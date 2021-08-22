import { } from './sgr.js';

export function repeat(message, stream, times) {
    while (times-->0)
        stream.write(message); 
}

export function box(messages, stream, filter=e=>e) {
    // Get the max length for box sizing
    let width = 0;
    for (let message of messages) {
        width = Math.max(width, message.length); 
    }

    // Print box to the console
    repeat('-', stream, width+4);
    stream.write('\n');

    for (let message of messages) {
        stream.write(`| `);
        repeat(' ', stream, (width - message.length)/2);
        stream.write(filter(message));
        repeat(' ', stream, (width - message.length)/2);
        stream.write(' |\n');
    }
    repeat('-', stream, width+4);
    stream.write('\n');
}

export function warn(...messages) {
    box(
        messages,
        process.stderr,
        e => e.red().bold()
    );
}

export function log(...messages) {
    box(
        messages,
        process.stderr,
        e => e.blue().bold()
    );
}

export function welcome(javapath) {
    let messages = [
        '',
        "Welcome to java listener!".magenta().bold(),
        `currently listening on ${javapath}`.italic().blue(),
        ''
    ];
    for (let message of messages)
        console.log(message);
}

