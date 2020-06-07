const { ipcRenderer, remote } = require("electron");
const path = require("path");
const fs = require("fs");

let current_file = "";
let current_dir = [];

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

	document.addEventListener("keyup", (evt) => {
		if (evt.key == "ArrowLeft") {
			let current_index = current_dir.indexOf(current_file);
			if (current_index === 0) {
				current_index = current_dir.length;
			}
			showImage(current_dir[current_index - 1]);
		} else if (evt.key == "ArrowRight") {
			let current_index = current_dir.indexOf(current_file);
			if (current_index === current_dir.length - 1) {
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

function showImage(file) {
	current_file = file;
	
	let file_dir = path.dirname(file);
	fs.readdir(file_dir, (err, files) => {
		let image_files = files.filter((path) => {
			return path.match(/\.(bmp|gif|jpg|png)$/i);
		});
		image_files = image_files.map((file) => {
			return `${file_dir}/${file}`;
		})
		current_dir = image_files.sort();
	});

	const $main = document.querySelector("#main");
	$main.innerHTML = `<img class="loading" src="${file}" />`;
	const $img = $main.querySelector("img");
	$img.onload = () => {
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
