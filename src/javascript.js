const {ipcRenderer, remote} = require('electron');
const path = require('path');

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
};

// @ts-ignore
ipcRenderer.on("initial-file", (event, fileName) => {
	// console.log(event);
	// console.log(fileName);
	showImage(fileName);
})

function showImage(file) {
	const $main = document.querySelector("#main");
	$main.innerHTML = `<img class="loading" src="${file}" />`;
	const $img = $main.querySelector("img");
	$img.onload = () => {
		// console.log($img.width);
		// console.log($img.height);
		remote.getCurrentWindow().setSize($img.width, $img.height);
		remote.getCurrentWindow().setAspectRatio($img.width/$img.height)
		remote.getCurrentWindow().setTitle(path.basename(file));
		ipcRenderer.send('renamed-window', path.basename(file));
		// ipcRenderer.send('resize-window', $img.width, $img.height);
		$img.classList.remove("loading")
	}
}