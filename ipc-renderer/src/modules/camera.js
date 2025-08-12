let video

function createVideoCapture(constraints, onVideoLoaded) {
  video?.remove()
  video = createCapture(constraints, onVideoLoaded)
  video.hide()
  return video
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

module.exports = {
  createVideoCapture,
  getCameraOptions,
  getCameraDevices,
}
