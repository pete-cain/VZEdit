function VZEnvelope(type) {
	this.time = []; // Menu 9
	this.level = []; // Menu 9
	this.velocity = []; // ???
	this.velocitySens = 7;
	this.sustain = 3;
	this.end = 5;
	this.init(type);
	this.depth = 99; // Menu 10
}

VZEnvelope.prototype.init = function(type) {
	if (type == 0) {
		this.time = [ 99, 50, 0, 0, 0, 0, 0, 0 ];
		this.level = [ 99, 0, 0, 0, 0, 0, 0, 0 ];
		this.velocity = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
	} else {
		this.time = [ 50, 50, 50, 50, 50, 50, 50, 50 ];
		this.level = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
		this.velocity = [ 0, 0, 0, 0, 0, 0, 0, 0 ];

	}
	this.velocitySens = 7;
	this.sustain = 0;
	this.end = 1;
};

export { VZEnvelope };
