"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const DataStorage_1 = require("../../app/code/services/DataStorage");
const Service_1 = require("../../app/code/services/onedrive/Service");
const fs = require("async-file");
const path = require("path");
const https = require("https");
const HttpHelper_1 = require("../../app/code/utils/HttpHelper");
const File_1 = require("../../app/code/utils/File");
const Config_1 = require("../../app/Config");
let expect = chai.expect;
chai.use(chaiAsPromised);
describe("Storage", () => {
    xit("Cache is empty when there are no collections", () => __awaiter(this, void 0, void 0, function* () {
        let storageFactory = new DataStorage_1.StorageFactory();
        let storage = yield storageFactory.create();
        let hasCache = yield storage.hasCache();
        expect(hasCache).to.equal(false);
    }));
    xit("Albums caching", () => __awaiter(this, void 0, void 0, function* () {
        let storageFactory = new DataStorage_1.StorageFactory();
        let storage = yield storageFactory.create();
        let albums = [];
        let authorization = yield fs.readTextFile(__dirname + "/../../app/resources/Auth.txt");
        let oneDriveService = new Service_1.Service(authorization);
        let items = yield oneDriveService.rootChildrenGet();
        let photosFolder = items.find((item) => item.name == "Photos");
        if (photosFolder) {
            items = yield oneDriveService.folderChildrenGet(photosFolder.id);
        }
        for (let item of items) {
            item.parentReference = null;
        }
        yield storage.cacheItems(items);
        var folders = items.filter((item) => item.folder ? true : false);
        for (let item of folders) {
            items = yield oneDriveService.folderChildrenGet(item.id);
            yield storage.cacheItems(items);
        }
    }));
    xit("Item reading", () => __awaiter(this, void 0, void 0, function* () {
        let storageFactory = new DataStorage_1.StorageFactory();
        let storage = yield storageFactory.create();
        let items = yield storage.findItems();
        expect(items).to.have.any;
    }));
    it("Downloads thumbnail from URL", () => __awaiter(this, void 0, void 0, function* () {
        let url = "https://y2zfbw-ch3301.files.1drv.com/y3mLBFLZ4Mx36J-mzFJ4FSJdKY9KWHcNyRsTXTxNYyeAVwgafDEetvcbqZZID0SmEYaWk2e7VgARgeZSrrWRBqgmLKm3gr8T_DOKK_hjkMniUSxzXiTCeER5vugO1kbAPdiIO4M8c2mRt0O23ZhEXFNwg";
        let promise = new Promise((resolve, reject) => {
            let request = https.get(url, (response) => HttpHelper_1.HttpHelper.readBinary(response, resolve, reject));
            request.end();
        });
        var data = yield promise;
        let filePath = path.join(Config_1.Config.LocalStorage.thumbnailCacheFolderPath, "1.jpg");
        yield File_1.File.writeBinary(filePath, data);
    }));
});
