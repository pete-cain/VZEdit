// window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024,
// function(grantedBytes) {
// window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
// }, function(e) {
// console.log('Error', e);
// });

export function onInitFs(fs) {
    const errorHandler = e => console.error(e);

    fs.root.getFile(
        "target.syx",
        {
            create: true
        },
        function(fileEntry) {
            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function() {
                    console.log("Write completed.");
                };

                fileWriter.onerror = function(e) {
                    console.error("Write failed: " + e.toString());
                };
            }, errorHandler);
        },
        errorHandler
    );
}
