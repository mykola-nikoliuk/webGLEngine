### webGLEngine
----------------------
#### Summary
##### Details:
	The library that can simplify work with webGL

	Version    : v0.3.0
	Programmer : Mykola Nikoliuk
	Repository : git@github.com:nick-nikoliuk/webGLEngine.git
##### Supported browsers:
	- Chrome (webkit);
	- Firefox (gecko).
------------------
#### Configuration
##### Build for windows:
	Execute "./make.cmd".
	Build will be created in root as "./build" folder.
	Example also will be updated.
##### Build for unix-based:
	You should to install:
	- nodejs >= 0.13.0.pre;
	- typescript >= 1.5.4;
		* npm install -g typescript@1.5.4;
	After that to build the project just execute "make.bash".
	Build will be created in root as "./build" folder.
	Example also will be updated.
------------
#### Example
##### Starting:
	You have two ways to start the example.
	* First and more simple way (windows only):
		1. Run "./example/run_server.cmd" to start server;
		2. Example will be opened in default browser.
	* Second (all platforms):
		1. Upload or copy "./example" folder to you server;
		2. Open link in browser (example: http://yourserver/yourpath/example/index.html).
##### How to use:
	Click on render, a browser will catch your mouse cursor.
	Allow this function, if your browser requesting this permission.
	Now you can use mouse to look around.
	To release mouse press ESC.
	Use WASD to fly.
-------------
#### Releases
##### v0.3.0
	- linux based builder added;
	- render added;
	- console added;
	- animation added;
	- camera added;
	- camera position and rotation fix;
	- mesh structure changed;
	- frame animation added;
	- example instruction added.
##### v0.2.0
	- dev branch added;
	- project reconstructed;
	- light added;
	- sample added;
	- skybox added;
	- project clean;
##### v0.1.0
	- render added;
	- added import "obj" files with "mtl" inside;
	- added transformation (move, rotate);
	- first version created;
		