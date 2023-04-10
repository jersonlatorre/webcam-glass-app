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

    let windowPosition = this.store.get('window-position')
    if (windowPosition) {
      this.setPosition(windowPosition.x, windowPosition.y)
    }

    let windowSize = this.store.get('window-size')
    if (windowSize) {
      this.setSize(windowSize.width, windowSize.height)
    }

    this.isMaximized = false
    this.savedWindowBoundsForTogglingFullScreen = this.getBounds()
    this.savedMouseDownPositionBeforeDragging = null
    this.isMaximized = false
    this.isMouseDragging = false
    this.opacity = 0.5
    this.dOpacity = 0.1
    this.menuBarVisible = false

    this.loadFile('ipc-renderer/index.html')
    this.setAlwaysOnTop(true)
    // this.webContents.openDevTools()

    setInterval(() => {
      try {
        this.update()
      } catch (e) {}
    }, 100)
  }

  update() {
    let mousePosition = screen.getCursorScreenPoint()
    let bounds = this.getBounds()
    let margin = 20
    if (mousePosition.x < bounds.x - margin || mousePosition.x > bounds.x + bounds.width + margin || mousePosition.y < bounds.y - margin || mousePosition.y > bounds.y + bounds.height + margin) {
      this.webContents.send('mouse-outside')
    } else {
      this.webContents.send('mouse-inside')
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
      this.setIgnoreMouseEvents(false)
    } else {
      this.onMaximize()
      if (this.opacity == 1) {
        this.setIgnoreMouseEvents(false)
      } else {
        this.setIgnoreMouseEvents(true)
      }
    }
  }

  decreaseOpacity() {
    this.opacity -= this.dOpacity
    if (this.opacity < 0.1) this.opacity = 0.1
    this.webContents.send('update-opacity', this.opacity)
    this.setIgnoreMouseEvents(this.isMaximized)
  }

  increaseOpacity() {
    this.opacity += this.dOpacity
    if (this.opacity > 1) this.opacity = 1
    this.webContents.send('update-opacity', this.opacity)
    if (Math.abs(this.opacity - 1) < 0.01) {
      this.setIgnoreMouseEvents(false)
    }
  }
}
