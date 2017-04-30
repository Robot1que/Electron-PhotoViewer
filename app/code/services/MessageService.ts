import { injectable } from "inversify";
import { ipcRenderer, ipcMain } from "electron";
import { IEvent, EventDispatcher, EventArgs } from "../utils/Events";
import { Channels, ShowErrorRequestedArgs } from "../../IpcChannels";

export interface IMessageService {
    readonly showSettingsRequested: IEvent<EventArgs>;
    readonly showSyncProgressRequested: IEvent<EventArgs>;
    readonly showErrorRequested: IEvent<ShowErrorRequestedArgs>;
    readonly hideRequested: IEvent<EventArgs>;

    showSettings(): void;
    showSyncProgress(): void;
    showError(error: string): void;
    hide(): void;
}

@injectable()
export class MessageService implements IMessageService {
    private readonly _showSettingsRequested = new EventDispatcher<EventArgs>();
    private readonly _showSyncProgressRequested = new EventDispatcher<EventArgs>();
    private readonly _showErrorRequested = new EventDispatcher<ShowErrorRequestedArgs>();
    private readonly _hideRequested = new EventDispatcher<EventArgs>();

    get showSettingsRequested(): IEvent<EventArgs> {
        return this._showSettingsRequested;
    }

    get showSyncProgressRequested(): IEvent<EventArgs> {
        return this._showSyncProgressRequested;
    }

    get showErrorRequested(): IEvent<ShowErrorRequestedArgs> {
        return this._showErrorRequested;
    }

    get hideRequested(): IEvent<EventArgs> {
        return this._hideRequested;
    }

    constructor() {
        this.registerRenderer(ipcRenderer);
    }

    showSettings(): void {
        ipcRenderer.send(Channels.showSettingsRequested);
    }

    showSyncProgress(): void {
        ipcRenderer.send(Channels.showSyncProgressRequested);
    }

    showError(error: string): void {
        ipcRenderer.send(Channels.showErrorRequested, error);
    }

    hide(): void {
        ipcRenderer.send(Channels.hideRequested);
    }

    private registerRenderer(ipcRenderer: Electron.IpcRenderer): void {
        ipcRenderer.on(
            Channels.showSettingsRequested, 
            () => { this._showSettingsRequested.dispatch(EventArgs.Empty); }
        );

        ipcRenderer.on(
            Channels.showSyncProgressRequested, 
            () => { this._showSyncProgressRequested.dispatch(EventArgs.Empty); }
        );

        ipcRenderer.on(
            Channels.showErrorRequested,
            (event, args) => {
                this._showErrorRequested.dispatch(new ShowErrorRequestedArgs(args as string)); 
            }
        );

        ipcRenderer.on(
            Channels.hideRequested, 
            () => { this._hideRequested.dispatch(EventArgs.Empty); }
        );
    }
}