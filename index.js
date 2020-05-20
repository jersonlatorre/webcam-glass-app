const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron')

let win
let isMaximized = false
let lastBounds
let offset
let mousePressedPosition = {}
let lastWindowBounds
let isDragging = false
let opacity = 0.5

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
		if (isDragging && !isMaximized) {
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
			win.setIgnoreMouseEvents(false)
		} else {
			onMaximize()
			if (opacity == 1) {
				win.setIgnoreMouseEvents(false)
			} else {
				win.setIgnoreMouseEvents(true)
			}
		}
	})

	globalShortcut.register('CommandOrControl+Alt+1', () => {
		opacity = 0.25
		win.webContents.send('change', opacity)
		if (isMaximized) {
			win.setIgnoreMouseEvents(true)
		} else {
			win.setIgnoreMouseEvents(false)
		}
	})

	globalShortcut.register('CommandOrControl+Alt+2', () => {
		opacity = 0.5
		win.webContents.send('change', opacity)
		if (isMaximized) {
			win.setIgnoreMouseEvents(true)
		} else {
			win.setIgnoreMouseEvents(false)
		}
	})

	globalShortcut.register('CommandOrControl+Alt+3', () => {
		opacity = 1
		win.webContents.send('change', opacity)
		win.setIgnoreMouseEvents(false)
	})

	globalShortcut.register('Escape', () => {
		app.quit()
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
