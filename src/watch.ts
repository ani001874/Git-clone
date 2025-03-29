import chokidar from "chokidar";
import path from "node:path";
import fs from "node:fs/promises";

const targetDir = path.join(__dirname, "..", "test");
const jsonPath = path.join(__dirname, "trackFile.json");

const watcher = chokidar.watch(targetDir);

watcher.on("change", async (path, stats) => {
    if(stats?.isFile) {
        const jsonFileList: string = await fs.readFile(jsonPath, "utf-8");
        if (jsonFileList) {
          const fileList: string[] = JSON.parse(jsonFileList);
          if (!fileList?.includes(path)) {
            fileList.push(path);
            await fs.writeFile(jsonPath, JSON.stringify(fileList));
          } else {
            console.log("File already exists");
          }
        } else {
          console.log("NO data found");
          await fs.writeFile(jsonPath, JSON.stringify([path]));
        }
    }else {
        console.log("Folder Folder....")
    }
  
});
