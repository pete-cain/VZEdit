import { VZEnvelope } from './VZEnvelope.js';
import { VZKeyFollow } from './VZKeyFollow.js';

function VZModule() {
	this.active = 1;
	this.envelope = new VZEnvelope(0);
	this.keyFollow = new VZKeyFollow();
	this.modSens = 4;
	this.waveForm = 0;
	this.init();
	this.velCurve = 0;
	this.detuneFix = 0;
	this.detuneRange = 0;
	this.detune = 0; // octave
}

VZModule.prototype.init = function() {
	// to be done
};

// TODO: range check
VZModule.prototype.setDetune = function(value) {
	this.detune = value;
};

VZModule.prototype.getOctave = function() {
	return Math.abs(Math.floor(this.detune / (12 * 64)));
};

VZModule.prototype.getNote = function() {
	return Math.abs((Math.floor(this.detune / 64)) % 12);
};

VZModule.prototype.getCent = function() {
	return Math.abs(this.detune % 64);
};

export { VZModule };
