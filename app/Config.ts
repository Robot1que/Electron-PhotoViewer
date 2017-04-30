import * as path from "path";

export let AppInfo = {
    CompanyName: "RoboWorks",
    Title: "Photo Viewer"
};

export let Config = {
    OneDrive: {
        authTokenUrl: "https://dev.onedrive.com/auth/msa_oauth.htm"
    },
    MongoDb: {
        uri: "mongodb://localhost:27017/PhotoAlbums"
    },
    LocalStorage: {
        settingsFilePath: path.join(
            process.env["LOCALAPPDATA"], 
            AppInfo.CompanyName, 
            AppInfo.Title,
            "settings.json"
        ),
        photoCacheFolderPath: path.join(
            process.env["LOCALAPPDATA"], 
            AppInfo.CompanyName, 
            AppInfo.Title, 
            "Cache",
            "Photos"
        ),
        thumbnailCacheFolderPath: path.join(
            process.env["LOCALAPPDATA"], 
            AppInfo.CompanyName, 
            AppInfo.Title, 
            "Cache",
            "Thumbnails"
        )
    }
};