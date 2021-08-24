# java-listener

node script to automatically compile and run java files when an IDE is not preferred

## howto

`node /path/to/index.js <java file or directoy (defaults to ./)>`

* permissions should be changed on windows (shebang in included)
* user can add an alias to terminal or symlink file
* node version is >=15.0.0 (because of abort controller)
* java-listener cannot detect changes to files recursively, so it is recommended to use with one file at a time
* also, java-listener does not handle packages, so it's best to use without packages and in the same folder as the files that need to be run
* if listening to a directory, the file that is run is the one that was last saved

## todo

* check for specific errors (to quit when necessary)
* add --help to index
* add better modularity to java helper function
* combine callback model with classes???
* add support for java libraries, jars, packages, etc.
