set CMD_FOLDER=%~dp0
set TOOLS_FOLDER=%CMD_FOLDER%tools\
set NODE_BIN=%TOOLS_FOLDER%node\node.exe
set CJSC=%TOOLS_FOLDER%cjsc\cjsc.js

md build\release\js\

rem bundle generate to source folder
rem cd app\source
rem "%NODE_BIN%" "%CJSC%" js/app.js js/bundle.js --source-map=bundle.js.map --source-map-url=http://localhost:63343/cjsc/app/source/


rem bundle generate to build/release folder
cd build\release\js
"%NODE_BIN%" "%CJSC%" ../../../app/source/js/app.js bundle.js --source-map=bundle.js.map
