import { Config } from "../../Config";
import { inject, injectable } from "inversify";
import { Types } from "../Types";
import * as fs from "async-file";
import * as path from "path";
import * as OneDrive from "./onedrive/ServiceFactory";
import { File } from "../utils/File";

export interface IPhotoRepository {
    /**
     * Returns file system path to a photo.
     */
    getPhoto(id: string, onBeforeLoad?: () => void): Promise<string>;

    /**
     * Saves thumbnail as a file on local disk and return full path to it.
     */
    saveThumbnail(id: string, data: Buffer): Promise<string>;

    /**
     * Deletes all cached photos in the file system.
     */
    clearCache(): Promise<void>;
}

@injectable()
export class PhotoRepository implements IPhotoRepository {
    private readonly _photoCacheFolderPath = Config.LocalStorage.photoCacheFolderPath;
    private readonly _thumbnailCacheFolderPath = Config.LocalStorage.thumbnailCacheFolderPath;

    constructor(
        @inject(Types.OneDriveServiceFactory) 
        private readonly _oneDriveServiceFactory: OneDrive.IServiceFactory
    ) {
    }

    public async getPhoto(id: string, onBeforeLoad?: () => void): Promise<string> {
        let filePath = path.join(this._photoCacheFolderPath, id);
        let fileExists = await fs.exists(filePath);
        if (!fileExists) {
            if (onBeforeLoad) onBeforeLoad();
            
            let oneDriveService = await this._oneDriveServiceFactory.create();
            let data = await oneDriveService.getContent(id);
            await File.writeBinary(filePath, data);
        }
        return filePath;
    }

    public async saveThumbnail(id: string, data: Buffer): Promise<string> {
        let filePath = path.join(this._thumbnailCacheFolderPath, id);
        let fileExists = await fs.exists(filePath);
        if (fileExists) {
            await fs.unlink(filePath);
        }
        await File.writeBinary(filePath, data);
        return filePath;
    }

    public async clearCache(): Promise<void> {
        await fs.rmdir(this._photoCacheFolderPath);
    }
}

