const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	// eslint-disable-line global-require
	app.quit();
}

// var initialFile = false;
const createWindow = ({initialFile} = {initialFile: false}) => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			devTools: true,
			enableRemoteModule: true,
		},
		titleBarStyle: "customButtonsOnHover",
		// titleBarStyle: "hidden",
		frame: false,
	});

	// and load the index.html of the app.
	// @ts-ignore
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	if (initialFile) {
		mainWindow.webContents.on('did-finish-load', () => {
			mainWindow.webContents.send("initial-file", initialFile);
		})
		// @ts-ignore
		mainWindow.setTitle(path.basename(initialFile));
	}

	mainWindow.once('close', updateTray);
	mainWindow.on('page-title-updated', updateTray);

	updateTray();

	return mainWindow;
};


// if (process.argv.length >= 2) {
// 	const filePath = process.argv[1];
// 	handleFile(filePath);
// }
app.on("open-file", (event, path) => {
	event.preventDefault();
	handleFile(path);
})
var handlingFile = false;
function handleFile(filePath) {
	handlingFile = true;
	// initialFile = filePath;
	app.whenReady().then(() => {
		createWindow({initialFile: filePath});
	})
	console.log(filePath);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	if (BrowserWindow.getAllWindows().length === 0 && !handlingFile) {
		createWindow();
	}
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	// if (process.platform !== "darwin") {
		app.quit();
	// }
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});


// ipcMain.on("ondragstart", (event, filePath) => {
// 	event.sender.startDrag({
// 		file: filePath,
// 		icon: "/path/to/icon.jpg",
// 	});
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.




var tray = null;
function updateTray() {
	app.whenReady().then(() => {
		if (tray === null) {
			tray = new Tray(nativeImage.createFromPath('./icon.png'));
		}
		tray.setToolTip("Image-viewer to the MAX!");
	
		let menuTemplate = [
			{
				label: "New Window",
				click() {
					createWindow();
				}
			}, {
				type: "separator",
			}
		];
		BrowserWindow.getAllWindows().forEach((win, i)=>{
			menuTemplate.push({
				label: win.title,
				click() {
					win.focus();
				}
			});
		})
		// @ts-ignore
		const dockMenu = Menu.buildFromTemplate(menuTemplate);
		app.dock.setMenu(dockMenu);
	
		tray.setContextMenu(dockMenu);
	})
}
ipcMain.on('renamed-window', updateTray);