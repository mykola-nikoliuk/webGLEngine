///<reference path="./classes/utils/Utils.ts"/>
///<reference path="./classes/common/Pool.ts"/>
///<reference path="./classes/common/Transformations.ts"/>
///<reference path="./classes/common/LinkedTransformations.ts"/>
///<reference path="./classes/canvas/Text.ts"/>
///<reference path="./classes/mesh/Mesh.ts"/>
///<reference path="./classes/Debugger.ts"/>
///<reference path="./classes/Light.ts"/>
///<reference path="./classes/Shader.ts"/>
///<reference path="./classes/Camera.ts"/>
///<reference path="./classes/Subscribe.ts"/>
///<reference path="./classes/Render.ts"/>
///<reference path="./classes/Controller.ts"/>
///<reference path="./classes/common/Vector3.ts"/>
///<reference path="./classes/mesh/Material.ts"/>
///<reference path="./classes/animation/Frame.ts"/>
///<reference path="./classes/animation/AnimationTarget.ts"/>
///<reference path="./classes/animation/Animation.ts"/>
///<reference path="config.ts"/>

module WebGLEngine {

	import Camera = WebGLEngine.Types.Camera;
	export var Console = new Utils.Console();

	export class Engine {

		private _gl : any;
		private _canvas : CanvasRenderingContext2D|any;
		private _isReady : boolean;
		private _shader;
		private _inited : boolean;
		private _webGLNode : HTMLCanvasElement;
		private _canvasNode : HTMLCanvasElement;

		private _mvMatrix : Types.Matrix4;
		private _pMatrix : Types.Matrix4;
		private _mvMatrixStack;

		private _meshes : Types.Mesh[];
		private _lights : Types.Light[];

		private _render : Types.Render;
		private _controller : Types.Controller;

		private _shaderProgram;
		private _isLightingEnable : boolean;

		public static getCanvas() : HTMLElement {
			return document.getElementById(Config.html.canvasNodeId);
		}

		constructor(fragmentShaderPath : string, vertexShaderPath : string) {

			Console.log('Start webGL initialization.');

			this._gl = null;
			this._isReady = false;
			this._shader = null;
			this._inited = false;
			this._webGLNode = null;

			this._mvMatrixStack = [];

			this._render = new Types.Render(this, new Utils.Callback(this._internalDraw, this));
			this._controller = new Types.Controller(this);

			this._meshes = [];
			this._lights = [];
			this._shaderProgram = null;

			this._isLightingEnable = true;

			window.addEventListener('resize', Utils.bind(this.onResize, this), false);

			this._createCanvas();
			this._initGL();
			this.onResize();
			this._loadShaders(fragmentShaderPath, vertexShaderPath);
		}

		get Render() {
			return this._render;
		}

		get Controller() {
			return this._controller;
		}

		public beginDraw() : void {
			this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
			this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

			this._mvMatrix = new Types.Matrix4();
			this._pMatrix = new Types.Matrix4();
			Utils.GLMatrix.mat4.perspective(45, this._gl.viewportWidth / this._gl.viewportHeight, 1, 1000000.0, this._pMatrix.matrixArray);

			this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
			this._gl.enable(this._gl.BLEND);
				//this._gl.disable(this._gl.DEPTH_TEST);
		}

		public isReady() : boolean {
			return this._isReady;
		}

		// TODO : add draw for LinkedTransformations
		// TODO : optimize index buffers to one buffer with offset
		public draw(mesh : Types.Mesh) : void {
			var indexBuffer,
				positionBuffer,
				normalBuffer,
				colorBuffer,
				indexesPerMaterial,
				textureBuffer,
				normalMatrix3,
				normalMatrix4,
				indexOffset : number,
				bufferBoxes : Types.BuffersBox[],
				meshMaterial : Types.Material,
				i, j,
				material;

			if (!(mesh instanceof Types.Mesh) || !mesh.isReady()) {
				return;
			}

			this._mvPushMatrix();

			this._mvMatrix.copyFrom(Types.Camera.current.getGlobalMatrix()).inverse();
			this._mvMatrix.multiply(mesh.getGlobalMatrix());

			bufferBoxes = mesh.getBufferBoxes();
			for (j = 0; j < bufferBoxes.length; j++) {

				indexOffset = 0;

				indexBuffer = bufferBoxes[j].getIndexBuffer();
				positionBuffer = bufferBoxes[j].getPositionBuffer();
				normalBuffer = bufferBoxes[j].getNormalBuffer();
				colorBuffer = bufferBoxes[j].getColorBuffer();
				textureBuffer = bufferBoxes[j].getTextureBuffer();
				indexesPerMaterial = bufferBoxes[j].getIndexesPerMaterial();

				this._gl.bindBuffer(this._gl.ARRAY_BUFFER, positionBuffer);
				this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, positionBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

				this._gl.bindBuffer(this._gl.ARRAY_BUFFER, normalBuffer);
				this._gl.vertexAttribPointer(this._shaderProgram.vertexNormalAttribute, normalBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

				this._gl.bindBuffer(this._gl.ARRAY_BUFFER, colorBuffer);
				this._gl.vertexAttribPointer(this._shaderProgram.vertexColorAttribute, colorBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

				this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

				this._gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, this._pMatrix.matrixArray);
				this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, this._mvMatrix.matrixArray);
				normalMatrix4 = mesh.getGlobalNormalMatrix().matrixArray;
				normalMatrix3 = Utils.GLMatrix.mat4.toMat3(normalMatrix4, Utils.GLMatrix.mat3.create());
				this._gl.uniformMatrix3fv(this._shaderProgram.nMatrixUniform, false, normalMatrix3);

				for (material in indexesPerMaterial) {
					if (indexesPerMaterial.hasOwnProperty(material)) {

						meshMaterial = mesh.getMaterials()[material];

						if (!meshMaterial.ready) continue;

						// set texture if it has material, texture and texture already loaded
						if (material !== Types.Mesh.defaultMaterialName && meshMaterial.texture) {
							this._gl.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
							this._gl.uniform1i(this._shaderProgram.textureEnabled, 1);

							this._gl.bindBuffer(this._gl.ARRAY_BUFFER, textureBuffer);
							this._gl.vertexAttribPointer(this._shaderProgram.textureCoordAttribute, textureBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

							this._gl.activeTexture(this._gl.TEXTURE0);
							this._gl.bindTexture(this._gl.TEXTURE_2D, meshMaterial.texture);
							this._gl.uniform1i(this._shaderProgram.samplerUniform, 0);
						}
						else {
							this._gl.disableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
							this._gl.uniform1i(this._shaderProgram.textureEnabled, 0);
						}

						this._gl.uniform1i(this._shaderProgram.useLightingUniform, Number(this._isLightingEnable));

						if (this._isLightingEnable) {
							var lightEnables = [], directions = [], colors = [], distances = [],
								direction, color;

							for (i = 0; i < this._lights.length; i++) {
								direction = this._lights[i].direction;
								color = this._lights[i].color;
								lightEnables.push(this._lights[i].isEnabled());
								directions.push(direction.x);
								directions.push(direction.y);
								directions.push(direction.z);
								colors.push(color.r);
								colors.push(color.g);
								colors.push(color.b);
								distances.push(this._lights[i].distance)
							}

							this._gl.uniform1fv(this._shaderProgram.lightingDistanceUniform, distances);
							this._gl.uniform3fv(this._shaderProgram.lightColorUniform, colors);
							this._gl.uniform3fv(this._shaderProgram.lightingDirectionUniform, directions);
							this._gl.uniform1f(this._shaderProgram.materialSpecular, meshMaterial.specular);
						}

						this._gl.uniform1f(this._shaderProgram.materialDissolved, meshMaterial.dissolved);
						this._gl.drawElements(this._gl.TRIANGLES, indexesPerMaterial[material], this._gl.UNSIGNED_SHORT, indexOffset * 2);

						indexOffset += indexesPerMaterial[material];
					}
				}
			}

			this._mvPopMatrix();
		}

		public addLight(light : Types.Light) : void {
			this._lights.push(light);
		}

		public turnOnLight() : boolean {
			var changed = false;
			if (!this._isLightingEnable) {
				this._isLightingEnable = true;
				changed = false;
			}
			return changed;
		}

		public turnOffLight() : boolean {
			var changed = false;
			if (this._isLightingEnable) {
				this._isLightingEnable = false;
				changed = true;
			}
			return changed;
		}

		public onResize() : void {
			if (this._inited) {
				this._webGLNode.setAttribute('width', window.innerWidth + 'px');
				this._webGLNode.setAttribute('height', window.innerHeight + 'px');
				this._canvasNode.setAttribute('width', window.innerWidth + 'px');
				this._canvasNode.setAttribute('height', window.innerHeight + 'px');
				this._gl.viewportWidth = window.innerWidth;
				this._gl.viewportHeight = window.innerHeight;
			}
		}

		public createMesh(vertexes, textures, normals, faces, materials) : Types.Mesh {
			var mesh = new Types.Mesh(this._gl);
			mesh.fillBuffers(vertexes, textures, normals, faces, materials);
			mesh.initBuffers();
			this._meshes.push(mesh);
			return mesh;
		}

		// TODO : create importer as plugin
		public createMeshFromFile(path : string, params? : any) : Types.Mesh {
			var mesh = new Types.Mesh(this._gl),
				parameters = {
					textureRepeat: true
				};

			Console.log('Start loading mesh => "' + Utils.getFileNameFromPath(path) + '"');

			this._meshes.push(mesh);

			if (typeof params === 'object') {
				if (typeof params.textureRepeat === 'string') {
					parameters.textureRepeat = params.textureRepeat;
				}
			}
			Utils.requestManager.request(path, new Utils.Callback(this._parseObjFile, this, mesh, path, parameters));

			return mesh;
		}

		// TODO : is it works?
		public createText() : Types.Text {
			return new Types.Text(this._canvas);
		}

		// TODO : whats this? Can it be combined with Console?
		public createDebugger() : Types.Debugger {
			return new Types.Debugger(this);
		}

		public createCamera() : Types.Camera {
			return new Types.Camera();
		}

		// TODO : is it using?
		public getGLInstance() : WebGLRenderingContext {
			return this._gl;
		}

		// TODO : implement all functionality to decrease direct using of this element
		public getCanvasInstance() : CanvasRenderingContext2D|any {
			return this._canvas;
		}

		private _createCanvas() : void {
			this._webGLNode = <HTMLCanvasElement>document.getElementById(Config.html.webGLNodeId);
			if (this._webGLNode === null) {
				this._webGLNode = document.createElement('canvas');
				this._webGLNode.id = Config.html.webGLNodeId;
				// TODO : what about using app in frame?
				this._webGLNode.style.position = 'fixed';
				this._webGLNode.style.left = '0px';
				this._webGLNode.style.top = '0px';
				document.body.appendChild(this._webGLNode);
			}
			// TODO find possibility to use only one canvas element
			this._canvasNode = <HTMLCanvasElement>document.getElementById(Config.html.canvasNodeId);
			if (this._canvasNode === null) {
				this._canvasNode = document.createElement('canvas');
				this._canvasNode.id = Config.html.canvasNodeId;
				this._canvasNode.style.position = 'fixed';
				this._canvasNode.style.left = '0px';
				this._canvasNode.style.top = '0px';
				document.body.appendChild(this._canvasNode);
			}
		}

		private _initGL() {
			try {
				this._gl = this._webGLNode.getContext("webgl", {alpha:false}) || this._webGLNode.getContext("experimental-webgl", {alpha:false});
				this._canvas = this._canvasNode.getContext("2d");
				this._inited = true;
			}
			catch (e) {
			}
			if (!this._gl) {
				Console.error("Could not initialise WebGL, sorry :-(");
			}
		}

		// TODO : what this method should to do?
		private _internalDraw() : void {
			if (Types.Debugger.currentDebugger) {
				Types.Debugger.currentDebugger.draw();
			}
		}

		private _loadShaders(fragmentShaderPath : string, vertexShaderPath : string) : void {
			this._shader = new Types.Shader(this._gl);
			Console.log('Start shaders loading.');
			this._isReady = false;
			this._shader.add(
				new Utils.Callback(this._initShaders, this),
				fragmentShaderPath,
				vertexShaderPath
			);
		}

		private _initShaders() : void {
			var fragmentShader = this._shader.getFragmentShader();
			var vertexShader = this._shader.getVertexShader();

			this._shaderProgram = this._gl.createProgram();

			this._gl.attachShader(this._shaderProgram, vertexShader);
			this._gl.attachShader(this._shaderProgram, fragmentShader);
			this._gl.linkProgram(this._shaderProgram);

			if (!this._gl.getProgramParameter(this._shaderProgram, this._gl.LINK_STATUS)) {
				Console.error("Could not initialise shaders");
			}

			this._gl.useProgram(this._shaderProgram);

			this._shaderProgram.vertexPositionAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexPosition");
			this._gl.enableVertexAttribArray(this._shaderProgram.vertexPositionAttribute);

			this._shaderProgram.vertexNormalAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexNormal");
			this._gl.enableVertexAttribArray(this._shaderProgram.vertexNormalAttribute);

			this._shaderProgram.vertexColorAttribute = this._gl.getAttribLocation(this._shaderProgram, "aVertexColor");
			this._gl.enableVertexAttribArray(this._shaderProgram.vertexColorAttribute);

			this._shaderProgram.textureCoordAttribute = this._gl.getAttribLocation(this._shaderProgram, "aTextureCoord");
			this._gl.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);

			this._shaderProgram.pMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uPMatrix");
			this._shaderProgram.mvMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
			this._shaderProgram.nMatrixUniform = this._gl.getUniformLocation(this._shaderProgram, "uNMatrix");
			this._shaderProgram.samplerUniform = this._gl.getUniformLocation(this._shaderProgram, "uSampler");
			this._shaderProgram.useLightingUniform = this._gl.getUniformLocation(this._shaderProgram, "uUseLighting");
			this._shaderProgram.useLightUniform = this._gl.getUniformLocation(this._shaderProgram, "uUseLight");
			this._shaderProgram.ambientColorUniform = this._gl.getUniformLocation(this._shaderProgram, "uAmbientColor");
			this._shaderProgram.lightingDirectionUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightDirection");
			this._shaderProgram.lightColorUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightColor");
			this._shaderProgram.lightingDistanceUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightDistance");
			this._shaderProgram.textureEnabled = this._gl.getUniformLocation(this._shaderProgram, "uUseTexture");
			this._shaderProgram.materialSpecular = this._gl.getUniformLocation(this._shaderProgram, "uMaterialSpecular");
			this._shaderProgram.materialDissolved = this._gl.getUniformLocation(this._shaderProgram, "uMaterialDissolved");

			this._gl.enable(this._gl.DEPTH_TEST);

			this._isReady = true;
		}

		private _mvPushMatrix() : void {
			this._mvMatrixStack.push((new Types.Matrix4()).copyFrom(this._mvMatrix));
		}

		private _mvPopMatrix() : void {
			if (this._mvMatrixStack.length == 0) {
				throw "Invalid popMatrix!";
			}
			this._mvMatrix = this._mvMatrixStack.pop();
		}

		// TODO : move to OBJ plugin
		private _parseObjFile(objFile : string, url : string, mesh : Types.Mesh, path : string, parameters : any) : void {
			var i, j, nodes,
				vertexes = [], textures = [], normals = [],
				faces : Types.Face[][] = [],
				materials : {[materialName:string] : Types.Material} = {},
				currentMaterial = Types.Mesh.defaultMaterialName,
				objConfig = Config.File.obj,
				lineTypes = objConfig.lineTypes,
				startParsingTime = Date.now(),
				totalFaceCounter = 0,
				hasMaterial = false,
				objList, materialPath;

			Console.log('Start parsing mesh => "' + Utils.getFileNameFromPath(path) + '"');

			mesh.callback(new Utils.Callback(this._checkMeshes, this));

			materials[currentMaterial] = new Types.Material();
			faces[currentMaterial] = [];

			objConfig.lineSeparator.lastIndex = 0;
			objList = objFile.split(objConfig.lineSeparator);
			for (i = 0; i < objList.length; i++) {
				objConfig.nodeSeparator.lastIndex = 0;
				nodes = objList[i].split(objConfig.nodeSeparator);
				switch (nodes[0].toLowerCase()) {
					case lineTypes.VERTEX:
						for (j = 1; j < 4; j++) {
							vertexes.push(Number(nodes[j]));
						}
						if (nodes.length !== 4) {
							Console.error('\t_parseObjFile() : wrong parameters amount in vertex, should be 3');
						}
						break;

					case lineTypes.VERTEX_TEXTURE:
						textures.push(Number(nodes[1]));
						textures.push(Number(nodes[2]));
						break;

					case lineTypes.VERTEX_NORMAL:
						for (j = 1; j < nodes.length; j++) {
							if (nodes[j] === '') continue;
							normals.push(Number(nodes[j]));
						}
						break;

					case lineTypes.FACE:
						var lastFace = null, firstFace = null,
							faceArray : string[],
							vertex : Types.Vertex,
							face = new Types.Face();

						for (j = 1; j < nodes.length && isNaN(nodes[j]); j++) {
							faceArray = nodes[j].split('/');

							if (isNaN(Number(faceArray[0]))) break;

							vertex = new Types.Vertex(
								Number(faceArray[0]) - 1,
								(faceArray.length > 1 && faceArray[1] !== '') ? Number(faceArray[1]) - 1 : null,
								(faceArray.length > 2 && faceArray[2] !== '') ? Number(faceArray[2]) - 1 : null
							);

							if (faceArray.length < 2) {
								Console.warning('\t_parseObjFile : There is no texture coordinate');
							}

							if (j >= 4) {
								face = new Types.Face();
								face.vertexes[0] = firstFace;
								face.vertexes[1] = lastFace;
								face.vertexes[2] = vertex;
							}
							else {
								face.vertexes[j - 1] = vertex;
							}

							if (j >= 3) {
								faces[currentMaterial].push(face);
							}

							if (j === 1) {
								firstFace = vertex;
							}
							lastFace = vertex;
						}
						totalFaceCounter++;
						// if (j > 4) {
						// 	Console.warning('\t_parseObjFile : ' + (j - 1) + ' vertexes in face. ' + 'Material : ' + currentMaterial);
						// }
						break;

					case lineTypes.MATERIAL_LIBRARY:
						hasMaterial = true;
						materialPath = path.substring(0, path.lastIndexOf("/") + 1) + nodes[1];
						Utils.requestManager.request(materialPath, new Utils.Callback(this._parseMaterial, this, materialPath, mesh, parameters));
						break;

					case lineTypes.USE_MATERIAL:
						if (!materials.hasOwnProperty(nodes[1])) {
							materials[nodes[1]] = new Types.Material();
							faces[nodes[1]] = [];
						}
						currentMaterial = nodes[1];
						break;
				}
			}

			Console.log('\tdone =>' +
				' Parse time: ' + (Date.now() - startParsingTime) + 'ms' +
				' | F: ' + totalFaceCounter +
				' | V: ' + vertexes.length / 3 +
				' | VT: ' + textures.length +
				' | N: ' + normals.length / 3);
			mesh.fillBuffers(vertexes, textures, normals, faces, materials);
			if (!hasMaterial) {
				mesh.initBuffers();
			}
		}

		// TODO : move to OBJ plugin
		private _parseMaterial(mtlFile : string, url : string, path : string, mesh : Types.Mesh, parameters : any) : void {
			var mtlList, i, j, nodes, material,
				mtlConfig = Config.File.mtl,
				lineTypes = mtlConfig.lineTypes,
				allMaterials : {[materialName:string] : Types.Material} = {},
				currentMaterial : Types.Material = null;

			Console.log('Start parsing material => "' + Utils.getFileNameFromPath(path) + '"');

			mtlConfig.lineSeparator.lastIndex = 0;
			mtlList = mtlFile.split(mtlConfig.lineSeparator);
			for (i = 0; i < mtlList.length; i++) {
				mtlConfig.nodeSeparator.lastIndex = 0;
				nodes = mtlList[i].split(mtlConfig.nodeSeparator);

				// remove leading spaces and tabs
				for (j = 0; j < nodes.length; j++) {
					if (nodes[j] === '' || nodes[j] === '\t') {
						nodes.shift();
						j--;
					}
					else {
						break;
					}
				}

				if (nodes.length > 0) {
					switch (nodes[0].toLowerCase()) {
						case lineTypes.NEW_MATERIAL:
							material = new Types.Material();
							allMaterials[nodes[1]] = material;
							currentMaterial = material;
							break;

						case lineTypes.MAP_TEXTURE:
							if (currentMaterial) {
								//path = path.replace(/\\/g, '/');
								currentMaterial.loadTexture(
									this._gl,
									(path.substring(0, path.lastIndexOf("/") + 1) + nodes[1]),
									parameters.textureRepeat
								);
							}
							break;

						case lineTypes.DIFFUSE_COLOR:
							var color = new Types.Vector3(),
								colors = [];
							for (j = 1; j < nodes.length && colors.length < 3; j++) {
								if (nodes[j] === '') continue;
								colors.push(Number(nodes[j]));
								if (colors.length === 3) {
									currentMaterial.diffuseColor = color.set(colors[0], colors[1], colors[2]);
									break;
								}
							}
							if (colors.length !== 3) {
								Console.error('>>> _parseMaterial() : color.length !== 3');
							}
							break;

						case lineTypes.SPECULAR:
							//				case 'Tr':
							for (j = 1; j < nodes.length; j++) {
								if (!isNaN(nodes[j])) {
									currentMaterial.specular = Number(nodes[j]);
									break;
								}
							}
							break;

						case lineTypes.TRANSPARENCY:
						case lineTypes.DISSOLVED:
							var value;
							if (!isNaN(nodes[1])) {
								value = nodes[1];
								if (nodes[0].toLowerCase() === lineTypes.TRANSPARENCY) {
									value = 1 - value;
								}
								currentMaterial.dissolved = Number(value);
							}
							break;
					}
				}
			}

			Console.log('\tdone');

			mesh.initBuffers(allMaterials);
		}

		// TODO : probably better to move this method to Mesh manager
		private _checkMeshes() : void {
			var i : number,
				allMeshesLoaded = true;

			for (i = 0; i < this._meshes.length; i++) {
				if (!this._meshes[i].isReady()) {
					//console.log(i);
					allMeshesLoaded = false;
					break;
				}
			}
			this._controller.sendEvent(Types.Controller.Events.MESH_LOADED);
			if (allMeshesLoaded) {
				this._controller.sendEvent(Types.Controller.Events.ALL_MESHES_LOADED);
			}
		}
	}
}