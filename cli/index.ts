import { generate } from "./command-generate";
import { binary, run } from "cmd-ts";

run(binary(generate), process.argv);
