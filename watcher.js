import { watch } from 'fs';

class Lock {
    update() {
        throw new Error('Method update() of class Lock not implemented');
    }
    isUnlocked() {
        throw new Error('Method isUnlocked() of class Lock not implemented');
    }
}

class CountLock extends Lock {
    constructor(unlockEvery) {
        super();
        this.tick = 0;
        this.unlockEvery = unlockEvery;
    }

    update() {
        this.tick++;
        this.tick%=this.unlockEvery;
    }

    isUnlocked() {
        return this.tick == 0;
    }
}
class EvenOddLock extends CountLock {
    constructor() {
        super(2);
    }
}

class TimeLock extends Lock {
    constructor(wait) {
        super();
        this.wait = wait;
        this.time = Date.now();
    }

    update() {}

    isUnlocked() {
        let now = Date.now();
        let unlocked = this.time + this.wait < now;
        
        if (unlocked) {
            this.time = now;
            return true;
        }
        else return false;
    }
}

export function watcher(javapath, callback) {
    let lock = new TimeLock(500);

    watch(javapath, async (_, filename) => {
        if (lock.isUnlocked()) {
            if (filename.endsWith('.java')) {
                await callback(filename);
            }
        }
        lock.update();
    });
}

