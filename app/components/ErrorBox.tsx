import * as React from "react";
import { ipcRenderer } from "electron";
import { Channels } from "../IpcChannels";

class Props {
    error: string;
}

class State {
}

export class ErrorBox extends React.Component<Props, State> {
    render(): JSX.Element | null {
        return <div>
            <div className="error-title">
                (✖╭╮✖)
            </div>
            <textarea 
                className="error-details" 
                value={this.props.error}
                readOnly
            />
            <div className="buttonPanel">
                <button 
                    className="btn-standard"
                    type="button"
                    onClick={() => this.exitApp()}
                >
                    Close the App
                </button>
            </div>
        </div>;
    }

    private exitApp() {
        ipcRenderer.send(Channels.appQuit);
    }
}