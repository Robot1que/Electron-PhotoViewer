import { injectable } from "inversify";
import * as mongo from "mongodb";
import * as OneDrive from "./onedrive/Entities";
import { Config } from "../../Config";

class CollectionNames {
    static readonly Items = "Items";
}

export enum ItemType {
    File = 1,
    Folder
}

export class Item {
    constructor(
        readonly _id: string,
        readonly name: string,
        readonly type: ItemType,
        readonly parentId: string | null,
        readonly thumbnail: Thumbnail | null
    ) {

    }
}

export class Thumbnail {
    constructor(
        readonly width: number,
        readonly height: number,
        readonly url: string
    ) {

    }
}

export interface IStorageFactory {
    create(): Promise<Storage>;
}

export interface IStorage {
    dispose(): Promise<void>;
    hasCache(): Promise<boolean>;
    clearCache(): Promise<void>;
    cacheItems(items: OneDrive.Item[]): Promise<void>;
    findItems(id?: string): Promise<Item[]>;
}

@injectable()
export class StorageFactory implements IStorageFactory {
    public async create(): Promise<Storage> {
        let db = await mongo.MongoClient.connect(Config.MongoDb.uri);
        return new Storage(db);   
    }
}

class Storage implements IStorage {
    public constructor(readonly _db: mongo.Db) {
    }

    public async dispose() {
        await this._db.close();
    }

    public async hasCache(): Promise<boolean> {
        let filter = { "name": CollectionNames.Items };
        let collections = await this._db.listCollections(filter).toArray();
        return collections.length === 1;
    }

    public async clearCache() {
        let hasCache = await this.hasCache();
        if (hasCache) {
            await this._db.dropCollection(CollectionNames.Items);
        }
    }

    public async cacheItems(items: OneDrive.Item[]) {
        let documents = this.convertMany(items);
        let collection = await this.getCollection(CollectionNames.Items);
        await collection.insertMany(documents);
    }

    public async findItems(id?: string): Promise<Item[]> {
        let collection = this._db.collection(CollectionNames.Items);
        let filter = { parentId: id ? id : null };
        return await collection.find(filter).toArray();
    }

    private async getCollection(name: string) {
        let collection: mongo.Collection;

        let hasCache = await this.hasCache();
        if (!hasCache) {
            collection = await this._db.createCollection(name);
        }
        else {
            collection = await this._db.collection(name);
        }

        return collection;
    }

    private convertMany(items: OneDrive.Item[]): Item[] {
        let documents: Item[] = [];

        for(let item of items) {
            let thumbnail: Thumbnail | null = null;

            if (item.thumbnails && item.thumbnails.length > 0) {
                let itemThumbnail = item.thumbnails[0].large;
                thumbnail =
                    new Thumbnail(
                        itemThumbnail.width,
                        itemThumbnail.height,
                        itemThumbnail.url
                    );
            }

            documents.push(
                new Item(
                    item.id,
                    item.name,
                    item.folder ? ItemType.Folder : ItemType.File,
                    item.parentReference ? item.parentReference.id : null,
                    thumbnail
                )
            );
        }

        return documents;
    }
}