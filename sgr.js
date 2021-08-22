export function SgrCode(n) {
    // this is the start of a SGR ansi escape
    // sequence

    // https://en.wikipedia.org/wiki/ANSI_escape_code
    return `\x1b[${n}m`;
}

export const SgrTable = {
    // Resets all attributes
    'done': SgrCode(0),
    'reset': SgrCode(0),

    // Font weight
    'bold': SgrCode(1),
    'faint': SgrCode(2),

    // Font styling
    'italic': SgrCode(3), // not widely supported
    'underline': SgrCode(4),
    'strike': SgrCode(9),
    'overlined': SgrCode(53),

    // Font visibility
    'slowBlink': SgrCode(5),
    'rapidBlink': SgrCode(6), // Not widely supported
    'conceal': SgrCode(8), // not widely supported

    // Font family
    // TODO: add 10-20

    // Font size
    'super': SgrCode(73),
    'sub': SgrCode(74),

    // Font color
    'black': SgrCode(30),
    'red': SgrCode(31),
    'green': SgrCode(32),
    'yellow': SgrCode(33),
    'blue': SgrCode(34),
    'magenta': SgrCode(35),
    'cyan': SgrCode(36),
    'white': SgrCode(37),

    'gray': SgrCode(90),
    'grey': SgrCode(90),
    'brightBlack': SgrCode(90),
    'brightGreen': SgrCode(92),
    'brightYellow': SgrCode(93),
    'brightBlue': SgrCode(94),
    'brightMagenta': SgrCode(95),
    'brightCyan': SgrCode(96),
    'brightWhite': SgrCode(97),

    // Background colors
    // TODO... 

    'invert': SgrCode(7), // inconsistent emulation
};

export function ApplySequence(string, sequence, withReset = true) {
    // Add a trailing-reset if necessary
    const reset = SgrTable['reset'];
    if (withReset && !string.endsWith(reset))
        string += reset;

    // Apply the sequence before the string
    return sequence + string;
}

export function ApplyAttribute(string, attribute, table = SgrTable) {
    return ApplySequence(string, table[attribute], true);
}

class SgrString {
    constructor(string) {
        this.string = string;
    }

    toString() {
        return this.string;
    }

    valueOf() {
        return this.toString();
    }

    str() {
        return this.toString();
    }
}

function AssignMethods() {
    for (let attribute in SgrTable) {
        SgrString.prototype[attribute] = function () {
            return ApplyAttribute(this.string, attribute);
        }
        String.prototype[attribute] = function () {
            return ApplyAttribute(this, attribute);
        }
    }
}
AssignMethods();

export { SgrString };
// export { SgrString as Sgr };
// export { SgrString as SGR };