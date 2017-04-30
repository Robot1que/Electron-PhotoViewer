import { injectable } from "inversify";
import { ipcRenderer } from "electron";
import { createBrowserHistory as createHistory } from "history";

export interface INavigationServie {
    home(): void;
    folder(id: string): void;
    photo(ids: string[], index: number): void;
}

@injectable()
export class NavigationServie implements INavigationServie {
    private _history = createHistory();

    home(): void {
        this._history.push(`/folders`);
    }

    folder(id: string): void {
        this._history.push(`/folders/${id}`);
    }

    photo(ids: string[], index: number): void {
        ipcRenderer.send("open-photo", ids, index);
    }
}