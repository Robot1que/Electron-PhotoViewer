import { lazyInject } from "../code/Container";
import { Types } from "../code/Types";
import * as React from "react";
import { Spinner } from "./common/Spinner";
import * as OneDrive from "../code/services/onedrive/ServiceFactory";
import { IService as IOneDriveService } from "../code/services/onedrive/Service";
import * as Entities from "../code/services/onedrive/Entities";
import { IStorageFactory, IStorage } from "../code/services/DataStorage";
import { IPhotoRepository } from "../code/services/PhotoRepository";
import { IMessageService } from "../code/services/MessageService";
import { IErrorHandler } from "../code/utils/ErrorHandler";
import { HttpHelper } from "../code/utils/HttpHelper";
import { INavigationServie } from "../code/services/NavigationService";

class Props {
}

class State {
    constructor(
        readonly progressReport?: ProgressReport
    ) {
    }
}

class ProgressReport {
    details: string = "";

    constructor(readonly title: string) {
    }
}

export class SyncProgress extends React.Component<Props, State> {
    @lazyInject(Types.ErrorHandler)
    private _errorHandler: IErrorHandler;

    @lazyInject(Types.MessageService)
    private _messageService: IMessageService;

    @lazyInject(Types.StorageFactory)
    private _storageFactory: IStorageFactory;

    @lazyInject(Types.PhotoRepository)
    private _photoRepository: IPhotoRepository;

    @lazyInject(Types.OneDriveServiceFactory)
    private _oneDriveServiceFactory: OneDrive.ServiceFactory;

    @lazyInject(Types.NavigationServie)
    private _navigationServie: INavigationServie;

    constructor(props: Props) {
        super(props);

        this.state = new State();
    }

    async componentDidMount() {
        try {
            await this.synchronize();

            this._navigationServie.home();
            this._messageService.hide();
        }
        catch(error) {
            this._errorHandler.handle(error);
        }
    }

    render(): JSX.Element | null {
        return this.state.progressReport ? this.getElement(this.state.progressReport) : null;
    }

    private getElement(progressReport: ProgressReport): JSX.Element {
        return <div>
            <Spinner width={60} height={60} />
            <div className="syncProgress-messagePanel">
                <div className="syncProgress-title">
                    {progressReport.title}
                </div>
                <div className="syncProgress-details">
                    {progressReport.details}
                </div>
            </div>
        </div>
    }

    private reportProgress(progressReport: ProgressReport) {
        this.setState(new State(progressReport));
    }

    private async synchronize() {
        let progressReport = new ProgressReport("Photos information is being read from OneDrive.");
        progressReport.details = "Getting contents of the root folder...";
        this.reportProgress(progressReport);

        let oneDriveService = await this._oneDriveServiceFactory.create();

        let items = await oneDriveService.rootChildrenGet();
        let photosFolder = items.find((item) => item.name == "Photos");

        if (!photosFolder) {
            throw new Error("OnDrive 'Photos' folder has not been found");
        }

        progressReport.details = "Getting contents of the 'Photos' folder...";
        this.reportProgress(progressReport);

        items = await oneDriveService.folderChildrenGet(photosFolder.id);

        for(let item of items) {
            item.parentReference = null;
        }
        
        progressReport = 
            new ProgressReport("Found photoes information is being cached in the local storage.");
        progressReport.details = "Preparing local storage..."
        this.reportProgress(progressReport);

        let storage = await this._storageFactory.create();
        await storage.clearCache();

        progressReport.details = "Caching root folder..."
        this.reportProgress(progressReport);
        await this.cacheItems(oneDriveService, storage, items);

        var folders = items.filter((item) => item.folder ? true : false)
        for(let item of folders) {
            progressReport.details = `Caching '${ item.name }' folder...`
            this.reportProgress(progressReport);

            items = await oneDriveService.folderChildrenGet(item.id);
            await this.cacheItems(oneDriveService, storage, items);
        }

        await storage.dispose();
    }

    private async cacheItems(
        oneDriveService: IOneDriveService,
        storage: IStorage, 
        items: Entities.Item[]
    ) {
        let countPerTime = 50;
        let currentPosition = 0;

        while(currentPosition < items.length) {
            let end = currentPosition + Math.min(countPerTime, items.length - currentPosition);
            let itemInProgress = items.slice(currentPosition, end);
            
            await Promise.all(
                itemInProgress.map(
                    item =>
                        new Promise<void>(
                            async (resolve, reject) => {
                                await this.convertUrlToLocal(item);
                                resolve();
                            }
                        )
                )
            );

            currentPosition += countPerTime;
        }
        await storage.cacheItems(items);
    }

    private async convertUrlToLocal(item: Entities.Item) {
        let url = item.thumbnails[0].large.url;
        let data = await HttpHelper.getContent(url);
        let newUrl = await this._photoRepository.saveThumbnail(item.id, data);
        item.thumbnails[0].large.url = newUrl;
    }
}