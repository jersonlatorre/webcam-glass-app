const ipcRenderer = require('electron').ipcRenderer
let video
let opacity = 0.5

ipcRenderer.on('change', (e, val) => {
	console.log(val)
	opacity = val
})

document.addEventListener('mousedown', (e) => {
	let px = e.screenX | 0
	let py = e.screenY | 0
	ipcRenderer.send('mousedown', { x: px, y: py })
})

document.addEventListener('mousemove', (e) => {
	let px = e.screenX | 0
	let py = e.screenY | 0
	ipcRenderer.send('mousemove', { x: px, y: py })
})

document.addEventListener('mouseup', (e) => {
	ipcRenderer.send('mouseup')
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
