#!/usr/bin/env node

import { watcher } from './watcher.js';
import readline from 'readline';
import { compile, run } from './java.js';

import { lstatSync } from 'fs';
import path from 'path';

import { warn, welcome, log } from './logger.js';

if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {

        /******************
         * JAVA PATH DATA *
         ******************/

        let javapath = process.argv[2];
        if (javapath === undefined) {
            warn(`No path provided as a program argument, using this directory`);
            // console.error(`No path provided, using ${process.cwd()}`)
            javapath = './';
        }
        welcome(javapath);

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
                // This is for classes with packages (works weirdly)
                // return active.replace('.java','').replace('/','.').replace('\\','.');
                
                return active.replace('.java','');
            }
            return javapath;
        }

        /****************
         * FILE WATCHER *
         ****************/

        let active = null;
        let compiling = false;

        watcher(javapath, async filename => {
            // Compile the modified file
            let compilepath = getCompilePath(filename);
            
            active = compilepath; // set active file as soon as posible
            
            log(`Compiling ${compilepath}...`);
            
            try {

                compiling = true;
                let { stdout, stderr } = await compile(compilepath);
                compiling = false;
                if (stdout) warn(stdout);
                if (stderr) log(stderr);

                // If a program is running, kill it
                if (running) {
                    await abortProgram();
                }

                log('Finished compiling!');

            } catch (err) {
                warn(
                    ...err.name.split('\n'),
                    '',
                    ...err.message.split('\n')
                )
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
                warn('Do not know which file to modify, modify and save the file you want to be run');
                return;
            }
        
            // Run the file
            log(`Running ${program}...`);
            running = true;

            let { aborted, code } = await run(program, stdio, controller);
            log(
                ...(`${ aborted ? `"${program}" was killed earlyX` : ''}"${program}" exited with code ${code}`.split('X'))    
            );

            running = false;
        }

        async function abortProgram() {
            controller.abort();
            controller = new AbortController();
        }

        stdio.on('line', async _ => {
            if (!(running || compiling)) {
                await runProgram();
            }
        });

    })();
}