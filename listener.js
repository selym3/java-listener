import { spawn, exec } from 'child_process';


function compile(filepath) {
    return new Promise((resolve, reject) => {
        exec(`javac ${filepath}`, (error, stdout, stderr) => {
            if (error)
                reject(error);
            
            resolve({stdout, stderr});
        });
    });
}

function run(progpath) {

    let child = spawn('java', [progpath]);
    child.stdout.on('data', data => console.log('>' + data));
    child.stderr.on('data', data => console.error('<' + data));
    
    child.on('close', (code) => {
        console.log(`"${progpath}" exited with code ${code}`);
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