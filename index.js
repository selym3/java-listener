import { watcher } from './watcher.js';
import readline from 'readline';
import { compile, run } from './java.js';

import { lstatSync } from 'fs';
import path from 'path';

if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {

        /******************
         * JAVA PATH DATA *
         ******************/

        let javapath = process.argv[2];
        if (javapath === undefined) {
            console.error(`No path provided, using ${process.cwd()}`)
            javapath = './';
        }

        let isDirectory = lstatSync(javapath).isDirectory();

        function getCompilePath(filename) {
            if (isDirectory) {
                return path.join(javapath, filename);
            }
            return javapath;
        }

        function getProgramPath() {
            if (isDirectory) {
                if (active === null) {
                    return null;
                }
                return active.replace('.java','').replace('/','.').replace('\\','.');
            }
            return javapath;
        }

        /****************
         * FILE WATCHER *
         ****************/

        let active = null;

        watcher(javapath, async filename => {
            // Compile the modified file
            let compilepath = getCompilePath(filename);
            console.log(`Compiling ${javafile}...`);
            
            let { stdout, stderr } = await compile(compilepath);
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);

            active = compilepath;

            // If a program is running, kill it
            if (running) {
                console.log('Ending execution');
                await abortProgram();
            }
        });


        /*******************
         * PROGRAM CONTROL *
         *******************/

        let stdio = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let controller = new AbortController();
        let running = false;

        async function runProgram() {
            // Determine what file to run
            let program = getProgramPath();
            if (program === null) {
                console.error('Do not know which file to modify, modify and save the file you want to be run');
                return;
            }
        
            // Run the file
            console.log(`Running ${program}...`);
            running = true;
            await run(program, stdio, controller);
            running = false;
        }

        async function abortProgram() {
            controller.abort();
            controller = new AbortController();
        }

        stdio.on('line', async _ => {
            if (!running) {
                await runProgram();
            }
        });

    })();
}