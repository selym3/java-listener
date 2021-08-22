import { watch, lstat } from 'fs/promises';
import path from 'path';
import { compile } from './java.js';

class Lock {
    update() {
        throw new Error('Method update() of class Lock not implemented');
    }
    isLocked() {
        throw new Error('Method isLocked() of class Lock not implemented');
    }
}

class EvenOddLock extends Lock {
    constructor() {
        super();
        this.tick = 0;
    }

    update() {
        ++this.tick;
        this.tick %= 2;
    }

    isLocked() {
        return this.tick == 1;
    }

}

export class Watcher {
    constructor(javapath) {
        this.javapath = javapath;
        this.watcher = watch(javapath);
        this.lock = new EvenOddLock();

        this.lastModified = null;
    }
    
    async isPathDirectory() {
        return (await lstat(this.javapath)).isDirectory();
    }

    async getCompilePath(filename) {
        if (await this.isPathDirectory()) {
            return path.join(this.javapath, filename);
        } else {
            return this.javapath;
        }
    }

    getLastModified() {
        return this.lastModified;
    }

    async* run() {

        // This loop is waiting on file changes to recompile
        for await (let event of this.watcher) {
            if (!this.lock.isLocked()) {
                let path = await this.getCompilePath(event.filename);

                console.log(`Compiling ${path}...`);

                let { out, err } = await compile(path);
                if (out) console.log(out);
                if (err) console.error(err);

                this.lastModified = event.filename;
                yield event.filename;
            }
            this.lock.update();
        }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {

        const filepath = 'test/';//GuessingGame.java';
        const watcher = new Watcher(filepath);

        await watcher.run();
    
    })();
}
