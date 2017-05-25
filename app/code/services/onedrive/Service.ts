import * as http from "http";
import * as https from "https";
import * as HttpStatus from "http-status-codes";
import { ItemArray } from "./Entities";
import { HttpHelper } from "../../utils/HttpHelper";

export interface IService {
    rootChildrenGet(): Promise<ItemArray>;
    folderChildrenGet(id: string): Promise<ItemArray>;
    getContent(id: string): Promise<Buffer>;
    getContentFromUrl(url: string): Promise<Buffer>;
}

export class Service {
    private readonly urlRoot = "api.onedrive.com";
    private readonly urlQuery = "select=id,name,folder,file,parentReference&expand=thumbnails(select=large)";

    private readonly authorization: string;

    public constructor(authorization: string) {
        this.authorization = authorization;
    }

    public async rootChildrenGet(): Promise<ItemArray> {
        let json = await this.requestJson(`/drive/root/children?${this.urlQuery}`);
        let jsonObject = JSON.parse(json);
        return jsonObject.value || jsonObject;
    }

    public async folderChildrenGet(id: string): Promise<ItemArray> {
        let json = await this.requestJson(`/drive/items/${id}/children?${this.urlQuery}`);
        let jsonObject = JSON.parse(json);
        return jsonObject.value || jsonObject;
    }

    public async getContent(id: string): Promise<Buffer> {
        return await this.requestBinary(`/drive/items/${id}/content`);
    }

    public async getContentFromUrl(url: string): Promise<Buffer> {
        return await this.requestBinary(url);
    }

    private async requestBinary(resourceUrl: string): Promise<Buffer> {
        let location = await new Promise<string>(
            (resolve, reject) => {
                let options = this.requestOptionsGet(resourceUrl);
                let client = http.request(options, (res) => {
                    if (res.statusCode === HttpStatus.MOVED_TEMPORARILY) {
                        let location = res.headers["location"] as string;
                        resolve(location);
                    }
                    else {
                        let statusCodeText = HttpHelper.getStatusCodeText(res.statusCode)
                        reject(new Error(`Expected 302 (Found) but received ${statusCodeText}.`))
                    }
                });
                client.end();
            }
        );
            
        return new Promise<Buffer>(
            (resolve, reject) => {
                let client = https.get(location, (res) => HttpHelper.readBinary(res, resolve, reject));
                client.end();
            }
        );
    }

    private async requestJson(resourceUrl: string): Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                let options = this.requestOptionsGet(resourceUrl);
                let client = http.request(options, (res) => HttpHelper.readString(res, resolve, reject));
                client.end();
            }
        );
    }

    private requestOptionsGet(resourceUrl: string): http.RequestOptions {
        let headers = {
            Authorization: this.authorization
        };
        let options: http.RequestOptions = {
            hostname: this.urlRoot,
            method: "GET",
            path: "/v1.0" + resourceUrl,
            headers: headers
        };
        return options;
    }
}