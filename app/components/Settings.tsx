import open = require("open");
import { lazyInject } from "../code/Container";
import { Types } from "../code/Types";
import * as React from "react";
import { ISettingsProvider } from "../code/SettingsProvider";
import { IErrorHandler } from "../code/utils/ErrorHandler";
import { IMessageService } from "../code/services/MessageService";
import { Config } from "../Config";

class Props {
}

class State {
    constructor(
        readonly authText?: string
    ) {
    }
}

export class Settings extends React.Component<Props, State> {
    @lazyInject(Types.MessageService)
    private _messageService: IMessageService;

    @lazyInject(Types.SettingsProvider)
    private _settingsProvider: ISettingsProvider;

    @lazyInject(Types.ErrorHandler)
    private _errorHandler: IErrorHandler;

    constructor(props: Props) {
        super(props);

        this.state = new State();
    }

    async componentDidMount() {
        let authKey = await this._settingsProvider.getOneDriveAuthKey();

        let state = new State(
            authKey ? authKey : ""
        );
        this.setState(state);
    }

    render(): JSX.Element | null {
        return <form onSubmit={(e) => this.onSubmit(e)}>
            <div className="title">
                Settings
            </div>
            <dl>
                <dt>
                    OneDrive Authorization Token (you can get it from {this.getAuthTokenLink("here")}):
                </dt>
                <dd>
                    <textarea 
                        className="syncAuthText" 
                        value={this.state.authText}
                        onChange={(e) => this.onChange(e)}
                    />
                </dd>
            </dl>
            <div className="buttonPanel">
                <button
                    className="btn-accent"
                    type="submit"
                >
                    Save
                </button>
                <button
                    className="btn-standard"
                    type="button"
                    onClick={() => this.onCancel()}
                >
                    Cancel
                </button>
            </div>
        </form>;
    }

    private getAuthTokenLink(text: string): JSX.Element {
        return <a 
            href="#" 
            onClick={(event) => this.onAuthTokenGet(event)}
        >
            {text}
        </a>;
    }

    private onChange(e: React.FormEvent<HTMLTextAreaElement>) {
        this.setState(new State(e.currentTarget.value));
    }

    private hide() {
        this._messageService.hide();
    }

    private async onAuthTokenGet(event: React.FormEvent<HTMLAnchorElement>) {
        try {
            event.preventDefault();
            open(Config.OneDrive.authTokenUrl);
        }
        catch(error) {
            this._errorHandler.handle(error);
        }
    }

    private async onSubmit(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            
            let authText = this.state.authText ? this.state.authText.trim() : null
            if (authText && authText.length > 0) {
                await this._settingsProvider.setOneDriveAuthKey(authText);
            }
            this.hide();
        }
        catch(err) {
            this._errorHandler.handle(err);
        }
    }

    private onCancel() {
        this.hide();
    }
}