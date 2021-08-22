import { watch, lstatSync } from 'fs';

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

export function watcher(javapath, callback) {
    let lock = new EvenOddLock();

    watch(javapath, async (_, filename) => {
        if (!lock.isLocked()) {
            if (filename.endsWith('.java')) {
                await callback(getCompilePath(filename));
            }
        }
        lock.update();
    });
}

