const ipcRenderer = require('electron').ipcRenderer

let video
let isVideoLoaded = false
let panel

let isMaximized = true

const params = {
  opacity: 0.4,
  rounded: 1,
  brightnessLevel: 1,
  saturationLevel: 1,
  contrastLevel: 1
}

document.addEventListener('mouseenter', () => {
  document.querySelector('.tp-dfwv').style.opacity = 1
  document.querySelector('#handlers').style.opacity = 1
})

document.addEventListener('mouseleave', () => {
  document.querySelector('.tp-dfwv').style.opacity = 0
  document.querySelector('#handlers').style.opacity = 0
})

ipcRenderer.on('update-opacity', (e, v) => {
  params.opacity = v
  panel.refresh()
})

ipcRenderer.on('maximize', (e) => {
  isMaximized = true
})

ipcRenderer.on('minimize', (e) => {
  updateControllers()
  isMaximized = false
})

window.onload = () => {
  ipcRenderer.send('renderer-loaded')
  document.querySelector('.tp-dfwv').style.opacity = 0
  document.querySelector('#handlers').style.opacity = 0
  updateControllers()
  document.getElementsByTagName('canvas')[0].style.borderRadius = 0
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
  ipcRenderer.send('dblclick')
})

function setup() {
  createCanvas(windowWidth, windowHeight)
  video = createCapture(VIDEO, onVideoLoaded)
  video.hide()

  panel = new Tweakpane()

  panel.addInput(params, 'opacity', { min: 0.1, max: 1, step: 0.1 }).on('change', (e) => {
    ipcRenderer.send('update-opacity', params.opacity)
  })

  panel.addInput(params, 'rounded', { label: 'Rounded', min: 0, max: 1, step: 0.01 }).on('change', (e) => {
    updateControllers()
  })

  panel.addInput(params, 'brightnessLevel', { label: 'Brightness', min: 0, max: 5, step: 0.1 }).on('change', (e) => {
    updateControllers()
  })

  panel.addInput(params, 'saturationLevel', { label: 'Saturation', min: 0, max: 2, step: 0.1 }).on('change', (e) => {
    updateControllers()
  })

  panel.addInput(params, 'contrastLevel', { label: 'Contrast', min: 0.5, max: 1.5, step: 0.1 }).on('change', (e) => {
    updateControllers()
  })
}

function draw() {
  clear()

  if (isMaximized) {
    document.querySelector('.tp-dfwv').style.opacity = 0
    document.querySelector('#handlers').style.opacity = 0
    document.getElementsByTagName('canvas')[0].style.borderRadius = 0
  }

  if (isVideoLoaded) {
    tint(255, 255 * params.opacity)
    if (windowWidth / windowHeight > 4 / 3) {
      let offset = 0.5 * (windowWidth * 3 / 4 - windowHeight)
      image(video, 0, -offset, windowWidth, windowWidth * 3 / 4)
    } else {
      let offset = 0.5 * (windowHeight * 4 / 3 - windowWidth)
      image(video, -offset, 0, windowHeight * 4 / 3, windowHeight)
    }
  }
}

function onVideoLoaded() {
  isVideoLoaded = true
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function noTouchPanel(e) {
  let panelBounds = document.querySelector('.tp-dfwv').getBoundingClientRect()
  let x = e.x
  let y = e.y

  return (
    x < panelBounds.x ||
    x > panelBounds.x + panelBounds.width ||
    y < panelBounds.y ||
    y > panelBounds.y + panelBounds.height
  )
}

function updateControllers() {
  document.getElementsByTagName('canvas')[0].style.borderRadius = params.rounded * 100 + '%'
  document.getElementsByTagName('canvas')[0].style.filter =
    'brightness(' +
    params.brightnessLevel +
    ') saturate(' +
    params.saturationLevel +
    ') contrast(' +
    params.contrastLevel +
    ')'
}
