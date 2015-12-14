@echo off
pushd %~dp0

"%~dp0/tools/nodejs/node.exe" "%~dp0/tools/nodejs/node_modules/typescript/bin/tsc" "%~dp0/source/WebGLEngine.ts" --out "%~dp0/source/WebGLEngine.js" -d --sourcemap --target ES5
if %ERRORLEVEL% NEQ 0 GOTO EXIT_LABEL
"%~dp0/tools/nodejs/node.exe" "%~dp0/tools/nodejs/node_modules/typescript/bin/tsc" "%~dp0/example/code/main.ts" --out "%~dp0/example/code/main.js" -sourcemap --target ES5
if %ERRORLEVEL% NEQ 0 GOTO EXIT_LABEL
"%~dp0/tools/nodejs/node.exe" "%~dp0/tools/config/build.js"
if %ERRORLEVEL% NEQ 0 GOTO EXIT_LABEL
:EXIT_LABEL
exit %ERRORLEVEL%