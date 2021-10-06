import { spawn, exec } from 'child_process';

export function compile(filepath) {
    return new Promise((resolve, reject) => {
        exec(`javac ${filepath}`, (error, stdout, stderr) => {
            if (error)
                reject(error);

            resolve({ stdout, stderr });
        });
    });
}

function parseArgs(args) {
    let inQuote = false;
    
    let buffer = '';
    let out = [];

    for (let char of args) {
        if (inQuote) {

            // if in quote, 
            if (char == '"') {
                inQuote = false;
            }
            else {
                buffer += char;
            }
        }

        else {

            // if not in quote, decide what to do
            if (char == ' ') {
                out.push(buffer);
                buffer = '';
            }
            else if (char == '"') {
                inQuote = true;
            }
            else {
                buffer += char;
            }
        }
    }
    if (buffer != '') 
        out.push(buffer);
 
    return out;
}

export function run(progpath, args, stdio, controller) {

    return new Promise((resolve, reject) => {
        try {
            let child = spawn('java', [progpath, ...parseArgs(args)], {signal: controller.signal});

            let aborted = false;

            child.stdout.on('data', data => process.stdout.write(data));
            child.stderr.on('data', data => process.stderr.write(data));

            function writeToChild(line) {
                // console.log('sending to program');
                child.stdin.write(`${line}\n`);
            }

            stdio.on('line', writeToChild);

            child.on('close', (code) => {
                stdio.removeListener('line', writeToChild);
                // console.log('closing');
                // console.log(`"${progpath}" exited with code ${code}`);
                resolve({ aborted, code });
                // resolve({interrupted: false});
            });

            child.on('error', (err) => {
                // console.log('aborting');
                // console.error(err);
                // resolve(true);
                aborted = true;
            });

        } catch (err) {
            console.error(err);
        }
    });
}
