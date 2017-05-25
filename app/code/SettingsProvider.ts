import * as fs from "async-file";
import { injectable } from "inversify";
import { File } from "./utils/File";

class Settings {
    oneDriveAuthKey: string | null = null;
}
import { Config } from "../Config";

export interface ISettingsProvider {
    clear(): Promise<void>;

    getOneDriveAuthKey(): Promise<string | null>;
    setOneDriveAuthKey(value: string): Promise<void>;
}

@injectable()
export class SettingsProvider implements ISettingsProvider {
    private readonly _filePath = Config.LocalStorage.settingsFilePath;

    private _settings: Settings | null = null;

    public async getOneDriveAuthKey(): Promise<string | null> {
        let settings = await this.load();
        return settings.oneDriveAuthKey;
    }

    public async setOneDriveAuthKey(value: string): Promise<void> {
        let settings = await this.load();
        settings.oneDriveAuthKey = value;
        await this.save();
    }

    public async clear(): Promise<void> {
        let fileExists = await fs.exists(this._filePath);
        if (fileExists) {
            await fs.delete(this._filePath);
        }
        this._settings = null;
    }

    private async load(): Promise<Settings> {
        if (!this._settings) {
            let fileExists = await fs.exists(this._filePath);
            if (fileExists) {
                let json = await fs.readTextFile(this._filePath);
                this._settings = JSON.parse(json) as Settings;
            }
            else {
                this._settings = new Settings();
            }
        }
        return this._settings;
    }

    private async save(): Promise<void> {
        if (!this._settings) {
            this._settings = new Settings();
        }

        let json = JSON.stringify(this._settings);
        File.writeText(this._filePath, json);
    }
}