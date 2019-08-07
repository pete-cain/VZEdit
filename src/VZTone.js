/**
 * This is the internal model of a VZ Tone consisting of VZTone VZEnvelope
 * VZKeyFolow VZModule VZLine
 *
 * A tone holds 4 lines, 8 modules
 */
export class Envelope {
    constructor(type) {
        this.time = []; // Menu 9
        this.level = []; // Menu 9
        this.velocity = []; // ???
        this.velocitySens = 7;
        this.sustain = 3;
        this.end = 5;
        this.init(type);
        this.depth = 99; // Menu 10
    }
    init(type) {
        if (type == 0) {
            this.time = [99, 50, 0, 0, 0, 0, 0, 0];
            this.level = [99, 0, 0, 0, 0, 0, 0, 0];
            this.velocity = [0, 0, 0, 0, 0, 0, 0, 0];
        } else {
            this.time = [50, 50, 50, 50, 50, 50, 50, 50];
            this.level = [0, 0, 0, 0, 0, 0, 0, 0];
            this.velocity = [0, 0, 0, 0, 0, 0, 0, 0];
        }
        this.velocitySens = 7;
        this.sustain = 0;
        this.end = 1;
    }
}

export class RateKF {
    constructor() {
        this.key = [2, 24, 36, 40, 60, 108];
        this.level = [99, 99, 99, 99, 99, 99];
    }
}

export class KeyFollow {
    constructor() {
        this.note = [2, 24, 36, 40, 60, 108];
        this.level = [99, 99, 99, 99, 99, 99];
        this.rate = [1, 2, 3, 4, 5, 6];
        this.rateNote = [1, 2, 3, 4, 5, 6];
    }
}

export class VZModule {
    constructor() {
        this.active = 1;
        this.envelope = new Envelope(0);
        this.keyFollow = new KeyFollow();
        this.modSens = 4;
        this.waveForm = 0;
        this.init();
        this.velCurve = 0;
        this.detuneFix = 0;
        this.detuneRange = 0;
        this.detune = 0; // octave
    }
    init() {
        // to be done
    }
    setDetune(value) {
        this.detune = value;
    }
    getOctave() {
        return Math.abs(Math.floor(this.detune / (12 * 64)));
    }
    getNote() {
        return Math.abs(Math.floor(this.detune / 64) % 12);
    }
    getCent() {
        return Math.abs(this.detune % 64);
    }
}

export class VZModulation {
    constructor() {
        this.octPol = 1;
        this.oct = 0;
        this.waveNames = ["Triangle", "Saw Up", "Saw Down", "Square"];
        this.wave = 0;
        this.depth = 0;
        this.rate = 0;
        this.delay = 0;
        this.multi = false;
    }
    setWave(wave) {
        this.wave = wave;
    }
    getWave() {
        return this.wave;
    }
    getWaveName() {
        return this.waveNames[this.wave];
    }
}

const KEY_FOLLOW = 8;

export class VZTone {
    constructor() {
        this.waveName = [
            "sine",
            "saw I",
            "saw II",
            "saw III",
            "saw IV",
            "saw V",
            "noise I",
            "noise II"
        ];
        this.level = 99;
        this.module = [];
        this.extPhase = [0, 0, 0];
        this.lineMix = [0, 0, 0, 0];
        this.pitchEnv = new Envelope(1);
        this.pitchKF = new KeyFollow();
        this.pitchEnvDepth = 63;
        this.pitchEnvRange = 0;
        this.pitchAmpSens = 4;
        this.pitchCurve = 0;
        this.rateCurve = 0;
        this.rateSensitivity = 0;
        this.vibrato = new VZModulation();
        this.tremolo = new VZModulation();
        this.name = "CAIN INIT";
        this.rateKF = new RateKF();
        this.octave = 0;
        this.init();
    }
    copyModule(source, dest) {
        this.module[dest].active = this.module[source].active;
        this.module[dest].modSens = this.module[source].modSens;
        this.module[dest].detune = this.module[source].detune;
        this.module[dest].detuneFix = this.module[source].detuneFix;
        this.module[dest].detuneRange = this.module[source].detuneRange;
        this.module[dest].velCurve = this.module[source].velCurve;
        this.module[dest].waveForm = this.module[source].waveForm;
        this.copyEnv(source, dest);
        this.copyKF(source, dest);
    }
    init() {
        for (var i = 0; i < 8; i++) {
            this.module[i] = new VZModule();
        }
    }
    // Menu 14
    setModulationSensitivity(module, value) {
        this.module[module].modSens = value;
    }
    getOctaveValue() {
        return Math.abs(this.octave);
    }
    getOctavePol() {
        if (this.octave < 0) {
            return 0;
        } else {
            return 1;
        }
    }
    getModulationSensitivity(module) {
        return this.module[module].modSens;
    }
    setDetune(module, value) {
        this.module[module].setDetune(value);
    }
    getDetune(module) {
        return this.module[module].detune;
    }
    getDetuneCoarse(module) {
        return (
            this.module[module].getOctave() * 12 + this.module[module].getNote()
        );
    }
    setDetunePol(module, value) {
        const detune =
            Math.abs(this.module[module].detune) * (value === 0 ? -1 : 1);
        this.module[module].detune = detune;
    }
    getDetuneOctave(module) {
        return this.module[module].getOctave();
    }
    getDetuneNote(module) {
        return this.module[module].getNote();
    }
    getDetuneCent(module) {
        return this.module[module].getCent();
    }
    getDetuneFix(module) {
        return this.module[module].detuneFix;
    }
    getDetuneRange(module) {
        return this.module[module].detuneRange;
    }
    getWaveForm(module) {
        return this.module[module].waveForm;
    }
    getDetunePol(module) {
        return Number(this.module[module].detune >= 0);
    }
    setLevel(level) {
        this.level = level;
    }
    getLevel() {
        return this.level;
    }
    setKeyFollowRateNote(module, step, rateNote) {
        if (module == KEY_FOLLOW) {
            this.pitchKF.rateNote[step] = rateNote;
        } else {
            this.module[module].keyFollow.rateNote[step] = rateNote;
        }
    }
    setVelCurve(module, curve) {
        if (module != KEY_FOLLOW) {
            this.module[module].velCurve = curve;
        } else {
            this.pitchCurve = curve;
        }
    }
    getVelCurve(module) {
        if (module != KEY_FOLLOW) {
            return this.module[module].velCurve;
        } else {
            return this.pitchCurve;
        }
    }
    setVelSens(module, sens) {
        this.module[module - 1].velSens = sens;
    }
    getKeyFollowRateNote(module, step) {
        if (module == KEY_FOLLOW) {
            return this.pitchKF.rateNote[step];
        } else {
            return this.module[module].keyFollow.rateNote[step];
        }
    }
    setKeyFollowRate(module, step, rate) {
        if (module == KEY_FOLLOW) {
            this.pitchKF.rate[step] = rate;
        } else {
            this.module[module].keyFollow.rate[step] = rate;
        }
    }
    getKeyFollowRate(module, step) {
        if (module == KEY_FOLLOW) {
            return this.pitchKF.rate[step];
        } else {
            return this.module[module].keyFollow.rate[step];
        }
    }
    setKeyFollowNote(module, step, note) {
        if (module == KEY_FOLLOW) {
            this.pitchKF.note[step] = note;
        } else {
            this.module[module].keyFollow.note[step] = note;
        }
    }
    getKeyFollowNote(module, step) {
        if (module == KEY_FOLLOW) {
            return this.pitchKF.note[step];
        } else {
            return this.module[module].keyFollow.note[step];
        }
    }
    setKeyFollowLevel(module, step, level) {
        if (module == KEY_FOLLOW) {
            this.pitchKF.level[step] = level;
        } else {
            this.module[module].keyFollow.level[step] = level;
        }
    }
    getKeyFollowLevel(module, step) {
        if (module == KEY_FOLLOW) {
            return this.pitchKF.level[step];
        } else {
            return this.module[module].keyFollow.level[step];
        }
    }
    setEnvelopeDepth(module, value) {
        this.module[module].envelope.depth = value;
    }
    setEnvelopeTime(module, step, time) {
        if (module == KEY_FOLLOW) {
            this.pitchEnv.time[step] = time;
        } else {
            this.module[module].envelope.time[step] = time;
        }
    }
    getEnvelopeTime(module, step) {
        if (module == KEY_FOLLOW) {
            return this.pitchEnv.time[step];
        } else {
            return this.module[module].envelope.time[step];
        }
    }
    setEnvelopeLevel(module, step, level) {
        if (module == KEY_FOLLOW) {
            this.pitchEnv.level[step] = level;
        } else {
            if (level > 99) level = 99;
            this.module[module].envelope.level[step] = level;
        }
    }
    getEnvelopeLevel(module, step) {
        if (module == KEY_FOLLOW) {
            return this.pitchEnv.level[step];
        } else {
            return this.module[module].envelope.level[step];
        }
    }
    setEnvelopeVelocity(module, step, vel) {
        if (module == KEY_FOLLOW) {
            this.pitchEnv.velocity[step] = vel;
        } else {
            this.module[module].envelope.velocity[step] = vel;
        }
    }
    getEnvelopeVelocity(module, step) {
        if (module == KEY_FOLLOW) {
            return this.pitchEnv.velocity[step];
        } else {
            return this.module[module].envelope.velocity[step];
        }
    }
    setVelSensitivity(module, value) {
        if (module == KEY_FOLLOW) {
            return (this.pitchEnv.velocitySens = value);
        } else {
            this.module[module].envelope.velocitySens = value;
        }
    }
    getVelSensitivity(module) {
        if (module == KEY_FOLLOW) {
            return this.pitchEnv.velocitySens;
        } else {
            return this.module[module].envelope.velocitySens;
        }
    }
    setEnvSustain(module, value) {
        if (module == KEY_FOLLOW) {
            return (this.pitchEnv.sustain = value);
        } else {
            this.module[module].envelope.sustain = value;
        }
    }
    getEnvSustain(module) {
        if (module == KEY_FOLLOW) {
            return this.pitchEnv.sustain;
        } else {
            return this.module[module].envelope.sustain;
        }
    }
    setEnvEnd(module, value) {
        if (module == KEY_FOLLOW) {
            this.pitchEnv.end = value;
        } else {
            this.module[module].envelope.end = value;
        }
    }
    getEnvEnd(module) {
        if (module == KEY_FOLLOW) {
            return this.pitchEnv.end;
        } else {
            return this.module[module].envelope.end;
        }
    }
    setLineMix(line, value) {
        this.lineMix[line] = value;
    }
    getLineMix(line) {
        return this.lineMix[line];
    }
    toggleModule(module) {
        this.module[module].toggleState();
    }
    getModuleState(module) {
        return this.module[module].active;
    }
    setModMulti(type, multi) {
        if (type == "vibrato") this.vibrato.multi = multi;
        if (type == "tremolo") this.tremolo.multi = multi;
    }
    setModWave(type, multi) {
        if (type == "vibrato") this.vibrato.wave = multi;
        if (type == "tremolo") this.tremolo.wave = multi;
    }
    getModWave(type) {
        if (type == "vibrato") return this.vibrato.wave;
        if (type == "tremolo") return this.tremolo.wave;
    }
    setModDepth(type, multi) {
        if (type == "vibrato") this.vibrato.depth = multi;
        if (type == "tremolo") this.tremolo.depth = multi;
    }
    setModRate(type, multi) {
        if (type == "vibrato") this.vibrato.rate = multi;
        if (type == "tremolo") this.tremolo.rate = multi;
    }
    setModDelay(type, multi) {
        if (type == "vibrato") this.vibrato.delay = multi;
        if (type == "tremolo") this.tremolo.delay = multi;
    }
    getHexArray() {
        let toneData = [];

        // 0 Ext Phase
        toneData[0] =
            (this.extPhase[2] << 2) +
            (this.extPhase[1] << 1) +
            this.extPhase[0];
        // 1 ..4 Line & WaveForm
        for (let i = 0; i < 4; i++) {
            const line =
                (this.lineMix[i] << 6) +
                (this.module[1 + i * 2].waveForm << 3) +
                this.module[0 + i * 2].waveForm;
            toneData[1 + i] = line;
        }
        // 5 .. 20 Detune
        for (i = 0; i < 8; i++) {
            toneData[5 + 2 * i] =
                (this.getDetuneCent(i) << 2) +
                (this.getDetuneFix(i) << 1) +
                this.getDetuneRange(i);
            toneData[5 + 2 * i + 1] =
                (this.getDetunePol(i) << 7) +
                Math.floor(Math.abs(this.getDetune(i) / 64));
        }
        // 21 .. 164 Velocity & Rate
        for (var step = 0; step < 8; step++) {
            for (var module = 0; module < 9; module++) {
                let rate = toneData[21 + step * 18 + module];
                let sustain;
                let level;

                rate =
                    (rate & 0x80) +
                    Math.floor(this.getEnvelopeTime(module, step) * 1.2828);
                toneData[21 + step * 18 + module] = rate;
                if (this.getEnvSustain(module) == step) {
                    sustain = 0x80;
                } else {
                    sustain = 0;
                }
                if (module != KEY_FOLLOW) {
                    level =
                        Math.floor(this.getEnvelopeLevel(module, step)) + 28;
                    if (level <= 28) level = 0;
                } else {
                    level =
                        Math.floor(this.getEnvelopeLevel(module, step)) + 0x40;
                    if (level < 1) level = 1;
                    if (level > 0x7f) level = 0x7f;
                }
                toneData[21 + step * 18 + 9 + module] = sustain + level;
                if (this.getEnvelopeVelocity(module, step) == 0)
                    toneData[21 + module + 18 * step] &= 0x7f;
                else toneData[21 + module + 18 * step] |= 0x80;
            }
        }
        // 165 .. 173 Envelope End Step / Amplitude Sensitivity
        for (let i = 0; i < 8; i++) {
            toneData[165 + i] =
                (this.getEnvEnd(i) << 4) + this.getModulationSensitivity(i);
        }
        toneData[165 + 8] = this.getEnvEnd(8) << 4;
        // 174 Total Level
        toneData[174] = 99 - this.getLevel();
        // 175 .. 182 Module on/off & Envelope Depth
        for (let i = 0; i < 8; i++) {
            let depth = this.module[i].envelope.depth;
            if (depth <= 0) {
                depth = 0x7f;
            } else {
                depth = 0x63 - depth;
            }
            toneData[175 + i] = ((this.module[i].active + 1) % 2 << 7) + depth;
        }
        // 183 Pitch Envelope Depth & Range
        toneData[183] = (this.pitchEnvRange << 7) + (63 - this.pitchEnvDepth);
        // 184 .. 279 Key follow Level (Amp)
        // 280 .. 291 Key Follow Level Pitch
        var offSetkeyFollow = 184;
        for (let module = 0; module < 9; module++) {
            for (let i = 0; i < 6; i++) {
                if (this.getKeyFollowNote(module, i) > 108)
                    this.setKeyFollowNote(module, i, 108);
                toneData[offSetkeyFollow + module * 12 + 2 * i] =
                    this.getKeyFollowNote(module, i) + 0x0c;
                if (module != KEY_FOLLOW) {
                    toneData[offSetkeyFollow + module * 12 + 2 * i + 1] =
                        99 - this.getKeyFollowLevel(module, i);
                    if (this.getKeyFollowLevel(module, i) == 0)
                        toneData[
                            offSetkeyFollow + module * 12 + 2 * i + 1
                        ] = 0x7f;
                } else {
                    if (this.getKeyFollowLevel(module, i) > 63)
                        this.setKeyFollowLevel(module, i, 63);
                    if (this.getKeyFollowLevel(module, i) < 0)
                        this.setKeyFollowLevel(module, i, 0);
                    toneData[offSetkeyFollow + module * 12 + 2 * i + 1] =
                        0x3f - this.getKeyFollowLevel(module, i);
                }
            }
        }
        // 292 .. 303 Still missing!!! not implemented
        for (let i = 0; i < 6; i++) {
            toneData[292 + i * 2 + 0] = this.rateKF.key[i] + 0x0c;
            let level = 0x1e + this.rateKF.level[i];
            if (this.rateKF.level[i] == 0) level = 0;
            toneData[292 + i * 2 + 1] = level;
        }
        // 304 .. 311 Velocity Curve & Sensitivity
        for (var i = 0; i < 8; i++) {
            toneData[304 + i] =
                this.module[i].envelope.velocitySens +
                (this.module[i].velCurve << 5);
        }
        // 312 .. 313 Velocity Sensitivity (Pitch & Rate)
        toneData[312] = (this.pitchCurve << 5) + this.pitchEnv.velocitySens;
        toneData[313] = (this.rateCurve << 5) + this.rateSensitivity;
        // 314..321 Vibrato & Tremolo
        toneData[314] =
            (this.getOctavePol() << 7) +
            (this.getOctaveValue() << 5) +
            (this.vibrato.depth << 3) +
            this.vibrato.wave;
        toneData[315] = Math.floor(this.vibrato.depth * 1.2828);
        toneData[316] = Math.floor(this.vibrato.rate * 1.2828);
        toneData[317] = Math.floor(this.vibrato.delay * 1.2828);
        toneData[318] = (this.tremolo.depth << 3) + this.tremolo.wave;
        toneData[319] = Math.floor(this.tremolo.depth * 1.2828);
        toneData[320] = Math.floor(this.tremolo.rate * 1.2828);
        toneData[321] = Math.floor(this.tremolo.delay * 1.2828);
        // 322 .. 335 Voice Name
        for (i = 0; i < 14; i++) {
            let character = this.name.charCodeAt(i);
            if (isNaN(character)) character = 32;
            toneData[322 + i] = character;
        }

        return toneData;
    }
    initFromHexArray(hexArray) {
        var i;
        // 0 Ext Phase
        this.extPhase[0] = hexArray[0] & 0x01;
        this.extPhase[1] = (hexArray[0] & 0x02) >> 1;
        this.extPhase[2] = (hexArray[0] & 0x04) >> 2;
        // 1 ..4 Line & WaveForm
        for (i = 0; i < 4; i++) {
            this.lineMix[i] = (hexArray[1 + i] & 0xc0) >> 6;
            this.module[1 + i * 2].waveForm = (hexArray[1 + i] & 0x38) >> 3;
            this.module[0 + i * 2].waveForm = hexArray[1 + i] & 0x07;
        }
        // 5 .. 20 Detune
        for (i = 0; i < 8; i++) {
            this.setDetune(
                i,
                (hexArray[5 + 2 * i] >> 2) +
                    (hexArray[5 + 2 * i + 1] & 0x7f) * 64
            );
            this.module[i].detuneFix = (hexArray[5 + 2 * i] & 0x02) >> 1;
            this.module[i].detuneRange = hexArray[5 + 2 * i] & 0x01;
            this.setDetunePol(i, (hexArray[5 + 2 * i + 1] & 0x80) >> 7);
        }
        // 21 .. 164 Velocity & Rate
        var sust = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
        for (let step = 0; step < 8; step++) {
            for (let module = 0; module < 9; module++) {
                this.setEnvelopeTime(
                    module,
                    step,
                    Math.floor(
                        (hexArray[21 + step * 18 + module] & 0x7f) / 1.2828
                    )
                );
                let level = hexArray[21 + step * 18 + 9 + module] & 0x7f;
                if (module != KEY_FOLLOW) {
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
            if (module != KEY_FOLLOW) {
                this.module[module].envelope.sustain = sust[module];
            } else {
                this.pitchEnv.sustain = sust[module];
            }
        }
        // 165 .. 173 Envelope End Step / Amplitude Sensitivity
        for (let i = 0; i < 9; i++) {
            this.setEnvEnd(i, hexArray[165 + i] >> 4);
            if (i == KEY_FOLLOW) {
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
                if (module != KEY_FOLLOW) {
                    let level = 99 - hexArray[184 + module * 12 + 2 * i + 1];
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
            this.rateKF.level[i] = Math.floor(
                hexArray[292 + i * 2 + 1] / 1.2828
            );
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
        this.vibrato.depth = (hexArray[314] & 0x08) >> 3;
        this.vibrato.wave = hexArray[314] & 0x03;
        this.octave = (hexArray[314] & 0x60) >> 5;
        if ((hexArray[314] & 0x80) == 0) this.octave = this.octave * -1;
        this.vibrato.oct = (hexArray[314] & 0x60) >> 7;
        this.vibrato.depth = Math.floor(hexArray[315] / 1.2828);
        this.vibrato.rate = Math.floor(hexArray[316] / 1.2828);
        this.vibrato.delay = Math.floor(hexArray[317] / 1.2828);
        this.tremolo.depth = (hexArray[318] & 0x08) >> 3;
        this.tremolo.wave = hexArray[318] & 0x03;
        this.tremolo.depth = Math.floor(hexArray[319] / 1.2828);
        this.tremolo.rate = Math.floor(hexArray[320] / 1.2828);
        this.tremolo.delay = Math.floor(hexArray[321] / 1.2828);
        // 322 .. 335 Voice Name
        this.name = "";
        for (i = 0; i < 14; i++) {
            this.name += String.fromCharCode(hexArray[322 + i]);
        }
    }
    copyEnv(source, destination) {
        this.module[destination].envelope.velocitySens = this.module[
            source
        ].envelope.velocitySens;
        this.module[destination].envelope.sustain = this.module[
            source
        ].envelope.sustain;
        this.module[destination].envelope.end = this.module[
            source
        ].envelope.end;
        for (this.i = 0; this.i < 8; this.i++) {
            this.module[destination].envelope.level[this.i] = this.module[
                source
            ].envelope.level[this.i];
            this.module[destination].envelope.time[this.i] = this.module[
                source
            ].envelope.time[this.i];
            this.module[destination].envelope.velocity[this.i] = this.module[
                source
            ].envelope.velocity[this.i];
        }
    }
    copyKF(source, destination) {
        for (this.i = 0; this.i < 6; this.i++) {
            this.module[destination].keyFollow.note[this.i] = this.module[
                source
            ].keyFollow.note[this.i];
            this.module[destination].keyFollow.level[this.i] = this.module[
                source
            ].keyFollow.level[this.i];
            //		this.module[destination].keyFollow.rate[this.i] = this.module[source].keyFollow.rate[this.i];
            //		this.module[destination].keyFollow.rateNote[this.i] = this.module[source].keyFollow.rateNote[this.i];
        }
    }
}
