const electron = require('electron')
const app = electron.app
const {Menu} = require('electron')
const BrowserWindow = electron.BrowserWindow

let mainWindow

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

function createWindow () {
  mainWindow = new BrowserWindow({width: 1024, height: 768})
  mainWindow.setResizable(false)
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  const template = [
  {
    label: 'Menu',
    submenu: [
      {
        label: 'Recharger',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Console développeur',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      }
    ]
  },
  {
    label : "Plus d'info ?",
    role: 'help',
    submenu: [
      {
        label: 'Notre dépot Github',
        click () { require('electron').shell.openExternal('https://github.com/launay12u/CO-OP') }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

  //mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
