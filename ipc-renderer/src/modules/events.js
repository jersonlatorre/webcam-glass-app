const { showUI, hideUI, noTouchPanel, setMaximized } = require('./ui')

function setupEvents(panel, config, createVideoCapture) {
  const ipcEvents = {
    'mouse-inside': showUI,
    'mouse-outside': hideUI,
    'update-opacity': (opacity) => {
      config.opacity = opacity
      panel.refresh()
    },
    'update-config': (c) => {
      Object.assign(config, c)
      createVideoCapture(config.cameraId)
      panel.refresh()
    },
    maximize: () => {
      setMaximized(true)
      hideUI()
    },
    minimize: () => {
      setMaximized(false)
    },
  }

  for (const [event, handler] of Object.entries(ipcEvents)) {
    window.electron.on(event, handler)
  }

  document.body.addEventListener('mousemove', (e) => {
    document.body.style.cursor = noTouchPanel(e) ? 'move' : 'default'
    if (noTouchPanel(e)) {
      window.electron.send('mousemove', { x: e.screenX | 0, y: e.screenY | 0 })
    }
  })

  document.addEventListener('mousedown', (e) => {
    if (noTouchPanel(e)) {
      window.electron.send('mousedown', { x: e.screenX | 0, y: e.screenY | 0 })
    }
  })

  document.addEventListener('mouseup', () => {
    window.electron.send('mouseup')
  })
}

module.exports = {
  setupEvents,
}
