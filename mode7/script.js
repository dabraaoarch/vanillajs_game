window.addEventListener("load", function () {
	var nMapSize = 1024;
	var canvas = document.getElementById("map");
	var context = canvas.getContext("2d");
	var canvas_2 = document.getElementById("game2");
	var context_2 = canvas_2.getContext("2d");
	var WIDTH = 320*2;
	var HEIGHT = 240*2;
	var startTime, previousTimestamp;
	var done = false;
	canvas.width = nMapSize;
	canvas.height = nMapSize;
	canvas_2.width = WIDTH;
	canvas_2.height = HEIGHT;
	canvas.style = "border: 1px solid black;"


	class View{
		constructor(game) {
			this.game = game;
			this.nearView = 0.01;
			this.farView = 0.015;
			this.fov = Math.PI / 4.0;
			this.far1 = [0.0, 0.0];
			this.far2 = [0.0, 0.0];
			this.near1 = [0.0, 0.0];
			this.near2 = [0.0, 0.0];
			this.pixels = {};
		}
		update() {
			this.far1[0] = this.game.player.position[0] + Math.cos(this.game.player.position[2] - this.fov) * this.farView;
			this.far1[1] = this.game.player.position[1] + Math.sin(this.game.player.position[2] - this.fov) * this.farView;
			this.far2[0] = this.game.player.position[0] + Math.cos(this.game.player.position[2] + this.fov) * this.farView;
			this.far2[1] = this.game.player.position[1] + Math.sin(this.game.player.position[2] + this.fov) * this.farView;

			this.near1[0] = this.game.player.position[0] + Math.cos(this.game.player.position[2] - this.fov) * this.nearView;
			this.near1[1] = this.game.player.position[1] + Math.sin(this.game.player.position[2] - this.fov) * this.nearView;
			this.near2[0] = this.game.player.position[0] + Math.cos(this.game.player.position[2] + this.fov) * this.nearView;
			this.near2[1] = this.game.player.position[1] + Math.sin(this.game.player.position[2] + this.fov) * this.nearView;

		}

		createImage(){
			const buffer = new ArrayBuffer(WIDTH*HEIGHT*4);
			this.pixels = new Uint8ClampedArray(buffer);
		}
		drawPixel(pixel, x, y){
			this.pixels[(x+(WIDTH*y))*4 + 0] = pixel[0];
			this.pixels[(x+(WIDTH*y))*4 + 1] = pixel[1];
			this.pixels[(x+(WIDTH*y))*4 + 2] = pixel[2];
			this.pixels[(x+(WIDTH*y))*4 + 3] = pixel[3];
		}
		saveImage(context) {
			const plane = new ImageData(this.pixels, WIDTH, HEIGHT);
			context.clearRect(0,0,WIDTH,HEIGHT);
			context.putImageData(plane, 0, 0);
		}

		draw(context) {
			let start = [0.0,0.0], end = [0.0, 0.0], point = [0.0, 0.0];
			let depth, section, pixel;
			this.createImage();
			for (let y = 0; y < HEIGHT/2; y++){
				depth = y / HEIGHT / 2.0;
				start[0] = (this.far1[0]-this.near1[0]) / (depth) + this.near1[0];
				start[1] = (this.far1[1]-this.near1[1]) / (depth) + this.near1[1];
				end[0] = (this.far2[0]-this.near2[0]) / (depth) + this.near2[0];
				end[1] = (this.far2[1]-this.near2[1]) / (depth) + this.near2[1];
				for (let x = 0; x < WIDTH; x++) {
					section = x / WIDTH;
					point[0] = (end[0] - start[0])*section + start[0];
					point[1] = (end[1] - start[1])*section + start[1];

					pixel = this.game.grabSample(point);
					this.drawPixel(pixel, x, y+(HEIGHT/2));
				}

			}
			this.saveImage(context);
		}
	}

	class Player {
		constructor(game) {
			this.game = game;
			this.position = [0.25,0.2,Math.PI/4];
			this.step = 0.014;
			this.turnAngle = 0.085;
		}
		update(){
			if (this.game.keys["d"]) {
				this.position[2] += this.turnAngle; 
				if (this.position[2] > Math.PI * 2) { this.position[2] -= Math.PI*2; }
			}
			if (this.game.keys["a"] ) {
				this.position[2] -= this.turnAngle; 
				if (this.position[2]  <= 0) { this.position[2] += Math.PI*2; }
			}
			if (this.game.keys["A"]) {
				this.game.view.nearView += 0.005;
				if (this.game.view.nearView > 1) {this.game.view.nearView -= 1;}
			}
			if (this.game.keys["D"]) {
				this.game.view.nearView -= 0.005;
				if (this.game.view.nearView < 0) {this.game.view.nearView += 1;}
			}
			if (this.game.keys["W"]) {
				this.game.view.farView += 0.005;
				if (this.game.view.farView > 1) {this.game.view.farView -= 1;}
			}
			if (this.game.keys["S"]) {
				this.game.view.farView -= 0.005;
				if (this.game.view.farView < 0) {this.game.view.farView += 1;}
			}
			if (this.game.keys["w"]) {
				let x = this.step * Math.cos(this.position[2]);
				let y = this.step * Math.sin(this.position[2]);
				this.position[0] += x;
				if (this.position[0] > 1) {this.position[0] -= 1; }
				this.position[1] += y;
				if (this.position[1] > 1) { this.position[1] -= 1; }
			}
			if (this.game.keys["s"]) {
				let x = this.step * Math.cos(this.position[2]);
				let y = this.step * Math.sin(this.position[2]);
				this.position[0] -= x;
				if (this.position[0] < 0) { this.position[0] += 1; }
				this.position[1] -= y;
				if (this.position[1] < 0) { this.position[1] += 1; }
			}
		}

		draw(context){

		}
	}

	class Game {
		constructor(){
			this.player = new Player(this);
			this.view = new View(this);
			this.keys = {
				"w": false,
				"a": false,
				"s": false,
				"d": false,
				"l": false,
				"k": false,
				"A": false,
				"S": false,
				"D": false,
				"W": false
			}
			this.start();
			this.createPlane(nMapSize);
		}

		grabSample(point) {
			let y = Math.abs(Math.floor(point[0] * nMapSize))*3;
			let x = Math.abs(Math.floor(point[1] * nMapSize))*3;
			let pos = (x+(y*nMapSize))%(nMapSize*nMapSize*3);
			let result = [
				mkart[pos + 0] ,
				mkart[pos + 1] ,
				mkart[pos + 2] ,
				255
			];
			return result;
		}

		start() {
			window.addEventListener("keydown", (event) => {
				if (this.keys[event.key] !== undefined) {
					this.keys[event.key] = true;
				}
			});
			window.addEventListener("keyup", (event) => {
				if (this.keys[event.key] !== undefined) {
					this.keys[event.key] = false;
				}
			});


		}

		update(){
			this.player.update();
			this.view.update();
			if (this.keys["k"]) { done = true; }

		}

		draw(context, context_2, elapsed) {
			this.player.draw(context);
			this.view.draw(context_2);
			context_2.font="10px Arial";
			const qtd = 1000/elapsed;
			const text = "Frames: " + qtd;
			context_2.fillText(text, 10, 11);
		}
		
		createPlane(res) {
			const buffer = new ArrayBuffer(res*res*4);
			this.pixels = new Uint8ClampedArray(buffer);
			const cor_vert = [0,0,255,255];
			const cor_hor = [100, 0, 100, 255];
			let cor = [], cor2=[];
			let k = 0, l = 0;
			for (let i = 0; i < res; i+=4){
				k++;
				for (let j=0; j<res*4; j++){
					cor = [255,255,255];
					if (k < 10) { cor = cor_vert; }
					if (k > 51) { k = 0; }
					if (l < 40) { cor = cor_hor; }
					if (l > 212) { l = 0; }
					l++;
					this.pixels[i+(j*res)+0] = cor[0];
					this.pixels[i+(j*res)+1] = cor[1];
					this.pixels[i+(j*res)+2] = cor[2];
					this.pixels[i+(j*res)+3] = 255;

				}
				l = 0;
			}
			this.plane = new ImageData(this.pixels, res, res);
		}

		drawMap(context) {
			context.putImageData(this.plane, 0, 0);
		}

	}

	var game = new Game();
//	game.drawMap(context);
	function run(timestamp) {
		if (startTime === undefined) { startTime = timestamp; }
		const elapsed = timestamp - startTime;
		if (elapsed >= 50) { 
			game.update();
			game.draw(context, context_2, elapsed);
			startTime = timestamp;
		}
		window.requestAnimationFrame(run);
	}
	window.requestAnimationFrame(run);
});
