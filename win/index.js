// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
 const url = require('url');
const { Initialize } = require('./index-node');
const { autoUpdater } = require('electron-updater');
const { Notification } = require('electron');

var FNotificationProperties = {
  title: 'CRMSOFT',
  icon: __dirname + '/img/logo.png',
  timeoutType: 'never'
};

Initialize();

function createWindow() {

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js')
    },
    // titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //   color: '#2196f3',
    //   symbolColor: '#fff'
    // },
    icon: __dirname + '/img/logo.png',
    menu: false
  });

  // and load the index.html of the app.
  // mainWindow.loadURL('http://localhost:3000/');

  mainWindow.loadFile(path.join(__dirname, "build/index.html"));
  // const __dirname = path.resolve();
  //  mainWindow.loadURL(url.format({
  // pathname: path.join(__dirname, '/build/index.html'),
  //  protocol: 'file:',
  //   slashes: true
  //  }));

  mainWindow.maximize();

  mainWindow.setMenuBarVisibility(false);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // new Notification({ ...FNotificationProperties, body: 'Welcome...' }).show();

  mainWindow.once('ready-to-show', () => {

    // new Notification({ ...FNotificationProperties, body: 'Checking for Update...' }).show();
    // autoUpdater.checkForUpdatesAndNotify();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {

  // mainWindow.webContents.send('update_available');

  new Notification({ ...FNotificationProperties, body: 'Update Available' }).show();
});

autoUpdater.on('update-downloaded', () => {
  // mainWindow.webContents.send('update_downloaded');


  new Notification({ ...FNotificationProperties, body: 'Update Downloaded' }).show();
});

ipcMain.on('restart_app', () => {

  new Notification({ ...FNotificationProperties, body: 'Restarting Application' }).show();
  autoUpdater.quitAndInstall();
});

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';