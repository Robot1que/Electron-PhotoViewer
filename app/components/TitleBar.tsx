import { ipcRenderer } from "electron";
import * as React from "react";
import { Channels } from "../IpcChannels";

export class TitleBar extends React.Component<{}, {}> {
    public render(): JSX.Element | null {
        return <div className="titleBar-panel">
            <button
                className="titleBar-btn-menu" 
                onClick={() => this.onMenuClick()} 
            />
        </div>
    }

    private onMenuClick() {
        ipcRenderer.send(Channels.menuOpen);
    }
}