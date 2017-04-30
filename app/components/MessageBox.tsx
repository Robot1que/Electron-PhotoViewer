import { ipcRenderer } from "electron";
import { lazyInject } from "../code/Container";
import { Types } from "../code/Types";
import * as React from "react";
import { Overlay } from "./common/Overlay";
import { Settings } from "./Settings";
import { SyncProgress } from "./SyncProgress";
import { ErrorBox } from "./ErrorBox";
import { PhotoViewer } from "./PhotoViewer";
import { IMessageService } from "../code/services/MessageService";

class Props {
    onShow: () => void;
    onHide: () => void;
}

class State {
    constructor(
        readonly element: JSX.Element | null
    ) {
    }
}

export class MessageBox extends React.Component<Props, State> {
    private _hasError: boolean = false;

    @lazyInject(Types.MessageService)
    private _messageService: IMessageService;

    constructor(props: Props) {
        super(props);

        this.state = new State(null);
    }

    componentDidMount(): void {
        this._messageService.showSettingsRequested.subscribe(
            (args) => this.update(() => this.getSettings())
        );

        this._messageService.showSyncProgressRequested.subscribe(
            (args) => this.update(() => this.getSyncProgress())
        );

        this._messageService.showErrorRequested.subscribe(
            (args) => {
                this.update(() => this.getError(args.error));
                this._hasError = true;
            }
        );

        this._messageService.hideRequested.subscribe(
            (args) => {
                this.update(() => null);
            } 
        );
    }

    render(): JSX.Element | null {
        return this.state.element ?
            <Overlay>{this.state.element}</Overlay> : 
            null;
    }

    private update(elementGeter: () => JSX.Element | null) {
        if (!this._hasError) {
            let element = elementGeter();

            if (element) {
                this.props.onShow();
            }
            else {
                this.props.onHide();
            }

            this.setState(new State(element));
        }
    }

    private getSettings(): JSX.Element {
        return <Settings />;
    }

    private getSyncProgress(): JSX.Element {
        return <SyncProgress />;
    }

    private getError(error: string): JSX.Element {
        return <ErrorBox error={error} />;
    }
}