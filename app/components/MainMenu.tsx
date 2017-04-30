import { ipcRenderer } from "electron";
import * as React from "react";
import { lazyInject } from "../code/Container";
import { Types } from "../code/Types";
import { IMessageService } from "../code/services/MessageService";
import { IErrorHandler } from "../code/utils/ErrorHandler";
import { Channels } from "../IpcChannels";

class Props {
}

export class MainMenu extends React.Component<Props, {}> {
    private static readonly menuOpenedClassName = "mainMenu-panel-opened";

    @lazyInject(Types.MessageService)
    private _messageService: IMessageService;

    @lazyInject(Types.ErrorHandler)
    private _errorHandler: IErrorHandler;

    componentDidMount(): void {
        try {
            ipcRenderer.on(Channels.menuOpen, () => this.onMenuOpen());
            ipcRenderer.on(Channels.menuClose, () => this.onMenuClose());
        }
        catch(error) {
            this._errorHandler.handle(error);
        }
    }

    render(): JSX.Element | null {
        return <div ref="panel" className="mainMenu-panel">
            <div className="mainMenu-bottom">

                <button
                    className="mainMenu-btn mainMenu-icon-sync"
                    type="button"
                    onClick={() => this.onSynchronize()}
                >
                    Synchronize
                </button>

                <button
                    className="mainMenu-btn mainMenu-icon-settings"
                    type="button"
                    onClick={() => this.onSettings()}
                >
                    Settings
                </button>

            </div>
        </div>;
    }

    private onSynchronize() {
        this._messageService.showSyncProgress();
    }

    private onSettings() {
        this._messageService.showSettings();
    }

    private onMenuOpen() {
        try {
            let panel = this.refs["panel"] as Element;
            if (!panel.classList.contains(MainMenu.menuOpenedClassName)) {
                panel.classList.add(MainMenu.menuOpenedClassName);
            }
            else {
                panel.classList.remove(MainMenu.menuOpenedClassName);
            }
        }
        catch(error) {
            this._errorHandler.handle(error);
        }
    }

    private onMenuClose() {
        try {
            let panel = this.refs["panel"] as Element;
            if (panel.classList.contains(MainMenu.menuOpenedClassName)) {
                panel.classList.remove(MainMenu.menuOpenedClassName);
            }
        }
        catch(error) {
            this._errorHandler.handle(error);
        }
    }
}