import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { createCommit, initiallizeRepo, readCommits, stageRepo } from "./controllers/git.controller";




const argv = yargs(hideBin(process.argv))
  .command("init", "Initialize a github repo!", {}, initiallizeRepo)
  .command(
    "add <filename...>",
    "add file for stage",
    (yargs) => {
      return yargs.positional("filename", {
        describe: "file to add",
        type: "string",
      });
    },
    (argv) => stageRepo(argv)
  )
  .command("commit <message>", "Add a commit",(yargs) => {
    return yargs.positional("message", {
      describe: "commit a file",
      type: "string",
      
    });
  },(argv) => createCommit(argv.message ? argv.message : "hello commit"))
  .command("read","read commits",{},() => {readCommits()})
  .demandCommand(1, "You need at least one command")
  .help().argv;
