window.addEventListener("load", function(){
	/* conteudo do jogo */
	const WIDTH = 640;
	const HEIGHT = 480;
	const canvas_mapa = document.getElementById("map");
	const canvas_game = document.getElementById("game");
	const context_mapa = canvas_mapa.getContext("2d");
	const context_game = canvas_game.getContext("2d");
	const mapa = [
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
	  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
	  [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	];
	

	class View {
		constructor(game) {
			this.game = game;
		}
		
		draw(context){
			/* Desenha o mapa */
			let box_width = WIDTH/2/mapa[0].length;
			let box_height = HEIGHT/2/mapa.length;
			let x = 0, y=0;
			let color;
			for (let i = 0; i < mapa[0].length; i++) {
				for (let j = 0; j < mapa.length; j++) {
					if (mapa[j][i] == 0) {
						color = "#ffffff";
					} else{
						color = "#999999";
					}
					context.fillStyle=color;
					context.fillRect(x,y,box_width-1, box_height-1);
					y += box_height;
				}
				y = 0;
				x += box_width;
			}

			/* Desenha o player */
			let player_x = this.game.player.position[0] * box_width;
			let player_y = this.game.player.position[1] * box_height;

			context.fillStyle = "#ff0000";
			context.beginPath();
			context.arc(player_x,player_y, 5, 0, Math.PI*2);
			context.fill();

			/* Desenha o nariz do player */
			let total_displacement = 10;
			let displacement_x = 10 * Math.cos(this.game.player.position[2]);
			let displacement_y = 10 * Math.sin(this.game.player.position[2]);

			context.strokeStyle="#ff0000";
			context.beginPath();
			context.moveTo(player_x, player_y);
			context.lineTo(player_x + displacement_x, player_y+displacement_y);
			context.stroke();



		}
		update() {

		}

	}
	
	class Player {
		constructor(game){
			this.game = game;
			this.position = [3, 3, Math.PI/2];
			this.rotationStep = Math.PI/20;
			this.step = 0.5;
		}

		draw(context) {


		}
		
		update() {
			if (this.game.keys["a"]) { 
				this.position[2] -= this.rotationStep; 
				if (this.position[2] < 0) { this.position[2] += Math.PI*2;}
			}
			if (this.game.keys["d"]) { 
				this.position[2] += this.rotationStep; 
				if (this.position[2] > Math.PI*2) { this.position[2] -= Math.PI*2;}
			}
			if (this.game.keys["w"] || this.game.keys["s"]) { 
				let x = this.step * Math.cos(this.position[2]);
				let y = this.step * Math.sin(this.position[2]);
				let current_x = Math.floor(this.position[0]);
				let current_y = Math.floor(this.position[1]);
				if (this.game.keys["w"]) {
					let future_x = Math.floor(this.position[0] + x);
					let future_y = Math.floor(this.position[1] + y);
					if (mapa[current_y][future_x] == 0) {
						this.position[0] += x;
					}
					if (mapa[future_y][current_x] == 0) {
						this.position[1] += y;
					}
				}
				if (this.game.keys["s"]) {
					let future_x = Math.floor(this.position[0] - x);
					let future_y = Math.floor(this.position[1] - y);
					if (mapa[current_y][future_x] == 0) {
						this.position[0] -= x;
					}
					if (mapa[future_y][current_x] == 0) {
						this.position[1] -= y;
					}
				}
			}
		}

	
	}

	class Game{
		constructor(){
			this.keys = {
			 "a": false,
			 "s": false,
			 "d": false,
			 "w": false,
			 " ": false,
			 "l": false

			};
			this.bindKeys();
			this.player = new Player(this);
			this.view = new View(this);
		}

		bindKeys(){
			window.addEventListener("keydown", (event) => {
				let key = event.key;
				if(this.keys[key] !== undefined) { this.keys[key] = true;}
			});
			window.addEventListener("keyup", (event) => {
				let key = event.key;
				if(this.keys[key] !== undefined) { this.keys[key] = false;}
			});

		}

		draw(context) {
			context.clearRect(0,0,WIDTH/2, HEIGHT/2);
			context.fillStyle="#000000";
			context.fillRect(0,0, WIDTH/2, HEIGHT/2);
			this.player.draw(context);
			this.view.draw(context);
		}

		update() {
			this.player.update();
			this.view.update();
		}
	}

	const game = new Game();
	var lastTime;

	function run(timestamp){
		if (lastTime === undefined) { lastTime = timestamp; }
		let elapsed = timestamp - lastTime;
		if (elapsed >= 50){
			game.update();
			game.draw(context_mapa);
			lastTime = timestamp;
		}
		window.requestAnimationFrame(run);
	}
	window.requestAnimationFrame(run);

});
