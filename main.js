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
  obposition TEXT, -- OB位置
  is_delete INTEGER DEFAULT 0 -- 是否被删除
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
          $username,
          $tel,
          $address,
          $date,
          $brand,
          $motor,
          $bignum,
          $obposition
        )`, // sql
        { 
          $username: arg.username,
          $tel: arg.tel,
          $address: arg.address,
          $date: new Date(arg.date).getTime(),
          $brand: arg.brand,
          $motor: arg.motor,
          $bignum: arg.bignum,
          $obposition: arg.obposition,
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
    const getCountSql = `select count(*) as total from carmanage where ${ wheres.length ? wheres.join(' and ') + ' and' : ''} is_delete = 0`;
    
    db.get(
      getCountSql,
      params,
      (err, data = {}) => {
        const { total = 0 } = data;
        if (err) {
            console.error(err);
            return;
        }
        
        const queryAllSql = `select * from carmanage where ${ wheres.length ? wheres.join(' and ') + ' and' : ''} is_delete = 0 limit ${size} offset ${(cur - 1) * size}`;

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

ipcMain.on('update-data', (event, data) => {
  const updata = {};
  const sets = [];

  Object.keys(data).forEach((key) => {
    if (key !== 'is_delete') {
      updata[`$${key}`] = data[key];
      if (key !== 'id') {
        sets.push(`${key} = $${key}`);
      }
    }
  });

  db.run(
    `UPDATE carmanage SET ${sets.join(', ')} WHERE id = $id and is_delete = 0`, 
    updata,
    (err, res) => {
      if (err) {
          console.error(err);
          return;
      }
      event.sender.send('update-data', { code: 200, message: '更新数据成功', data: res });
    }
  );
});

ipcMain.on('delete-data', (event, id) => {
  db.run(
    `UPDATE carmanage SET is_delete = 1 WHERE id = $id`, 
    {
      $id: id
    },
    (err, res) => {
      if (err) {
          console.error(err);
          return;
      }
      event.sender.send('delete-data', { code: 200, message: '删除数据成功', data: res });
    }
  );
});


let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1260,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    mainWindow.loadFile('./build/index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 打开控制台
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
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