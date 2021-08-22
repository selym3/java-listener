import { Watcher } from './watcher.js';
import readline from 'readline';
import { run } from './java.js';
// import { exit } from 'process';
import path from 'path';

if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {

        // get target java file
        const jpath = process.argv[2];
        if (jpath === undefined) {
            throw new Error('No path provided to java-listener');
        }

        // create a file watcher 
        let watcher = new Watcher(jpath);

        // create a readline interface to handle i/o
        let controller = new AbortController();

        let io = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // when data is inputted, start running a java program 
        let running = false;

        async function runProgram() {
            if (!running) {
                // Determine what file to run
                let program = watcher.javapath;
                if (await watcher.isPathDirectory()) {
                    program = watcher.getLastModified();
                    if (program === null) {
                        throw new Error('Do not know which file to modify, specify a run file or modify the file you want to be run');
                    }
                    program = await watcher.getCompilePath(program);
                }
                program = program.replace('.java','').replace('/','.').replace('\\','.');
            
                // Run the file
                console.log(`Running ${program}...`);
                running = true;
                while (await run(program, io, controller));
                running = false;
            }
        }

        async function abortProgram() {
            if (running) {
                controller.abort();
                controller = new AbortController();
                // running = false;
            }
        }
        
        io.on('line', async line => {
            await runProgram();
            // if (line && line.charAt(0) == ':') {
            //     const cmd = line.substring(1);
            //     const seen = {};

            //     for (let char of cmd) {
            //         if (!seen[char]) {

            //             if (char == 'r') {
            //                 await runProgram();
            //             }
            //             else if (char == 'c') {
            //                 await abortProgram();
            //             }
            //             else if (char == 'q') {
            //                 process.exit(0);
            //             }

            //             seen[char] = true;
            //         }
            //     }
            // }
        });

        // run file watcher (sits in loop)
        for await (let _ of watcher.run()) {
            await abortProgram();
        }

    })();
}