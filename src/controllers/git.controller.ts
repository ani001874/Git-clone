import path from "path";
import fs from "node:fs/promises";
import yargs from "yargs";

import crypto from "crypto";
import { json } from "node:stream/consumers";

interface stageArrType {
  $id: number;
  fileName: string;
  fullPath: string;
}

const rootDir = path.join(__dirname, "..", "..");
const targetDir = path.join(__dirname, "..", "..", "test");

// Helper function

const findAllDir = async (rootDir: string, stageArr: stageArrType[]) => {
  const dir: string[] = await fs.readdir(rootDir);

  for (let i = 0; i < dir.length; i++) {
    const location: string = path.join(rootDir, dir[i]);
    let dirPath = await fs.stat(location);
    if (dirPath.isFile()) {
      stageArr.push({
        $id: Date.now(),
        fileName: dir[i],
        fullPath: location,
      });
    } else if (dirPath.isDirectory()) {
      const subFiles = await fs.readdir(location);
      if (subFiles.length === 0) continue;
      await findAllDir(location, stageArr);
    }
  }

  return stageArr;
};

// create a json file to stages file

const createStageJson = async (stageArr: stageArrType[]) => {
  const convertJson: string = JSON.stringify(stageArr);
  const stageDir = path.join(rootDir, "minigit", "stages");

  try {
    await fs.access(stageDir);
    await fs.writeFile(path.join(stageDir, "stages.json"), convertJson);
  } catch (error) {
    await fs.mkdir(stageDir);
  }
};

// main function

const initiallizeRepo = async () => {
  try {
    const gitDir = await fs.mkdir(`${rootDir}/minigit`, { recursive: true });
  } catch (error) {
    console.log(error);
  }
};

const stageRepo = async (argv: yargs.ArgumentsCamelCase) => {
  // let x =  await  readStageJson()

  let allDir = await fs.readdir(targetDir);

  const files: string[] = Array.isArray(argv.filename)
    ? argv.filename
    : [argv.filename as string];

  let stageArr: stageArrType[] = [];

  if (files[0] === ".") {
    stageArr = await findAllDir(targetDir, stageArr);
    createStageJson(stageArr);
    return;
  }

  for (const file of files) {
    if (allDir.includes(file)) {
      const fileLocation: string = path.join(targetDir, file);
      const fileData = await fs.readFile(fileLocation);
      stageArr.push({
        $id: Date.now(),
        fileName: file,
        fullPath: fileLocation,
      });
    }
  }

  createStageJson(stageArr);
};

// create commit

const createCommit = async (message: string) => {
  const commitDir = path.join(rootDir, "minigit", "commits");
  const stagePath = path.join(rootDir, "minigit", "stages", "stages.json");



try {
    await fs.mkdir(commitDir, { recursive: true });
  
    const jsonData = await fs.readFile(stagePath, "utf-8");
  
     if(!jsonData) {
      throw new Error("File may be empty")
     }
    const stageData = JSON.parse(jsonData);
  
    for (let data of stageData) {
      const fileContent = await fs.readFile(data.fullPath, "utf-8");
      const commitObj = {
        path: data.fullPath,
        fileName: data.fileName,
        timeStamp: new Date().toISOString(),
        commitMsg: message,
      };
      const hashPath = crypto
        .createHash("sha256")
        .update(JSON.stringify(commitObj))
        .digest("hex");
      const commitPath = path.join(commitDir, hashPath);
      await fs.writeFile(commitPath, JSON.stringify(fileContent, null, 2));
    }
} catch (error) {
   console.log(error)
}
};

export { initiallizeRepo, stageRepo, createCommit };
