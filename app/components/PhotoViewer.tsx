import { ipcRenderer, remote } from "electron";
import * as React from "react";
import { lazyInject } from "../code/Container";
import { Types } from "../code/Types";
import { IPhotoRepository } from "../code/services/PhotoRepository";
import { IErrorHandler } from "../code/utils/ErrorHandler";

class Props {
}

class State {
    constructor(
        readonly filePath?: string,
        readonly isBusy?: boolean
    ) {
    }
}

class Size {
    readonly ratio: number;

    constructor(
        readonly width: number, 
        readonly height: number
    ) {
        this.ratio = Size.getRatio(width, height);
    }

    static getRatio(width: number, height: number): number {
        return width / height;
    }
}

export class PhotoViewer extends React.Component<Props, State> {
    private _photoIds: string[] = [];
    private _currentIndex: number = 0;
    private _imageSize: Size | null;
    private _isCancelled: boolean = false;

    @lazyInject(Types.PhotoRepository)
    private _photoRepository: IPhotoRepository;

    @lazyInject(Types.ErrorHandler)
    private _errorHandler: IErrorHandler;

    constructor(props: Props) {
        super(props);

        this.state = new State();
    }

    async componentDidMount() {
        try {
            remote.getCurrentWindow().on("resize", () => this.onResize());
            ipcRenderer.on("open-photo", (_event, photoIds, num) => this.onPhotoOpen(photoIds, num));
        }
        catch(error) {
            this.onError(error);
        }
    }

    render(): JSX.Element | null {
        let element: JSX.Element | null = null;
        let busyElement: JSX.Element | null = null;

        if (this.state.isBusy && this.state.isBusy === true) {
            busyElement = <div
                    ref="container" 
                    className="photoViewer-container" 
                    onKeyUp={(event) => this.onKeyPress(event)}
                    onLoad={(event) => this.onContainerLoad(event)}
                    tabIndex={0}
                >
                    <div className="overlay-background" />
                </div>;
        }

        if (this.state.filePath) {
            element = <div
                ref="container" 
                className="photoViewer-container photoViewer-container-background" 
                onKeyUp={(event) => this.onKeyPress(event)}
                onLoad={(event) => this.onContainerLoad(event)}
                tabIndex={0}
            >
                <img 
                    ref="image"
                    className="photoViewer-content-horizontal"
                    src={this.state.filePath}
                    onLoad={(event) => this.onImageLoad(event)}
                />
                {busyElement}
            </div>;
        }
        else {
            element = busyElement;
        }

        return element;
    }

    private hide() {
        this._imageSize = null;
        this.setState(new State());
    }

    private async show() {
        this._isCancelled = false;

        let id = this._photoIds[this._currentIndex];
        let filePath = await this._photoRepository.getPhoto(id, () => this.onBeforeLoad());

        if (!this._isCancelled) {
            this.setState(new State(filePath));
        }
    }

    private onBeforeLoad() {
        this.setState(new State(this.state.filePath, true));
    }

    private onKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
        if (this.state.isBusy && this.state.isBusy) {
            // Escape
            if (event.keyCode === 27) {
                this._isCancelled = true;
                this.hide();
            }
        }
        else {
            // Escape
            if (event.keyCode === 27) {
                this.hide();
            }
            // Left arrow
            else if (event.keyCode === 37 && this._currentIndex > 0) {
                --this._currentIndex;
                this.show();
            }
            // Right arrow
            else if (event.keyCode === 39 && this._currentIndex + 1 < this._photoIds.length) {
                ++this._currentIndex;
                this.show();
            }
        }
    }

    private async onPhotoOpen(photoIds: string[], num: number) {
        try {
            this._photoIds = photoIds;
            this._currentIndex = num;
            await this.show();
        }
        catch(error) {
            this.onError(error);
        }
    }

    private onError(error: any) {
        this.setState(new State());
        this._errorHandler.handle(error);
    }

    private onContainerLoad(event: React.FormEvent<HTMLDivElement>) {
        event.currentTarget.focus();
    }

    private onImageLoad(event: React.FormEvent<HTMLImageElement>) {
        let image = event.currentTarget;
        this._imageSize = new Size(image.naturalWidth, image.naturalHeight);
        this.updateImageStyle();
    }

    private onResize() {
        this.updateImageStyle();
    }

    private updateImageStyle() {
        if (this._imageSize) {
            let container = this.refs["container"] as Element;
            let image = this.refs["image"] as Element;

            if (container && image) {
                let containerRatio = Size.getRatio(container.clientWidth, container.clientHeight);
                image.className = 
                    this._imageSize.ratio > containerRatio ? 
                        "photoViewer-content-horizontal" : 
                        "photoViewer-content-vertical";
            }
        }
    }
}