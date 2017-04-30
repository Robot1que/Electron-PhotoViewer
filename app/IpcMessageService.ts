import { Channels } from "./IpcChannels";
import { ipcMain } from "electron";

export function register(webContents: Electron.WebContents): void {
    ipcMain.on(Channels.showSettingsRequested, () => {
        webContents.send(Channels.showSettingsRequested);
    });

    ipcMain.on(Channels.showSyncProgressRequested, () => {
        webContents.send(Channels.showSyncProgressRequested);
    });

    ipcMain.on(Channels.showErrorRequested, (event, args) => {
        webContents.send(Channels.showErrorRequested, args);
    });

    ipcMain.on(Channels.hideRequested, () => {
        webContents.send(Channels.hideRequested);
    });

    ipcMain.on("open-photo", (event, arg1, arg2) => {
        webContents.send("open-photo", arg1, arg2);
    });
}