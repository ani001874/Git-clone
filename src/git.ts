import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { initiallizeRepo, stageRepo } from "./controllers/git.controller";

const argv = yargs(hideBin(process.argv))
  .command("init", "Initialize a github repo!", {}, initiallizeRepo)
  .command("add <filename...>", "add file for stage",(yargs) => {
    return yargs.positional('filename',{
      describ:"file to add",
      type:'string'
    })
  }, (argv)=> stageRepo(argv))
  .demandCommand(1, "You need at least one command")
  .help().argv;


