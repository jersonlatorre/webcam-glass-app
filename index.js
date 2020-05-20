const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron')

let win
let isMaximized = false
let lastBounds
let offset
let mousePressedPosition = {}
let lastWindowBounds
let isDragging = false

// app.commandLine.appendSwitch('enable-transparent-visuals')
// app.commandLine.appendSwitch('disable-gpu')

function createWindow() {
	win = new BrowserWindow({
		width: 640,
		height: 480,
		transparent: true,
		alwaysOnTop: true,
		resizable: true,
		fullscreenable: false,
		opacity: true,
		frame: false,
		webPreferences: {
			nodeIntegration: true
		}
	})

	lastBounds = win.getBounds()

	ipcMain.on('mousedown', (e, position) => {
		isDragging = true
		lastWindowBounds = win.getBounds()
		mousePressedPosition.x = position.x
		mousePressedPosition.y = position.y
	})

	ipcMain.on('mouseup', () => {
		isDragging = false
	})

	ipcMain.on('mousemove', (e, position) => {
		if (isDragging) {
			let ox = position.x - mousePressedPosition.x
			let oy = position.y - mousePressedPosition.y
			win.setPosition(lastWindowBounds.x + ox, lastWindowBounds.y + oy)
			win.setSize(lastWindowBounds.width, lastWindowBounds.height)
		}
	})

	win.loadFile('src/index.html')
	win.menuBarVisible = false
	win.setAlwaysOnTop(true)

	win.on('maximize', (e) => {
		onMaximize()
		win.unmaximize()
	})
}

function onMaximize() {
	// console.log('maximize')
	isMaximized = true
	win.setIgnoreMouseEvents(true)
	lastBounds = win.getBounds()
	win.setSize(screen.getPrimaryDisplay().bounds.width, screen.getPrimaryDisplay().bounds.height, true)
	win.setPosition(0, 0)
}

function onMinimize() {
	// console.log('unmaximize')
	isMaximized = false
	win.setIgnoreMouseEvents(false)
	win.setSize(lastBounds.width, lastBounds.height, true)
	win.setPosition(lastBounds.x, lastBounds.y)
}

app.whenReady().then(() => {
	setTimeout(function() {
		createWindow()
	}, 1000)

	globalShortcut.register('CommandOrControl+Alt+F', () => {
		if (isMaximized) {
			onMinimize()
		} else {
			onMaximize()
		}
	})

	globalShortcut.register('CommandOrControl+Alt+1', () => {
		win.webContents.send('change', 0.25)
	})

	globalShortcut.register('CommandOrControl+Alt+2', () => {
		win.webContents.send('change', 0.5)
	})

	globalShortcut.register('CommandOrControl+Alt+3', () => {
		win.webContents.send('change', 1)
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
