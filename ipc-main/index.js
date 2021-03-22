const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const contextMenu = require('electron-context-menu')
const MainWindow = require('./main-window')

/**
 * Create the main window and manage its events
 */
let mainWindow

function createWindow() {
  mainWindow = new MainWindow()

  ipcMain.on('log', (e, value) => {
    console.log(value)
  })

  ipcMain.on('update-opacity', (e, opacity) => {
    mainWindow.opacity = opacity
  })

  ipcMain.on('mousedown', (e, position) => {
    mainWindow.onMouseDown(position)
  })

  ipcMain.on('mouseup', (e) => {
    mainWindow.onMouseUp()
  })

  ipcMain.on('mousemove', (e, position) => {
    mainWindow.onMouseMove(position)
  })

  ipcMain.on('dblclick', (e) => {
    mainWindow.onDoubleClick()
  })

  ipcMain.on('renderer-loaded', () => {
    mainWindow.update()
  })

  ipcMain.on('fullscreen', () => {
    mainWindow.toggleFullScreen()
  })

  ipcMain.on('exit', () => {
    app.quit()
  })

  globalShortcut.register('CommandOrControl+Alt+F', () => {
    mainWindow.toggleFullScreen()
  })

  globalShortcut.register('CommandOrControl+Alt+1', () => {
    mainWindow.decreaseOpacity()
  })

  globalShortcut.register('CommandOrControl+Alt+2', () => {
    mainWindow.increaseOpacity()
  })

  globalShortcut.register('Ctrl+Alt+Q', () => {
    app.quit()
  })

  globalShortcut.register('Ctrl+Esc', () => {
    app.quit()
  })

  // globalShortcut.register('Ctrl+Alt+H', () => {
    // mainWindow.toggleHide()
  // })
}

/**
 * Prevents multiple instances of main window
 */
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
