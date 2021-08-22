import { spawn, exec } from 'child_process';
import readline from 'readline';

function compile(filepath) {
    return new Promise((resolve, reject) => {
        exec(`javac ${filepath}`, (error, stdout, stderr) => {
            if (error)
                reject(error);

            resolve({ stdout, stderr });
        });
    });
}

function run(progpath) {

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
    });

    stdio.on('line', line => {
        child.stdin.write(line + '\n');
    });

}


(async () => {

    const name = 'GuessingGame';

    console.log('Compiling!');
    let { out, err } = await compile(`test/${name}.java`);
    console.log(`stdout: ${out}`);
    console.log(`stderr: ${err}`);
    console.log('---');

    console.log();

    console.log('Running!');
    run(`test.${name}`);
    console.log('---');

})();


// let child = spawn('javac test/