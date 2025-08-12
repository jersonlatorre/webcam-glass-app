let isMaximized = false

function showUI() {
  document.querySelector('#tweak-container').style.opacity = 1
  document.querySelector('#handlers').style.opacity = 1
}

function hideUI() {
  document.querySelector('#tweak-container').style.opacity = 0
  document.querySelector('#handlers').style.opacity = 0
}

function updateCorners(panelShape) {
  if (isMaximized) {
    document.getElementsByTagName('canvas')[0].style.borderRadius = 0
    return
  }

  switch (panelShape) {
    case 'oval':
      document.getElementsByTagName('canvas')[0].style.borderRadius = '50%'
      break

    case 'rectangle':
      document.getElementsByTagName('canvas')[0].style.borderRadius = '20px'
      break
  }
}

function updateFilters(brightnessLevel, saturationLevel, contrastLevel) {
  document.getElementsByTagName('canvas')[0].style.filter =
    `brightness(${brightnessLevel}) saturate(${saturationLevel}) contrast(${contrastLevel})`
}

function adjustPanelWidth(windowWidth, panel) {
  const container = document.querySelector('#tweak-container')
  const maxWidth = 300
  const padding = 20
  const newWidth = Math.min(windowWidth - padding, maxWidth)
  container.style.width = `${newWidth}px`
  panel.refresh()
}

function noTouchPanel(e) {
  const panelBounds = document.querySelector('#tweak-container').getBoundingClientRect()
  return e.x < panelBounds.x || e.x > panelBounds.x + panelBounds.width || e.y < panelBounds.y || e.y > panelBounds.y + panelBounds.height
}

function setMaximized(value) {
  isMaximized = value
}

module.exports = {
  showUI,
  hideUI,
  updateCorners,
  updateFilters,
  adjustPanelWidth,
  noTouchPanel,
  setMaximized,
}
