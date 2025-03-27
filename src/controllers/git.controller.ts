import path from "path";
import fs from "node:fs/promises";
import yargs from "yargs";
import stageData from "../../minigit/stages/stages.json"
import { readFile } from "node:fs";

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
      const fileContent = await fs.readFile(location);
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
  try {
    const stages = await fs.mkdir(path.join(rootDir, "minigit", "stages"), {
      recursive: true,
    });

    
    
      const stageFilePath = path.join(rootDir, "minigit", "stages", "stages.json");
      const fileExists = await fs
        .access(stageFilePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        await fs.writeFile(stageFilePath, convertJson);
     
    } else {
      throw new Error("Folder not found");
    }
  } catch (error) {
    console.log(error);
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

// const readStageJson = async() => {
//   const fileLocation = path.join(rootDir,"minigit","stages","stages.json")
//   console.log(fileLocation)
//   // const fileData = await fs.readFile(JSON.parse(fileLocation),"utf-8" )
//   // console.log(fileData)
// }

const stageRepo = async (argv: yargs.ArgumentsCamelCase) => {

  // let x =  await  readStageJson()
    for(let x of stageData) {
      const data = await fs.readFile(x.fullPath,"utf-8")
      console.log(data)
    }
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
      console.log(fileData);
      stageArr.push({
        $id: Date.now(),
        fileName: file,
        fullPath: fileLocation,
      });
    }
  }

  createStageJson(stageArr);
};




export { initiallizeRepo, stageRepo };
