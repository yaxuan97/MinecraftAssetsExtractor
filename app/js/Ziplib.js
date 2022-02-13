const fs = require("fs");
const archiver = require('archiver');
const EventEmitter = require('events');
const path = require('path');
class MyEmitter extends EventEmitter {}
class Ziplib {
	static createZipFile(origin, dest) {
		const eventEmitter = new MyEmitter();
		const output = fs.createWriteStream(path.join(dest, 'output.zip'));
		const archive = archiver('zip', {
			zlib: { level: 9 } // Sets the compression level.
		});
		output.on('close', function () {
			eventEmitter.emit('zipFileCreated', {err: undefined});
		});
		archive.on('error', function (err) {
			eventEmitter.emit('error', err);
		});
		archive.directory(origin, false);
		archive.pipe(output);
		archive.finalize();
		return eventEmitter;
	}
}
export default Ziplib;