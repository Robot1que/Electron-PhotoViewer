import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import { register as registerMessageService } from "./IpcMessageService";
import { Channels } from "./IpcChannels";
import { AppInfo } from "./Config";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: Electron.BrowserWindow | null;

function createWindow(): Electron.BrowserWindow {
    // Create the browser window.
    win = new BrowserWindow({ 
        width: 800, 
        height: 600,
        minWidth: 700,
        minHeight: 500,
        title: AppInfo.Title,
        backgroundColor: "#1e1e1e"
    });

    win.setMenu(new Menu());
    win.setMenuBarVisibility(false);
    win.maximize();

    // and load the index.html of the app.
    let pagePath = 
        url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        });
    win.loadURL(pagePath);

    // Open the DevTools.
    win.webContents.openDevTools({ mode: "detach" });

    // Emitted when the window is closed.
    win.on(
        'closed', 
        () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            win = null;
        }
    );

    return win;
}

function quit() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    let window = createWindow();

    registerMessageService(window.webContents);

    ipcMain.on(Channels.appQuit, () => quit());
    ipcMain.on(Channels.menuOpen, () => window.webContents.send(Channels.menuOpen));
    ipcMain.on(Channels.menuClose, () => window.webContents.send(Channels.menuClose));
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    quit();
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});