function VZModulation() {
	this.octPol = 1;
	this.oct = 0;
	this.waveNames = [ 'Triangle', 'Saw Up', 'Saw Down', 'Square' ];
	this.wave = 0;
	this.depth = 0;
	this.rate = 0;
	this.delay = 0;
	this.multi = false;
}

VZModulation.prototype.setWave = function(wave) {
	this.wave = wave;
};

VZModulation.prototype.getWave = function() {
	return this.wave;
};

VZModulation.prototype.getWaveName = function() {
	return this.waveName[this.wave];
};

export { VZModulation };
