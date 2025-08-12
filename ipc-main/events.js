const { ipcMain, globalShortcut, app } = require('electron')

function registerEvents(mainWindow, store) {
  const eventHandlers = {
    log: (e, value) => console.log(value),
    'update-opacity': (e, opacity) => (mainWindow.opacity = opacity),
    mousedown: (e, position) => mainWindow.onMouseDown(position),
    mouseup: () => mainWindow.onMouseUp(),
    mousemove: (e, position) => mainWindow.onMouseMove(position),
    dblclick: () => mainWindow.onDoubleClick(),
    'renderer-loaded': () => mainWindow.updateConfig(store.get('config')),
    fullscreen: () => mainWindow.toggleFullScreen(),
    'window-resized': (e, size) => mainWindow.onWindowResized(size),
    exit: () => app.quit(),
    'save-config': (e, config) => store.set('config', config),
  }

  for (const [event, handler] of Object.entries(eventHandlers)) {
    ipcMain.on(event, handler)
  }
}

function registerShortcuts(mainWindow) {
  const shortcuts = {
    'CommandOrControl+Alt+F': () => mainWindow.toggleFullScreen(),
    'CommandOrControl+Alt+1': () => mainWindow.decreaseOpacity(),
    'CommandOrControl+Alt+2': () => mainWindow.increaseOpacity(),
    'Ctrl+Alt+Q': () => app.quit(),
    'Ctrl+Esc': () => app.quit(),
  }

  for (const [accelerator, callback] of Object.entries(shortcuts)) {
    globalShortcut.register(accelerator, callback)
  }
}

module.exports = {
  registerEvents,
  registerShortcuts,
}
