import { VZTone } from "./VZTone";
import { VZBank } from "./VZBank";

const SYSEX_START = [0xf0, 0x44, 0x03, 0x00];
const SYSEX_CHANNEL = [0x70]; /* set to channel 1 */
const SYSEX_DATA_RECEIVE_AREA = [0x00, 0x40];
const SYSEX_END = [0xf7];
var sourceEnvelope = 0;

// create the tone object
const vzTone = new VZTone();
const bank = new VZBank();
const reader = new FileReader();

const lock = [];
lock[0] = [0, 0, 0, 0, 0, 0, 0, 0]; // not used .... for module copy
lock[1] = [0, 0, 0, 0, 0, 0, 0, 0]; // envelope
lock[2] = [0, 0, 0, 0, 0, 0, 0, 0]; // key follow

window.internalToneData = [];

const byId = document.getElementById;

for (let i = 1; i < 5; i++) {
    byId("lines").innerHTML +=
        "<div class = 'VZline' id='line" + i + "'></div>";
    byId("line" + i).innerHTML =
        "<input type='submit' value='' id='sum' class='sum' >";
    byId("line" + i).innerHTML +=
        "<input type='submit' value='' class='mix'  id='mixType" +
        i +
        "' onclick = 'lineMix(" +
        i +
        ")' >";
    byId("line" + i).innerHTML +=
        "<input type='submit' value='' id='connector' class='connector' >";
    if (i < 4) {
        byId("line" + i).innerHTML +=
            "<input type='submit' value='' class='line'  id='extPhase" +
            i +
            "' onclick = 'extPhase(" +
            i +
            ")' >";
    } else {
        byId("line" + i).innerHTML +=
            "<input type='submit' value='' class='line'  id='extPhase" +
            i +
            "' >";
    }

    byId("line" + i).style.left = 25 * (i - 1) + "%";
}

for (let i = 1; i < 9; i++) {
    byId("modules").innerHTML += "<div class='VZmodule' id='M" + i + "'></div>";
    byId("M" + i).style.left = 12 * (i - 1) + "%";
    byId("M" + i).innerHTML = buildModule(i);
    byId("detune_M" + i).innerHTML = buildDetune(i);
    byId("wave_M" + i).innerHTML = buildWave(i);
    byId("envelope_M" + i).innerHTML = buildEnvelopeModules(i);
    byId("modulation_M" + i).innerHTML = buildModuleModulation(i);
}
byId("global").innerHTML = buildGlobal();
byId("envelopes").innerHTML = buildEnvelope();
byId("modulation").innerHTML = buildModulation();
byId("vZbank").innerHTML = buildVZbank();

var envCanvas = byId("envelope");
var envContext = envCanvas.getContext("2d");
var envMouseState = 0;
drawEnvelope(envCanvas, 0);

byId("keyFollows").innerHTML = buildKF();
var kfCanvas = byId("kf");
var kfContext = kfCanvas.getContext("2d");
var kfMouseState = 0;
drawKFBars(kfCanvas, 0, 0);
drawKF(kfCanvas, 0, 0);

var envCanvases = [];
var waveCanvases = [];
var kFCanvases = [];

for (let i = 1; i < 9; i++) {
    waveCanvases[i - 1] = byId("waveForm" + i);
    renderOsc(waveCanvases[i - 1], i - 1);
    kFCanvases[i - 1] = byId("keyFollow" + i);
    drawKF(kFCanvases[i - 1], i - 1, 0);
}

for (let i = 1; i < 10; i++) {
    envCanvases[i - 1] = byId("envelope" + i);
    drawEnvelope(envCanvases[i - 1], i - 1);
}

renderAll();

function buildVZbank() {
    var vzBankString =
        "<output id='vzBankFile'> drop a SysEx file here... </output>";
    vzBankString += "<table>";
    for (var i = 0; i < 8; i++) {
        vzBankString += "<tr>";
        for (var j = 0; j < 8; j++) {
            vzBankString +=
                "<td> <output draggable='true' onclick='loadTone(" +
                (i * 8 + j) +
                ")' id = 'tone" +
                (i * 8 + j) +
                "' ></output></td>";
        }
        vzBankString += "</tr>";
    }
    vzBankString += "</table>";
    return vzBankString;
}

function buildModulation() {
    let modulationString = "";
    modulationString += buildPitchEnv();
    modulationString += buildModulationType("vibrato");
    modulationString += buildModulationType("tremolo");
    return modulationString;
}

function buildPitchEnv() {
    let pitchEnvString = "";
    pitchEnvString += "<div id='pitchEnvelope'>";
    pitchEnvString += "Pitch Envelope <br>";
    pitchEnvString +=
        "<label> <input type='checkbox' id='pitchRange' onclick='pitchChangeRange()'>Range</label> <br> ";
    pitchEnvString +=
        "<canvas id='envelope" +
        9 +
        "' width = '100%' height='30%' onclick = 'activateEnvelopeModule(" +
        9 +
        ")'> </canvas> <br>";
    pitchEnvString +=
        "<input type='range' id='pitchEnvDepth'    min='0' max='63' step='1' value='63' onchange='setPitchEnvDepth()' > Depth <br>";
    pitchEnvString += "Velocity <br>";
    // pitchEnvString += "<input type='range' class='ampCurve' min='0' max='7'
    // step='1' value='0' id='ampCurveM9' oninput='setCurveImg(9,value)'
    // onchange='selectAmpCurve(9,value)'> ";
    pitchEnvString +=
        "<image class='curve' id='curveImg9' onclick = 'nextAmpCurve(9)' src = 'curve1.png'> Curve <br>";
    pitchEnvString +=
        "<input type='range' id='modSens9'    min='0' max='31' step='1' value='4' onchange='setVelocitySensitivity(9,value)' > Sens";
    pitchEnvString += "</div>";
    return pitchEnvString;
}

function buildModulationType(type) {
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
        "<image id= 'modImg" +
        type +
        "' onclick='modUp(" +
        modType +
        ")'  width = '12%' src = 'mwave1.png'><br>";
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
}

function buildGlobal() {
    let globalString = "";
    globalString +=
        "<input type='text' id='toneName' onchange='setToneName()'> Tone Name <br>";
    globalString +=
        "<input type='range' id='TotalVZLevel' min='0' max='99' step='1' value='90' onchange='setTotalLevel()'> Total Level <br>";
    globalString +=
        "<input type='range' id='octave' min='-2' max='2' step='1' value='0' onchange='setOctave()'> Octave <br>";

    return globalString;
}

function setTotalLevel() {
    let level = parseInt($("#TotalVZLevel").val());
    vzTone.setLevel(level);
    window.send_data_to_vz();
}

function buildModule(module) {
    moduleString = "";
    moduleString +=
        "<input type='submit' value ='' class='active' id='module_enabled_M" +
        module +
        "' src='active.jpg' draggable='true' ondragstart='dragModule(event," +
        module +
        ")' ondrop='dropModule(event, " +
        module +
        ")' onclick='toggleModuleUI(" +
        module +
        ")' ondragover= 'allowDrop(event)' >";
    moduleString += "<div id='wave_M" + module + "'></div>";
    moduleString += "<div id='detune_M" + module + "'></div>";
    moduleString += "<div id='envelope_M" + module + "'></div>";
    moduleString += "<div id='modulation_M" + module + "'></div>";
    return moduleString;
}

function buildWave(module) {
    waveString = "";
    waveString +=
        "<input type='image'  id='waveDwn" +
        module +
        "' class='waveBtn' src='left.jpg' onclick='waveDown(" +
        module +
        ")'  >";
    waveString +=
        "<canvas id='waveForm" +
        module +
        "' width = '70px' height='30px' border='none' onclick = 'waveUp(" +
        module +
        ")'></canvas>";
    waveString +=
        "<input type='image' class='waveBtn' id='waveUp" +
        module +
        "'src='right.jpg' onclick='waveUp(" +
        module +
        ")'>";

    waveString += "<output id='wave" + module + "'>sine</output>";
    return waveString;
}

function buildModuleModulation(module) {
    moduleModulationString =
        "<input type='submit' value='' class='unlocked'  id='kfLock" +
        i +
        "' onclick = 'lockEnvelopeModule(" +
        i +
        ",2)' >  Key Follow  <br> ";
    moduleModulationString +=
        "<canvas id='keyFollow" +
        module +
        "' width = '12%' height='5%' onclick = 'activateKFModule(" +
        module +
        ")'></canvas>";
    moduleModulationString += "Velocity <br>";
    // moduleModulationString += "<input type='range' class='ampCurve' min='0'
    // max='7' step='1' value='0' id='ampCurveM" + module + "'
    // onchange='selectAmpCurve("
    // + module + ",value)'> Curve";
    moduleModulationString +=
        "<image class='curve' id='curveImg" +
        module +
        "' onclick = 'nextAmpCurve(" +
        module +
        ")' src = 'curve1.png'><br>";
    moduleModulationString +=
        "<input type='range' class='ampSens' min='0' max='31' step='1' value='0' id='ampSensM" +
        module +
        "' onchange='setVelocitySensitivity(" +
        module +
        ",value)'> Sens<br>";
    moduleModulationString += "Modulation <br>";
    moduleModulationString +=
        "<input type='range' id='modSens" +
        module +
        "' onchange='setModSens(" +
        module +
        ")' min='0' max='7' step='1' value='4'> Sens";
    return moduleModulationString;
}

function buildDetune(module) {
    detuneString = "Pitch <br>";
    detuneString +=
        "<input type='image' class='positive' id='det_pos_neg_M" +
        module +
        "' src='positive.jpg' onclick='togglePosNegUI(this," +
        module +
        ")'  widht='15px'>";
    detuneString +=
        " <label> <input type='checkbox' id='pitchFix" +
        module +
        "' onchange='setPitchFix(" +
        module +
        ")'>Fix</label><br> ";
    detuneString +=
        "<label for='oct_M" +
        module +
        "'>Oct:</label> <output id='oct_M" +
        module +
        "' width='20px' > </output>";
    detuneString +=
        "<label for='note_M" +
        module +
        "'>Note:</label> <output id='note_M" +
        module +
        "' width='20px' > </output>";
    detuneString +=
        "<label for='cent_M" +
        module +
        "'>Fine:</label> <output id='cent_M" +
        module +
        "' width='20px' > </output><br> ";
    detuneString +=
        "<input type='range' min='0' max='127' step='1' value='0' id='det_note_M" +
        module +
        "' onchange='window.send_data_to_vz()' oninput='setDetune(" +
        module +
        ")'> Coarse";
    detuneString +=
        "<input type='range' min='0' max='63' step='1' value='0'	id='det_cent_M" +
        module +
        "' onchange='window.send_data_to_vz()' oninput='setDetune(" +
        module +
        ")'> Fine";
    return detuneString;
}

function loadTone(num) {
    vzTone.initFromHexArray(convertLongMsg2Short(bank.getToneArray(num)));
    renderAll();
    window.send_data_to_vz();
}
function buildEnvelopeModules(module) {
    envelopeModuleString =
        "<input type='submit' value='' class='unlocked'  id='envLock" +
        module +
        "' onclick = 'lockEnvelopeModule(" +
        module +
        ",1)' >Envelope <br> ";
    envelopeModuleString +=
        "<canvas id='envelope" +
        module +
        "' width = '150px' height='40px' onclick = 'activateEnvelopeModule(" +
        module +
        ")'></canvas>";

    envelopeModuleString +=
        "<input type='range' id='envDepth" +
        module +
        "' onchange='setEnvDepth(" +
        module +
        ")' min='0' max='99' step='1' value='90'> Depth";
    return envelopeModuleString;
}

function buildEnvelope() {
    var i;
    envelopeString = "";
    envelopeString +=
        "<input type='image' id='close_env' src='negative.jpg' align='right' onclick='closeOverlay(1)' widht='30px'> Envelope Editor <br>";
    envelopeString +=
        "<canvas id='envelope' width = '1400' height='600'></canvas>";

    envelopeString += "<table>";
    envelopeString += "<tr>";
    for (i = 0; i < 9; i++) {
        envelopeString += "<td>";
        if (i > 0) envelopeString += i;
        envelopeString += "</td>";
    }
    envelopeString += "</tr>	<tr>";
    for (i = 0; i < 9; i++) {
        envelopeString += "<td>";
        if (i > 0)
            envelopeString +=
                "<input type='text' class='envText' id='r" +
                i +
                "' onchange='editEnvelopeTxt(" +
                i +
                ",1,value)' >";
        else envelopeString += "Rate";
        envelopeString += "</td>";
    }
    envelopeString += "</tr>	<tr>";
    for (i = 0; i < 9; i++) {
        envelopeString += "<td>";
        if (i > 0)
            envelopeString +=
                "<input type='text' class='envText' id='l" +
                i +
                "' onchange='editEnvelopeTxt(" +
                i +
                ",2,value)' >";
        else envelopeString += "Level";
        envelopeString += "</td>";
    }
    envelopeString += "</tr></table>";
    return envelopeString;
}

function buildKF() {
    var i;
    kfString = "";
    kfString +=
        "<input type='image' id='close_env' src='negative.jpg' align='right' onclick='closeOverlay(2)' widht='30px'> Key Follow Editor <br>";
    kfString += "<canvas id='kf' width = '1000px' height = '300px'></canvas>";

    kfString += "<table>";
    kfString += "<tr>";
    for (i = 0; i < 7; i++) {
        kfString += "<td>";
        if (i > 0) kfString += i;
        kfString += "</td>";
    }
    kfString += "</tr>	<tr>";
    for (i = 0; i < 7; i++) {
        kfString += "<td>";
        if (i > 0)
            kfString +=
                "<input type='text' class='envText' id='kf_level" +
                i +
                "' onchange='editKFTxt(" +
                i +
                ")' >";
        else kfString += "Level";
        kfString += "</td>";
    }
    kfString += "</tr>	<tr>";
    for (i = 0; i < 7; i++) {
        kfString += "<td>";
        if (i > 0)
            kfString +=
                "<input type='text' class='envText' id='kf_note" +
                i +
                "' onchange='editKFTxt(" +
                i +
                ")' >";
        else kfString += "Note";
        kfString += "</td>";
    }
    kfString += "</tr></table>";
    return kfString;
}

function readSysEx(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;
    f = files[0];

    if (files.length > 1) alert("more than one file selected");

    reader.readAsArrayBuffer(f);
}

reader.onload = function(e) {
    var sysExBuffer = reader.result;

    bank.init(sysExBuffer, f.name);
    $("#vzBankFile").val(escape(f.name) + " - " + f.size + " bytes");
    for (var i = 0; i < 64; i++) {
        $("#tone" + i).val(bank.getToneName(i));
    }
};

function setModulation(type) {
    if ($("#" + type + "Multi").is(":checked")) {
        multi = 1;
    } else {
        multi = 0;
    }
    wave = parseInt($("#" + type + "Wave").val());
    depth = parseInt($("#" + type + "Depth").val());
    rate = parseInt($("#" + type + "Rate").val());
    delay = parseInt($("#" + type + "Delay").val());
    vzTone.setModMulti(type, multi);
    vzTone.setModWave(type, wave);
    vzTone.setModDepth(type, depth);
    vzTone.setModRate(type, rate);
    vzTone.setModDelay(type, delay);
}

function setModvibrato() {
    type = "vibrato";
    setModulation(type);
    window.send_data_to_vz();
}

function setModtremolo() {
    type = "tremolo";
    setModulation(type);
    window.send_data_to_vz();
}

function selectAmpCurve(module, value) {
    var curve = parseInt(value);
    vzTone.setVelCurve(module - 1, curve);
    window.send_data_to_vz();
}

function nextAmpCurve(module) {
    value = (vzTone.getVelCurve(module - 1) + 1) % 8;
    vzTone.setVelCurve(module - 1, value);
    setCurveImg(module, value);
    window.send_data_to_vz();
}

function setVelocitySensitivity(module, value) {
    var sens = parseInt(value);
    vzTone.setVelSensitivity(module - 1, sens);
    window.send_data_to_vz();
}

function setEnvDepth(module) {
    level = parseInt($("#envDepth" + module).val());
    vzTone.setEnvelopeDepth(module - 1, level);
    window.send_data_to_vz();
}

function setPitchEnvDepth() {
    level = parseInt($("#pitchEnvDepth").val());
    vzTone.pitchEnvDepth = level;
    window.send_data_to_vz();
}

function setModSens(module) {
    level = parseInt($("#modSens" + module).val());
    vzTone.setModulationSensitivity(module - 1, level);
    window.send_data_to_vz();
}

function renderAll() {
    $("#TotalVZLevel").val(vzTone.level);
    $("#toneName").val(vzTone.name);

    for (var i = 0; i < 4; i++) {
        $("#mixType" + (i + 1)).removeClass("ring");
        $("#mixType" + (i + 1)).removeClass("mix");
        $("#M" + (i * 2 + 1)).removeClass("VZmodule");
        $("#mixType" + (i + 1)).removeClass("phase");
        $("#M" + (i * 2 + 1)).removeClass("VZmodule_mod");

        switch (vzTone.getLineMix(i)) {
            case 0:
                $("#mixType" + (i + 1)).addClass("mix");
                $("#M" + (i * 2 + 1)).addClass("VZmodule");
                break;
            case 1:
                $("#mixType" + (i + 1)).addClass("phase");
                $("#M" + (i * 2 + 1)).addClass("VZmodule_mod");

                break;
            default:
                $("#mixType" + (i + 1)).addClass("ring");
                $("#M" + (i * 2 + 1)).addClass("VZmodule");

                break;
        }

        if (i > 0) {
            if (vzTone.extPhase[i - 1] == 0) {
                $("#extPhase" + (i + 1)).addClass("line");
                $("#extPhase" + (i + 1)).removeClass("extPhase");
            } else {
                $("#extPhase" + (i + 1)).addClass("extPhase");
                $("#extPhase" + (i + 1)).removeClass("line");
            }
        }
    }

    for (var i = 0; i < 8; i++) {
        if (vzTone.module[i].active == 1) {
            $("#module_enabled_M" + (i + 1)).addClass("active");
            $("#module_enabled_M" + (i + 1)).removeClass("inactive");
        } else {
            $("#module_enabled_M" + (i + 1)).addClass("inactive");
            $("#module_enabled_M" + (i + 1)).removeClass("active");
        }

        renderOsc(waveCanvases[i], i);
        $("#wave" + (i + 1)).val(vzTone.waveName[vzTone.getWaveForm(i)]);

        if (vzTone.module[i].detuneFix == 1) {
            $("#pitchFix" + (i + 1)).prop("checked", true);
        } else {
            $("#pitchFix" + (i + 1)).prop("checked", false);
        }
        $("#oct_M" + (i + 1)).val(vzTone.getDetuneOctave(i));
        $("#note_M" + (i + 1)).val(vzTone.getDetuneNote(i));
        $("#cent_M" + (i + 1)).val(vzTone.getDetuneCent(i));
        $("#det_note_M" + (i + 1)).val(vzTone.getDetuneCoarse(i));
        $("#det_cent_M" + (i + 1)).val(vzTone.getDetuneCent(i));

        status = 0;
        if (lock[1][i] == 1) status = 2;
        if (sourceEnvelope == i) status = 1;
        drawEnvelope(envCanvases[i], i, status);

        setCurveImg(i + 1, vzTone.getVelCurve(i));

        $("#envDepth" + (i + 1)).val(vzTone.module[i].envelope.depth);

        status = 0;
        if (lock[2][i] == 1) status = 2;
        if (sourceEnvelope == i) status = 1;
        drawKF(kFCanvases[i], i, 0, status);

        $("#ampCurveM" + (i + 1)).val(vzTone.module[i].velCurve);
        $("#ampSensM" + (i + 1)).val(vzTone.module[i].envelope.depth);

        $("#modSens" + (i + 1)).val(vzTone.getModulationSensitivity(i));
    }
    drawEnvelope(envCanvases[8], 8, status);
}

function toggleModuleUI(module) {
    vzTone.module[module - 1].active =
        (vzTone.module[module - 1].active + 1) % 2;
    if (vzTone.module[module - 1].active == 1) {
        $("#module_enabled_M" + module).addClass("active");
        $("#module_enabled_M" + module).removeClass("inactive");
    } else {
        $("#module_enabled_M" + module).addClass("inactive");
        $("#module_enabled_M" + module).removeClass("active");
    }
    window.send_data_to_vz();
}

function setCurveImg(module, value) {
    $("#curveImg" + module).attr(
        "src",
        "curve" + (parseInt(value) + 1) + ".png"
    );
}

function setModImg(type, value) {
    $("#modImg" + type).attr("src", "mwave" + (parseInt(value) + 1) + ".png");
}

function modUp(modType) {
    var type = "vibrato";
    if (modType == 2) type = "tremolo";
    vzTone.setModWave(type, (vzTone.getModWave(type) + 1) % 4);
    $("#" + type + "Wave").val(vzTone.getModWave(type));
    setModImg(type, vzTone.getModWave(type));
    renderAll();
}
function togglePosNegUI(el, module) {
    vzTone.setDetunePol(module - 1, (vzTone.getDetunePol(module - 1) + 1) % 2);

    if (vzTone.getDetunePol(module - 1) == 0) {
        el.src = "negative.jpg";
        el.className = "negative";
    } else {
        el.src = "positive.jpg";
        el.className = "positive";
    }
    window.send_data_to_vz();
}

function setOctave() {
    vzTone.octave = parseInt($("#octave").val());
    window.send_data_to_vz();
}

function setToneName() {
    vzTone.name = $("#toneName").val();
    window.send_data_to_vz();
}

function pitchChangeRange() {
    if ($("#pitchRange").is(":checked")) vzTone.pitchEnvRange = 1;
    else vzTone.pitchEnvRange = 0;
    window.send_data_to_vz();
}

function extPhase(line) {
    vzTone.extPhase[line - 1] = (vzTone.extPhase[line - 1] + 1) % 2;
    if (vzTone.extPhase[line - 1] == 0) {
        $("#extPhase" + line).addClass("line");
        $("#extPhase" + line).removeClass("extPhase");
    } else {
        $("#extPhase" + line).addClass("extPhase");
        $("#extPhase" + line).removeClass("line");
    }
    window.send_data_to_vz();
}

function lockEnvelopeModule(module, type) {
    switch (type) {
        case 1:
            element = "#envLock";
            break;
        case 2:
            element = "#kfLock";
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
    for (var i = 0; i < 8; i++) {
        status = 0;
        if (lock[2][i] == 1) status = 2;
        if (sourceEnvelope == i) status = 1;
        drawKF(kFCanvases[i], i, 0, status);
    }

    for (var i = 0; i < 9; i++) {
        status = 0;
        if (lock[1][i] == 1) status = 2;
        if (sourceEnvelope == i) status = 1;
        drawEnvelope(envCanvases[i], i, status);
    }
}

function activateEnvelopeModule(module) {
    if (
        $("#envelopes").attr("class") == "showEnvelope" &&
        sourceEnvelope == module - 1
    ) {
        $("#envelopes").addClass("hideEnvelope");
        $("#envelopes").removeClass("showEnvelope");
    } else {
        $("#envelopes").removeClass("hideEnvelope");
        $("#envelopes").addClass("showEnvelope");
    }
    sourceEnvelope = module - 1;
    drawEnvelope(envCanvas, module - 1);
    updateEnvelopeTable();
    for (var i = 0; i < 9; i++) {
        status = 0;
        if (lock[1][i] == 1) status = 2;
        if (sourceEnvelope == i) status = 1;
        drawEnvelope(envCanvases[i], i, status);
    }
}

function activateKFModule(module) {
    if (
        $("#keyFollows").attr("class") == "showEnvelope" &&
        sourceEnvelope == module - 1
    ) {
        $("#keyFollows").addClass("hideEnvelope");
        $("#keyFollows").removeClass("showEnvelope");
    } else {
        $("#keyFollows").removeClass("hideEnvelope");
        $("#keyFollows").addClass("showEnvelope");
    }
    sourceEnvelope = module - 1;
    drawKFBars(envCanvas, module - 1);
    updateKFTable();
}

function closeOverlay(element) {
    switch (element) {
        case 1:
            element = "#envelopes";
            break;
        case 2:
            element = "#keyFollows";
            break;

        default:
            break;
    }
    $(element).addClass("hideEnvelope");
    $(element).removeClass("showEnvelope");
}

function getMousePos(Canvas, evt) {
    var rect = Canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function detectBarProximity(kfCanvas, evt) {
    var mousePos = getMousePos(kfCanvas, evt);
    var barProximity = 0;
    var xproxy = 15;
    x_offset = 10;
    y_offset = -10;
    x = 0;
    y = kfCanvas.height;

    for (var i = 0; i < 8; i++) {
        x =
            vzTone.getKeyFollowNote(sourceEnvelope, i) *
                (kfCanvas.width / 792) *
                5 +
            x_offset;
        y =
            kfCanvas.height -
            (vzTone.getKeyFollowLevel(sourceEnvelope, i) * kfCanvas.height) /
                792 +
            y_offset;
        if (mousePos.x >= x - xproxy && mousePos.x <= x + xproxy)
            barProximity = i + 1;
    }
    return barProximity;
}

function detectNodeProximity(envCanvas, evt) {
    var mousePos = getMousePos(envCanvas, evt);
    var nodeProximity = 0;
    x = 0;
    y = 0;
    yScale = envCanvas.height / 100;
    for (var i = 0; i < 8; i++) {
        time = 99 - vzTone.getEnvelopeTime(sourceEnvelope, i);
        x += time;
        if (sourceEnvelope == 8) {
            y =
                envCanvas.height / 2 -
                (envCanvas.height / 126) *
                    vzTone.getEnvelopeLevel(sourceEnvelope, i);
        } else {
            y =
                envCanvas.height -
                vzTone.getEnvelopeLevel(sourceEnvelope, i) * yScale;
        }
        if (
            mousePos.x >= (x * envCanvas.width) / 792 - 10 &&
            mousePos.x <= (x * envCanvas.width) / 792 + 10 &&
            mousePos.y >= y - 10 &&
            mousePos.y <= y + 10
        )
            nodeProximity = i + 1;
    }
    return nodeProximity;
}

function detectLineProximity(envCanvas, evt) {
    var mousePos = getMousePos(envCanvas, evt);
    var lineProximity = 0;
    xend = 0;
    xstart = 0;
    for (var i = 0; i < 8; i++) {
        time = 99 - vzTone.getEnvelopeTime(sourceEnvelope, i);
        xend += time;

        if (
            mousePos.x >= (xstart * envCanvas.width) / 792 &&
            mousePos.x <= (xend * envCanvas.width) / 792
        )
            lineProximity = i + 1;
        xstart += time;
    }
    // console.log("line proxy:" + lineProximity);
    return lineProximity;
}

function drawEnvelopeBackground(status) {
    // envContext.beginPath();
    switch (status) {
        case "2":
            envContext.fillStyle = "#afaf90";

            break;
        case "1":
            envContext.fillStyle = "#90afaf";

            break;

        default:
            envContext.fillStyle = "#c0c0c0";
            break;
    }

    envContext.fillRect(0, 0, envCanvas.width, envCanvas.height);
}

function drawKFBackground(canvas, status) {
    context = canvas.getContext("2d");
    // context.beginPath();
    switch (status) {
        case "2":
            context.fillStyle = "#afaf90";

            break;
        case "1":
            context.fillStyle = "#90afaf";

            break;

        default:
            context.fillStyle = "#c0c0c0";
            break;
    }
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawEnvelope(canvas, module, state, lineProximity) {
    envContext = canvas.getContext("2d");
    drawEnvelopeBackground(state);

    x = 0;
    if (module == 8) y = canvas.height / 2;
    else y = canvas.height;

    for (var i = 0; i < 8; i++) {
        envContext.beginPath();
        envContext.moveTo((x * canvas.width) / 792, y);
        time = 99 - vzTone.getEnvelopeTime(module, i);
        x += time;
        if (module == 8) {
            y =
                canvas.height / 2 -
                (canvas.height / 126) * vzTone.getEnvelopeLevel(module, i);
        } else {
            y =
                canvas.height -
                (canvas.height * vzTone.getEnvelopeLevel(module, i)) / 100;
        }
        envContext.lineTo((x * canvas.width) / 792, y);
        envContext.strokeStyle = "black";
        if (vzTone.getEnvelopeVelocity(module, i) == 1)
            envContext.strokeStyle = "#611f21";
        if (lineProximity - 1 == i) envContext.strokeStyle = "orange";
        envContext.lineWidth = "2";
        envContext.stroke();
    }
}

function drawKFBars(canvas, module, barProximity) {
    context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawKFBackground(canvas);

    x_offset = 0;
    y_offset = -2;
    x = 0;
    y = canvas.height;

    for (var i = 0; i < 6; i++) {
        x =
            vzTone.getKeyFollowNote(module, i) * 5 * (canvas.width / 792) +
            x_offset;
        y =
            canvas.height +
            y_offset -
            (vzTone.getKeyFollowLevel(module, i) * (canvas.height + y_offset)) /
                100;
        if (barProximity == i + 1) {
            kfContext.fillStyle = "goldenrod";
            context.fillRect(x - 4, 0, 8, canvas.height);
        }

        context.fillStyle = "black";
        context.fillRect(
            x - 4,
            y,
            8,
            (vzTone.getKeyFollowLevel(module, i) * (canvas.height + y_offset)) /
                100
        );
        // context.fillRect(x - 4, y, 8, 50);
    }
}

function drawKF(canvas, module, barProximity, status) {
    var ctx = canvas.getContext("2d");
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawKFBackground(canvas, status);

    x_offset = 0;
    y_offset = -2;
    x = 0 + x_offset;
    y = canvas.height + y_offset;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (var i = 0; i < 6; i++) {
        x = Math.floor(
            vzTone.getKeyFollowNote(module, i) * 5 * (canvas.width / 792) +
                x_offset
        );
        y = Math.floor(
            canvas.height +
                y_offset -
                (vzTone.getKeyFollowLevel(module, i) *
                    (canvas.height + y_offset)) /
                    100
        );
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

    for (var i = 0; i < 6; i++) {
        x =
            vzTone.getKeyFollowNote(module, i) * 5 * (canvas.width / 792) +
            x_offset;
        y =
            canvas.height +
            y_offset -
            (vzTone.getKeyFollowLevel(module, i) * (canvas.height + y_offset)) /
                100;
        if (barProximity == i + 1) {
            ctx.fillStyle = "goldenrod";
            ctx.fillRect(x - 4, 0, 8, canvas.height);
        }
    }
}

function editEnvelope(envCanvas, evt, nodeProximity) {
    var x = 0;

    for (var i = 0; i < 8; i++) {
        if (nodeProximity - 1 == i) {
            mousePos = getMousePos(envCanvas, evt);
            newX = Math.floor(
                (mousePos.x - (x * envCanvas.width) / 792) /
                    (envCanvas.width / 792)
            );
            if (newX <= 0) newX = 0;
            if (newX >= 99) newX = 99;
            vzTone.setEnvelopeTime(sourceEnvelope, i, 99 - newX);
            if (sourceEnvelope == 8) {
                vzTone.setEnvelopeLevel(
                    sourceEnvelope,
                    i,
                    ((envCanvas.height / 2 - mousePos.y) * 126) /
                        envCanvas.height
                );
            } else {
                var newY =
                    ((envCanvas.height - mousePos.y) * 100) / envCanvas.height;
                if (newY <= 0) newY = 0;
                if (newY >= 99) newY = 99;
                vzTone.setEnvelopeLevel(sourceEnvelope, i, newY);
            }
        }
        time = 99 - vzTone.getEnvelopeTime(sourceEnvelope, i);
        x += time;
    }

    envMouseState = 2;
}

function editKFLevel(canvas, evt, barProximity) {
    x_offset = 10;
    y_offset = -10;
    x = 0;
    if (barProximity > 0) {
        left = vzTone.getKeyFollowNote(sourceEnvelope, barProximity - 2);
        right = vzTone.getKeyFollowNote(sourceEnvelope, barProximity);

        mousePos = getMousePos(canvas, evt);
        newX = Math.floor((mousePos.x - x_offset) / ((5 * canvas.width) / 792));

        newY =
            ((canvas.height - mousePos.y) * 100) / canvas.height +
            y_offset -
            y_offset;
        if (newX <= left) newX = left + 1;
        if (newX >= right) newX = right - 1;

        if (sourceEnvelope != 8) {
            if (newY > 99) newY = 99;
        } else {
            if (newY > 63) newY = 63;
        }
        if (newY < 0) newY = 0;
        // console.log(newY, mousePos.y,
        // vzTone.getKeyFollowLevel(sourceEnvelope, barProximity-1));
        vzTone.setKeyFollowLevel(sourceEnvelope, barProximity - 1, newY);
        vzTone.setKeyFollowNote(sourceEnvelope, barProximity - 1, newX);
    }
    envMouseState = 2;
}

function editEnvelopeTxt(step, type, value) {
    if (sourceEnvelope == 8 && type == 2) {
        if (value > 63) value = 63;
        if (value < -63) value = -63;
    } else {
        if (value > 99) value = 99;
        if (value < 0) value = 0;
    }
    if (type == 1) {
        vzTone.setEnvelopeTime(sourceEnvelope, step - 1, value);
    } else {
        vzTone.setEnvelopeLevel(sourceEnvelope, step - 1, value);
    }

    updateEnvelope(envCanvas);
    drawEnvelopePoints(envCanvas);
    window.send_data_to_vz();
}

function editKFTxt(module) {
    for (var i = 0; i < 8; i++) {}
    window.send_data_to_vz();
}

function drawEnvelopePoints(envCanvas, nodeProximity) {
    x = 0;
    y = 0;
    var ctx = envCanvas.getContext("2d");
    yScale = envCanvas.height / 100;

    for (var i = 0; i < 8; i++) {
        time = 99 - vzTone.getEnvelopeTime(sourceEnvelope, i);
        x += time;
        if (sourceEnvelope == 8) {
            y =
                envCanvas.height / 2 -
                (envCanvas.height / 126) *
                    vzTone.getEnvelopeLevel(sourceEnvelope, i);
        } else {
            y =
                envCanvas.height -
                vzTone.getEnvelopeLevel(sourceEnvelope, i) * yScale;
        }
        ctx.fillStyle = "#abcdef";
        if (vzTone.getEnvSustain(sourceEnvelope) == i) {
            ctx.fillStyle = "yellow";
            ctx.fillRect((x * envCanvas.width) / 792 - 4, y - 4, 8, 8);
        }
        if (vzTone.getEnvEnd(sourceEnvelope) == i) {
            ctx.fillStyle = "red";
            ctx.fillRect((x * envCanvas.width) / 792 - 4, y - 4, 8, 8);
        }
        if (nodeProximity - 1 == i) {
            ctx.fillStyle = "green";
            ctx.fillRect((x * envCanvas.width) / 792 - 3, y - 3, 6, 6);
        }
    }
}

function updateEnvelopeTable() {
    for (var i = 0; i < 8; i++) {
        byId("l" + (i + 1)).value = Math.floor(
            vzTone.getEnvelopeLevel(sourceEnvelope, i)
        );
        byId("r" + (i + 1)).value = vzTone.getEnvelopeTime(sourceEnvelope, i);
    }
}

function updateKFTable() {
    this.notes = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B"
    ];
    for (var i = 0; i < 6; i++) {
        byId("kf_level" + (i + 1)).value = Math.floor(
            vzTone.getKeyFollowLevel(sourceEnvelope, i)
        );
        byId("kf_note" + (i + 1)).value =
            notes[vzTone.getKeyFollowNote(sourceEnvelope, i) % 12] +
            Math.floor(vzTone.getKeyFollowNote(sourceEnvelope, i) / 12);
    }
}

function doMouseMove(envCanvas, evt) {
    // detect new mouse node proximity only, when not currently editing
    // this improves the responsivenes off the envelopes
    if (envMouseState == 0) nodeProximity = detectNodeProximity(envCanvas, evt);
    lineProximity = detectLineProximity(envCanvas, evt);
    if (envMouseState > 0) {
        editEnvelope(envCanvas, evt, nodeProximity);
    }
    updateEnvelopeTable();
    updateEnvelope(envCanvas, lineProximity);
    drawEnvelopePoints(envCanvas, nodeProximity);
}

function updateEnvelope(envCanvas, lineProximity) {
    var i;

    if (sourceEnvelope != 8) {
        for (i = 0; i < 8; i++) {
            if (lock[1][i] == 1) vzTone.copyEnv(sourceEnvelope, i);
        }
    }

    drawEnvelope(envCanvas, sourceEnvelope, 0, lineProximity);

    for (i = 0; i < 9; i++) {
        status = 0;
        if (lock[1][i] == 1) status = 2;
        if (sourceEnvelope == i) status = 1;
        drawEnvelope(envCanvases[i], i, status);
    }
}

function doKFMouseMove(kfCanvas, evt) {
    if (kfMouseState == 0) barProximity = detectBarProximity(kfCanvas, evt);
    if (kfMouseState > 0) editKFLevel(kfCanvas, evt, barProximity);

    drawKFBars(kfCanvas, sourceEnvelope, barProximity);
    drawKF(kfCanvas, sourceEnvelope, barProximity);
    updateKFTable();

    for (var i = 0; i < 8; i++) {
        if (lock[2][i] == 1) vzTone.copyKF(sourceEnvelope, i);
    }
    for (var i = 0; i < 8; i++) {
        status = 0;
        if (lock[2][i] == 1) status = 2;
        if (sourceEnvelope == i) status = 1;
        drawKF(kFCanvases[i], i, 0, status);
    }
}

function doKFMouseUp(kfCanvas, evt) {
    kfMouseState = 0;
    window.send_data_to_vz();
}

function doKFMouseDown(kfCanvas, evt) {
    kfMouseState = 1;
}

function doMouseDown(envCanvas, evt) {
    // console.log("in down: " + envMouseState);
    envMouseState = 1;
}

function doMouseOut(envCanvas, evt) {
    // console.log("Mouse OUTTTTTTTTT" + envMouseState);
    doMouseUp(envCanvas, evt);
}

function doMouseUp(envCanvas, evt) {
    // console.log("in up: " + envMouseState);

    if (envMouseState == 1) {
        // var mousePos = getMousePos(envCanvas, evt);
        nodeProximity = detectNodeProximity(envCanvas, evt);
        lineProximity = detectLineProximity(envCanvas, evt);
        if (nodeProximity >= 1) {
            sustain = vzTone.getEnvSustain(sourceEnvelope);
            end = vzTone.getEnvEnd(sourceEnvelope);

            if (nodeProximity - 1 > end)
                vzTone.setEnvEnd(sourceEnvelope, nodeProximity - 1);
            if (nodeProximity - 1 == sustain)
                vzTone.setEnvSustain(sourceEnvelope, -1);
            else if (nodeProximity - 1 < end)
                vzTone.setEnvSustain(sourceEnvelope, nodeProximity - 1);
            if (nodeProximity - 1 == end) {
                vzTone.setEnvSustain(sourceEnvelope, 0);
                vzTone.setEnvEnd(sourceEnvelope, sustain);
            }
        }
        // set velocity enabled for rate
        if (lineProximity >= 1) {
            if (
                vzTone.getEnvelopeVelocity(sourceEnvelope, lineProximity - 1) ==
                0
            )
                vzTone.setEnvelopeVelocity(
                    sourceEnvelope,
                    lineProximity - 1,
                    1
                );
            else
                vzTone.setEnvelopeVelocity(
                    sourceEnvelope,
                    lineProximity - 1,
                    0
                );
        }
    }
    envMouseState = 0;
    kfMouseState = 0;
    window.send_data_to_vz();
}

envCanvas.addEventListener(
    "mousemove",
    function(evt) {
        doMouseMove(envCanvas, evt);
    },
    false
);

envCanvas.addEventListener(
    "mousedown",
    function(evt) {
        doMouseDown(envCanvas, evt);
    },
    false
);

envCanvas.addEventListener(
    "mouseup",
    function(evt) {
        doMouseUp(envCanvas, evt);
    },
    false
);

envCanvas.addEventListener(
    "mouseout",
    function(evt) {
        doMouseOut(envCanvas, evt);
    },
    false
);

kfCanvas.addEventListener(
    "mousemove",
    function(evt) {
        doKFMouseMove(kfCanvas, evt);
    },
    false
);

kfCanvas.addEventListener(
    "mousedown",
    function(evt) {
        doKFMouseDown(kfCanvas, evt);
    },
    false
);

kfCanvas.addEventListener(
    "mouseup",
    function(evt) {
        doKFMouseUp(kfCanvas, evt);
    },
    false
);

function convertLongMsg2Short(hexArray) {
    var tmpByte;
    var shortMsg = [];
    for (var i = 0; i < hexArray.length; i += 2) {
        tmpByte = hexArray[i] << 4;
        tmpByte = tmpByte | hexArray[i + 1];
        shortMsg.push(tmpByte);
    }
    return shortMsg;
}

function calculateChecksum(SysexData) {
    newChecksum = 0;
    for (var i = 0; i < SysexData.length; i += 2) {
        newChecksum += SysexData[i] * 16 + SysexData[i + 1];
        newChecksum = newChecksum % 128;
    }

    return 128 - newChecksum;
}

window.fillSysexToneData = function() {
    window.internalToneData = vzTone.getHexArray();
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
    const SYSEX_CHECKSUM = [];
    toneData = window.fillSysexToneData();
    SYSEX_CHECKSUM.push(calculateChecksum(toneData));
    SysexMessage = SYSEX_START;
    SysexMessage = SysexMessage.concat(SYSEX_CHANNEL);
    SysexMessage = SysexMessage.concat(SYSEX_DATA_RECEIVE_AREA);
    SysexMessage = SysexMessage.concat(toneData);
    SysexMessage = SysexMessage.concat(SYSEX_CHECKSUM);
    SysexMessage = SysexMessage.concat(SYSEX_END);
    Jazz.MidiOutLong(SysexMessage);
};

function lineMix(line) {
    vzTone.setLineMix(line - 1, (vzTone.getLineMix(line - 1) + 1) % 3);
    switch (vzTone.getLineMix(line - 1)) {
        case 0:
            $("#mixType" + line).addClass("mix");
            $("#mixType" + line).removeClass("ring");
            break;
        case 1:
            $("#mixType" + line).addClass("phase");
            $("#mixType" + line).removeClass("mix");
            $("#M" + ((line - 1) * 2 + 1)).addClass("VZmodule_mod");
            $("#M" + ((line - 1) * 2 + 1)).removeClass("VZmodule");
            break;
        default:
            $("#mixType" + line).addClass("ring");
            $("#mixType" + line).removeClass("phase");
            $("#M" + ((line - 1) * 2 + 1)).addClass("VZmodule");
            $("#M" + ((line - 1) * 2 + 1)).removeClass("VZmodule_mod");
            break;
    }
    window.window.send_data_to_vz();
}

function waveUp(module) {
    wave = vzTone.getWaveForm(module - 1);
    vzTone.module[module - 1].waveForm = (wave + 1) % 8;
    renderOsc(waveCanvases[module - 1], module - 1);
    $("#wave" + module).val(vzTone.waveName[vzTone.getWaveForm(module - 1)]);
    window.send_data_to_vz();
}

function waveDown(module) {
    wave = vzTone.getWaveForm(module - 1);
    vzTone.module[module - 1].waveForm = (wave + 8 - 1) % 8;
    renderOsc(waveCanvases[module - 1], module - 1);
    $("#wave" + module).val(vzTone.waveName[vzTone.getWaveForm(module - 1)]);
    window.send_data_to_vz();
}

// function togglePosNeg(module, state) {
// vzTone.setDetunePol(module - 1, state);
// }

function selectFixedPitch(module) {
    window.internalToneData[3 + 2 * module] &= 0xfd;
    if ($("#det_pitch_fixM" + module).is(":checked"))
        window.internalToneData[3 + 2 * module] += 1 << 1;
    window.send_data_to_vz();
}

function setDetune(module) {
    pol = vzTone.getDetunePol(module - 1);
    if (pol == 0) {
        pol = -1;
    } else {
        pol = 1;
    }
    noteval = parseInt($("#det_note_M" + module).val());
    cent = parseInt($("#det_cent_M" + module).val());
    vzTone.setDetune(module - 1, (noteval * 64 + cent) * pol);
    byId("oct_M" + module).value = vzTone.getDetuneOctave(module - 1);
    byId("note_M" + module).value = vzTone.getDetuneNote(module - 1);
    byId("cent_M" + module).value = vzTone.getDetuneCent(module - 1);
}

function dragModule(event, value) {
    event.dataTransfer.setData("text/string", value - 1);
}

function allowDrop(event) {
    event.preventDefault();
}

function setPitchFix(module) {
    if ($("#pitchFix" + module).is(":checked")) {
        vzTone.module[module - 1].detuneFix = 1;
    } else {
        vzTone.module[module - 1].detuneFix = 0;
    }
    window.send_data_to_vz();
}

function dropModule(event, dest) {
    event.preventDefault();
    var source = event.dataTransfer.getData("text/string");
    vzTone.copyModule(source, dest - 1);
    renderAll();
    window.send_data_to_vz();
}

function renderOsc(canvas, module) {
    canvas.width = canvas.width;
    var context = canvas.getContext("2d");

    var cheight = canvas.height;
    var cwidth = canvas.width;
    var Freq = Math.PI / (cwidth / 2);
    var Zoom = 2;

    context.beginPath();
    context.fillStyle = "#c0c0c0";
    context.fillRect(0, 0, envCanvas.width, envCanvas.height);

    context.moveTo(0, cheight / 2);

    wave = vzTone.getWaveForm(module);

    for (var i = 0; i <= 2 * Math.PI * Zoom; i = i + Freq * Zoom) {
        Osc1Wave = osc(i, wave, 0, 1.8, 1, 0);

        context.lineTo(
            (1 / (Freq * Zoom)) * i,
            cheight / 2 + Osc1Wave * (cheight / 2)
        );
    }
    context.lineWidth = 2;
    context.stroke();
}

function osc(i, waveform, extWave1, volume, frequenz, modtype) {
    output = 0;
    wf = Math.cos(i) * (waveform / 8);
    // wf = (i%(2*Math.PI)/(2*Math.PI)*2-1) * (waveform / 8);
    // wf =
    if (waveform == 7) wf = Math.random();
    if (waveform == 6) wf = Math.random() * 2 * Math.PI;

    j = i * frequenz;

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

function changeMidiChannel(value) {
    midiChannel = parseInt(value);
    if (value > 16 || value < 1) value = 1; // it should throw an error... I
    // know
    SYSEX_CHANNEL[0] = midiChannel - 1 + 0x70;
    MIDI_CHANNEL[0] = midiChannel - 1 + 0x70; //changed just now
    byId("midiChannelTxt").value = midiChannel;
}
