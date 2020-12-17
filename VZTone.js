/**
 * This is the internal model of a VZ Tone consisting of 
 * VZTone 
 * VZEnvelope
 * VZKeyFollow 
 * VZModule 
 * VZLine
 *
 * A tone holds 4 lines, 8 modules
 */
import { VZEnvelope } from "./VZEnvelope.js";
import { VZKeyFollow } from "./VZKeyFollow.js";
import { VZModulation } from "./VZModulation.js";
import { VZModule } from "./VZModule.js";

function VZTone() {
	this.waveName = [
		"sine",
		"saw I",
		"saw II",
		"saw III",
		"saw IV",
		"saw V",
		"noise I",
		"noise II",
	];
	this.level = 99;
	this.module = [];
	this.extPhase = [0, 0, 0];
	this.lineMix = [0, 0, 0, 0];
	this.pitchEnv = new VZEnvelope(1);
	this.pitchKF = new VZKeyFollow();
	this.pitchEnvDepth = 63;
	this.pitchEnvRange = 0;
	this.pitchAmpSens = 4;
	this.pitchCurve = 0;
	this.rateCurve = 0;
	this.rateSensitivity = 0;
	this.vibrato = new VZModulation();
	this.tremolo = new VZModulation();
	this.name = "CAIN INIT";
	this.rateKF = 	{ key: [2, 24, 36, 40, 60, 108], level: [99, 99, 99, 99, 99, 99] }
	this.octave = 0;
	this.init();
}

VZTone.prototype.copyModule = function (source, dest) {
	this.module[dest].active = this.module[source].active;
	this.module[dest].modSens = this.module[source].modSens;
	this.module[dest].detune = this.module[source].detune;
	this.module[dest].detuneFix = this.module[source].detuneFix;
	this.module[dest].detuneRange = this.module[source].detuneRange;
	this.module[dest].velCurve = this.module[source].velCurve;
	this.module[dest].waveForm = this.module[source].waveForm;
	this.copyEnv(source, dest);
	this.copyKF(source, dest);
};

VZTone.prototype.init = function () {
	for (var i = 0; i < 8; i++) {
		this.module[i] = new VZModule();
	}
};

// Menu 14
VZTone.prototype.setModulationSensitivity = function (module, value) {
	this.module[module].modSens = value;
};

VZTone.prototype.getOctaveValue = function () {
	return Math.abs(this.octave);
};

VZTone.prototype.getOctavePol = function () {
	if (this.octave < 0) {
		return 0;
	} else {
		return 1;
	}
};

VZTone.prototype.getModulationSensitivity = function (module) {
	return this.module[module].modSens;
};

VZTone.prototype.setDetune = function (module, value) {
	this.module[module].setDetune(value);
};

VZTone.prototype.getDetune = function (module) {
	return this.module[module].detune;
};

VZTone.prototype.getDetuneCoarse = function (module) {
	return this.module[module].getOctave() * 12 + this.module[module].getNote();
};

VZTone.prototype.setDetunePol = function (module, value) {
	let detune = Math.abs(this.module[module].detune);
	if (value == 0) detune = detune * -1;
	this.module[module].detune = detune;
};

VZTone.prototype.getDetuneOctave = function (module) {
	return this.module[module].getOctave();
};

VZTone.prototype.getDetuneNote = function (module) {
	return this.module[module].getNote();
};
VZTone.prototype.getDetuneCent = function (module) {
	return this.module[module].getCent();
};

VZTone.prototype.getDetuneFix = function (module) {
	return this.module[module].detuneFix;
};

VZTone.prototype.getDetuneRange = function (module) {
	return this.module[module].detuneRange;
};

VZTone.prototype.getWaveForm = function (module) {
	return this.module[module].waveForm;
};

VZTone.prototype.getDetunePol = function (module) {
	if (this.module[module].detune < 0) {
		return 0;
	} else {
		return 1;
	}
};

VZTone.prototype.setLevel = function (level) {
	this.level = level;
};

VZTone.prototype.getLevel = function () {
	return this.level;
};

VZTone.prototype.setKeyFollowRateNote = function (module, step, rateNote) {
	if (module == 8) {
		this.pitchKF.rateNote[step] = rateNote;
	} else {
		this.module[module].keyFollow.rateNote[step] = rateNote;
	}
};

VZTone.prototype.setVelCurve = function (module, curve) {
	if (module != 8) {
		this.module[module].velCurve = curve;
	} else {
		this.pitchCurve = curve;
	}
};

VZTone.prototype.getVelCurve = function (module) {
	if (module != 8) {
		return this.module[module].velCurve;
	} else {
		return this.pitchCurve;
	}
};

VZTone.prototype.setVelSens = function (module, sens) {
	this.module[module - 1].velSens = sens;
};

VZTone.prototype.getKeyFollowRateNote = function (module, step) {
	if (module == 8) {
		return this.pitchKF.rateNote[step];
	} else {
		return this.module[module].keyFollow.rateNote[step];
	}
};

VZTone.prototype.setKeyFollowRate = function (module, step, rate) {
	if (module == 8) {
		this.pitchKF.rate[step] = rate;
	} else {
		this.module[module].keyFollow.rate[step] = rate;
	}
};

VZTone.prototype.getKeyFollowRate = function (module, step) {
	if (module == 8) {
		return this.pitchKF.rate[step];
	} else {
		return this.module[module].keyFollow.rate[step];
	}
};

VZTone.prototype.setKeyFollowNote = function (module, step, note) {
	if (module == 8) {
		this.pitchKF.note[step] = note;
	} else {
		this.module[module].keyFollow.note[step] = note;
	}
};

VZTone.prototype.getKeyFollowNote = function (module, step) {
	if (module == 8) {
		return this.pitchKF.note[step];
	} else {
		return this.module[module].keyFollow.note[step];
	}
};

VZTone.prototype.setKeyFollowLevel = function (module, step, level) {
	if (module == 8) {
		this.pitchKF.level[step] = level;
	} else {
		this.module[module].keyFollow.level[step] = level;
	}
};

VZTone.prototype.getKeyFollowLevel = function (module, step) {
	if (module == 8) {
		return this.pitchKF.level[step];
	} else {
		return this.module[module].keyFollow.level[step];
	}
};

VZTone.prototype.setEnvelopeDepth = function (module, value) {
	this.module[module].envelope.depth = value;
};

VZTone.prototype.setEnvelopeTime = function (module, step, time) {
	if (module == 8) {
		this.pitchEnv.time[step] = time;
	} else {
		this.module[module].envelope.time[step] = time;
	}
};

VZTone.prototype.getEnvelopeTime = function (module, step) {
	if (module == 8) {
		return this.pitchEnv.time[step];
	} else {
		return this.module[module].envelope.time[step];
	}
};

VZTone.prototype.setEnvelopeLevel = function (module, step, level) {
	if (module == 8) {
		this.pitchEnv.level[step] = level;
	} else {
		if (level > 99) level = 99;
		this.module[module].envelope.level[step] = level;
	}
};

VZTone.prototype.getEnvelopeLevel = function (module, step) {
	if (module == 8) {
		return this.pitchEnv.level[step];
	} else {
		return this.module[module].envelope.level[step];
	}
};

VZTone.prototype.setEnvelopeVelocity = function (module, step, vel) {
	if (module == 8) {
		this.pitchEnv.velocity[step] = vel;
	} else {
		this.module[module].envelope.velocity[step] = vel;
	}
};

VZTone.prototype.getEnvelopeVelocity = function (module, step) {
	if (module == 8) {
		return this.pitchEnv.velocity[step];
	} else {
		return this.module[module].envelope.velocity[step];
	}
};

VZTone.prototype.setVelSensitivity = function (module, value) {
	if (module == 8) {
		return (this.pitchEnv.velocitySens = value);
	} else {
		this.module[module].envelope.velocitySens = value;
	}
};
VZTone.prototype.getVelSensitivity = function (module) {
	if (module == 8) {
		return this.pitchEnv.velocitySens;
	} else {
		return this.module[module].envelope.velocitySens;
	}
};

VZTone.prototype.setEnvSustain = function (module, value) {
	if (module == 8) {
		return (this.pitchEnv.sustain = value);
	} else {
		this.module[module].envelope.sustain = value;
	}
};
VZTone.prototype.getEnvSustain = function (module) {
	if (module == 8) {
		return this.pitchEnv.sustain;
	} else {
		return this.module[module].envelope.sustain;
	}
};

VZTone.prototype.setEnvEnd = function (module, value) {
	if (module == 8) {
		this.pitchEnv.end = value;
	} else {
		this.module[module].envelope.end = value;
	}
};
VZTone.prototype.getEnvEnd = function (module) {
	if (module == 8) {
		return this.pitchEnv.end;
	} else {
		return this.module[module].envelope.end;
	}
};

VZTone.prototype.setLineMix = function (line, value) {
	this.lineMix[line] = value;
};

VZTone.prototype.getLineMix = function (line) {
	return this.lineMix[line];
};

VZTone.prototype.toggleModule = function (module) {
	this.module[module].toggleState();
};

VZTone.prototype.getModuleState = function (module) {
	return this.module[module].active;
};

VZTone.prototype.setModMulti = function (type, multi) {
	if (type == "vibrato") this.vibrato.multi = multi;
	if (type == "tremolo") this.tremolo.multi = multi;
};

VZTone.prototype.setModWave = function (type, multi) {
	if (type == "vibrato") this.vibrato.wave = multi;
	if (type == "tremolo") this.tremolo.wave = multi;
};

VZTone.prototype.getModWave = function (type) {
	if (type == "vibrato") return this.vibrato.wave;
	if (type == "tremolo") return this.tremolo.wave;
};

VZTone.prototype.setModDepth = function (type, multi) {
	if (type == "vibrato") this.vibrato.depth = multi;
	if (type == "tremolo") this.tremolo.depth = multi;
};

VZTone.prototype.setModRate = function (type, multi) {
	if (type == "vibrato") this.vibrato.rate = multi;
	if (type == "tremolo") this.tremolo.rate = multi;
};

VZTone.prototype.setModDelay = function (type, multi) {
	if (type == "vibrato") this.vibrato.delay = multi;
	if (type == "tremolo") this.tremolo.delay = multi;
};

VZTone.prototype.getHexArray = function () {
	let internalToneData = [];

	// 0 Ext Phase
	internalToneData[0] =
		(this.extPhase[2] << 2) + (this.extPhase[1] << 1) + this.extPhase[0];

	// 1 ..4 Line & WaveForm
	for (let i = 0; i < 4; i++) {
		let line =
			(this.lineMix[i] << 6) +
			(this.module[1 + i * 2].waveForm << 3) +
			this.module[0 + i * 2].waveForm;
		internalToneData[1 + i] = line;
	}

	// 5 .. 20 Detune
	for (let i = 0; i < 8; i++) {
		internalToneData[5 + 2 * i] =
			(this.getDetuneCent(i) << 2) +
			(this.getDetuneFix(i) << 1) +
			this.getDetuneRange(i);
		internalToneData[5 + 2 * i + 1] =
			(this.getDetunePol(i) << 7) +
			Math.floor(Math.abs(this.getDetune(i) / 64));
	}

	// 21 .. 164 Velocity & Rate
	for (let step = 0; step < 8; step++) {
		for (let module = 0; module < 9; module++) {
			let rate = internalToneData[21 + step * 18 + module];
			rate =
				(rate & 0x80) +
				Math.floor(
					this.getEnvelopeTime(module, step) * 1.2828
				);
			internalToneData[21 + step * 18 + module] = rate;

			let sustain;

			if (this.getEnvSustain(module) == step) sustain = 0x80;
			else sustain = 0;

			let level;
			if (module != 8) {
				level =
					Math.floor(this.getEnvelopeLevel(module, step)) +
					28;
				if (level <= 28) level = 0;
			} else {
				level =
					Math.floor(this.getEnvelopeLevel(module, step)) +
					0x40;
				if (level < 1) level = 1;
				if (level > 0x7f) level = 0x7f;
			}

			internalToneData[21 + step * 18 + 9 + module] = sustain + level;

			if (this.getEnvelopeVelocity(module, step) == 0)
				internalToneData[21 + module + 18 * step] &= 0x7f;
			else internalToneData[21 + module + 18 * step] |= 0x80;
		}
	}

	// 165 .. 173 Envelope End Step / Amplitude Sensitivity
	for (let i = 0; i < 8; i++) {
		internalToneData[165 + i] =
			(this.getEnvEnd(i) << 4) +
			this.getModulationSensitivity(i);
	}
	internalToneData[165 + 8] = this.getEnvEnd(8) << 4;

	// 174 Total Level
	internalToneData[174] = 99 - this.getLevel();

	// 175 .. 182 Module on/off & Envelope Depth
	for (let i = 0; i < 8; i++) {
		let depth = this.module[i].envelope.depth;
		if (depth <= 0) {
			depth = 0x7f;
		} else {
			depth = 0x63 - depth;
		}
		internalToneData[175 + i] =
			((this.module[i].active + 1) % 2 << 7) + depth;
	}

	// 183 Pitch Envelope Depth & Range
	internalToneData[183] =
		(this.pitchEnvRange << 7) + (63 - this.pitchEnvDepth);

	// 184 .. 279 Key follow Level (Amp)
	// 280 .. 291 Key Follow Level Pitch
	var offSetkeyFollow = 184;
	for (let module = 0; module < 9; module++) {
		for (let i = 0; i < 6; i++) {
			if (this.getKeyFollowNote(module, i) > 108)
				this.setKeyFollowNote(module, i, 108);
			internalToneData[offSetkeyFollow + module * 12 + 2 * i] =
				this.getKeyFollowNote(module, i) + 0x0c;
			if (module != 8) {
				internalToneData[offSetkeyFollow + module * 12 + 2 * i + 1] =
					99 - this.getKeyFollowLevel(module, i);
				if (this.getKeyFollowLevel(module, i) == 0)
					internalToneData[
						offSetkeyFollow + module * 12 + 2 * i + 1
					] = 0x7f;
			} else {
				if (this.getKeyFollowLevel(module, i) > 63)
					this.setKeyFollowLevel(module, i, 63);
				if (this.getKeyFollowLevel(module, i) < 0)
					this.setKeyFollowLevel(module, i, 0);
				internalToneData[offSetkeyFollow + module * 12 + 2 * i + 1] =
					0x3f - this.getKeyFollowLevel(module, i);
			}
		}
	}

	// 292 .. 303 Still missing!!! not implemented
	for (let i = 0; i < 6; i++) {
		internalToneData[292 + i * 2 + 0] = this.rateKF.key[i] + 0x0c;
		let level = 0x1e + this.rateKF.level[i];
		if (this.rateKF.level[i] == 0) level = 0;
		internalToneData[292 + i * 2 + 1] = level;
	}

	// 304 .. 311 Velocity Curve & Sensitivity for Envelopes (1-06)
	for (let i = 0; i < 8; i++) {
		internalToneData[304 + i] =
			this.module[i].envelope.velocitySens +
			(this.module[i].velCurve << 5);
	}

	// 312 .. 313 Velocity Sensitivity (Pitch & Rate)
	internalToneData[312] = (this.pitchCurve << 5) + this.pitchEnv.velocitySens;
	internalToneData[313] = (this.rateCurve << 5) + this.rateSensitivity;

	// 314..321 Vibrato & Tremolo
	internalToneData[314] =
		(this.getOctavePol() << 7) +
		(this.getOctaveValue() << 5) +
		(this.vibrato.multi << 3) +
		this.vibrato.wave;
	internalToneData[315] = Math.floor(this.vibrato.depth * 1.2828);
	internalToneData[316] = Math.floor(this.vibrato.rate * 1.2828);
	internalToneData[317] = Math.floor(this.vibrato.delay * 1.2828);
	internalToneData[318] = (this.tremolo.multiA << 3) + this.tremolo.wave;
	internalToneData[319] = Math.floor(this.tremolo.depth * 1.2828);
	internalToneData[320] = Math.floor(this.tremolo.rate * 1.2828);
	internalToneData[321] = Math.floor(this.tremolo.delay * 1.2828);

	// 322 .. 335 Voice Name
	for (let i = 0; i < 14; i++) {
		let character = this.name.charCodeAt(i);
		if (isNaN(character)) character = 32;
		internalToneData[322 + i] = character;
	}

	return internalToneData;
};

VZTone.prototype.initFromHexArray = function (hexArray) {
	// 0 Ext Phase
	this.extPhase[0] = hexArray[0] & 0x01;
	this.extPhase[1] = (hexArray[0] & 0x02) >> 1;
	this.extPhase[2] = (hexArray[0] & 0x04) >> 2;

	// 1 ..4 Line & WaveForm
	for (let i = 0; i < 4; i++) {
		this.lineMix[i] = (hexArray[1 + i] & 0xc0) >> 6;
		this.module[1 + i * 2].waveForm = (hexArray[1 + i] & 0x38) >> 3;
		this.module[0 + i * 2].waveForm = hexArray[1 + i] & 0x07;
	}

	// 5 .. 20 Detune
	for (let i = 0; i < 8; i++) {
		this.setDetune(
			i,
			(hexArray[5 + 2 * i] >> 2) + (hexArray[5 + 2 * i + 1] & 0x7f) * 64
		);
		this.module[i].detuneFix = (hexArray[5 + 2 * i] & 0x02) >> 1;
		this.module[i].detuneRange = hexArray[5 + 2 * i] & 0x01;
		this.setDetunePol(i, (hexArray[5 + 2 * i + 1] & 0x80) >> 7);
	}

	// 21 .. 164 Velocity & Rate
	var sust = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
	for (var step = 0; step < 8; step++) {
		for (var module = 0; module < 9; module++) {
			this.setEnvelopeTime(
				module,
				step,
				Math.floor((hexArray[21 + step * 18 + module] & 0x7f) / 1.2828)
			);
			level = hexArray[21 + step * 18 + 9 + module] & 0x7f;
			if (module != 8) {
				this.module[module].envelope.velocity[step] =
					(hexArray[21 + step * 18 + module] & 0x80) >> 7;
				level -= 0x1d;
				if (level < 0) level = 0;
			} else {
				this.pitchEnv.velocity[step] =
					(hexArray[21 + step * 18 + module] & 0x80) >> 7;
				level -= 64;
			}

			this.setEnvelopeLevel(module, step, level);

			if ((hexArray[21 + step * 18 + 9 + module] & 0x80) != 0)
				sust[module] = step;
		}
	}
	for (let module = 0; module < 9; module++) {
		if (module != 8) {
			this.module[module].envelope.sustain = sust[module];
		} else {
			this.pitchEnv.sustain = sust[module];
		}
	}
	// 165 .. 173 Envelope End Step / Amplitude Sensitivity

	for (let i = 0; i < 9; i++) {
		this.setEnvEnd(i, hexArray[165 + i] >> 4);
		if (i == 8) {
			this.pitchAmpSens = hexArray[165 + i] & 0x0f;
		} else {
			this.module[i].modSens = hexArray[165 + i] & 0x0f;
		}
	}

	// 174 Total Level
	this.level = 99 - hexArray[174];

	// 175 .. 182 Module on/off & Envelope Depth
	for (let i = 0; i < 8; i++) {
		var depth = 0x63 - hexArray[175 + i];
		if (hexArray[175 + i] == 0x7f) depth = 0x00;
		this.module[i].envelope.depth = depth;
		this.module[i].active = ((hexArray[175 + i] >> 7) + 1) % 2;
	}

	// 183 Pitch Envelope Depth & Range
	this.pitchEnvRange = hexArray[183] >> 7;
	this.pitchEnvDepth = 63 - (hexArray[183] & 0x3f);

	// 184 .. 279 Key follow Level (Amp)
	// 280 .. 291 Key Follow Level Pitch

	for (let module = 0; module < 9; module++) {
		for (let i = 0; i < 6; i++) {
			this.setKeyFollowNote(
				module,
				i,
				hexArray[184 + module * 12 + 2 * i] - 0x0c
			);
			if (module != 8) {
				var level = 99 - hexArray[184 + module * 12 + 2 * i + 1];
				if (level < 0) level = 0;
				this.setKeyFollowLevel(module, i, level);
			} else {
				this.setKeyFollowLevel(
					module,
					i,
					64 - hexArray[184 + module * 12 + 2 * i + 1]
				);
			}
		}
	}

	// 292 .. 303 Still missing!!! not implemented

	for (let i = 0; i < 6; i++) {
		this.rateKF.key[i] = hexArray[292 + i * 2] - 0x0c;
		this.rateKF.level[i] = Math.floor(hexArray[292 + i * 2 + 1] / 1.2828);
	}

	// 304 .. 311 Velocity Curve & Sensitivity
	for (let i = 0; i < 8; i++) {
		this.module[i].envelope.velocitySens = hexArray[304 + i] & 0x1f;
		this.module[i].velCurve = hexArray[304 + i] >> 5;
	}

	// 312 .. 313 Velocity Sensitivity (Pitch & Rate)

	this.pitchEnv.velocitySens = hexArray[312] & 0x1f;
	this.pitchCurve = hexArray[312] >> 5;
	this.rateSensitivity = hexArray[313] & 0x1f;
	this.rateCurve = hexArray[313] >> 5;

	// 314..321 Vibrato & Tremolo
	this.vibrato.multi = (hexArray[314] & 0x08) >> 3;
	this.vibrato.wave = hexArray[314] & 0x03;
	this.octave = (hexArray[314] & 0x60) >> 5;
	if ((hexArray[314] & 0x80) == 0) this.octave = this.octave * -1;
	this.vibrato.oct = (hexArray[314] & 0x60) >> 7;
	this.vibrato.depth = Math.floor(hexArray[315] / 1.2828);
	this.vibrato.rate = Math.floor(hexArray[316] / 1.2828);
	this.vibrato.delay = Math.floor(hexArray[317] / 1.2828);
	this.tremolo.multi = (hexArray[318] & 0x08) >> 3;
	this.tremolo.wave = hexArray[318] & 0x03;
	this.tremolo.depth = Math.floor(hexArray[319] / 1.2828);
	this.tremolo.rate = Math.floor(hexArray[320] / 1.2828);
	this.tremolo.delay = Math.floor(hexArray[321] / 1.2828);

	// 322 .. 335 Voice Name
	this.name = "";
	for (let i = 0; i < 14; i++) {
		this.name += String.fromCharCode(hexArray[322 + i]);
	}
};

VZTone.prototype.copyEnv = function (source, destination) {
	this.module[destination].envelope.velocitySens = this.module[
		source
	].envelope.velocitySens;
	this.module[destination].envelope.sustain = this.module[
		source
	].envelope.sustain;
	this.module[destination].envelope.end = this.module[source].envelope.end;
	for (let i = 0; i < 8; i++) {
		this.module[destination].envelope.level[i] = this.module[
			source
		].envelope.level[i];
		this.module[destination].envelope.time[i] = this.module[
			source
		].envelope.time[i];
		this.module[destination].envelope.velocity[i] = this.module[
			source
		].envelope.velocity[i];
	}
};

VZTone.prototype.copyKF = function (source, destination) {
	for (let i = 0; i < 6; i++) {
		this.module[destination].keyFollow.note[i] = this.module[
			source
		].keyFollow.note[i];
		this.module[destination].keyFollow.level[i] = this.module[
			source
		].keyFollow.level[i];
		//		this.module[destination].keyFollow.rate[i] = this.module[source].keyFollow.rate[i];
		//		this.module[destination].keyFollow.rateNote[i] = this.module[source].keyFollow.rateNote[i];
	}
};

export { VZTone };

