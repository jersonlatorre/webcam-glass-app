const { BrowserWindow, screen } = require('electron')
const Store = require('electron-store')

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
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    })

    this.store = new Store()
    this.initializeWindowProperties()
    this.loadFile('ipc-renderer/index.html')
    this.setAlwaysOnTop(true)
    
    this.updateInterval = setInterval(() => this.update(), 100)
    
    this.on('closed', () => {
      clearInterval(this.updateInterval)
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

  update() {
    if (!this.isDestroyed()) {
      const mousePosition = screen.getCursorScreenPoint()
      const bounds = this.getBounds()
      const margin = 20
      const isMouseOutside = 
        mousePosition.x < bounds.x - margin || 
        mousePosition.x > bounds.x + bounds.width + margin || 
        mousePosition.y < bounds.y - margin || 
        mousePosition.y > bounds.y + bounds.height + margin

      this.webContents.send(isMouseOutside ? 'mouse-outside' : 'mouse-inside')
    }
  }

  updateConfig(config) {
    this.webContents.send('update-config', config)
  }

  onMaximize() {
    this.isMaximized = true
    this.setIgnoreMouseEvents(true)
    this.savedWindowBoundsForTogglingFullScreen = this.getBounds()
    this.setSize(screen.getPrimaryDisplay().bounds.width, screen.getPrimaryDisplay().bounds.height)
    this.setPosition(screen.getPrimaryDisplay().bounds.x, screen.getPrimaryDisplay().bounds.y)
    this.webContents.send('maximize')
  }

  onMinimize() {
    this.isMaximized = false
    this.setIgnoreMouseEvents(false)
    this.setSize(this.savedWindowBoundsForTogglingFullScreen.width, this.savedWindowBoundsForTogglingFullScreen.height)
    this.setPosition(this.savedWindowBoundsForTogglingFullScreen.x, this.savedWindowBoundsForTogglingFullScreen.y)
    this.webContents.send('minimize')
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
      this.onMinimize()
    } else {
      this.onMaximize()
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
