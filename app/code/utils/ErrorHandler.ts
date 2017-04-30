import { injectable, inject } from "inversify";
import { Types } from "../Types";
import { IMessageService } from "../services/MessageService";

export interface IErrorHandler {
    handle(error: any): void;
}

@injectable()
export class ErrorHandler implements IErrorHandler {
    private _messageService: IMessageService;

    constructor(
        @inject(Types.MessageService) messageService: IMessageService
    ) {
        this._messageService = messageService;
    }

    handle(error: any) {
        this._messageService.showError(error.toString());
    }
}
