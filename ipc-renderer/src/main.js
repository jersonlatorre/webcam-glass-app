const Pane = require('tweakpane').Pane
const { showUI, hideUI, updateCorners, updateFilters, adjustPanelWidth, noTouchPanel } = require('./modules/ui')
const { createVideoCapture, getCameraOptions } = require('./modules/camera')
const { setupEvents } = require('./modules/events')

let video
let panel
let isVideoLoaded = false

const config = {
  opacity: 0.5,
  panelShape: 'oval',
  brightnessLevel: 1,
  saturationLevel: 1,
  contrastLevel: 1,
  cameraId: '',
}

window.onload = () => {
  window.electron.send('renderer-loaded')
  hideUI()
  updateControllers()
  setupEvents(panel, config, () => {
    video = createVideoCapture({ video: { deviceId: config.cameraId } }, onVideoLoaded)
  })
}

async function setup() {
  createCanvas(windowWidth, windowHeight)

  panel = new Pane({
    container: document.querySelector('#tweak-container'),
    title: 'Settings',
    expanded: false,
  })

  panel.addInput(config, 'panelShape', { label: 'Shape', options: { oval: 'oval', rectangle: 'rectangle' } }).on('change', () => {
    updateControllers()
    window.electron.send('save-config', config)
  })

  panel.addInput(config, 'opacity', { label: 'Opacity:', min: 0.1, max: 1, step: 0.1 }).on('change', () => {
    window.electron.send('update-opacity', config.opacity)
    window.electron.send('save-config', config)
  })

  panel.addInput(config, 'brightnessLevel', { label: 'Brightness', min: 0.2, max: 3, step: 0.1 }).on('change', () => {
    updateControllers()
    window.electron.send('save-config', config)
  })

  panel.addInput(config, 'saturationLevel', { label: 'Saturation', min: 0, max: 2, step: 0.1 }).on('change', () => {
    updateControllers()
    window.electron.send('save-config', config)
  })

  panel.addInput(config, 'contrastLevel', { label: 'Contrast', min: 0.3, max: 2, step: 0.1 }).on('change', () => {
    updateControllers()
    window.electron.send('save-config', config)
  })

  panel.addInput(config, 'cameraId', { label: 'Camera', options: await getCameraOptions() }).on('change', (e) => {
    video = createVideoCapture({ video: { deviceId: e.value } }, onVideoLoaded)
    window.electron.send('save-config', config)
  })

  panel.addSeparator()

  panel.addButton({ title: 'Fullscreen' }).on('click', () => {
    window.electron.send('fullscreen')
  })

  panel.addButton({ title: 'Exit' }).on('click', () => {
    window.electron.send('exit')
  })

  adjustPanelWidth(windowWidth, panel)
}

function draw() {
  clear()

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
  window.electron.send('window-resized', {
    width: windowWidth,
    height: windowHeight,
  })

  adjustPanelWidth(windowWidth, panel)
}

function updateControllers() {
  updateCorners(config.panelShape)
  updateFilters(config.brightnessLevel, config.saturationLevel, config.contrastLevel)
}
