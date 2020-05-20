const { app, BrowserWindow, globalShortcut, screen } = require('electron')

let win
let isMaximized = false
let lastBounds

// app.commandLine.appendSwitch('enable-transparent-visuals')
// app.commandLine.appendSwitch('disable-gpu')

function createWindow() {
	win = new BrowserWindow({
		width: 640,
		height: 480,
		transparent: true,
		alwaysOnTop: true,
		fullscreenable: false,
		opacity: true,
		frame: false,
		webPreferences: {
			nodeIntegration: true
		}
	})

	lastBounds = win.getBounds()

	win.loadFile('src/index.html')
	win.menuBarVisible = false
	win.setResizable = true
	win.setAlwaysOnTop(true)

	win.on('maximize', (e) => {
		onMaximize()
	})
}

function onMaximize() {
	isMaximized = true
	win.setIgnoreMouseEvents(true)
	lastBounds = win.getBounds()
	win.setSize(screen.getPrimaryDisplay().workAreaSize.width, screen.getPrimaryDisplay().workAreaSize.height)
	win.setPosition(0, 0)
	console.log('maximize')
}

function onMinimize() {
	console.log('unmaximize')
			isMaximized = false
			win.unmaximize()
			win.setIgnoreMouseEvents(false)
			win.setSize(lastBounds.width, lastBounds.height)
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
