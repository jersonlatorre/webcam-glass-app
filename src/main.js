const ipcRenderer = require('electron').ipcRenderer
let video
let isVideoLoaded = false
let opacity

ipcRenderer.on('update-opacity', (e, v) => {
	opacity = v
})

window.onload = () => {
	ipcRenderer.send('renderer-loaded')
}

document.addEventListener('mousedown', (e) => {
	ipcRenderer.send('mousedown', { x: e.screenX | 0, y: e.screenY | 0 })
})

document.addEventListener('mousemove', (e) => {
	ipcRenderer.send('mousemove', { x: e.screenX | 0, y: e.screenY | 0 })
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
}

function draw() {
	clear()
	if (isVideoLoaded) {
		tint(255, 255 * opacity)
		if (windowWidth / windowHeight > 4 / 3) {
			let offset = 0.5 * (windowWidth * 3 / 4 - windowHeight)
			image(video, 0, -offset, windowWidth, windowWidth * 3 / 4)
		} else {
			let offset = 0.5 * (windowHeight * 4 / 3 - windowWidth)
			image(video, -offset, 0, windowHeight * 4 / 3, windowHeight)
		}

		// if (Math.round(opacity * 10) == 0) {
			// reserve space
			// fill('rgba(0, 0, 0, 0.001)')
			// rect(0, 0, windowWidth, windowHeight)
			
			// draw rectangle
			// noFill()
			// strokeWeight(1)
			// stroke('#666')
			// rect(1, 0, windowWidth, windowHeight)
		// }
	}
}

function onVideoLoaded() {
	isVideoLoaded = true
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight)
}