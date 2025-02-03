const ipcRenderer = require('electron').ipcRenderer
const Pane = require('tweakpane').Pane

let video
let panel
let isVideoLoaded = false
let isMaximized = false

const config = {
  opacity: 0.5,
  panelShape: 'oval',
  brightnessLevel: 1,
  saturationLevel: 1,
  contrastLevel: 1,
  cameraId: '',
}

document.body.addEventListener('mousemove', (e) => {
  document.body.style.cursor = noTouchPanel(e) ? 'move' : 'default'
})

window.onload = () => {
  ipcRenderer.send('renderer-loaded')
  hideUI()
  updateControllers()
  updateCorners()
  setupEvents()
}

document.addEventListener('mousedown', (e) => {
  if (noTouchPanel(e)) {
    ipcRenderer.send('mousedown', { x: e.screenX | 0, y: e.screenY | 0 })
  }
})

document.addEventListener('mousemove', (e) => {
  if (noTouchPanel(e)) {
    ipcRenderer.send('mousemove', { x: e.screenX | 0, y: e.screenY | 0 })
  }
})

document.addEventListener('mouseup', (e) => {
  ipcRenderer.send('mouseup')
})

document.addEventListener('dblclick', (e) => {
  // ipcRenderer.send('dblclick')
})

async function setup() {
  createCanvas(windowWidth, windowHeight)

  panel = new Pane({
    container: document.querySelector('#tweak-container'),
    title: 'Settings',
    expanded: false,
  })

  panel.addInput(config, 'panelShape', { label: 'Shape', options: { oval: 'oval', rectangle: 'rectangle' } }).on('change', (e) => {
    updateControllers()
    ipcRenderer.send('save-config', config)
  })

  panel.addInput(config, 'opacity', { label: 'Opacity:', min: 0.1, max: 1, step: 0.1 }).on('change', (e) => {
    ipcRenderer.send('update-opacity', config.opacity)
    ipcRenderer.send('save-config', config)
  })

  panel.addInput(config, 'brightnessLevel', { label: 'Brightness', min: 0.2, max: 3, step: 0.1 }).on('change', (e) => {
    updateControllers()
    ipcRenderer.send('save-config', config)
  })

  panel.addInput(config, 'saturationLevel', { label: 'Saturation', min: 0, max: 2, step: 0.1 }).on('change', (e) => {
    updateControllers()
    ipcRenderer.send('save-config', config)
  })

  panel.addInput(config, 'contrastLevel', { label: 'Contrast', min: 0.3, max: 2, step: 0.1 }).on('change', (e) => {
    updateControllers()
    ipcRenderer.send('save-config', config)
  })

  panel.addInput(config, 'cameraId', { label: 'Camera', options: await getCameraOptions() }).on('change', (e) => {
    createVideoCapture(e.value)
    ipcRenderer.send('save-config', config)
  })

  panel.addSeparator()

  panel.addButton({ title: 'Fullscreen' }).on('click', () => {
    ipcRenderer.send('fullscreen')
  })

  panel.addButton({ title: 'Exit' }).on('click', () => {
    ipcRenderer.send('exit')
  })

  adjustPanelWidth()
}

function draw() {
  clear()

  if (isMaximized) {
    hideUI()
    updateCorners()
  }

  if (isVideoLoaded) {
    tint(255, 255 * config.opacity)
    let ratio = video.width / video.height

    if (windowWidth / windowHeight > ratio) {
      let offset = 0.5 * ((windowWidth * 1) / ratio - windowHeight)
      image(video, 0, -offset, windowWidth, (windowWidth * 1) / ratio)
    } else {
      let offset = 0.5 * (windowHeight * ratio - windowWidth)
      image(video, -offset, 0, windowHeight * ratio, windowHeight)
    }
  }
}

function onVideoLoaded() {
  isVideoLoaded = true
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  ipcRenderer.send('window-resized', {
    width: windowWidth,
    height: windowHeight,
  })

  adjustPanelWidth()
}

function noTouchPanel(e) {
  let panelBounds = document.querySelector('#tweak-container').getBoundingClientRect()
  let x = e.x
  let y = e.y

  return x < panelBounds.x || x > panelBounds.x + panelBounds.width || y < panelBounds.y || y > panelBounds.y + panelBounds.height
}

function updateControllers() {
  updateCorners()
  updateFilters()
}

function showUI() {
  document.querySelector('#tweak-container').style.opacity = 1
  document.querySelector('#handlers').style.opacity = 1
}

function hideUI() {
  document.querySelector('#tweak-container').style.opacity = 0
  document.querySelector('#handlers').style.opacity = 0
}

function updateCorners() {
  if (isMaximized) {
    document.getElementsByTagName('canvas')[0].style.borderRadius = 0
    return
  }

  switch (config.panelShape) {
    case 'oval':
      document.getElementsByTagName('canvas')[0].style.borderRadius = '50%'
      break

    case 'rectangle':
      document.getElementsByTagName('canvas')[0].style.borderRadius = '20px'
      break
  }
}

function updateFilters() {
  document.getElementsByTagName('canvas')[0].style.filter =
    'brightness(' + config.brightnessLevel + ') saturate(' + config.saturationLevel + ') contrast(' + config.contrastLevel + ')'
}

function createVideoCapture(deviceId = '') {
  const constraints = deviceId ? { audio: false, video: { deviceId } } : VIDEO
  video?.remove()
  video = createCapture(constraints, onVideoLoaded)
  video.hide()
}

async function getCameraOptions() {
  const cameras = await getCameraDevices()
  return cameras.reduce((camOptions, device) => {
    const label = device.label || 'Camera ' + device.deviceId
    camOptions[label] = device.deviceId
    return camOptions
  }, {})
}

async function getCameraDevices() {
  if (!('mediaDevices' in navigator)) return []
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter((device) => device.kind === 'videoinput')
}

function setupEvents() {
  // eventos IPC
  const ipcEvents = {
    'mouse-inside': showUI,
    'mouse-outside': hideUI,
    'update-opacity': (e, opacity) => {
      config.opacity = opacity
      panel.refresh()
    },
    'update-config': (e, c) => {
      Object.assign(config, c)
      createVideoCapture(config.cameraId)
      panel.refresh()
    },
    maximize: () => {
      isMaximized = true
      hideUI()
    },
    minimize: () => {
      isMaximized = false
      updateControllers()
    },
  }

  // registrar eventos IPC
  Object.entries(ipcEvents).forEach(([event, handler]) => {
    ipcRenderer.on(event, handler)
  })

  // eventos del DOM
  const domEvents = {
    mousemove: (e) => {
      document.body.style.cursor = noTouchPanel(e) ? 'move' : 'default'
    },
    mousedown: (e) => {
      if (noTouchPanel(e)) {
        ipcRenderer.send('mousedown', { x: e.screenX | 0, y: e.screenY | 0 })
      }
    },
    mousemove: (e) => {
      if (noTouchPanel(e)) {
        ipcRenderer.send('mousemove', { x: e.screenX | 0, y: e.screenY | 0 })
      }
    },
    mouseup: () => {
      ipcRenderer.send('mouseup')
    },
    // 'dblclick': () => ipcRenderer.send('dblclick')
  }

  // registrar eventos del DOM
  Object.entries(domEvents).forEach(([event, handler]) => {
    if (event === 'mousemove') {
      document.body.addEventListener(event, handler)
    } else {
      document.addEventListener(event, handler)
    }
  })
}

function adjustPanelWidth() {
  const container = document.querySelector('#tweak-container')
  const maxWidth = 300
  const padding = 20
  const newWidth = Math.min(windowWidth - padding, maxWidth)
  container.style.width = `${newWidth}px`
  panel.refresh()
}
