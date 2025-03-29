import path from "path";
import fs from "node:fs/promises";
import yargs from "yargs";
import crypto from "crypto";
import chokider from "chokidar";
import { JsonWebTokenError } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";

interface stageArrType {
  fileName: string;
  fullPath: string;
  fileContent: string;
}

interface CommitType {
  path: string;
  fileName: string;
  commitMsg: string;
  fileContent: string;
}

const rootDir = path.join(__dirname, "..", "..");
const targetDir = path.join(__dirname, "..", "..", "test");
const jsonPath = path.join(__dirname, "..", "trackFile.json");

let isFirstTimeToStage: boolean = true;

// Helper function

// const findAllDir = async (rootDir: string, stageArr: stageArrType[]) => {
//   const dir: string[] = await fs.readdir(rootDir);

//   for (let i = 0; i < dir.length; i++) {
//     const location: string = path.join(rootDir, dir[i]);
//     let dirPath = await fs.stat(location);
//     if (dirPath.isFile()) {
//       stageArr.push({

//         fileName: dir[i],
//         fullPath: location,
//       });
//     } else if (dirPath.isDirectory()) {
//       const subFiles = await fs.readdir(location);
//       if (subFiles.length === 0) continue;
//       await findAllDir(location, stageArr);
//     }
//   }

//   return stageArr;
// };

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
  // check the file name entered by user if file has any change stored the file path and other data as per required

  // let allDir = await fs.readdir(targetDir);

  const files: string[] = Array.isArray(argv.filename)
    ? argv.filename
    : [argv.filename as string];

  let stageArr: stageArrType[] | null = [];
  const jsonFileList: string = await fs.readFile(jsonPath, "utf-8");
  if (jsonFileList) {
    const fileList: string[] = JSON.parse(jsonFileList);
    if (files[0] === ".") {
      // when jsonFileList is not empty string
      if (jsonFileList) {
        const fileList: string[] = JSON.parse(jsonFileList);
        for (let file of fileList) {
          const fileContent = await fs.readFile(file, "utf-8");
          const fileName = file.split(`\\`).slice(-1).join("");
          const stageObj: stageArrType = {
            fileName,
            fullPath: file,
            fileContent,
          };
          stageArr.push(stageObj);
        }
        createStageJson(stageArr);
        await fs.writeFile(jsonPath, "");
      } else {
        console.log("all files are in stages");
      }

      return;
    }
  }

  // for (const file of files) {
  //   if (allDir.includes(file)) {
  //     const fileLocation: string = path.join(targetDir, file);
  //     const fileData = await fs.readFile(fileLocation);
  //     stageArr.push({
  //       $id: Date.now(),
  //       fileName: file,
  //       fullPath: fileLocation,
  //     });
  //   }
  // }

  // createStageJson(stageArr);
};

// create commit

const createCommit = async (message: string) => {
  const commitDir = path.join(rootDir, "minigit", "commits", message);
  const stagePath = path.join(rootDir, "minigit", "stages", "stages.json");

  try {
    await fs.mkdir(commitDir, { recursive: true });

    const jsonData = await fs.readFile(stagePath, "utf-8");

    if (!jsonData) {
      throw new Error("File may be empty");
    }
    const stageData = JSON.parse(jsonData);

    for (let data of stageData) {
      const commitObj: CommitType = {
        path: data.fullPath,
        fileName: data.fileName,
        commitMsg: message,
        fileContent: data.fileContent,
      };
      const hashPath = crypto
        .createHash("sha256")
        .update(JSON.stringify(commitObj))
        .digest("hex");
      const commitPath = path.join(commitDir, hashPath);
      await fs.writeFile(commitPath, JSON.stringify(commitObj, null, 2));
    }
  } catch (error) {
    console.log(error);
  }
};

const readCommits = async () => {
  const commitDir = path.join(__dirname, "..", "..", "minigit", "commits");
  const allCommitsDir = await fs.readdir(commitDir);
  const commits = [];
  for (let dir of allCommitsDir) {
    const singleCommitDir = path.join(commitDir, dir);
    const commitFilePath = await fs.readdir(singleCommitDir);
    for (let filepath of commitFilePath) {
      const uri = path.join(singleCommitDir, filepath);
      const data = await fs.readFile(uri, "utf-8");
      commits.push(JSON.parse(data));
    }
  }

  return commits;
};

const readCommitsFromClient = asyncHandler(async (req, res) => {
  const allCommits: CommitType[] = await readCommits();
  res
    .status(200)
    .json(
      new ApiResponse<CommitType[]>("Commits fetched successfully", allCommits)
    );
});

export {
  initiallizeRepo,
  stageRepo,
  createCommit,
  readCommits,
  readCommitsFromClient,
};
