///<reference path="./classes/utils/Utils.ts"/>
///<reference path="./classes/Mesh.ts"/>
///<reference path="./classes/Face.ts"/>
///<reference path="./classes/Light.ts"/>
///<reference path="./classes/Shader.ts"/>
///<reference path="./classes/Vector3.ts"/>
///<reference path="./classes/Material.ts"/>
///<reference path="./classes/Transformations.ts"/>
///<reference path="webGLConfig.ts"/>

module webGLEngine {

	export class Engine {

		private _gl : any;
		private _isReady : boolean;
		private _shader;
		private _inited : boolean;
		private _canvasNode : HTMLCanvasElement;

		private _mvMatrix : Float32Array;
		private _pMatrix : Float32Array;
		private _mvMatrixStack;

		private _camera : Types.Transformations;
		private _meshes : Types.Mesh[];
		private _lights : Types.Light[];

		private _shaderProgram;
		private _isLightingEnable : boolean;

		constructor(fragmentShaderPath : string, vertexShaderPath : string) {

			console.log('> Start webGL initialization.');

			this._gl = null;
			this._isReady = false;
			this._shader = null;
			this._inited = false;
			this._canvasNode = null;

			this._mvMatrix = Utils.GLMatrix.mat4.create(undefined);
			this._pMatrix = Utils.GLMatrix.mat4.create(undefined);
			this._mvMatrixStack = [];

			this._camera = new Types.Transformations();

			this._meshes = [];
			this._lights = [];
			this._shaderProgram = null;

			this._isLightingEnable = true;

			window.addEventListener('resize', Utils.bind(this.onResize, this), false);

			this._crateCanvas();
			this._initGL();
			this._loadShaders(fragmentShaderPath, vertexShaderPath);
		}

		private _crateCanvas() : void {
			this._canvasNode = <HTMLCanvasElement>document.getElementById(config.html.canvasID);
			if (this._canvasNode === null) {
				this._canvasNode = document.createElement('canvas');
				this._canvasNode.id = config.html.canvasID;
				this._canvasNode.style.position = 'fixed';
				this._canvasNode.style.left = '0px';
				this._canvasNode.style.top = '0px';
				document.body.appendChild(this._canvasNode);
			}
		}

		private _initGL() {
			try {
				this._gl = this._canvasNode.getContext("webgl") || this._canvasNode.getContext("experimental-webgl");
				this._inited = true;
				this.onResize();
			}
			catch (e) {
			}
			if (!this._gl) {
				console.log("Could not initialise WebGL, sorry :-(");
			}
		}

		private _loadShaders(fragmentShaderPath : string, vertexShaderPath : string) : void {
			this._shader = new Types.Shader(this._gl);
			console.log('> Start shaders loading.');
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

			//		console.log('test: ' + typeof this._shader);
			this._gl.attachShader(this._shaderProgram, vertexShader);
			this._gl.attachShader(this._shaderProgram, fragmentShader);
			this._gl.linkProgram(this._shaderProgram);

			if (!this._gl.getProgramParameter(this._shaderProgram, this._gl.LINK_STATUS)) {
				console.log("Could not initialise shaders");
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
			this._shaderProgram.lightingPositionUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightPosition");
			this._shaderProgram.lightColorUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightColor");
			this._shaderProgram.lightingDistanceUniform = this._gl.getUniformLocation(this._shaderProgram, "uLightDistance");
			this._shaderProgram.textureEnabled = this._gl.getUniformLocation(this._shaderProgram, "uUseTexture");
			this._shaderProgram.materialSpecular = this._gl.getUniformLocation(this._shaderProgram, "uMaterialSpecular");

			this._gl.enable(this._gl.DEPTH_TEST);

			this._isReady = true;
		}

		private _mvPushMatrix() : void {
			var copy = Utils.GLMatrix.mat4.create(undefined);
			Utils.GLMatrix.mat4.set(this._mvMatrix, copy);
			this._mvMatrixStack.push(copy);
		}

		private _mvPopMatrix() : void {
			if (this._mvMatrixStack.length == 0) {
				throw "Invalid popMatrix!";
			}
			this._mvMatrix = this._mvMatrixStack.pop();
		}

		private _setMatrixUniforms() : void {
			this._gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, this._pMatrix);
			this._gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, this._mvMatrix);

			var normalMatrix = Utils.GLMatrix.mat3.create(undefined);
			Utils.GLMatrix.mat4.toInverseMat3(this._mvMatrix, normalMatrix);
			Utils.GLMatrix.mat3.transpose(normalMatrix);
			this._gl.uniformMatrix3fv(this._shaderProgram.nMatrixUniform, false, normalMatrix);
		}

		//private _degToRad(degrees : number) : number {
		//	return degrees * Math.PI / 180;
		//}

		public beginDraw() : void {
			this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
			this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

			Utils.GLMatrix.mat4.perspective(45, this._gl.viewportWidth / this._gl.viewportHeight, 1, 1000000.0, this._pMatrix);

			Utils.GLMatrix.mat4.identity(this._mvMatrix);

			// set camera position
			Utils.GLMatrix.mat4.rotateX(this._mvMatrix, this._camera.rotation.x);
			Utils.GLMatrix.mat4.rotateY(this._mvMatrix, this._camera.rotation.y);
			Utils.GLMatrix.mat4.rotateZ(this._mvMatrix, this._camera.rotation.z);
			Utils.GLMatrix.mat4.translate(this._mvMatrix, this._camera.position.getArray());

			//noinspection ConstantIfStatementJS
			if (false) {
				this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
				this._gl.enable(this._gl.BLEND);
				this._gl.disable(this._gl.DEPTH_TEST);
			} else {
				this._gl.disable(this._gl.BLEND);
				this._gl.enable(this._gl.DEPTH_TEST);
			}
		}

		public isReady() : boolean {
			return this._isReady;
		}

		public draw(mesh : Types.Mesh) : void {

			if (typeof mesh === 'undefined' || mesh === null || !mesh.isReady()) {
				return;
			}

			var vertexIndexBuffers,
				vertexPositionBuffer,
				vertexNormalBuffer,
				vertexColorBuffer,
				vertexTextureBuffer,
				transformations,
				i, material;

			this._mvPushMatrix();

			vertexIndexBuffers = mesh.getVertexIndexBuffers();
			vertexPositionBuffer = mesh.getVertexPositionBuffer();
			vertexNormalBuffer = mesh.getVertexNormalBuffer();
			vertexColorBuffer = mesh.getVertexColorBuffer();
			vertexTextureBuffer = mesh.getVertexTextureBuffer();
			transformations = mesh.getTransformations();

			// apply matrix transformations
			Utils.GLMatrix.mat4.translate(this._mvMatrix, transformations.position.getArray());
			Utils.GLMatrix.mat4.rotateZ(this._mvMatrix, transformations.rotation.z);
			Utils.GLMatrix.mat4.rotateY(this._mvMatrix, transformations.rotation.y);
			Utils.GLMatrix.mat4.rotateX(this._mvMatrix, transformations.rotation.x);
			Utils.GLMatrix.mat4.scale(this._mvMatrix, transformations.scale.getArray());

			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexPositionBuffer);
			this._gl.vertexAttribPointer(this._shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexNormalBuffer);
			this._gl.vertexAttribPointer(this._shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexColorBuffer);
			this._gl.vertexAttribPointer(this._shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

			for (material in vertexIndexBuffers) {
				if (vertexIndexBuffers.hasOwnProperty(material)) {

					if (!vertexIndexBuffers[material].material.ready) continue;

					// set texture if it has material, texture and texture already loaded
					if (material !== 'noMaterial' && vertexIndexBuffers[material].material.texture) {
						this._gl.enableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
						this._gl.uniform1i(this._shaderProgram.textureEnabled, 1);

						this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexTextureBuffer);
						this._gl.vertexAttribPointer(this._shaderProgram.textureCoordAttribute, vertexTextureBuffer.itemSize, this._gl.FLOAT, false, 0, 0);

						this._gl.activeTexture(this._gl.TEXTURE0);
						this._gl.bindTexture(this._gl.TEXTURE_2D, vertexIndexBuffers[material].material.texture);
						this._gl.uniform1i(this._shaderProgram.samplerUniform, 0);
					}
					else {
						this._gl.disableVertexAttribArray(this._shaderProgram.textureCoordAttribute);
						this._gl.uniform1i(this._shaderProgram.textureEnabled, 0);
					}

					this._gl.uniform1i(this._shaderProgram.useLightingUniform, Number(this._isLightingEnable));


					if (this._isLightingEnable) {
						var lightEnables = [], positions = [], colors = [], distances = [],
							position, color;

						for (i = 0; i < this._lights.length; i++) {
							position = this._lights[i].position;
							color = this._lights[i].color;
							lightEnables.push(this._lights[i].isEnabled());
							positions.push(position.x + this._mvMatrix[0]);
							positions.push(position.y + this._mvMatrix[1]);
							positions.push(position.z + this._mvMatrix[2]);
							colors.push(color.r);
							colors.push(color.g);
							colors.push(color.b);
							distances.push(this._lights[i].distance)
						}

						this._gl.uniform1iv(this._shaderProgram.useLightUniform, lightEnables);
						this._gl.uniform1fv(this._shaderProgram.lightingDistanceUniform, distances);
						this._gl.uniform3fv(this._shaderProgram.lightColorUniform, colors);
						this._gl.uniform3fv(this._shaderProgram.lightingPositionUniform, positions);
						this._gl.uniform1f(this._shaderProgram.materialSpecular, vertexIndexBuffers[material].material.specular);

						//						this._gl.uniform3f(this._shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);
						//						var lightingDirection = [0.0, 0.0, 0.0];
						//
						//						var adjustedLD = glMatrix.vec3.create();
						//						glMatrix.vec3.normalize(lightingDirection, adjustedLD);
						//						glMatrix.vec3.scale(adjustedLD, -1);
					}

					//					this._gl.disableVertexAttribArray(this._shaderProgram.textureCoordAttribute);

					this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffers[material].buffer);
					this._setMatrixUniforms();
					this._gl.drawElements(this._gl.TRIANGLES, vertexIndexBuffers[material].buffer.numItems, this._gl.UNSIGNED_SHORT, 0);
				}
			}
			this._mvPopMatrix();
		}

		public createLight(type : number, color : number[], param : number[], distance : number) : Types.Light {
			this._lights.push(new Types.Light(type, color, param, distance));
			return this._lights[this._lights.length - 1];
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
				this._canvasNode.setAttribute('width', window.innerWidth + 'px');
				this._canvasNode.setAttribute('height', window.innerHeight + 'px');
				this._gl.viewportWidth = window.innerWidth;
				this._gl.viewportHeight = window.innerHeight;
			}
		}

		public getCamera() : Types.Transformations {
			return this._camera;
		}

		public createMesh(vertexes, textures, normals, faces, materials) : Types.Mesh {
			var mesh = new Types.Mesh(this._gl);
			mesh.fillBuffers(vertexes, textures, normals, faces, materials);
			mesh.initBuffers();
			this._meshes.push(mesh);
			return mesh;
		}

		private _createMeshFromFile(path : string, params : any) : Types.Mesh {
			var mesh = new Types.Mesh(this._gl),
				parameters = {
					textureRepeat: true
				};

			console.log('> Start loading mesh');

			this._meshes.push(mesh);

			if (typeof params === 'object') {
				if (typeof params.textureRepeat === 'boolean') {
					parameters.textureRepeat = params.textureRepeat;
				}
			}
			Utils.requestFile(path, new Utils.Callback(this._parseObjFile, this, mesh, path, parameters));

			return mesh;
		}

		private _parseObjFile(objFile : string, mesh : Types.Mesh, path : string, parameters : any) : void {
			var i, j, nodes,
				vertexes = [], textures = [], normals = [], faces = [],
				materials = [],
				currentMaterial = Types.Mesh.defaultMaterialName,
				vertexCounter,
				hasMaterial = false,
				objList, materialPath;

			// TODO : Async and fill mesh

			console.log('> Start parsing mesh');

			materials[currentMaterial] = new Types.Material();
			faces[currentMaterial] = [];

			objList = objFile.split(/\r\n|\n|\r/g);
			for (i = 0; i < objList.length; i++) {
				nodes = objList[i].split(' ');
				switch (nodes[0].toLowerCase()) {
					case 'v':
						vertexCounter = 0;
						for (j = 1; j < nodes.length && vertexCounter < 3; j++) {
							if (nodes[j] === '') continue;
							vertexCounter++;
							vertexes.push(Number(nodes[j]));
						}
						break;

					case 'vt':
						/** @class VertexTexture */
						textures.push(Number(nodes[1]));
						textures.push(Number(nodes[2]));
						break;

					case 'vn':
						for (j = 1; j < nodes.length; j++) {
							if (nodes[j] === '') continue;
							normals.push(Number(nodes[j]));
						}
						break;

					case 'f':
						if (nodes.length > 4) {
							//							console.log('face isn\'t triangle');
						}
						var lastFace = null, firstFace = null;
						for (j = 1; j < nodes.length && isNaN(nodes[j]); j++) {
							/** @class Face */
							var faceArray = nodes[j].split('/'), face;

							if (isNaN(faceArray[0])) break;

							face = new Types.Face(
								Number(faceArray[0]) - 1,
								faceArray.length > 1 ? Number(faceArray[1]) - 1 : 0,
								faceArray.length > 2 ? Number(faceArray[2]) - 1 : 0
							);

							if (j >= 4) {
								faces[currentMaterial].push(firstFace);
								faces[currentMaterial].push(lastFace);
							}

							if (j === 1) {
								firstFace = face;
							}
							lastFace = face;

							faces[currentMaterial].push(face);
						}
						break;

					case 'mtllib':
						hasMaterial = true;
						materialPath = path.substring(0, path.lastIndexOf("/") + 1) + nodes[1];
						Utils.requestFile(materialPath, new Utils.Callback(this._parseMaterial, this, materialPath, mesh, parameters));
						break;

					case 'usemtl':
						if (!materials.hasOwnProperty(nodes[1])) {
							materials[nodes[1]] = new Types.Material();
							faces[nodes[1]] = [];
						}
						currentMaterial = nodes[1];
						break;
				}
			}

			console.log('> Mesh parsed');

			mesh.fillBuffers(vertexes, textures, normals, faces, materials);
			if (!hasMaterial) {
				mesh.initBuffers();
			}
		}

		private _parseMaterial(mtlFile : string, path : string, mesh : Types.Mesh, parameters : any) : void {
			var mtlList, i, j, nodes, material, allMaterials = {};
			/** @type {Material} */
			var currentMaterial = null;

			console.log('> Start parsing material');

			mtlList = mtlFile.split(/\r\n|\n|\r/g);
			for (i = 0; i < mtlList.length; i++) {
				nodes = mtlList[i].split(' ');
				switch (nodes[0].toLowerCase()) {
					case 'newmtl':
						/** @type {Material} */
						material = new Types.Material();
						allMaterials[nodes[1]] = material;
						currentMaterial = material;
						break;

					case 'map_kd':
						if (currentMaterial) {
							currentMaterial.loadTexture(
								this._gl,
								(path.substring(0, path.lastIndexOf("/") + 1) + nodes[1]),
								parameters.textureRepeat
							);
						}
						break;

					case 'kd':
						for (j = 1; j < nodes.length; j++) {
							if (nodes[j] === '') continue;
							currentMaterial.diffuseColor[j - 1] = Number(nodes[j]);
						}
						break;

					case 'ns':
						//				case 'Tr':
						for (j = 1; j < nodes.length; j++) {
							if (!isNaN(nodes[j])) {
								currentMaterial.specular = Number(nodes[j]);
								break;
							}
						}
						break;
				}
			}

			console.log('> Material parsed');

			mesh.initBuffers(allMaterials);
		}

		public getGLInstance() : any {
			return this._gl;
		}
	}
}