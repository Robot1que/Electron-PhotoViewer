import "reflect-metadata";
import * as mocha from "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { StorageFactory } from "../../app/code/services/DataStorage";
import * as OneDrive from "../../app/code/services/onedrive/Entities";
import { Service as OneDriveService } from "../../app/code/services/onedrive/Service";
import * as fs from "async-file";
import * as path from "path";
import * as https from "https";
import { HttpHelper } from "../../app/code/utils/HttpHelper";
import { File } from "../../app/code/utils/File";
import { Config } from "../../app/Config";

let expect = chai.expect;
chai.use(chaiAsPromised);

describe(
    "Storage",
    () => {

        xit(
            "Cache is empty when there are no collections",
            async () => {
                let storageFactory = new StorageFactory();
                let storage = await storageFactory.create();    
                let hasCache = await storage.hasCache();
                expect(hasCache).to.equal(false);
            }
        );

        xit(
            "Albums caching",
            async () => {
                let storageFactory = new StorageFactory();
                let storage = await storageFactory.create();
                let albums: OneDrive.Item[] = [];

                let authorization = await fs.readTextFile(__dirname + "/../../app/resources/Auth.txt");
                let oneDriveService = new OneDriveService(authorization);
                
                let items = await oneDriveService.rootChildrenGet();
                let photosFolder = items.find((item) => item.name == "Photos");
                if (photosFolder) {
                    items = await oneDriveService.folderChildrenGet(photosFolder.id);
                }

                for(let item of items) {
                    item.parentReference = null;
                }

                await storage.cacheItems(items);

                var folders = items.filter((item) => item.folder ? true : false)
                for(let item of folders) {
                    items = await oneDriveService.folderChildrenGet(item.id);
                    await storage.cacheItems(items);
                }
            }
        );

        xit(
            "Item reading",
            async () => {
                let storageFactory = new StorageFactory();
                let storage = await storageFactory.create();
                let items = await storage.findItems();
                expect(items).to.have.any;
            }
        );

        it(
            "Downloads thumbnail from URL",
            async () => {
                let url = "https://y2zfbw-ch3301.files.1drv.com/y3mLBFLZ4Mx36J-mzFJ4FSJdKY9KWHcNyRsTXTxNYyeAVwgafDEetvcbqZZID0SmEYaWk2e7VgARgeZSrrWRBqgmLKm3gr8T_DOKK_hjkMniUSxzXiTCeER5vugO1kbAPdiIO4M8c2mRt0O23ZhEXFNwg";
                let promise = new Promise<Buffer>((resolve, reject) => { 
                    let request = https.get(url, (response) => HttpHelper.readBinary(response, resolve, reject));
                    request.end();
                });
                var data = await promise;

                let filePath = path.join(Config.LocalStorage.thumbnailCacheFolderPath, "1.jpg");
                await File.writeBinary(filePath, data);
            }
        )
    }
);
