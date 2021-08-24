#!/usr/bin/env node

import { watcher } from './watcher.js';
import readline from 'readline';
import { compile, run } from './java.js';

import { lstatSync } from 'fs';
import path from 'path';

import { warn, welcome, log, warnError } from './logger.js';

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

        let isDirectory;
        try {
            isDirectory = lstatSync(javapath).isDirectory();
        } catch(err) {
            // lstat throws an error if the file doesn't exist (so print an error and leave)
            warnError(err);
            return 1;
        }

        function getCompilePath(filename) {
            if (isDirectory) {
                return path.join(javapath, filename);
            }
            return javapath;
        }

        function getProgramPath() {
            let programpath = javapath;
            if (isDirectory) {
                if (active === null) {
                    return null;
                }
                programpath = active;
            }
            programpath = program.replace('.java','');
            return programpath;
        }

        /****************
         * FILE WATCHER *
         ****************/


        let active = null;
        let compiling = false;

        async function compileFile(filename) {
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
                warnError(err);
            }
        }

        watcher(javapath, async filename => {
            await compileFile(filename);
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

        // idk if this is bad practice but this allows
        // for one sigint to work 
        stdio.on('SIGINT', () => {
            log("Goodbye ;(")
            // can also call process.emit('SIGINT') here but that requires
            // a on('SIGINT') with process that just calls process.exit() 
            process.exit();
        });

        /*****************
         * STARTUP STUFF *
         *****************/
        
        // put any startup stuff here so that it can run after 
        // all the variables have been initialized

        welcome(javapath);
        if (!isDirectory) {
            await compileFile(javapath);
        }

    })();
}