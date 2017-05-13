import { remote } from "electron";
import * as React from "react";
import { lazyInject } from "../code/Container";
import { Types } from "../code/Types";
import { IStorageFactory, Item as DataItem, ItemType } from "../code/services/DataStorage";
import { IErrorHandler } from "../code/utils/ErrorHandler";
import { Item } from "./Item";
import { Busy } from "./common/Busy";
import { Time } from "../code/utils/Time";
import { INavigationServie } from "../code/services/NavigationService";

interface Params {
    folderId?: string;
}

interface ReactProps {
    params: Params;
}

class Props {
}

class State {
    constructor(
        readonly items?: DataItem[],
        readonly css?: React.CSSProperties
    ) {
    }
}

export class ItemList extends React.Component<Props, State> {
    private readonly _sizeChangeLogicDelay: number = 100;

    private _loadedItemCount: number = 0;
    private _loadedItemIds: string[];
    private _columnCount: number = 0;
    private _sizeChangeTime: number;

    @lazyInject(Types.StorageFactory)
    private _storageFactory: IStorageFactory;

    @lazyInject(Types.ErrorHandler)
    private _errorHandler: IErrorHandler;

    @lazyInject(Types.NavigationServie)
    private _navigationServie: INavigationServie;

    constructor(props: Props) {
        super(props);

        this.state = this.cleanStateGet();
    }

    async componentWillReceiveProps(nextProps: Props) {
        let params = (this.props as ReactProps).params;
        let nextParams = (nextProps as ReactProps).params;

        if (params.folderId != nextParams.folderId) {
            this.clearState();
            await this.updateState(nextParams.folderId);
        }
    }

    async componentDidMount() {
        try {
            await this.updateState();
        }
        catch(error) {
            this._errorHandler.handle(error);
        }
    }
    
    render(): JSX.Element {
        let element: JSX.Element;

        if (this.state.items) {
            let rows = [];
            let items = this.state.items;

            for(let i = 0; i < items.length; ++i) {
                let item = items[i];
                rows.push(
                    <div
                        key={item._id}
                        className="wrapPanelItem"
                        style={this.state.css}
                    >
                        <a
                            ref={item._id}
                            className="selectable"
                            style={{opacity: 0}}
                            onClick={() => this.navigate(items, i)}
                        >
                            <Item
                                item={item}
                                onLoad={() => this.onItemLoad(item._id)}
                            />
                        </a>
                    </div>
                );
            }
            element = 
                <div 
                    ref="rootPanel" 
                    className="wrapPanel"
                    style={{width: "100%"}}
                    onLoad={() => this.onRootPanelLoad()}
                >
                    {rows}
                </div>;
        }
        else {
            element = <Busy />;
        }

        return element;
    }

    private async loadItems(id?: string): Promise<DataItem[]> {
        let storage = await this._storageFactory.create();
        let items = await storage.findItems(id);
        await storage.dispose();
        return items;
    }

    private cleanStateGet() {
        return new State();
    }

    private clearState() {
        this.setState(this.cleanStateGet());
    }

    private async updateState(folderId?: string) {
        try {
            let items = await this.loadItems(folderId);
            this.setState(new State(items));
        }
        catch(error) {
            this._errorHandler.handle(error);
        }
    }

    private navigate(items: DataItem[], index: number): void {
        let item = items[index];

        if (item.type === ItemType.File) {
            let itemIds = items.map((x) => x._id);
            this._navigationServie.photo(itemIds, index);
        }
        else {
            this._navigationServie.folder(item._id);
        }
    }

    private async onItemLoad(id: string) {
        ++this._loadedItemCount;

        if (this.state.items && this._loadedItemCount === this.state.items.length) {
            for(let i=0; i<this.state.items.length; ++i) {
                await Time.delay(100);
                let item = this.state.items[i];
                let element = this.refs[item._id] as Element;
                element.classList.add("itemPreview-loaded");
            }
        }
    }

    private _counter: number = 0;

    private onRootPanelLoad() {
        this.setItemSize();
        remote.getCurrentWindow().on("resize", () => this.onResize());
    }

    private async onResize() {
        try {
            this._sizeChangeTime = Date.now();
            await Time.delay(this._sizeChangeLogicDelay);
            if (Date.now() - this._sizeChangeTime >= this._sizeChangeLogicDelay) {
                this.setItemSize();
            }
        }
        catch(error) {
            this._errorHandler.handle(error);
        }
    }

    private setItemSize() {
        let element = this.refs["rootPanel"] as HTMLDivElement;
        let columnCount = this.getColumnCount(element.clientWidth);
        if (this._columnCount !== columnCount) {
            this._columnCount = columnCount;
            let css: React.CSSProperties = {
                width: `${100 / this._columnCount}%`,
                opacity: 1
            };
            this.setState(new State(this.state.items, css));
        }
    }

    private getColumnCount(panelWidth: number): number {
        let itemWidthMax = 400;
        let columnCount = Math.floor(panelWidth / itemWidthMax);
        if (panelWidth % itemWidthMax !== 0) {
            ++columnCount;
        }
        return columnCount;
    }
}