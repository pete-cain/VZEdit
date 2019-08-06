export class VZBank {
    constructor() {
        this.sysexArray = new Uint8Array(55958);
        this.startMsg = 14;
        this.endMsg = 8;
        this.numOfTones = 64;
        this.toneLen = 336 * 2;
        this.startOpData = this.startMsg + this.numOfTones * this.toneLen + 64;
        this.numOfOps = 64;
        this.opLen = 100 * 2;
        this.ops = new Array();
        this.tones = new Array();
        this.toneNames = new Array();
        this.opNames = new Array();
    }
    init(sysexBuff, fileName) {
        if (sysexBuff != null) this.sysexArray = new Uint8Array(sysexBuff);
        if (fileName == null) this.name = "NewBank";
        else this.name = fileName;
        this.parseTones();
        this.parseOps();
    }
    getToneName(int) {
        return this.tones[int].name;
    }
    getOpName(int) {
        return this.ops[int].name;
    }
    getToneArray(number) {
        let start = this.startMsg + (this.toneLen + 1) * number;
        return this.sysexArray.subarray(start, start + this.toneLen + 1);
    }
    getOperationArray(number) {
        let start =
            this.startMsg +
            (this.toneLen + 1) * this.numOfTones +
            (this.opLen + 1) * number;
        return this.sysexArray.subarray(start, start + this.opLen + 1);
    }
    addTone(toneArray, number) {
        this.tones[number] = new Tone(toneArray);
        this.toneNames[number] = this.tones[number].name;
    }
    addOperation(opArray, number) {
        this.ops[number] = new Operation(opArray);
        this.opNames[number] = this.opNames[number].name;
    }
    parseTones() {
        while (this.tones.length > 0) {
            this.tones.pop();
            this.toneNames.pop();
        }
        for (var int = 0; int < this.numOfTones; int++) {
            var tone = new Tone(this.getToneArray(int));
            this.tones.push(tone);
            this.toneNames.push(tone.name);
        }
        return this.tones;
    }
    parseOps() {
        while (this.ops.length > 0) {
            this.ops.pop();
            this.opNames.pop();
        }
        for (var int = 0; int < this.numOfOps; int++) {
            let op = new Operation(this.getOperationArray(int));
            this.ops.push(op);
            this.opNames.push(op.name);
        }
        return this.ops;
    }

    /*
    writeFile() {
        // Create a new Blob and write it to log.txt.
        var bb = new Blob([this.sysexArray]); // Note: window.WebKitBlobBuilder in Chrome 12.
        fileWriter.write(bb.getBlob("text/plain"));
	}
	*/
}

class CainUtils {
    hex(decimal) {
        // Helper for proper display...
        let hexr = decimal;
        if (decimal == 10) hexr = "A";
        if (decimal == 11) hexr = "B";
        if (decimal == 12) hexr = "C";
        if (decimal == 13) hexr = "D";
        if (decimal == 14) hexr = "E";
        if (decimal == 15) hexr = "F";
        return hexr;
    }
    // Annotations for later reuse
    hexOutput(sysExBuffer) {
        let text = "";
        // let sysExConvert = new Array();
        for (var i = 0; i < sysExBuffer.length; i++) {
            var char = sysExBuffer.charCodeAt(i);
            // text += CainUtil.hex(char >> 4) + '';
            // text += CainUtil.hex(char & 0xF) + ' ';
            sysExBuffer.push(sysExBuffer[i]);
            if (this.hex(char >>> 4) == "F" && this.hex(char & 0xf) == "7")
                text += " <br>";
        }
        return text;
    }
    static readASCII(array, from, to) {
        let rValue = "";
        for (var i = from; i < to; i += 2) {
            let char = array[i] * 16 + array[i + 1];
            rValue += String.fromCharCode(char);
        }
        return rValue;
    }
}

class Tone {
    constructor(toneArray) {
        this.empty = true;
        this.dataLength = 336;
        this.raw = new Uint8Array(toneArray.subarray(0, this.dataLength * 2));
        this.name = CainUtils.readASCII(toneArray, 322 * 2, 336 * 2);
        this.checkSum = this.calculateChecksum();
        this.isEmpty();
        //console.log("Tone Checksum: "+origChecksum+" = "+ this.checkSum);
    }
    calculateChecksum() {
        let newChecksum = 0;
        for (var i = 0; i < this.raw.length; i += 2) {
            newChecksum += this.raw[i] * 16 + this.raw[i + 1];
            newChecksum = newChecksum % 128;
        }
        return 128 - newChecksum;
    }
    isEmpty() {
        let sum = 0;
        for (var i = 0; i < this.raw.length; i++) {
            sum += this.raw[i];
        }
        if (sum == 0) this.empty = true;
        else this.empty = false;
    }
}

class Operation {
    constructor(opArray) {
        this.empty = true;
        this.dataLength = 100;
        this.startSD = new Array();
        this.startSD.push(28);
        this.startSD.push(46);
        this.startSD.push(64);
        this.startSD.push(82);
        this.tones = new Array();
        this.raw = new Uint8Array(opArray.subarray(0, this.dataLength * 2));
        this.name = CainUtils.readASCII(opArray, 2, 28);
        this.xtractTones();
        this.checkSum = this.calculateChecksum();
        this.isEmpty();
        //console.log("Op Checksum: "+origChecksum+" = "+ this.checkSum);
    }
    xtractTones() {
        while (this.tones > 0) this.tones.pop();
        for (var i = 0; i < this.startSD.length; i++) {
            var startPoint = this.startSD[i];
            this.tones.push(
                (this.raw[startPoint * 2] * 16 + this.raw[startPoint * 2 + 1]) &
                    0x3f
            );
        }
    }
    getTones() {
        return this.tones;
    }
    getTone(toneNumber) {
        return this.tones[toneNumber];
    }
    calculateChecksum() {
        newChecksum = 0;
        for (var i = 0; i < this.raw.length; i += 2) {
            newChecksum += this.raw[i] * 16 + this.raw[i + 1];
            newChecksum = newChecksum % 128;
        }
        return 128 - newChecksum;
    }
    isEmpty() {
        sum = 0;
        for (var i = 0; i < this.raw.length; i++) {
            sum += this.raw[i];
        }
        if (sum == 0) this.empty = true;
        else this.empty = false;
    }
}
