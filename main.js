const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron')

// 初始化数据库文件
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

// 创建表
db.run(`CREATE TABLE IF NOT EXISTS carmanage (
  id INTEGER PRIMARY KEY AUTOINCREMENT, -- 自增id
  username TEXT, -- 车主姓名
  tel TEXT, -- 联系电话
  address TEXT, -- 车主地址 
  date INTEGER, -- 检测日期
  brand TEXT, -- 车辆品牌
  motor TEXT,  -- 发动机型号
  bignum TEXT, -- 大架号位置
  obposition TEXT -- OB位置
)`);

// 主进程收到保存数据事件
ipcMain.on('save-data', (event, arg) => {
    db.run(
        `INSERT INTO carmanage(
          username,
          tel,
          address,
          date,
          brand,
          motor,
          bignum,
          obposition
        ) VALUES (
          $d1,
          $d2,
          $d3,
          $d4,
          $d5,
          $d6,
          $d7,
          $d8
        )`, // sql
        { 
          $d1: arg.username,
          $d2: arg.tel,
          $d3: arg.address,
          $d4: new Date(arg.date).getTime(),
          $d5: arg.brand,
          $d6: arg.motor,
          $d7: arg.bignum,
          $d8: arg.obposition,
        }, // 参数
        (err, res) => { // 异步处理函数
            if (err) {
                console.error(err);
                return;
            }
            // 告诉渲染进程保存成功
            event.sender.send('save-data', { code: 200, message: '保存数据成功', data: arg });
        }
    );
});

// 主进程收到查询数据事件
ipcMain.on('query-data', (event, { page, data = [] }) => {
    const wheres = [];
    const params = {};
    let index = 1;
    for (const key in data) {
      const value = data[key];
      if (value) {
        let p = `$d${index}`;
        if (key === 'date') {
          wheres.push(`${key} = ${p}`);
          params[p] = new Date(value).getTime();
        } else {
          wheres.push(`${key} like ${p}`);
          params[p] = `%${value}%`;
        }
        index ++;
      }
    }
    const { size, cur } = page;
    const getCountSql = `select count(*) as total from carmanage ${ wheres.length ? 'where '+wheres.join(' and ') : ''}`;
    
    db.get(
      getCountSql,
      params,
      (err, { total = 0 }) => {
        if (err) {
            console.error(err);
            return;
        }
        
        const queryAllSql = `select * from carmanage ${ wheres.length ? 'where '+wheres.join(' and ') : ''} limit ${size} offset ${(cur - 1) * size}`;

        db.all(
          queryAllSql,
          params,
          (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            // 将查询数据发送到渲染进程
            event.sender.send('query-data', { code: 200, page: { cur: page.cur, size: size, total }, data: res });
          }
        );
      }
    )
});


let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    mainWindow.loadFile('./build/index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 打开控制台
    mainWindow.webContents.openDevTools({ mode: 'detach' });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
})