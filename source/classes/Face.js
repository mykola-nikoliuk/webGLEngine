
/** @class Face */
var Face = function (vertexIndex, textureIndex, normalIndex) {
	this.vertexIndex = typeof vertexIndex === 'number' ? vertexIndex : 0;
	this.textureIndex = typeof textureIndex === 'number' ? textureIndex : 0;
	this.normalIndex = typeof normalIndex === 'number' ? normalIndex : 0;
};

module.exports = Face;