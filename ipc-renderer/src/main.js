const ipcRenderer = require('electron').ipcRenderer

let video
let isVideoLoaded = false
let panel

let isMaximized = false

const params = {
  opacity: 0.4,
  roundedType: 'oval',
  brightnessLevel: 1,
  saturationLevel: 1,
  contrastLevel: 1
}

document.addEventListener('mouseenter', () => {
  showUI()
})

document.addEventListener('mouseleave', () => {
  hideUI()
})

ipcRenderer.on('update-opacity', (e, opacity) => {
  params.opacity = opacity
  panel.refresh()
})

ipcRenderer.on('maximize', (e) => {
  isMaximized = true
  hideUI()
})

ipcRenderer.on('minimize', (e) => {
  isMaximized = false
  updateControllers()
})

window.onload = () => {
  ipcRenderer.send('renderer-loaded')
  document.querySelector('.tp-dfwv').style.opacity = 0
  document.querySelector('#handlers').style.opacity = 0
  updateControllers()
  updateCorners()
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

  panel
    .addInput(params, 'roundedType', {
      label: 'Rounded',
      options: {
        oval: 'oval',
        corners: 'corners',
        none: 'none'
      }
    })
    .on('change', (e) => {
      updateControllers()
    })

  panel.addInput(params, 'opacity', { label: 'Opacity:', min: 0.1, max: 1, step: 0.1 }).on('change', (e) => {
    ipcRenderer.send('update-opacity', params.opacity)
  })

  panel.addInput(params, 'brightnessLevel', { label: 'Brightness', min: 0.2, max: 3, step: 0.1 }).on('change', (e) => {
    updateControllers()
  })

  panel.addInput(params, 'saturationLevel', { label: 'Saturation', min: 0, max: 2, step: 0.1 }).on('change', (e) => {
    updateControllers()
  })

  panel.addInput(params, 'contrastLevel', { label: 'Contrast', min: 0.5, max: 2, step: 0.1 }).on('change', (e) => {
    updateControllers()
  })
}

function draw() {
  clear()

  if (isMaximized) {
    hideUI()
    updateCorners()
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
  updateCorners()
  updateFilters()
}

function showUI() {
  document.querySelector('.tp-dfwv').style.opacity = 1
  document.querySelector('#handlers').style.opacity = 1
}

function hideUI() {
  document.querySelector('.tp-dfwv').style.opacity = 0
  document.querySelector('#handlers').style.opacity = 0
}

function updateCorners() {
  if (isMaximized) {
    document.getElementsByTagName('canvas')[0].style.borderRadius = 0
    return
  }

  switch (params.roundedType) {
    case 'oval': {
      document.getElementsByTagName('canvas')[0].style.borderRadius = '50%'
      break
    }

    case 'corners': {
      document.getElementsByTagName('canvas')[0].style.borderRadius = '30px'
      break
    }

    case 'none': {
      document.getElementsByTagName('canvas')[0].style.borderRadius = 0
      break
    }
  }
}

function updateFilters() {
  document.getElementsByTagName('canvas')[0].style.filter =
    'brightness(' +
    params.brightnessLevel +
    ') saturate(' +
    params.saturationLevel +
    ') contrast(' +
    params.contrastLevel +
    ')'
}
