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
			this.fov = [0.0, 0.66];
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
			let displacement_x = 10 * this.game.player.angle[0]; 
			let displacement_y = 10 * this.game.player.angle[1]; 

			context.strokeStyle="#ff0000";
			context.beginPath();
			context.moveTo(player_x, player_y);
			context.lineTo(player_x + displacement_x, player_y+displacement_y);
			context.stroke();

			this.castRays(context, box_width, box_height);
		}

		castRays(context, box_width, box_height){
			let cameraX;
			let direction = [0,0];
			let step = [0,0];
			let relativeStep = [0,0];
			let distance = [0, 0];
			let mapPosition = [0, 0];
			let hit, side;
			let ratio, smaller;
			let endx;
			let player = [this.game.player.position[0], this.game.player.position[1]];
			let ends = [0.0, 0.0];
			let inv = 0;
			let rows = 0;
			for (let x = 0; x < WIDTH; x++){
				player = [this.game.player.position[0], this.game.player.position[1]];
				ends = [0.0, 0.0];
				mapPosition[0] = Math.floor(this.game.player.position[0]);
				mapPosition[1] = Math.floor(this.game.player.position[1]);
				cameraX = x*2/(WIDTH+0.0) - 1;
				direction[0] = this.game.player.angle[0] + this.fov[0] * cameraX;
				direction[1] = this.game.player.angle[1] + this.fov[1] * cameraX;
				relativeStep[0] = Math.abs(1/direction[0]);
				relativeStep[1] = Math.abs(1/direction[1]);
				if (direction[0] < 0) {
					step[0] = -1;
					distance[0]=(this.game.player.position[0]-mapPosition[0])*relativeStep[0];
					ends[0] = (this.game.player.position[0]-mapPosition[0]);
				} else {
					step[0] = 1;
					distance[0]=(mapPosition[0]+1.0-this.game.player.position[0])*relativeStep[0];
					ends[0] = (mapPosition[0]+1.0-this.game.player.position[0]);
				}
				if (direction[1] < 0) {
					step[1] = -1;
					distance[1]=(this.game.player.position[1]-mapPosition[1])*relativeStep[1];
					ends[1] = (this.game.player.position[1]-mapPosition[1]);
				} else {
					step[1] = 1;
					distance[1]=(mapPosition[1]+1.0-this.game.player.position[1])*relativeStep[1];
					ends[1] = (mapPosition[1]+1.0-this.game.player.position[1]);
				}
				hit = 0;
				while(hit==0){
					if (distance[0]<distance[1]) {
						side = 0;
						distance[0] += relativeStep[0];
						mapPosition[0] += step[0];
						ends[0] += step[0];
					} else {
						side = 1;
						distance[1] += relativeStep[1];
						mapPosition[1] += step[1];
						ends[1] += step[1];
					}
					if (mapPosition[0] >= mapa[0].length || mapPosition[0] < 0) { 
						hit = 1; 
					} else if (mapPosition[1] >= mapa.length || mapPosition[1] < 0) {
						hit = 1;
					} else if (mapa[mapPosition[1]][mapPosition[0]] != 0) {
						hit = 1;
						smaller = (distance[0]-relativeStep[0]) * step[0];
						inv = 0;
						if (distance[0] > distance[1]) {
							smaller = (distance[1] - relativeStep[1]) * step[1];
							inv = 1;
						}
					}
				}
				if (rows < 35) {
					ratio = direction[1]/direction[0];
					endx = Math.abs(smaller) * ratio;
					context.strokeStyle="#00ff00";
					if (inv==1) {
						let aux = smaller;
						smaller = Math.abs(smaller) / ratio*-1;
						endx = aux*-1;
						context.strokeStyle="#ff0000";
					}
					if (this.game.keys["l"]) { 
						console.log(smaller, endx, side, distance); 
					}
					context.beginPath();
					player[0] *= box_width;
					player[1] *= box_height;
					context.moveTo(player[0], player[1]);
					player[0] += (smaller * box_width);
					player[1] -= (endx * box_height);
					context.lineTo(player[0], player[1]);
					context.stroke();
					rows++;
				}
			}
			this.game.keys["l"] = false;
		}
		update() {

		}

	}
	
	class Player {
		constructor(game){
			this.game = game;
			this.position = [3.5, 3.5];
			this.angle = [-1,0];
			this.step = 0.5;
		}

		draw(context) {


		}
		
		update() {
			if (this.game.keys["a"]) { 
				this.angle = this.game.rotatePoint(this.angle, -1);
				this.game.view.fov = this.game.rotatePoint(this.game.view.fov, -1);
			}
			if (this.game.keys["d"]) { 
				this.angle = this.game.rotatePoint(this.angle);
				this.game.view.fov = this.game.rotatePoint(this.game.view.fov);
			}
			if (this.game.keys["w"] || this.game.keys["s"]) { 
				let x = this.step * this.angle[0];
				let y = this.step * this.angle[1]; 
				let current_x = Math.floor(this.position[0]);
				let current_y = Math.floor(this.position[1]);
				if (this.game.keys["w"]) {
					let future_x = Math.floor(this.position[0] + x);
					let future_y = Math.floor(this.position[1] + y);
					if (mapa[current_y][future_x] == 0) {
						this.position[0] += x;
						current_x = future_x;
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
						current_x = future_x;
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
			this.rotationStep = Math.PI/20;
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
		
		rotatePoint(points=[], direction=1){
			return [ 
				points[0]*Math.cos(direction*this.rotationStep)-points[1]*Math.sin(direction*this.rotationStep),
				points[0]*Math.sin(direction*this.rotationStep)+points[1]*Math.cos(direction*this.rotationStep)
			];
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
