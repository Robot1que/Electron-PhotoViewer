import * as fs from "async-file";
import * as path from "path";

export class File {
    static async writeText(filePath: string, data: string): Promise<void> {
        await File.createDirectory(filePath);
        await fs.writeTextFile(filePath, data);
    }
    
    static async writeBinary(filePath: string, data: Buffer) {
        await File.createDirectory(filePath);
        await fs.writeFile(filePath, data);
    }

    private static async createDirectory(filePath: string) {
        let dirPath = path.dirname(filePath);
        let dirExists = await fs.exists(dirPath);
        if (!dirExists) {
            await fs.createDirectory(dirPath);
        }
    }
}