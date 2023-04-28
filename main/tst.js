const decompress = require('decompress');
const fs = require('fs');

decompress('./tst/src.docx', './dest').then(files => {
    fs.readFile('./dest/word/document.xml', 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
    });
});