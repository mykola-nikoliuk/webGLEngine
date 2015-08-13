%~dp0/tools/nodejs/node %~dp0/tools/nodejs/node_modules/typescript/bin/tsc %~dp0/source/WebGLEngine.ts --out %~dp0/source/WebGLEngine.js -d --sourcemap --target ES5
%~dp0/tools/nodejs/node %~dp0/tools/nodejs/node_modules/typescript/bin/tsc %~dp0/example/code/main.ts --out %~dp0/example/code/main.js -sourcemap --target ES5
%~dp0/tools/nodejs/node %~dp0/tools/config/build.js
if %ERRORLEVEL% neq 0 GOTO EXIT_LABEL
:EXIT_LABEL
exit %ERRORLEVEL%