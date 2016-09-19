#!/bin/bash
PATH="`dirname \"$0\"`"
PATH="`( cd \"$PATH\" && pwd )`"
NODE="/usr/local/bin/node"
$NODE $PATH/node_modules/typescript/bin/tsc $PATH/source/WebGLEngine.ts --out $PATH/source/WebGLEngine.js --sourcemap --target ES5
$NODE $PATH/node_modules/typescript/bin/tsc $PATH/example/code/main.ts --out $PATH/example/code/main.js --sourcemap --target ES5
$NODE $PATH/tools/config/build.js