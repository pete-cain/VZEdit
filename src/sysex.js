function readSysEx(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;
    const f = files[0];

    if (files.length > 1) alert("more than one file selected");

    reader.readAsArrayBuffer(f);
}

reader.onload = function (e) {
    var sysExBuffer = reader.result;

    bank.init(sysExBuffer, f.name);
    $("#vzBankFile").val(escape(f.name) + " - " + f.size + " bytes");
    for (var i = 0; i < 64; i++) {
        $("#tone" + i).val(bank.getToneName(i));
    }
};
