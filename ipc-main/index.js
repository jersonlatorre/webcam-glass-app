const { app, BrowserWindow, screen } = require('electron')
const MainWindow = require('./main-window')
const Store = require('electron-store')
const { registerEvents, registerShortcuts } = require('./events')

const store = new Store()
let mainWindow = null

function createWindow() {
  if (mainWindow) return
  mainWindow = new MainWindow(screen)

  registerEvents(mainWindow, store)
  registerShortcuts(mainWindow)
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
