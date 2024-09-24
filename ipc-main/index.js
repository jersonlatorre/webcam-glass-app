const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const MainWindow = require('./main-window')
const Store = require('electron-store')
const store = new Store()

/**
 * Create the main window and manage its events
 */

let mainWindow = null

function createWindow() {
  if (mainWindow) return
  mainWindow = new MainWindow()

  // event handlers
  const eventHandlers = {
    log: (e, value) => console.log(value),
    'update-opacity': (e, opacity) => mainWindow.opacity = opacity,
    mousedown: (e, position) => mainWindow.onMouseDown(position),
    mouseup: () => mainWindow.onMouseUp(),
    mousemove: (e, position) => mainWindow.onMouseMove(position),
    dblclick: () => mainWindow.onDoubleClick(),
    'renderer-loaded': () => mainWindow.updateConfig(store.get('config')),
    fullscreen: () => mainWindow.toggleFullScreen(),
    'window-resized': (e, size) => mainWindow.onWindowResized(size),
    exit: () => app.quit(),
    'save-config': (e, config) => store.set('config', config)
  }

  // register events
  Object.entries(eventHandlers).forEach(([event, handler]) => {
    ipcMain.on(event, handler)
  })

  // register shortcuts
  const shortcuts = {
    'CommandOrControl+Alt+F': () => mainWindow.toggleFullScreen(),
    'CommandOrControl+Alt+1': () => mainWindow.decreaseOpacity(),
    'CommandOrControl+Alt+2': () => mainWindow.increaseOpacity(),
    'Ctrl+Alt+Q': () => app.quit(),
    'Ctrl+Esc': () => app.quit()
  }

  Object.entries(shortcuts).forEach(([accelerator, callback]) => {
    globalShortcut.register(accelerator, callback)
  })
}

/**
 * App listeners
 */

app.on('ready', () => {
  setTimeout(function() {
    createWindow()
  }, 1000)
})

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
