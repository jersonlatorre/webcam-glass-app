const { BrowserWindow } = require('electron')
const Store = require('electron-store')

const { screen } = require('electron')

module.exports = class MainWindow extends BrowserWindow {
  constructor() {
    super({
      width: 240,
      height: 240,
      minWidth: 240,
      minHeight: 240,
      transparent: true,
      alwaysOnTop: true,
      resizable: true,
      fullscreenable: false,
      opacity: true,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: require('path').join(__dirname, '../ipc-renderer/preload.js'),
      },
    })

    this.store = new Store()
    this.initializeWindowProperties()
    this.loadFile('ipc-renderer/index.html')
    this.setAlwaysOnTop(true)
    
    this.on('closed', () => {
      this.removeAllListeners()
    })
  }

  initializeWindowProperties() {
    this.setPositionAndSize()
    this.isMaximized = false
    this.savedWindowBoundsForTogglingFullScreen = this.getBounds()
    this.savedMouseDownPositionBeforeDragging = null
    this.isMouseDragging = false
    this.opacity = 0.5
    this.dOpacity = 0.1
    this.menuBarVisible = false
  }

  setPositionAndSize() {
    const windowPosition = this.store.get('window-position')
    if (windowPosition) {
      this.setPosition(windowPosition.x, windowPosition.y)
    }

    const windowSize = this.store.get('window-size')
    if (windowSize) {
      this.setSize(windowSize.width, windowSize.height)
    }
  }

  updateConfig(config) {
    this.webContents.send('update-config', config)
  }

  onMouseDown(position) {
    this.isMouseDragging = true
    this.savedWindowBoundsBeforeDragging = this.getBounds()
    this.savedMouseDownPositionBeforeDragging = position
  }

  onMouseUp() {
    this.isMouseDragging = false
  }

  onMouseMove(position) {
    if (this.isMouseDragging && !this.isMaximized) {
      let offsetX = position.x - this.savedMouseDownPositionBeforeDragging.x
      let offsetY = position.y - this.savedMouseDownPositionBeforeDragging.y
      let x = this.savedWindowBoundsBeforeDragging.x + offsetX
      let y = this.savedWindowBoundsBeforeDragging.y + offsetY
      this.store.set('window-position', { x: x, y: y })
      this.setPosition(x, y)
      this.setSize(this.savedWindowBoundsBeforeDragging.width, this.savedWindowBoundsBeforeDragging.height)
    }
  }

  onWindowResized(size) {
    this.store.set('window-size', { width: size.width, height: size.height })
  }

  onDoubleClick() {
    this.toggleFullScreen()
  }

  toggleFullScreen() {
    if (this.isMaximized) {
      this.isMaximized = false
      this.setIgnoreMouseEvents(false)
      this.setSize(this.savedWindowBoundsForTogglingFullScreen.width, this.savedWindowBoundsForTogglingFullScreen.height)
      this.setPosition(this.savedWindowBoundsForTogglingFullScreen.x, this.savedWindowBoundsForTogglingFullScreen.y)
      this.webContents.send('minimize')
    } else {
      this.isMaximized = true
      this.setIgnoreMouseEvents(true)
      this.savedWindowBoundsForTogglingFullScreen = this.getBounds()
      const { width, height, x, y } = screen.getPrimaryDisplay().bounds
      this.setSize(width, height)
      this.setPosition(x, y)
      this.webContents.send('maximize')
    }
    this.setIgnoreMouseEvents(this.isMaximized && this.opacity !== 1)
  }

  adjustOpacity(delta) {
    this.opacity = Math.max(0.1, Math.min(1, this.opacity + delta))
    this.webContents.send('update-opacity', this.opacity)
    this.setIgnoreMouseEvents(this.isMaximized && this.opacity !== 1)
  }

  decreaseOpacity() {
    this.adjustOpacity(-this.dOpacity)
  }

  increaseOpacity() {
    this.adjustOpacity(this.dOpacity)
  }
}
