import { VZBank } from './VZBank.js';
import { VZTone } from './VZTone.js';

const SYSEX_START = window.SYSEX_START = [ 0xf0, 0x44, 0x03, 0x00 ];
const SYSEX_CHANNEL = window.SYSEX_CHANNEL = [ 0x70 ]; /* set to channel 1 */
const MIDI_CHANNEL = window.MIDI_CHANNEL = [0x00];
const SYSEX_DATA_RECEIVE_AREA = window.SYSEX_DATA_RECEIVE_AREA = [ 0x00, 0x40 ];
const SYSEX_END = window.SYSEX_END = [ 0xf7 ];

var sourceEnvelope = 0;

// TODO unused
// var inactiveSourceEnvelope = 0;

// var pitchEnabled = false;

// create the tone object
window.vzTone = new VZTone();
var bank = new VZBank();
var reader = new FileReader();

var lock = [];
lock[0] = [ 0, 0, 0, 0, 0, 0, 0, 0 ]; // not used .... for module copy
lock[1] = [ 0, 0, 0, 0, 0, 0, 0, 0 ];// envelope
lock[2] = [ 0, 0, 0, 0, 0, 0, 0, 0 ];// key follow

window.internalToneData = [];

const buildModule = function(module) {
	let moduleString = "";
	moduleString += "<input type='submit' value ='' class='active' id='module_enabled_M" + module
			+ "' src='active.jpg' draggable='true' ondragstart='dragModule(event," + module + ")' ondrop='dropModule(event, " + module
			+ ")' onclick='toggleModuleUI(" + module + ")' ondragover= 'allowDrop(event)' >";
	moduleString += "<div id='wave_M" + module + "'></div>";
	moduleString += "<div id='detune_M" + module + "'></div>";
	moduleString += "<div id='envelope_M" + module + "'></div>";
	moduleString += "<div id='modulation_M" + module + "'></div>";
	return moduleString;
}

const buildWave = function(module) {
	let waveString = "";
	waveString += "<input type='image'  id='waveDwn" + module + "' class='waveBtn' src='left.jpg' onclick='waveDown(" + module + ")'  >";
	waveString += "<canvas id='waveForm" + module + "' width = '70px' height='30px' border='none' onclick = 'waveUp(" + module + ")'></canvas>";
	waveString += "<input type='image' class='waveBtn' id='waveUp" + module + "'src='right.jpg' onclick='waveUp(" + module + ")'>";

	waveString += "<output id='wave" + module + "'>sine</output>"
	return waveString;
}

const buildModuleModulation = function(module) {
	let moduleModulationString = "<input type='submit' value='' class='unlocked'  id='kfLock" + module + "' onclick = 'lockEnvelopeModule(" + module
			+ ",2)' >  Key Follow  <br> ";
	moduleModulationString += "<canvas id='keyFollow" + module + "' width = '150px' height='40px' onclick = 'activateKFModule(" + module + ")'></canvas><br>";
	moduleModulationString += "Velocity Curve Type and Sensitivity <br>";
	moduleModulationString += "<image class='curve' id='curveImg" + module + "' onclick = 'nextAmpCurve(" + module + ")' src = 'curve1.png'><br>";
	moduleModulationString += "<input type='range' class='ampSens' min='0' max='31' step='1' value='0' id='ampSensM" + module
			+ "' onchange='setVelocitySensitivity(" + module + ",value)'> Sens<br>";
	moduleModulationString += "Modulation <br>";
	moduleModulationString += "<input type='range' id='modSens" + module + "' onchange='setModSens(" + module + ")' min='0' max='7' step='1' value='4'> Sens";
	return moduleModulationString;
}

const buildDetune = function(module) {
	let detuneString = "Pitch <br>";
	detuneString += "<input type='image' class='positive' id='det_pos_neg_M" + module + "' src='positive.jpg' onclick='togglePosNegUI(this," + module
			+ ")'  widht='15px'>";
	detuneString += " <label> <input type='checkbox' id='pitchFix" + module + "' onchange='setPitchFix(" + module + ")'>Fix</label><br> ";
	detuneString += "<label for='oct_M" + module + "'>Oct:</label> <output id='oct_M" + module + "' width='20px' > </output>";
	detuneString += "<label for='note_M" + module + "'>Note:</label> <output id='note_M" + module + "' width='20px' > </output>";
	detuneString += "<label for='cent_M" + module + "'>Fine:</label> <output id='cent_M" + module + "' width='20px' > </output><br> ";
	// changed the range to fit to the non fixed detuning still a lot to clean up here
	detuneString += "<input type='range' min='0' max='71' step='1' value='0' id='det_note_M" + module + "' onchange='send_data_to_vz()' oninput='setDetune("
			+ module + ")'> Coarse";
	detuneString += "<input type='range' min='0' max='63' step='1' value='0'	id='det_cent_M" + module + "' onchange='send_data_to_vz()' oninput='setDetune("
			+ module + ")'> Fine";
	return detuneString;
}

// TODO attach event handler instead
window.loadTone = function(num) {
	window.vzTone.initFromHexArray(convertLongMsg2Short(bank.getToneArray(num)));
	renderAll();
	window.send_data_to_vz();
}
const buildEnvelopeModules = function(module) {

	let envelopeModuleString = "<input type='submit' value='' class='unlocked'  id='envLock" + module + "' onclick = 'lockEnvelopeModule(" + module
			+ ",1)' >Envelope <br> ";
	envelopeModuleString += "<canvas id='envelope" + module + "' width = '150px' height='40px' onclick = 'activateEnvelopeModule(" + module + ")'></canvas>";

	envelopeModuleString += "<input type='range' id='envDepth" + module + "' onchange='setEnvDepth(" + module
			+ ")' min='0' max='99' step='1' value='90'> Depth";
	return envelopeModuleString;
}

const buildModulationType = function (type) {
	var modType = 1;
	if (type == "tremolo") modType = 2;

	let modulationString = "";
	modulationString += "<div id='" + type + "'>";
	modulationString += type + "<br>";
	modulationString +=
		"<label> <input type='checkbox' id='" +
		type +
		"Multi' onchange='setMod" +
		type +
		"()'>Multi</label><br>";
	modulationString +=
		"<image class='modwave' id= 'modImg" +
		type +
		"' onclick='modUp(" +
		modType +
		")'  src = 'mwave1.png'><br>";
	modulationString +=
		"<input type='range' id='" +
		type +
		"Wave' min='0' max='3' step='1' value='0' oninput='setModImg(" +
		modType +
		",value)' onchange='setMod" +
		type +
		"()'> Wave<br>";
	modulationString +=
		"<input type='range' id='" +
		type +
		"Depth' min='0' max='99' step='1' value='0' onchange='setMod" +
		type +
		"()'> depth <br>";
	modulationString +=
		"<input type='range' id='" +
		type +
		"Rate' min='0' max='99' step='1' value='0' onchange='setMod" +
		type +
		"()'> rate <br>";
	modulationString +=
		"<input type='range' id='" +
		type +
		"Delay' min='0' max='99' step='1' value='0' onchange='setMod" +
		type +
		"()'> delay <br>";
	modulationString += "</div>";
	return modulationString;
};

function buildEnvelope() {
	var i;
	let envelopeString = "";
	envelopeString += "<input type='image' id='close_env' src='negative.jpg' align='right' onclick='closeOverlay(1)' widht='30px'> Envelope Editor <br>";
	envelopeString += "<canvas id='envelope' width = '1400' height='600'></canvas>";

	envelopeString += "<table>";
	envelopeString += "<tr>";
	for (i = 0; i < 9; i++) {
		envelopeString += "<td>";
		if (i > 0)
			envelopeString += i;
		envelopeString += "</td>";
	}
	envelopeString += "</tr>	<tr>";
	for (i = 0; i < 9; i++) {
		envelopeString += "<td>";
		if (i > 0)
			envelopeString += "<input type='text' class='envText' id='r" + i + "' onchange='editEnvelopeTxt(" + i + ",1,value)' >";
		else
			envelopeString += "Rate";
		envelopeString += "</td>";
	}
	envelopeString += "</tr>	<tr>";
	for (i = 0; i < 9; i++) {
		envelopeString += "<td>";
		if (i > 0)
			envelopeString += "<input type='text' class='envText' id='l" + i + "' onchange='editEnvelopeTxt(" + i + ",2,value)' >";
		else
			envelopeString += "Level";
		envelopeString += "</td>";
	}
	envelopeString += "</tr></table>";
	return envelopeString;
}

function buildKF() {
	var i;
	let kfString = "";
	kfString += "<input type='image' id='close_env' src='negative.jpg' align='right' onclick='closeOverlay(2)' widht='30px'> Key Follow Editor <br>";
	kfString += "<canvas id='kf' width = '1000px' height = '300px'></canvas>";

	kfString += "<table>";
	kfString += "<tr>";
	for (i = 0; i < 7; i++) {
		kfString += "<td>";
		if (i > 0)
			kfString += i;
		kfString += "</td>";
	}
	kfString += "</tr>	<tr>";
	for (i = 0; i < 7; i++) {
		kfString += "<td>";
		if (i > 0)
			kfString += "<input type='text' class='envText' id='kf_level" + i + "' onchange='editKFTxt(" + i + ")' >";
		else
			kfString += "Level";
		kfString += "</td>";
	}
	kfString += "</tr>	<tr>";
	for (i = 0; i < 7; i++) {
		kfString += "<td>";
		if (i > 0)
			kfString += "<input type='text' class='envText' id='kf_note" + i + "' onchange='editKFTxt(" + i + ")' >";
		else
			kfString += "Note";
		kfString += "</td>";
	}
	kfString += "</tr></table>";
	return kfString;
}

for (let i = 1; i < 5; i++) {
	document.getElementById('lines').innerHTML += "<div class = 'VZline' id='line" + i + "'></div";
	document.getElementById('line' + i).innerHTML = "<input type='submit' value='' id='sum' class='sum' >"
	document.getElementById('line' + i).innerHTML += "<input type='submit' value='' class='mix'  id='mixType" + i + "' onclick = 'lineMix(" + i + ")' >";
	document.getElementById('line' + i).innerHTML += "<input type='submit' value='' id='connector' class='connector' >";
	if (i < 4) {
		document.getElementById('line' + i).innerHTML += "<input type='submit' value='' class='line'  id='extPhase" + i + "' onclick = 'extPhase(" + i + ")' >";
	} else {
		document.getElementById('line' + i).innerHTML += "<input type='submit' value='' class='line'  id='extPhase" + i + "' >";
	}

	document.getElementById('line' + i).style.left = (25 * (i - 1)) + "%";
}

for (let i = 1; i < 9; i++) {
	document.getElementById('modules').innerHTML += "<div class='VZmodule' id='M" + i + "'></div>";
	document.getElementById('M' + i).style.left = (12 * (i - 1)) + "%";
	document.getElementById('M' + i).innerHTML = buildModule(i);
	document.getElementById('detune_M' + i).innerHTML = buildDetune(i);
	document.getElementById('wave_M' + i).innerHTML = buildWave(i);
	document.getElementById('envelope_M' + i).innerHTML = buildEnvelopeModules(i);
	document.getElementById('modulation_M' + i).innerHTML = buildModuleModulation(i);
}
document.getElementById('global').innerHTML = buildGlobal();
document.getElementById('envelopes').innerHTML = buildEnvelope();
document.getElementById('modulation').innerHTML = buildModulation();
document.getElementById('vZbank').innerHTML = buildVZbank();

var envCanvas = document.getElementById('envelope');
var envContext = envCanvas.getContext('2d');
var envMouseState = 0;


const setCurveImg = function(module, value) {
	$('#curveImg' + module).attr("src", "curve" + (parseInt(value) + 1) + ".png");
}

const drawEnvelopeBackground = function(status) {
	// envContext.beginPath();
	switch (status) {
	case '2':
		envContext.fillStyle = "#afaf90";

		break;
	case '1':
		envContext.fillStyle = "#90afaf";

		break;

	default:
		envContext.fillStyle = "#c0c0c0";
		break;
	}

	envContext.fillRect(0, 0, envCanvas.width, envCanvas.height);
}

const drawEnvelope = function(canvas, module, state, lineProximity) {
	const envContext = canvas.getContext('2d');
	drawEnvelopeBackground(state);

	let x = 0;
	let y = module == 8 ? canvas.height / 2 : canvas.height;

	for (var i = 0; i < 8; i++) {
		envContext.beginPath();
		envContext.moveTo(x * canvas.width / 792, y);
		let time = 99 - window.vzTone.getEnvelopeTime(module, i);
		x += time;
		if (module == 8) {
			y = canvas.height / 2 - (canvas.height / 126) * window.vzTone.getEnvelopeLevel(module, i);
		} else {
			y = canvas.height - (canvas.height * window.vzTone.getEnvelopeLevel(module, i) / 100);
		}
		envContext.lineTo(x * canvas.width / 792, y);
		envContext.strokeStyle = "black";
		if (window.vzTone.getEnvelopeVelocity(module, i) == 1)
			envContext.strokeStyle = "#611f21";
		if (lineProximity - 1 == i)
			envContext.strokeStyle = "orange";
		envContext.lineWidth = "2";
		envContext.stroke();
	}
}

const drawKFBackground = function(canvas, status) {
	const context = canvas.getContext('2d');
	// context.beginPath();
	switch (status) {
	case '2':
		context.fillStyle = "#afaf90";

		break;
	case '1':
		context.fillStyle = "#90afaf";

		break;

	default:
		context.fillStyle = "#c0c0c0";
		break;
	}
	context.fillRect(0, 0, canvas.width, canvas.height);
}


const drawKF = function(canvas, module, barProximity, status) {
	var ctx = canvas.getContext('2d');
	// ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawKFBackground(canvas, status);

	let x_offset = 0;
	let y_offset = -2;
	let x = 0 + x_offset;
	let y = canvas.height + y_offset;

	ctx.beginPath();
	ctx.moveTo(x, y)

	for (var i = 0; i < 6; i++) {
		x = Math.floor(window.vzTone.getKeyFollowNote(module, i) * 5 * (canvas.width / 792) + x_offset);
		y = Math.floor((canvas.height + y_offset) - window.vzTone.getKeyFollowLevel(module, i) * (canvas.height + y_offset) / 100);
		ctx.lineTo(x, y);
	}
	ctx.lineTo(canvas.width, canvas.height + y_offset);
	ctx.lineTo(x_offset, canvas.height + y_offset);

	ctx.fillStyle = "black";
	ctx.closePath();

	// ctx.strokeStyle = "green";
	// ctx.lineWidth = "2";
	// ctx.stroke();
	ctx.fill();

	for (let i = 0; i < 6; i++) {
		x = window.vzTone.getKeyFollowNote(module, i) * 5 * (canvas.width / 792) + x_offset;
		y = (canvas.height + y_offset) - window.vzTone.getKeyFollowLevel(module, i) * (canvas.height + y_offset) / 100;
		if (barProximity == i + 1) {
			ctx.fillStyle = "goldenrod";
			ctx.fillRect(x - 4, 0, 8, canvas.height);
		}
	}

}
const drawKFBars = function(canvas, module, barProximity) {
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawKFBackground(canvas);

	let x_offset = 0;
	let y_offset = -2;
	let x = 0;
	let y = canvas.height;

	for (var i = 0; i < 6; i++) {
		x = window.vzTone.getKeyFollowNote(module, i) * 5 * (canvas.width / 792) + x_offset;
		y = (canvas.height + y_offset) - window.vzTone.getKeyFollowLevel(module, i) * (canvas.height + y_offset) / 100;
		if (barProximity == i + 1) {
			kfContext.fillStyle = "goldenrod";
			context.fillRect(x - 4, 0, 8, canvas.height);
		}

		context.fillStyle = "black";
		context.fillRect(x - 4, y, 8, window.vzTone.getKeyFollowLevel(module, i) * (canvas.height + y_offset) / 100);
		// context.fillRect(x - 4, y, 8, 50);

	}
}

const renderOsc = function(canvas, module) {
	// TODO does this trigger something?
	// canvas.width = canvas.width;
	var context = canvas.getContext("2d");

	var cheight = canvas.height;
	var cwidth = canvas.width;
	var Freq = Math.PI / (cwidth / 2);
	var Zoom = 2;

	context.beginPath();
	context.fillStyle = "#c0c0c0";
	context.fillRect(0, 0, envCanvas.width, envCanvas.height);

	context.moveTo(0, cheight / 2);

	const wave = window.vzTone.getWaveForm(module);

	for (var i = 0; i <= 2 * Math.PI * Zoom; i = i + Freq * Zoom) {
		let Osc1Wave = osc(i, wave, 0, 1.8, 1, 0);

		context.lineTo((1 / (Freq * Zoom)) * i, cheight / 2 + (Osc1Wave * (cheight / 2)));

	}
	context.lineWidth = 2;
	context.stroke();

}

const osc = function(i, waveform, extWave1, volume, frequenz, modtype) {
	let output = 0;
	let wf = Math.cos(i) * (waveform / 8);
	// wf = (i%(2*Math.PI)/(2*Math.PI)*2-1) * (waveform / 8);
	// wf =
	if (waveform == 7)
		wf = Math.random();
	if (waveform == 6)
		wf = Math.random() * 2 * Math.PI;

	let j = i * frequenz;

	switch (modtype) {
	case 0:
		output = (Math.cos(j + wf) * volume + extWave1) / 2;
		break;
	case 1:
		output = Math.cos(j + wf) * volume * extWave1;
		break;
	case 2:
		output = Math.cos(j + wf + extWave1 * 10) * volume;
		break;

	default:
		break;
	}
	return output;
}

drawEnvelope(envCanvas, 0);

document.getElementById('keyFollows').innerHTML = buildKF();
var kfCanvas = document.getElementById('kf');
var kfContext = kfCanvas.getContext('2d');
var kfMouseState = 0;
drawKFBars(kfCanvas, 0, 0);
drawKF(kfCanvas, 0, 0);

var envCanvases = [];

// TODO: Unused
// var envContexts = [];

var waveCanvases = [];
var kFCanvases = [];

for (let i = 1; i < 9; i++) {
	waveCanvases[i - 1] = document.getElementById('waveForm' + i);
	renderOsc(waveCanvases[i - 1], i - 1);
	kFCanvases[i - 1] = document.getElementById('keyFollow' + i);
	drawKF(kFCanvases[i - 1], i - 1, 0);
}

for (let i = 1; i < 10; i++) {
	envCanvases[i - 1] = document.getElementById('envelope' + i);
	drawEnvelope(envCanvases[i - 1], i - 1);
}

renderAll();

function buildVZbank() {
	var vzBankString = "<output id='vzBankFile'> drop a SysEx file here... </output>";
	vzBankString += "<table>";
	for (var i = 0; i < 8; i++) {
		vzBankString += "<tr>";
		for (var j = 0; j < 8; j++) {
			vzBankString += "<td> <output draggable='true' onclick='loadTone(" + (i * 8 + j) + ")' id = 'tone" + (i * 8 + j) + "' ></output></td>";
		}
		vzBankString += "</tr>";
	}
	vzBankString += "</table>";
	return vzBankString;
}

  
function buildModulation() {
	let modulationString = "";
	modulationString += buildPitchEnv();
	modulationString += buildModulationType('vibrato');
	modulationString += buildModulationType('tremolo');
	return modulationString;
}

function buildPitchEnv() {
	let pitchEnvString = "";
	pitchEnvString += "<div id='pitchEnvelope'>";
	pitchEnvString += "Pitch Envelope <br>"
	pitchEnvString += "<label> <input type='checkbox' id='pitchRange' onclick='pitchChangeRange()'>Range</label> <br> ";
	pitchEnvString += "<canvas id='envelope" + 9 + "' width = '150px' height='40px' onclick = 'activateEnvelopeModule(" + 9 + ")'> </canvas> <br>";
	pitchEnvString += "<input type='range' id='pitchEnvDepth'    min='0' max='63' step='1' value='63' onchange='setPitchEnvDepth()' > Depth <br>";
	pitchEnvString += "Velocity <br>"
	// pitchEnvString += "<input type='range' class='ampCurve' min='0' max='7'
	// step='1' value='0' id='ampCurveM9' oninput='setCurveImg(9,value)'
	// onchange='selectAmpCurve(9,value)'> ";
	pitchEnvString += "<image class='curve' id='curveImg9' onclick = 'nextAmpCurve(9)' src = 'curve1.png'> Curve <br>";
	pitchEnvString += "<input type='range' id='modSens9'    min='0' max='31' step='1' value='4' onchange='setVelocitySensitivity(9,value)' > Sens";
	pitchEnvString += "</div>";
	return pitchEnvString;
}



function buildGlobal() {
	let globalString = "";
	globalString += "<input type='text' id='toneName' onchange='setToneName()'> Tone Name <br>";
	globalString += "<input type='range' id='TotalVZLevel' min='0' max='99' step='1' value='90' onchange='setTotalLevel()'> Total Level <br>";
	globalString += "<input type='range' id='octave' min='-2' max='2' step='1' value='0' onchange='setOctave()'> Octave <br>";

	return globalString;
}

// TODO attach event handler instead
window.setTotalLevel = function() {
	let level = parseInt(($('#TotalVZLevel').val()));
	window.vzTone.setLevel(level);
	window.send_data_to_vz();
}


// TODO move out of global scope
let f;

export function readSysEx(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files;
	f = files[0];

	if (files.length > 1)
		alert('more than one file selected');

	reader.readAsArrayBuffer(f);
}

reader.onload = function() {
	var sysExBuffer = reader.result;

	bank.init(sysExBuffer, f.name);
	$("#vzBankFile").val((escape(f.name) + ' - ' + f.size + ' bytes'));
	for (let i = 0; i < 64; i++) {
		$('#tone' + i).val(bank.getToneName(i));
	}
};

const setModulation = function(type) {
	const multi = ($("#" + type + "Multi").is(':checked')) ? 1 : 0;
	const wave = parseInt(($("#" + type + "Wave").val()));
	const depth = parseInt(($("#" + type + "Depth").val()));
	const rate = parseInt(($("#" + type + "Rate").val()));
	const delay = parseInt(($("#" + type + "Delay").val()));
	window.vzTone.setModMulti(type, multi);
	window.vzTone.setModWave(type, wave);
	window.vzTone.setModDepth(type, depth);
	window.vzTone.setModRate(type, rate);
	window.vzTone.setModDelay(type, delay);
}

// TODO unused
/* eslint-disable-next-line */
window.setModvibrato = function() {
	const type = 'vibrato';
	setModulation(type);
	window.send_data_to_vz();
}

// TODO unused
/* eslint-disable-next-line */
window.setModtremolo = function() {
	const type = 'tremolo';
	setModulation(type);
	window.send_data_to_vz();
}

// TODO unused, commented out in buildPitchEnv
window.selectAmpCurve = function(module, value) {
	const curve = parseInt(value)
	window.vzTone.setVelCurve(module - 1, curve);
	window.send_data_to_vz();
}

// TODO add event listeners instead for the following event handlers
window.nextAmpCurve = function (module) {
	const value = (window.vzTone.getVelCurve(module - 1) + 1) % 8;
	window.vzTone.setVelCurve(module - 1, value);
	setCurveImg(module, value)
	window.send_data_to_vz();
}

window.setVelocitySensitivity = function(module, value) {
	var sens = parseInt(value);
	window.vzTone.setVelSensitivity(module - 1, sens);
	window.send_data_to_vz();
}

window.setEnvDepth = function(module) {
	const level = parseInt(($("#envDepth" + module).val()));
	window.vzTone.setEnvelopeDepth(module - 1, level);
	window.send_data_to_vz();
}

window.setPitchEnvDepth = function() {
	const level = parseInt(($("#pitchEnvDepth").val()));
	window.vzTone.pitchEnvDepth = level;
	window.send_data_to_vz();
}

window.setModSens = function(module) {
	const level = parseInt(($("#modSens" + module).val()));
	window.vzTone.setModulationSensitivity(module - 1, level);
	window.send_data_to_vz();
}

const setModImg = function(type, value) {
	$('#modImg' + type).attr("src", "mwave" + (parseInt(value) + 1) + ".png");
}

function renderAll() {
	$('#TotalVZLevel').val(window.vzTone.level);
	$('#toneName').val(window.vzTone.name);

	for (var i = 0; i < 4; i++) {

		$('#mixType' + (i + 1)).removeClass("ring");
		$('#mixType' + (i + 1)).removeClass("mix");
		$('#M' + (i * 2 + 1)).removeClass("VZmodule");
		$('#mixType' + (i + 1)).removeClass("phase");
		$('#M' + (i * 2 + 1)).removeClass("VZmodule_mod");

		switch (window.vzTone.getLineMix(i)) {
		case 0:
			$('#mixType' + (i + 1)).addClass("mix");
			$('#M' + (i * 2 + 1)).addClass("VZmodule");
			break;
		case 1:
			$('#mixType' + (i + 1)).addClass("phase");
			$('#M' + (i * 2 + 1)).addClass("VZmodule_mod");

			break;
		default:
			$('#mixType' + (i + 1)).addClass("ring");
			$('#M' + (i * 2 + 1)).addClass("VZmodule");

			break;
		}

		/*
		Updated to correctly display of the routing between lines

		if (i > 0) {
			if (window.vzTone.extPhase[i - 1] == 0) {
				$('#extPhase' + (i + 1)).addClass("line");
				$('#extPhase' + (i + 1)).removeClass("extPhase");
			} else {
				$('#extPhase' + (i + 1)).addClass("extPhase");
				$('#extPhase' + (i + 1)).removeClass("line");
			}
		}
		*/
		if (i < 3) {
			if (window.vzTone.extPhase[i] == 0) {
				$('#extPhase' + (i + 1)).addClass("line");
				$('#extPhase' + (i + 1)).removeClass("extPhase");
			} else {
				$('#extPhase' + (i + 1)).addClass("extPhase");
				$('#extPhase' + (i + 1)).removeClass("line");
			}
		} else {
			$('#extPhase' + (i + 1)).addClass("line");
				$('#extPhase' + (i + 1)).removeClass("extPhase");
		}
	}

	for (let i = 0; i < 8; i++) {

		if (window.vzTone.module[i].active == 1) {
			$('#module_enabled_M' + (i + 1)).addClass("active");
			$('#module_enabled_M' + (i + 1)).removeClass("inactive");
		} else {
			$('#module_enabled_M' + (i + 1)).addClass("inactive");
			$('#module_enabled_M' + (i + 1)).removeClass("active");
		}

		renderOsc(waveCanvases[i], i);
		$('#wave' + (i + 1)).val(window.vzTone.waveName[window.vzTone.getWaveForm(i)]);

		if (window.vzTone.module[i].detuneFix == 1) {
			$('#pitchFix' + (i + 1)).prop('checked', true);
		} else {
			$('#pitchFix' + (i + 1)).prop('checked', false);
		}
		$('#oct_M' + (i + 1)).val(window.vzTone.getDetuneOctave(i));
		$('#note_M' + (i + 1)).val(window.vzTone.getDetuneNote(i));
		$('#cent_M' + (i + 1)).val(window.vzTone.getDetuneCent(i));
		$('#det_note_M' + (i + 1)).val(window.vzTone.getDetuneCoarse(i));
		$('#det_cent_M' + (i + 1)).val(window.vzTone.getDetuneCent(i));

		let status = 0;
		if (lock[1][i] == 1)
			status = 2;
		if (sourceEnvelope == i)
			status = 1;
		drawEnvelope(envCanvases[i], i, status);

		setCurveImg(i + 1, window.vzTone.getVelCurve(i));

		$('#envDepth' + (i + 1)).val(window.vzTone.module[i].envelope.depth);

		status = 0;
		if (lock[2][i] == 1)
			status = 2;
		if (sourceEnvelope == i)
			status = 1;
		drawKF(kFCanvases[i], i, 0, status);

		$('#ampCurveM' + (i + 1)).val(window.vzTone.module[i].velCurve);
		$('#ampSensM' + (i + 1)).val(window.vzTone.module[i].envelope.depth);

		$('#modSens' + (i + 1)).val(window.vzTone.getModulationSensitivity(i));
	}
	drawEnvelope(envCanvases[8], 8, status);
}

// TODO use event listener
window.toggleModuleUI = function(module) {
	window.vzTone.module[module - 1].active = (window.vzTone.module[module - 1].active + 1) % 2;
	if (window.vzTone.module[module - 1].active == 1) {
		$('#module_enabled_M' + module).addClass("active");
		$('#module_enabled_M' + module).removeClass("inactive");
	} else {
		$('#module_enabled_M' + module).addClass("inactive");
		$('#module_enabled_M' + module).removeClass("active");
	}
	window.send_data_to_vz();
}

window.modUp = function(modType) {
	var type = 'vibrato';
	if (modType == 2)
		type = 'tremolo';
	window.vzTone.setModWave(type, (window.vzTone.getModWave(type) + 1) % 4);
	$('#' + type + 'Wave').val(window.vzTone.getModWave(type));
	setModImg(type, window.vzTone.getModWave(type));
	renderAll();
}
window.togglePosNegUI = function(el, module) {
	window.vzTone.setDetunePol(module - 1, (window.vzTone.getDetunePol(module - 1) + 1) % 2);

	if (window.vzTone.getDetunePol(module - 1) == 0) {
		el.src = 'negative.jpg';
		el.className = "negative";
	} else {
		el.src = 'positive.jpg';
		el.className = "positive";

	}
	window.send_data_to_vz();
}

window.setOctave = function() {
	window.vzTone.octave = parseInt(($('#octave').val()))
	window.send_data_to_vz();
}

window.setToneName = function() {
	window.vzTone.name = $('#toneName').val();
	window.send_data_to_vz();
}

window.pitchChangeRange = function() {
	if ($('#pitchRange').is(':checked'))
		window.vzTone.pitchEnvRange = 1;
	else
		window.vzTone.pitchEnvRange = 0;
	window.send_data_to_vz();
}

window.extPhase = function(line) {
	window.vzTone.extPhase[line - 1] = (window.vzTone.extPhase[line - 1] + 1) % 2;
	if (window.vzTone.extPhase[line - 1] == 0) {
		$('#extPhase' + line).addClass("line");
		$('#extPhase' + line).removeClass("extPhase");
	} else {
		$('#extPhase' + line).addClass("extPhase");
		$('#extPhase' + line).removeClass("line");
	}
	window.send_data_to_vz();
}

window.lockEnvelopeModule = function(module, type) {
	let element;
	switch (type) {
	case 1:
		element = '#envLock';
		break;
	case 2:
		element = '#kfLock';
		break;

	default:
		break;
	}

	if (lock[type][module - 1] == 0) {
		lock[type][module - 1] = 1;
		$(element + module).addClass("locked");
		$(element + module).removeClass("unlocked");
	} else {
		lock[type][module - 1] = 0;
		$(element + module).addClass("unlocked");
		$(element + module).removeClass("locked");
	}

	let status;
	for (let i = 0; i < 8; i++) {
		status = 0;
		if (lock[2][i] == 1)
			status = 2;
		if (sourceEnvelope == i)
			status = 1;
		drawKF(kFCanvases[i], i, 0, status);
	}

	for (let i = 0; i < 9; i++) {
		status = 0;
		if (lock[1][i] == 1)
			status = 2;
		if (sourceEnvelope == i)
			status = 1;
		drawEnvelope(envCanvases[i], i, status);
	}
}

window.activateEnvelopeModule = function(module) {
	if ($('#envelopes').attr('class') == "showEnvelope" && sourceEnvelope == module - 1) {
		$('#envelopes').addClass("hideEnvelope");
		$('#envelopes').removeClass("showEnvelope");
	} else {
		$('#envelopes').removeClass("hideEnvelope");
		$('#envelopes').addClass("showEnvelope");
	}
	sourceEnvelope = module - 1;
	drawEnvelope(envCanvas, module - 1);
	updateEnvelopeTable();
	let status;
	for (var i = 0; i < 9; i++) {
		status = 0;
		if (lock[1][i] == 1)
			status = 2;
		if (sourceEnvelope == i)
			status = 1;
		drawEnvelope(envCanvases[i], i, status);
	}
}

function updateKFTable() {
	const notes = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ];
	for (var i = 0; i < 6; i++) {

		document.getElementById('kf_level' + (i + 1)).value = Math.floor(window.vzTone.getKeyFollowLevel(sourceEnvelope, i));
		document.getElementById('kf_note' + (i + 1)).value = notes[window.vzTone.getKeyFollowNote(sourceEnvelope, i) % 12]
				+ Math.floor(window.vzTone.getKeyFollowNote(sourceEnvelope, i) / 12);

	}
}

window.activateKFModule = function(module) {
	if ($('#keyFollows').attr('class') == "showEnvelope" && sourceEnvelope == module - 1) {
		$('#keyFollows').addClass("hideEnvelope");
		$('#keyFollows').removeClass("showEnvelope");
	} else {
		$('#keyFollows').removeClass("hideEnvelope");
		$('#keyFollows').addClass("showEnvelope");
	}
	sourceEnvelope = module - 1;
	drawKFBars(envCanvas, module - 1);
	updateKFTable();
}

window.closeOverlay = function(element) {
	switch (element) {
	case 1:
		element = '#envelopes';
		// lock[1]  = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
		break;
	case 2:
		element = '#keyFollows';
		// lock[2]  = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
      break;

    default:
      break;
  }
  $(element).addClass('hideEnvelope');
  $(element).removeClass('showEnvelope');

}

const getMousePos = function(Canvas, evt) {
	var rect = Canvas.getBoundingClientRect();
	return {
		x : evt.clientX - rect.left,
		y : evt.clientY - rect.top
	};
}

const detectBarProximity = function(kfCanvas, evt) {
	var mousePos = getMousePos(kfCanvas, evt);
	var barProximity = 0;
	var xproxy = 15;
	let x_offset = 10;
	// TODO y_offset is unused
	// let y_offset = -10;
	let x = 0;

	// TODO y is unused
	// let y = kfCanvas.height;

	for (let i = 0; i < 8; i++) {
		x = window.vzTone.getKeyFollowNote(sourceEnvelope, i) * (kfCanvas.width / 792) * 5 + x_offset;
		// TODO y is unused
		// y = kfCanvas.height - window.vzTone.getKeyFollowLevel(sourceEnvelope, i) * kfCanvas.height / 792 + y_offset;
		if (mousePos.x >= x - xproxy && mousePos.x <= x + xproxy)
			barProximity = i + 1;
	}
	return barProximity;
}

const detectNodeProximity = function(envCanvas, evt) {
	var mousePos = getMousePos(envCanvas, evt);
	var nodeProximity = 0;
	let x = 0;
	let y = 0;
	let yScale = envCanvas.height / 100;
	for (var i = 0; i < 8; i++) {
		let time = 99 - window.vzTone.getEnvelopeTime(sourceEnvelope, i);
		x += time;
		if (sourceEnvelope == 8) {
			y = envCanvas.height / 2 - (envCanvas.height / 126) * window.vzTone.getEnvelopeLevel(sourceEnvelope, i);
		} else {
			y = envCanvas.height - window.vzTone.getEnvelopeLevel(sourceEnvelope, i) * yScale;
		}
		if (mousePos.x >= x * envCanvas.width / 792 - 10 && mousePos.x <= x * envCanvas.width / 792 + 10 && mousePos.y >= y - 10 && mousePos.y <= y + 10)
			nodeProximity = i + 1;
	}
	return nodeProximity;
}

const detectLineProximity = function(envCanvas, evt) {
	var mousePos = getMousePos(envCanvas, evt);
	var lineProximity = 0;
	let xend = 0;
	let xstart = 0;
	for (var i = 0; i < 8; i++) {
		let time = 99 - window.vzTone.getEnvelopeTime(sourceEnvelope, i);
		xend += time;

		if (mousePos.x >= xstart * envCanvas.width / 792 && mousePos.x <= xend * envCanvas.width / 792)
			lineProximity = i + 1;
		xstart += time;
	}
	// console.log("line proxy:" + lineProximity);
	return lineProximity;
}


const editEnvelope = function(envCanvas, evt, nodeProximity) {
	var x = 0;

	for (var i = 0; i < 8; i++) {
		if (nodeProximity - 1 == i) {
			let mousePos = getMousePos(envCanvas, evt);
			let newX = Math.floor((mousePos.x - x * envCanvas.width / 792) / (envCanvas.width / 792));
			if (newX <= 0)
				newX = 0;
			if (newX >= 99)
				newX = 99;
			window.vzTone.setEnvelopeTime(sourceEnvelope, i, 99 - newX);
			if (sourceEnvelope == 8) {
				window.vzTone.setEnvelopeLevel(sourceEnvelope, i, ((envCanvas.height / 2 - mousePos.y) * 126 / envCanvas.height));
			} else {
				var newY = (envCanvas.height - mousePos.y) * 100 / envCanvas.height;
				if (newY <= 0)
					newY = 0;
				if (newY >= 99)
					newY = 99;
				window.vzTone.setEnvelopeLevel(sourceEnvelope, i, newY);
			}
		}
		let time = 99 - window.vzTone.getEnvelopeTime(sourceEnvelope, i);
		x += time;

	}

	envMouseState = 2;
}

const editKFLevel = function(canvas, evt, barProximity) {
	let x_offset = 10;
	let y_offset = -10;
	
	// TODO unused
	// let x = 0;
	if (barProximity > 0) {
		let left = window.vzTone.getKeyFollowNote(sourceEnvelope, barProximity - 2);
		let right = window.vzTone.getKeyFollowNote(sourceEnvelope, barProximity);

		let mousePos = getMousePos(canvas, evt);
		let newX = Math.floor((mousePos.x - x_offset) / (5 * canvas.width / 792));

		let newY = ((canvas.height - mousePos.y) * 100 / canvas.height + y_offset) - y_offset;
		if (newX <= left)
			newX = (left + 1);
		if (newX >= right)
			newX = (right - 1);

		if (sourceEnvelope != 8) {
			if (newY > 99)
				newY = 99;
		} else {
			if (newY > 63)
				newY = 63;
		}
		if (newY < 0)
			newY = 0;
		// console.log(newY, mousePos.y,
		// window.vzTone.getKeyFollowLevel(sourceEnvelope, barProximity-1));
		window.vzTone.setKeyFollowLevel(sourceEnvelope, barProximity - 1, newY);
		window.vzTone.setKeyFollowNote(sourceEnvelope, barProximity - 1, newX);
	}
	envMouseState = 2;
}

window.editEnvelopeTxt = function(step, type, value) {
	if (sourceEnvelope == 8 && type == 2) {
		if (value > 63)
			value = 63;
		if (value < -63)
			value = -63;
	} else {
		if (value > 99)
			value = 99;
		if (value < 0)
			value = 0;
	}
	if (type == 1) {
		window.vzTone.setEnvelopeTime(sourceEnvelope, step - 1, value);
	} else {
		window.vzTone.setEnvelopeLevel(sourceEnvelope, step - 1, value);
	}

	updateEnvelope(envCanvas);
	drawEnvelopePoints(envCanvas);
	window.send_data_to_vz();
}

// TODO doesn't appear to do anything
window.editKFTxt = function() {
	// for (var i = 0; i < 8; i++) {

	// }
	// window.send_data_to_vz();
}

const drawEnvelopePoints = function(envCanvas, nodeProximity) {
	let x = 0;
	let y = 0;
	var ctx = envCanvas.getContext('2d');
	let yScale = envCanvas.height / 100;

	for (var i = 0; i < 8; i++) {
		let time = 99 - window.vzTone.getEnvelopeTime(sourceEnvelope, i);
		x += time;
		if (sourceEnvelope == 8) {
			y = envCanvas.height / 2 - (envCanvas.height / 126) * window.vzTone.getEnvelopeLevel(sourceEnvelope, i);
		} else {
			y = envCanvas.height - window.vzTone.getEnvelopeLevel(sourceEnvelope, i) * yScale;
		}
		ctx.fillStyle = "#abcdef";
		if (window.vzTone.getEnvSustain(sourceEnvelope) == i) {
			ctx.fillStyle = "yellow";
			ctx.fillRect(x * envCanvas.width / 792 - 4, y - 4, 8, 8);
		}
		if (window.vzTone.getEnvEnd(sourceEnvelope) == i) {
			ctx.fillStyle = "red";
			ctx.fillRect(x * envCanvas.width / 792 - 4, y - 4, 8, 8);
		}
		if (nodeProximity - 1 == i) {
			ctx.fillStyle = "green";
			ctx.fillRect(x * envCanvas.width / 792 - 3, y - 3, 6, 6);
		}

	}
}

function updateEnvelopeTable() {
	for (var i = 0; i < 8; i++) {

		document.getElementById('l' + (i + 1)).value = Math.floor(window.vzTone.getEnvelopeLevel(sourceEnvelope, i));
		document.getElementById('r' + (i + 1)).value = window.vzTone.getEnvelopeTime(sourceEnvelope, i);

	}
}

const doMouseMove = function(envCanvas, evt) {
	let nodeProximity;
	let lineProximity;
	// detect new mouse node proximity only, when not currently editing
	// this improves the responsivenes off the envelopes
	if (envMouseState == 0) {
		nodeProximity = detectNodeProximity(envCanvas, evt);
		lineProximity = detectLineProximity(envCanvas, evt);
	}

	if (envMouseState > 0) {
		editEnvelope(envCanvas, evt, nodeProximity);
	}

	updateEnvelopeTable();
	updateEnvelope(envCanvas, lineProximity);
	drawEnvelopePoints(envCanvas, nodeProximity);
}

const updateEnvelope = function(envCanvas, lineProximity) {
	var i;

	if (sourceEnvelope != 8) {
		for (i = 0; i < 8; i++) {
			if (lock[1][i] == 1)
				window.vzTone.copyEnv(sourceEnvelope, i);
		}
	}

	drawEnvelope(envCanvas, sourceEnvelope, 0, lineProximity);

	for (i = 0; i < 9; i++) {
		let status = 0;
		if (lock[1][i] == 1)
			status = 2;
		if (sourceEnvelope == i)
			status = 1;
		drawEnvelope(envCanvases[i], i, status);
	}
}

const doKFMouseMove = function(kfCanvas, evt) {
	let barProximity;

	if (kfMouseState == 0)
		barProximity = detectBarProximity(kfCanvas, evt);
	if (kfMouseState > 0)
		editKFLevel(kfCanvas, evt, barProximity);

	drawKFBars(kfCanvas, sourceEnvelope, barProximity);
	drawKF(kfCanvas, sourceEnvelope, barProximity);
	updateKFTable();

	for (let i = 0; i < 8; i++) {
		if (lock[2][i] == 1)
			window.vzTone.copyKF(sourceEnvelope, i);
	}
	for (let i = 0; i < 8; i++) {
		let status = 0;
		if (lock[2][i] == 1)
			status = 2;
		if (sourceEnvelope == i)
			status = 1;
		drawKF(kFCanvases[i], i, 0, status);
	}
}

const doKFMouseUp = function() {
	kfMouseState = 0;
	window.send_data_to_vz();
}

const doKFMouseDown = function() {
	kfMouseState = 1;
}

const doMouseDown = function() {
	// console.log("in down: " + envMouseState);
	envMouseState = 1;

}

const doMouseOut = function(envCanvas, evt) {
	// console.log("Mouse OUTTTTTTTTT" + envMouseState);
	doMouseUp(envCanvas, evt);

}

const doMouseUp = function(envCanvas, evt) {
	// console.log("in up: " + envMouseState);
	let nodeProximity;
	let lineProximity;
	let sustain;
	let end;

	if (envMouseState == 1) {
		// var mousePos = getMousePos(envCanvas, evt);
		nodeProximity = detectNodeProximity(envCanvas, evt);
		lineProximity = detectLineProximity(envCanvas, evt);
		if (nodeProximity >= 1) {
			sustain = window.vzTone.getEnvSustain(sourceEnvelope);
			end = window.vzTone.getEnvEnd(sourceEnvelope);

			if (nodeProximity - 1 > end)
				window.vzTone.setEnvEnd(sourceEnvelope, nodeProximity - 1);
			if (nodeProximity - 1 == sustain)
				window.vzTone.setEnvSustain(sourceEnvelope, -1);
			else if (nodeProximity - 1 < end)
				window.vzTone.setEnvSustain(sourceEnvelope, nodeProximity - 1);
			if (nodeProximity - 1 == end) {
				window.vzTone.setEnvSustain(sourceEnvelope, 0);
				window.vzTone.setEnvEnd(sourceEnvelope, sustain);
			}
		}
		// set velocity enabled for rate
		if (lineProximity >= 1) {
			if (window.vzTone.getEnvelopeVelocity(sourceEnvelope, lineProximity - 1) == 0)
				window.vzTone.setEnvelopeVelocity(sourceEnvelope, lineProximity - 1, 1);
			else
				window.vzTone.setEnvelopeVelocity(sourceEnvelope, lineProximity - 1, 0);
		}
	}
	envMouseState = 0;
	kfMouseState = 0;
	window.send_data_to_vz();

}

envCanvas.addEventListener('mousemove', function(evt) {
	doMouseMove(envCanvas, evt);
}, false);

envCanvas.addEventListener('mousedown', function(evt) {
	doMouseDown(envCanvas, evt);
}, false);

envCanvas.addEventListener('mouseup', function(evt) {
	doMouseUp(envCanvas, evt);
}, false);

envCanvas.addEventListener('mouseout', function(evt) {
	doMouseOut(envCanvas, evt);
}, false);

kfCanvas.addEventListener('mousemove', function(evt) {
	doKFMouseMove(kfCanvas, evt);
}, false);

kfCanvas.addEventListener('mousedown', function(evt) {
	doKFMouseDown(kfCanvas, evt);
}, false);

kfCanvas.addEventListener('mouseup', function(evt) {
	doKFMouseUp(kfCanvas, evt);
}, false);

const convertLongMsg2Short = function(hexArray) {
	var tmpByte;
	var shortMsg = [];
	for (var i = 0; i < hexArray.length; i += 2) {
		tmpByte = hexArray[i] << 4;
		tmpByte = tmpByte | hexArray[i + 1];
		shortMsg.push(tmpByte);

	}
	return shortMsg;
}

const calculateChecksum = function(SysexData) {
	let newChecksum = 0;
	for (var i = 0; i < SysexData.length; i += 2) {
		newChecksum += SysexData[i] * 16 + SysexData[i + 1];
		newChecksum = newChecksum % 128;
	}

	newChecksum = 128 - newChecksum;
	if (newChecksum == 128) newChecksum = 0;
	return newChecksum;
}

const fillSysexToneData = function() {
	window.vzTone.getHexArray();
	var toneData = [];
	for (var i = 0; i < window.internalToneData.length; i++) {
		if (window.internalToneData[i] < 0)
			console.log("--->" + i + ":" + window.internalToneData[i]);
		if (window.internalToneData[i] > 255)
			console.log("too hi! " + i + ":" + window.internalToneData[i]);
		toneData.push(window.internalToneData[i] >> 4);
		toneData.push(window.internalToneData[i] & 0x0f);
	}
	return toneData;
};

window.send_data_to_vz = function() {
	var toneData = [];
	let SysexMessage = [];
	let SYSEX_CHECKSUM = [];
	toneData = fillSysexToneData();
	SYSEX_CHECKSUM.push(calculateChecksum(toneData));
	SysexMessage = SYSEX_START;
	SysexMessage = SysexMessage.concat(SYSEX_CHANNEL);
	SysexMessage = SysexMessage.concat(SYSEX_DATA_RECEIVE_AREA);
	SysexMessage = SysexMessage.concat(toneData);
	SysexMessage = SysexMessage.concat(SYSEX_CHECKSUM);
	SysexMessage = SysexMessage.concat(SYSEX_END);
	// Added clear and send offset
	//outport.clear(); 
	// TODO avoid global variable, pass as argument?
	window.outport.send(SysexMessage) ;
};

window.lineMix = function(line) {
	window.vzTone.setLineMix(line - 1, (window.vzTone.getLineMix(line - 1) + 1) % 3);
	switch (window.vzTone.getLineMix(line - 1)) {
	case 0:
		$('#mixType' + line).addClass("mix");
		$('#mixType' + line).removeClass("ring");
		break;
	case 1:
		$('#mixType' + line).addClass("phase");
		$('#mixType' + line).removeClass("mix");
		$('#M' + ((line - 1) * 2 + 1)).addClass("VZmodule_mod");
		$('#M' + ((line - 1) * 2 + 1)).removeClass("VZmodule");
		break;
	default:
		$('#mixType' + line).addClass("ring");
		$('#mixType' + line).removeClass("phase");
		$('#M' + ((line - 1) * 2 + 1)).addClass("VZmodule");
		$('#M' + ((line - 1) * 2 + 1)).removeClass("VZmodule_mod");
		break;
	}
	window.send_data_to_vz();
}

window.waveUp = function(module) {
	let wave = window.vzTone.getWaveForm(module - 1);
	window.vzTone.module[module - 1].waveForm = (wave + 1) % 8;
	renderOsc(waveCanvases[module - 1], module - 1);
	$('#wave' + module).val(window.vzTone.waveName[window.vzTone.getWaveForm(module - 1)]);
	window.send_data_to_vz();
}

window.waveDown = function(module) {
	let wave = window.vzTone.getWaveForm(module - 1);
	window.vzTone.module[module - 1].waveForm = (wave + 8 - 1) % 8;
	renderOsc(waveCanvases[module - 1], module - 1);
	$('#wave' + module).val(window.vzTone.waveName[window.vzTone.getWaveForm(module - 1)]);
	window.send_data_to_vz();
}

// function togglePosNeg(module, state) {
// window.vzTone.setDetunePol(module - 1, state);
// }

window.selectFixedPitch = function(module) {
	window.internalToneData[3 + 2 * module] &= 0xfd;
	if ($('#det_pitch_fixM' + module).is(':checked'))
		window.internalToneData[3 + 2 * module] += 1 << 1;
	window.send_data_to_vz();
}

window.setDetune = function(module) {
	let pol = window.vzTone.getDetunePol(module - 1);
	if (pol == 0) {
		pol = -1;
	} else {
		pol = 1
	}
	let noteval = parseInt(($('#det_note_M' + module).val()));
	let cent = parseInt(($('#det_cent_M' + module).val()));
	window.vzTone.setDetune(module - 1, (noteval * 64 + cent) * pol);
	document.getElementById('oct_M' + module).value = window.vzTone.getDetuneOctave(module - 1);
	document.getElementById('note_M' + module).value = window.vzTone.getDetuneNote(module - 1);
	document.getElementById("cent_M" + module).value = window.vzTone.getDetuneCent(module - 1);

}

window.dragModule = function(event, value) {
	event.dataTransfer.setData('text/string', value - 1);
}

window.allowDrop = function(event) {
	event.preventDefault();
}

window.setPitchFix = function(module) {
	if ($('#pitchFix' + module).is(":checked")) {
		window.vzTone.module[module - 1].detuneFix = 1;
	} else {
		window.vzTone.module[module - 1].detuneFix = 0;
	}
	window.send_data_to_vz();
}

window.dropModule = function(event, dest) {
	event.preventDefault();
	var source = event.dataTransfer.getData('text/string');
	window.vzTone.copyModule(source, dest - 1);
	renderAll();
	window.send_data_to_vz();
}

window.changeMidiChannel = function(value) {
	let midiChannel = parseInt(value);
	if (value > 15 || value <0)
		value = 1; // it should throw an error... I know
	SYSEX_CHANNEL[0] = midiChannel + 0x70;
	MIDI_CHANNEL[0] = midiChannel; //changed just now
	// document.getElementById("midiChannelTxt").value = midiChannel;
}


