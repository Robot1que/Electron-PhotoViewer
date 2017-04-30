import { EventArgs } from "./code/utils/Events";

export class Channels {
    // Application
    static readonly appQuit: string = "app-quit";
    static readonly menuOpen: string = "menu-open";
    static readonly menuClose: string = "menu-close";

    // Messgae Box
    static readonly showSettingsRequested: string = "show-settings";
    static readonly showSyncProgressRequested: string = "show-syncProgress";
    static readonly showErrorRequested: string = "show-error";
    static readonly hideRequested: string = "dismiss-modal";
}

export class ShowErrorRequestedArgs extends EventArgs {
    constructor(readonly error: string) {
        super();
    }
}
