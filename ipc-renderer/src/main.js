const ipcRenderer = require('electron').ipcRenderer

let video
let isVideoLoaded = false
let panel
let isMaximized = false

const config = {
  opacity: 0.5,
  roundedType: 'oval',
  brightnessLevel: 1,
  saturationLevel: 1,
  contrastLevel: 1
}

document.body.addEventListener('mousemove', (e) => {
  if (noTouchPanel(e)) {
    document.body.style.cursor = 'move'
  } else {
    document.body.style.cursor = 'default'
  }
})

ipcRenderer.on('mouse-inside', (e) => {
  showUI()
})

ipcRenderer.on('mouse-outside', (e) => {
  hideUI()
})

ipcRenderer.on('update-opacity', (e, opacity) => {
  config.opacity = opacity
  panel.refresh()
})

ipcRenderer.on('update-config', (e, c) => {
  Object.assign(config, c)
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
  hideUI()
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
  // ipcRenderer.send('dblclick')
})

function setup() {
  createCanvas(windowWidth, windowHeight)
  video = createCapture(VIDEO, onVideoLoaded)
  video.hide()

  panel = new Tweakpane({
    title: 'Settings',
    expanded: false
  })

  panel
    .addInput(config, 'roundedType', {
      label: 'Rounded',
      options: {
        oval: 'oval',
        corners: 'corners',
        none: 'none'
      }
    })
    .on('change', (e) => {
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

  panel.addSeparator()

  panel
    .addButton({
      title: 'Fullscreen'
    })
    .on('click', () => {
      ipcRenderer.send('fullscreen')
    })

  panel
    .addButton({
      title: 'Exit'
    })
    .on('click', () => {
      ipcRenderer.send('exit')
    })
}

function draw() {
  clear()

  if (isMaximized) {
    hideUI()
    updateCorners()
  }

  if (isVideoLoaded) {
    tint(255, 255 * config.opacity)
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
  ipcRenderer.send('window-resized', { width: windowWidth, height: windowHeight })
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

  switch (config.roundedType) {
    case 'oval': {
      document.getElementsByTagName('canvas')[0].style.borderRadius = '50%'
      break
    }

    case 'corners': {
      document.getElementsByTagName('canvas')[0].style.borderRadius = '20px'
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
    config.brightnessLevel +
    ') saturate(' +
    config.saturationLevel +
    ') contrast(' +
    config.contrastLevel +
    ')'
}
