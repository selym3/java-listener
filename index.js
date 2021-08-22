import { Watcher } from './watcher.js';
import readline from 'readline';
import { compile, run } from './java.js';
// import { exit } from 'process';
// import path from 'path';

if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {

        // get target java director/file
        let javapath = process.argv[2];
        if (javapath === undefined) {
            console.error(`No path provided, using ${process.cwd()}`)
            javapath = './';
        }

        // create a file watcher 
        let watcher = new Watcher(javapath);

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
                        console.error('Do not know which file to modify, modify and save the file you want to be run');
                        return;
                    }
                    program = await watcher.getCompilePath(program);
                }
                program = program.replace('.java','').replace('/','.').replace('\\','.');
            
                // Run the file
                console.log(`Running ${program}...`);
                running = true;
                await run(program, io, controller);
                running = false;
            }
        }

        async function abortProgram() {
            controller.abort();
            controller = new AbortController();
        }
        
        io.on('line', async line => {
            await runProgram();
        });

        // run file watcher (sits in loop)
        for await (let javafile of watcher.watch()) {
            // Compile the modified file
            console.log(`Compiling ${javafile}...`);
            let { stdout, stderr } = await compile(javafile);
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);

            // If a program is running, kill it
            if (running) {
                console.log('Ending execution');
                await abortProgram();
            }
        }

    })();
}