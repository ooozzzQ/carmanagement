npm install sqlite3 --build-from-source --runtime=electron --target=$(NODE_WEBKIT_VERSION)

./node_modules/.bin/node-pre-gyp install --directory=./build/node_modules/sqlite3 --target_platform=win32 --target_arch=ia32 --target=6.4.1

"build": {  // 这里是electron-builder的配置
    "productName":"xxxx",//项目名 这也是生成的exe文件的前缀名
    "appId": "com.xxx.xxxxx",//包名  
    "copyright":"xxxx",//版权  信息
    "directories": { // 输出文件夹
      "output": "build"
    }, 
    // windows相关的配置
    "win": {  // 更改build下选项
       "icon": "xxx/icon.ico"//图标路径 
        "target": [
            {
                "target": "nsis" // 我们要的目标安装包
            }
        ]
    },
    "nsis": {
        "oneClick": false, // 是否一键安装
        "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
        "allowToChangeInstallationDirectory": true, // 允许修改安装目录
        "installerIcon": "./build/icons/aaa.ico",// 安装图标
        "uninstallerIcon": "./build/icons/bbb.ico",//卸载图标
        "installerHeaderIcon": "./build/icons/aaa.ico", // 安装时头部图标
        "createDesktopShortcut": true, // 创建桌面图标
        "createStartMenuShortcut": true,// 创建开始菜单图标
        "shortcutName": "xxxx", // 图标名称
        "include": "build/script/installer.nsh", // 包含的自定义nsis脚本 这个对于构建需求严格得安装过程相当有用。
        "script" : "build/script/installer.nsh" // NSIS脚本的路径，用于自定义安装程序。 默认为build /installer.nsi  
    },
  }

  NODE_MODULE_VERSION 64 > 69 error https://github.com/electron-userland/electron-builder/issues/3660 保持 electron 为 4.0.0 不变