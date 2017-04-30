import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";
import { Types } from "./Types";
import * as OneDrive from "./services/onedrive/ServiceFactory";
import { IStorageFactory, StorageFactory } from "./services/DataStorage";
import { IMessageService, MessageService } from "./services/MessageService";
import { IErrorHandler, ErrorHandler } from "./utils/ErrorHandler";
import { IPhotoRepository, PhotoRepository } from "./services/PhotoRepository";
import { ISettingsProvider, SettingsProvider } from "./SettingsProvider";
import { INavigationServie, NavigationServie } from "./services/NavigationService";

let container = new Container({ defaultScope: "Singleton" });
let { lazyInject } = getDecorators(container);

container
    .bind<OneDrive.IServiceFactory>(Types.OneDriveServiceFactory)
    .to(OneDrive.ServiceFactory);

container.bind<IStorageFactory>(Types.StorageFactory).to(StorageFactory);
container.bind<IMessageService>(Types.MessageService).to(MessageService);
container.bind<IErrorHandler>(Types.ErrorHandler).to(ErrorHandler);
container.bind<IPhotoRepository>(Types.PhotoRepository).to(PhotoRepository);
container.bind<ISettingsProvider>(Types.SettingsProvider).to(SettingsProvider);
container.bind<INavigationServie>(Types.NavigationServie).to(NavigationServie);

export { lazyInject };
