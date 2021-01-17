const { ipcRenderer, remote } = require("electron");
const path = require("path");
const fs = require("fs");

let current_file = "";

window.onload = () => {
	const $main = document.querySelector("#main");

	// @ts-ignore
	$main.ondragover = () => {
		return false;
	};

	// @ts-ignore
	$main.ondragleave = () => {
		return false;
	};

	// @ts-ignore
	$main.ondragend = () => {
		return false;
	};
	// @ts-ignore
	$main.ondrop = (event) => {
		event.preventDefault();
		if (event.dataTransfer.files.length) {
			showImage(event.dataTransfer.files[0].path);
		} else {
			// console.log(typeof event.dataTransfer.files)
		}
	};

	document.addEventListener("keyup", async (evt) => {
		if (evt.key == "ArrowLeft") {
			let current_dir = await listCurrentDir(current_file);
			if (!current_dir.length) {
				return;
			}
			let current_index = current_dir.indexOf(current_file);
			if (current_index === 0) {
				current_index = current_dir.length;
			} else if (current_index === -1) {
				current_index = 1;
			}
			showImage(current_dir[current_index - 1]);
		} else if (evt.key == "ArrowRight") {
			let current_dir = await listCurrentDir(current_file);
			if (!current_dir.length) {
				return;
			}
			let current_index = current_dir.indexOf(current_file);
			if (current_index === current_dir.length - 1) {
				current_index = -1;
			} else if (current_index === -1) {
				current_index = -1;
			}
			showImage(current_dir[current_index + 1]);
		}
	});
};

// @ts-ignore
ipcRenderer.on("initial-file", (event, fileName) => {
	// console.log(event);
	// console.log(fileName);
	showImage(fileName);
});

async function listCurrentDir(file) {
	return new Promise((resolve, reject) => {
		let file_dir = path.dirname(file);
		fs.readdir(file_dir, (err, files) => {
			if (err) {
				reject(err);
			}
			let image_files = files.filter((path) => {
				return path.match(/\.(bmp|gif|jpe?g|png|svg)$/i);
			});
			image_files = image_files.map((file) => {
				return `${file_dir}/${file}`;
			})
			resolve(image_files.sort());
		});
	})
}

function showImage(file) {
	current_file = file;
	
	const $main = document.querySelector("#main");
	$main.innerHTML = `<img class="loading" src="${file}" />`;
	const $img = $main.querySelector("img");
	$img.onload = () => {
		if ($img.src.match(/\.svg$/i)) {
			if ($img.height > $img.width) {
				$img.width = 1024 * $img.width / $img.height;
				$img.height = 1024;
			} else {
				$img.height = 1024 * $img.height / $img.width;
				$img.width = 1024;
			}
		}
		// console.log($img.width);
		// console.log($img.height);
		remote.getCurrentWindow().setSize($img.width, $img.height);
		remote.getCurrentWindow().setAspectRatio($img.width / $img.height);
		remote.getCurrentWindow().setTitle(path.basename(file));
		ipcRenderer.send("renamed-window", path.basename(file));
		// ipcRenderer.send('resize-window', $img.width, $img.height);
		$img.classList.remove("loading");
	};
}
