const ipcRenderer = require('electron').ipcRenderer
let video
let opacity = 1

ipcRenderer.on('change-1', () => {
	opacity = 0.3	
})

ipcRenderer.on('change-2', () => {
	opacity = 0.6
})

ipcRenderer.on('change-3', () => {
	opacity = 1
})



function setup() {
	createCanvas(windowWidth, windowHeight)
	video = createCapture(VIDEO)
	video.hide()
}

function draw() {
	clear()
	textAlign(CENTER, CENTER)
	textSize(29)
	fill('rgba(0, 0, 0, 0.3)')

	text('...', width / 2, height / 2)

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