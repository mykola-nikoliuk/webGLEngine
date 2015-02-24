var http = require('http'),
		url = require('url'),
		path = require('path'),
		fs = require('fs'),
		colors = require('colors');

var mimeTypes = {
	"html" : "text/html",
	"jpeg" : "image/jpeg",
	"jpg"  : "image/jpeg",
	"png"  : "image/png",
	"js"   : "text/javascript",
	"css"  : "text/css"};

var dirname = path.dirname(process.argv[1]);
var users = {};
var randomString = 'abcdefaslkghasjndgjnasoifghsidfna;jsddn;f';
var keyLenght = 20;
var userCounter = 0;
var kickTimeout = 3 * 1000;

http.createServer(function (req, res) {
	var uri = url.parse(req.url).pathname;
	var filename = path.join(process.cwd(), uri);
	if (req.method === 'GET') {

		fs.exists(filename, function (exists) {
			if (!exists) {
				console.log(colors.red('not exists: ') + ' .\\' + path.relative(dirname, filename));
				res.writeHead(200, {'Content-Type' : 'text/plain'});
				res.write('404 Not Found\n');
				res.end();
				return;
			}
			console.log(colors.green('request:') + ' .\\' + path.relative(dirname, filename));
			var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
			res.writeHead(200, {'Content-Type' : mimeType});

			var fileStream = fs.createReadStream(filename);
			fileStream.pipe(res);

		}); //end path.exists
	}
	if (req.method === 'POST') {
		var body = [], i, id;
		req.on('data', function (chunk) { body.push(chunk); });
		req.on('end', function () {
			var response = JSON.parse(body), resData = {
				type : null
			};

//			console.log(response.id);

			if (users.hasOwnProperty(response.id)) {
				id = response.id;
				resData.type = 'update';
				users[response.id].position = response.position;
				users[response.id].angles = response.angles;
				users[response.id].updateTime = Date.now();
			}
			else {
				var key = [];
				while (key.length < keyLenght) {
					key.push(randomString[Math.random()*keyLenght|0]);
				}
				key = key.join('');
				users[key] = {
					name: 'vasya pupkin #' + userCounter,
					updateTime: Date.now(),
					position : response.position,
					angles : response.angles
				};

				if (userCounter === 0) {
					setInterval(function () {
						var time = Date.now();
						for (var user in users) {
							if (users.hasOwnProperty(user)) {
								if (time - users[user].updateTime >= kickTimeout) {
									console.log(users[user].name + ' has left the game');
									delete users[user];
								}
							}
						}
					}, 1000);
				}

				resData.type = 'logged';
				id = resData.id = key;
				userCounter++;

				console.log(users[key].name + ' has joined the game.');
			}

			resData.users = {};
			for (var user in users) {
				if(users.hasOwnProperty(user) && user !== id) {
					resData.users[users[user].name] = users[user];
				}
			}

			res.end(JSON.stringify(resData));
			res.writeHead(200, {'Content-Type' : 'text/plain'});

		});
	}
}).listen(8080);

