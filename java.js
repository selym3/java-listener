import { spawn, exec } from 'child_process';
import readline from 'readline';

export function compile(filepath) {
    return new Promise((resolve, reject) => {
        exec(`javac ${filepath}`, (error, stdout, stderr) => {
            if (error)
                reject(error);

            resolve({ stdout, stderr });
        });
    });
}

export function run(progpath, stdio, controller) {

    return new Promise((resolve, reject) => {
        try {
            let child = spawn('java', [progpath], {signal: controller.signal});

            child.stdout.on('data', data => process.stdout.write(data));
            child.stderr.on('data', data => process.stderr.write(data));

            function writeToChild(line) {
                console.log('sending to program');
                child.stdin.write(`${line}\n`);
            }

            stdio.on('line', writeToChild);

            child.on('close', (code) => {
                stdio.removeListener('line', writeToChild);
                // console.log('closing');
                console.log(`"${progpath}" exited with code ${code}`);
                resolve(false);
                // resolve({interrupted: false});
            });

            child.on('error', (err) => {
                // console.log('aborting');
                // console.error(err);
                resolve(true);
            });

        } catch (err) {
            reject(err);
        }
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {

        const name = 'GuessingGame';
    
        console.log('Compiling!');
        console.log('---');
        let { out, err } = await compile(`test/${name}.java`);
        console.log(`stdout: ${out}`);
        console.log(`stderr: ${err}`);
        console.log('---');
    
        console.log();
    
        console.log('Running!');
        console.log('---');
        await run(`test.${name}`);
        console.log('---');
    
    })();
}
