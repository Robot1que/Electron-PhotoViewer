import { inject, injectable } from "inversify";
import { IService, Service } from "./Service";
import { Types } from "../../Types";
import { ISettingsProvider } from "../../SettingsProvider";

export interface IServiceFactory {
    create() : Promise<IService>;
}

@injectable()
export class ServiceFactory implements IServiceFactory {
    constructor(
        @inject(Types.SettingsProvider)
        private readonly _settingsProvider: ISettingsProvider
    ) {
    }

    public async create() : Promise<IService> {
        let authKey = await this._settingsProvider.getOneDriveAuthKey();
        if (!authKey) {
            throw new Error("Authentication key is undefined.");
        }

        return new Service(authKey);
    }
}