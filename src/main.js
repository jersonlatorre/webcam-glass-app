const ipcRenderer = require('electron').ipcRenderer
let video
let opacity = 0.15

ipcRenderer.on('update-opacity', (e, val) => {
	opacity = val
})

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
	video = createCapture(VIDEO)
	video.hide()
}

function draw() {
	clear()
	tint(255, 255 * opacity)
	if (windowWidth / windowHeight > 4 / 3) {
		let offset = 0.5 * (windowWidth * 3 / 4 - windowHeight)
		image(video, 0, -offset, windowWidth, windowWidth * 3 / 4)
	} else {
		let offset = 0.5 * (windowHeight * 4 / 3 - windowWidth)
		image(video, -offset, 0, windowHeight * 4 / 3, windowHeight)
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight)
}
