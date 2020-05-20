const { app, BrowserWindow, globalShortcut } = require('electron')
const ipc = require('electron').ipcRenderer

let win
let alwaysOnTopTimer
let isMaximized = false

app.commandLine.appendSwitch('enable-transparent-visuals')
app.commandLine.appendSwitch('disable-gpu')

function createWindow() {
	win = new BrowserWindow({
		width: 640,
		height: 480,
		transparent: true,
		alwaysOnTop: true,
		opacity: true,
		frame: false,
		webPreferences: {
			nodeIntegration: true
		}
	})

	win.loadFile('src/index.html')
	win.menuBarVisible = false
	win.setResizable = true

	win.on('maximize', () => {
		win.setIgnoreMouseEvents(true)
		console.log('hola')
	})
}

app.whenReady().then(() => {
	setTimeout(function() {
		createWindow()

		alwaysOnTopTimer = setInterval(() => {
			win.setAlwaysOnTop(true, 'floating', 1)
			win.setVisibleOnAllWorkspaces(true)
		}, 10)
	}, 1000)

	globalShortcut.register('CommandOrControl+Alt+F', () => {
		console.log('Fullscreen')
		if (isMaximized) {
			isMaximized = false
			win.setIgnoreMouseEvents(false)
			// win.setFocusable(false)
			win.unmaximize()
		} else {
			isMaximized = true
			win.setIgnoreMouseEvents(true)
			// win.setFocusable(true)
			win.maximize()
		}
	})

	globalShortcut.register('CommandOrControl+1', () => {
		win.webContents.send('change-1')
	})

	globalShortcut.register('CommandOrControl+2', () => {
		win.webContents.send('change-2')
	})

	globalShortcut.register('CommandOrControl+3', () => {
		win.webContents.send('change-3')
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
		clearInterval(alwaysOnTopTimer)
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
