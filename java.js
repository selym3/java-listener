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

export function run(progpath) {

    return new Promise((resolve, reject) => {
        try {
            let child = spawn('java', [progpath]);

            let stdio = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            child.stdout.on('data', data => process.stdout.write(data));
            child.stderr.on('data', data => process.stderr.write(data));

            child.on('close', (code) => {
                stdio.close(); 
                stdio.removeAllListeners();

                console.log(`"${progpath}" exited with code ${code}`);
                resolve();
            });

            stdio.on('line', line => {
                child.stdin.write(line + '\n');
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
