import { ipcRenderer } from "electron";
import * as React from "react";
import { lazyInject } from "../code/Container";
import { Types } from "../code/Types";
import { MainMenu } from "./MainMenu";
import { PhotoViewer } from "./PhotoViewer";
import { MessageBox } from "./MessageBox";
import { TitleBar } from "./TitleBar";
import { INavigationServie } from "../code/services/NavigationService";
import { Channels } from "../IpcChannels";

class State {
    constructor(
        readonly isBlurEnabled?: boolean
    ) {
    }
}

export class Main extends React.Component<any, State> {
    @lazyInject(Types.NavigationServie)
    private _navigationServie: INavigationServie;

    constructor(props: any) {
        super(props);

        this.state = new State(false);        
    }

    componentDidMount(): void {
        this._navigationServie.home();
    }

    render(): JSX.Element {
        return <div 
            onKeyUp={(event) => this.onKeyPress(event)}
            tabIndex={0}
        >
            <div className={this.state.isBlurEnabled ? "blur" : ""}>
                <TitleBar />
                <MainMenu />
                <div className="mainRegion">
                    {this.props.children}
                </div>
            </div>
            <PhotoViewer />
            <MessageBox 
                onShow={() => this.enableBlur(true)} 
                onHide={() => this.enableBlur(false)} 
            />
        </div>;
    }

    private enableBlur(value: boolean) {
        this.setState(new State(value));
    }

    private onKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
        // escape
        if (event.keyCode === 27) {
            ipcRenderer.send(Channels.menuClose)
        }
    }
}