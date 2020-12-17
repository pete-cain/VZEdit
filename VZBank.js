function VZBank() {
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

VZBank.prototype.init = function (sysexBuff, fileName) {
	if (sysexBuff != null) this.sysexArray = new Uint8Array(sysexBuff);

	if (fileName == null) this.name = "NewBank";
	else this.name = fileName;
	this.parseTones();
	this.parseOps();
};

VZBank.prototype.getToneName = function (int) {
	return this.tones[int].name;
};

VZBank.prototype.getOpName = function (int) {
	return this.ops[int].name;
};

VZBank.prototype.getToneArray = function (number) {
	const start = this.startMsg + (this.toneLen + 1) * number;
	return this.sysexArray.subarray(start, start + this.toneLen + 1);
};

VZBank.prototype.getOperationArray = function (number) {
	const start =
		this.startMsg +
		(this.toneLen + 1) * this.numOfTones +
		(this.opLen + 1) * number;
	return this.sysexArray.subarray(start, start + this.opLen + 1);
};

VZBank.prototype.addTone = function (toneArray, number) {
	this.tones[number] = new Tone(toneArray);
	this.toneNames[number] = this.tones[number].name;
};

VZBank.prototype.addOperation = function (opArray, number) {
	this.ops[number] = new Operation(opArray);
	this.opNames[number] = this.opNames[number].name;
};

VZBank.prototype.parseTones = function () {
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
};

VZBank.prototype.parseOps = function () {
	while (this.ops.length > 0) {
		this.ops.pop();
		this.opNames.pop();
	}
	for (var int = 0; int < this.numOfOps; int++) {
		const op = new Operation(this.getOperationArray(int));
		this.ops.push(op);
		this.opNames.push(op.name);
	}
	return this.ops;
};

// TODO pass fileWriter as argument or set on instance
VZBank.prototype.writeFile = function (fileWriter) {
	// Create a new Blob and write it to log.txt.
	var bb = new Blob(this.sysexArray); // Note: window.WebKitBlobBuilder in Chrome 12.
	fileWriter.write(bb.getBlob("text/plain"));
};

function CainUtils() {}

// CainUtils.prototype.hex = // Helper for proper display...

function hex(decimal) {
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
CainUtils.prototype.hexOutput = function (sysExBuffer) {
	// TODO unused
	// const sysExConvert = new Array();

	let text;
	for (var i = 0; i < sysExBuffer.length; i++) {
		var char = sysExBuffer.charCodeAt(i);

		// text += CainUtil.hex(char >> 4) + '';
		// text += CainUtil.hex(char & 0xF) + ' ';

		sysExBuffer.push(sysExBuffer[i]);

		if (hex(char >>> 4) == "F" && hex(char & 0xf) == "7") text += " <br>";
	}
	return text;
};

CainUtils.readASCII = function (array, from, to) {
	let rValue = "";
	for (var i = from; i < to; i += 2) {
		let char = array[i] * 16 + array[i + 1];
		rValue += String.fromCharCode(char);
	}
	return rValue;
};

function Tone(toneArray) {
	this.empty = true;
	this.dataLength = 336;
	this.raw = new Uint8Array(toneArray.subarray(0, this.dataLength * 2));
	this.name = CainUtils.readASCII(toneArray, 322 * 2, 336 * 2);
	// const origChecksum = toneArray[this.dataLength*2];
	this.checkSum = this.calculateChecksum();
	this.isEmpty();
	//console.log("Tone Checksum: "+origChecksum+" = "+ this.checkSum);
}

Tone.prototype.calculateChecksum = function () {
	let newChecksum = 0;
	for (var i = 0; i < this.raw.length; i += 2) {
		newChecksum += this.raw[i] * 16 + this.raw[i + 1];
		newChecksum = newChecksum % 128;
	}

	return 128 - newChecksum;
};

Tone.prototype.isEmpty = function () {
	let sum = 0;
	for (var i = 0; i < this.raw.length; i++) {
		sum += this.raw[i];
	}
	if (sum == 0) this.empty = true;
	else this.empty = false;
};

function Operation(opArray) {
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
	// const origChecksum = opArray[this.dataLength*2];
	this.checkSum = this.calculateChecksum();
	this.isEmpty();
	//console.log("Op Checksum: "+origChecksum+" = "+ this.checkSum);
}

Operation.prototype.xtractTones = function () {
	while (this.tones > 0) this.tones.pop();
	for (var i = 0; i < this.startSD.length; i++) {
		var startPoint = this.startSD[i];
		this.tones.push(
			(this.raw[startPoint * 2] * 16 + this.raw[startPoint * 2 + 1]) &
				0x3f
		);
	}
};

Operation.prototype.getTones = function () {
	return this.tones;
};

Operation.prototype.getTone = function (toneNumber) {
	return this.tones[toneNumber];
};

Operation.prototype.calculateChecksum = function () {
	let newChecksum = 0;
	for (var i = 0; i < this.raw.length; i += 2) {
		newChecksum += this.raw[i] * 16 + this.raw[i + 1];
		newChecksum = newChecksum % 128;
	}

	return 128 - newChecksum;
};

Operation.prototype.isEmpty = function () {
	let sum = 0;
	for (var i = 0; i < this.raw.length; i++) {
		sum += this.raw[i];
	}
	if (sum == 0) this.empty = true;
	else this.empty = false;
};

export { VZBank, Operation, Tone };

