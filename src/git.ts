import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .command("init", "Initialize a github repo!", {}, () => console.log("Hello"))
  .demandCommand(1, "You need at least one command")
  .help().argv;


