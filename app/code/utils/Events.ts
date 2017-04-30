export class EventArgs {
    static readonly Empty = new EventArgs();
}

export interface IEventHandler<T> {
    (args: T): void;
}

export interface IEvent<T extends EventArgs> {
    subscribe(handler: IEventHandler<T>): void;
    unsubscribe(handler: IEventHandler<T>): void;
}

export class EventDispatcher<T extends EventArgs> implements IEvent<T> {
    private _handlers: IEventHandler<T>[] = [];

    subscribe(handler: IEventHandler<T>): void {
        if (handler) {
            this._handlers.push(handler);
        }
    }

    unsubscribe(handler: IEventHandler<T>): void {
        if (handler) {
            let idx = this._handlers.indexOf(handler);
            if (idx !== -1) {
                this._handlers.splice(idx, 1);
            }
        }
    }

    dispatch(args: T): void {
        // Event handler can modify array, therefore copy of array is required.
        let hendlers = this._handlers.slice(0);
        for(let handler of hendlers) {
            handler(args);
        }
    }
}