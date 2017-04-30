export interface File {
    mimeType: string;
}

export interface Folder {
    childCount: number;
}

export interface Item {
    id: string;
    name: string;
    folder: Folder | undefined;
    file: File | undefined;
    thumbnails: Thumbnails[];
    parentReference: ParentReference | null;
}

export interface ParentReference {
    driveId: string;
    id: string;
    path: string;
}

export interface Thumbnails {
    large: Thumbnail;
}

export interface Thumbnail {
    width: number;
    height: number;
    url: string;
}

export interface ItemArray extends Array<Item> {
}