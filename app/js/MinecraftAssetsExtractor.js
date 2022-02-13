const env = require("process").env;
const fs = require("fs");
const path = require("path");
class MinecraftAssetsExtractor {
	#assetsPath;
	#indexesPath;
	#objectsPath;
	#tempPath;
	#progress;
	#jarFile;
	constructor(mcpath) {
		this.#assetsPath = path.join(mcpath, "assets");
		this.#indexesPath = path.join(this.#assetsPath, "indexes");
		this.#objectsPath = path.join(this.#assetsPath, "objects");
		this.#tempPath = env.TEMP || env.TMP || (env.HOME || env.HOMEPATH) + "\\AppData\\Local\\Temp";
		this.#tempPath = path.join(this.#tempPath, "minecraftassets");
	}
	static #getAppdataPath() {
		return env.APPDATA || (env.HOME || env.HOMEPATH) + "\\AppData\\Roaming";
	};
	static getDefaultMinecraftPath() {
		return path.join(this.#getAppdataPath(), ".minecraft");
	};
	getTempPath() {
		return this.#tempPath;
	};
	getMinecraftIndexes() {
		return fs.readdirSync(this.#indexesPath);
	}
	getMinecraftAssets(version) {
		let indexfile = path.join(this.#indexesPath, version);
		let index = JSON.parse(fs.readFileSync(indexfile));
		index = index.objects;
		let total = Object.keys(index).length;
		this.#progress = new ProgressCounter(total);
		for (const [filename, fileinfo] of Object.entries(index)) {
			let filepath = path.join(this.#objectsPath, fileinfo.hash.substr(0, 2), fileinfo.hash);
			fs.stat(filepath, (err, stats) => {
				if (err) {
				} else {
					// 检查文件大小是否与索引文件中的大小一致
					if (stats.size != fileinfo.size) {
					} else {
						let folder = path.dirname(filename);
						let file = path.basename(filename);
						this.#progress.increaseStatsCurrent();
						fs.mkdir(path.join(this.#tempPath, folder), { recursive: true }, (err) => {
							if (err) {
							} else {
								// 将文件复制到临时目录，命名为原来的名字
								let target = path.join(this.#tempPath, filename);
								fs.copyFile(filepath, target, (err) => {
									if (err) {
									} else {
										this.#progress.increaseCopiesCurrent();
									}
								});
							}
						})
					}
				}
			});
		}
	}
	getProgress() {
		return this.#progress;
	}
}
class ProgressCounter {
	#total;
	#statsCurrent;
	#copiesCurrent;
	constructor(total) {
		this.#total = total;
		this.#statsCurrent = 0;
		this.#copiesCurrent = 0;
	}
	getStatsCurrent() {
		return this.#statsCurrent;
	}
	getCopiesCurrent() {
		return this.#copiesCurrent;
	}
	getTotal() {
		return this.#total;
	}
	increaseStatsCurrent() {
		this.#statsCurrent++;
	}
	increaseCopiesCurrent() {
		this.#copiesCurrent++;
	}
}
