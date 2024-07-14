window.addEventListener("load", function(){
	/* conteudo do jogo */
	const WIDTH = 480;
	const HEIGHT = 320;
	const TEXTURE_SIZE = 32;
	const TEXTURE_STEP = 1/TEXTURE_SIZE;
	const canvas_mapa = document.getElementById("map");
	const canvas_game = document.getElementById("game");
	const context_mapa = canvas_mapa.getContext("2d");
	const context_game = canvas_game.getContext("2d");
	const mapa = [
	  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
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
	  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,0,0,0,0,0,0,1],
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
			let player = [this.game.player.position[0], this.game.player.position[1]];
			let ends = [0.0, 0.0];
			let catetos = [0.0, 0.0];
			let ratio;
			for (let x = 0; x < WIDTH; x++){
				player = [this.game.player.position[0], this.game.player.position[1]];
				mapPosition[0] = Math.floor(this.game.player.position[0]);
				mapPosition[1] = Math.floor(this.game.player.position[1]);
				cameraX = x*2/(WIDTH+0.0) - 1;
				direction[0] = this.game.player.angle[0] + this.game.player.fov[0] * cameraX;
				direction[1] = this.game.player.angle[1] + this.game.player.fov[1] * cameraX;
				relativeStep[0] = Math.abs(1/direction[0]);
				relativeStep[1] = Math.abs(1/direction[1]);
				catetos = [0.0, 0.0];
				if (direction[0] < 0) {
					step[0] = -1;
					distance[0]=(this.game.player.position[0]-mapPosition[0])*relativeStep[0];
					catetos[0] = (this.game.player.position[0]-mapPosition[0]);
				} else {
					step[0] = 1;
					distance[0]=(mapPosition[0]+1.0-this.game.player.position[0])*relativeStep[0];
					catetos[0] = (mapPosition[0]+1.0-this.game.player.position[0]);
				}
				if (direction[1] < 0) {
					step[1] = -1;
					distance[1]=(this.game.player.position[1]-mapPosition[1])*relativeStep[1];
					catetos[1] = (this.game.player.position[1]-mapPosition[1]);
				} else {
					step[1] = 1;
					distance[1]=(mapPosition[1]+1.0-this.game.player.position[1])*relativeStep[1];
					catetos[1] = (mapPosition[1]+1.0-this.game.player.position[1]);
				}
				hit = 0;
				while(hit==0){
					if (distance[0]<distance[1]) {
						side = 0;
						distance[0] += relativeStep[0];
						mapPosition[0] += step[0];
						catetos[0] += 1;
					} else {
						side = 1;
						distance[1] += relativeStep[1];
						mapPosition[1] += step[1];
						catetos[1] += 1;
					}
					if (mapPosition[0] >= mapa[0].length || mapPosition[0] < 0) { 
						hit = 1; 
					} else if (mapPosition[1] >= mapa.length || mapPosition[1] < 0) {
						hit = 1;
					} else if (mapa[mapPosition[1]][mapPosition[0]] != 0) {
						hit = 1;
						catetos[side] -= 1;
						if (side == 0) {
							ratio = relativeStep[0] / relativeStep[1];
							catetos[1] = catetos[0] * ratio * step[1];
							catetos[0] *= step[0];
						} else {
							ratio = relativeStep[1] / relativeStep[0];
							catetos[0] = catetos[1] * ratio * step[0];
							catetos[1] *= step[1];
						}
					}
				}
				context.strokeStyle="#00ff00";
				context.beginPath();
				player[0] *= box_width;
				player[1] *= box_height;
				ends[0] = player[0];
				ends[1] = player[1];
				context.moveTo(player[0], player[1]);
				ends[0] += (catetos[0] * box_width);
				ends[1] += (catetos[1] * box_height);
				context.lineTo(ends[0], ends[1]);
				context.stroke();
			}
		}

		update() {

		}

	}
	class Ray{
		constructor(game, cameraX){
			this.game = game;
			this.cameraX = cameraX;
			this.mapPosition = [0,0];
			this.direction = [0.0,0.0];
			this.distance= [0.0,0.0];
			this.relativeStep= [0.0,0.0];
			this.mapValue = 0;
			this.catetos = [0.0,0.0];
			this.step = [0.0,0.0];
			this.hit = 0;
			this.side = 0;
			this.wallHeight = 0;
			this.startWall = 0;
			this.endWall = HEIGHT;
			this.setUp();
		}

		setUp() {
			this.mapPosition[0]=Math.floor(this.game.player.position[0]);
			this.mapPosition[1]=Math.floor(this.game.player.position[1]);
			this.direction[0] = this.game.player.angle[0] + this.game.player.fov[0] * this.cameraX;
			this.direction[1] = this.game.player.angle[1] + this.game.player.fov[1] * this.cameraX;
			this.relativeStep[0] = Math.abs(1/this.direction[0]);
			this.relativeStep[1] = Math.abs(1/this.direction[1]);
			if (this.direction[0] < 0) {
				this.step[0] = -1;
				this.distance[0]=(this.game.player.position[0]-this.mapPosition[0])*this.relativeStep[0];
				this.catetos[0] = (this.game.player.position[0]-this.mapPosition[0]);
			} else {
				this.step[0] = 1;
				this.distance[0]=(this.mapPosition[0]+1.0-this.game.player.position[0])*this.relativeStep[0];
				this.catetos[0] = (this.mapPosition[0]+1.0-this.game.player.position[0]);
			}
			if (this.direction[1] < 0) {
				this.step[1] = -1;
				this.distance[1]=(this.game.player.position[1]-this.mapPosition[1])*this.relativeStep[1];
				this.catetos[1] = (this.game.player.position[1]-this.mapPosition[1]);
			} else {
				this.step[1] = 1;
				this.distance[1]=(this.mapPosition[1]+1.0-this.game.player.position[1])*this.relativeStep[1];
				this.catetos[1] = (this.mapPosition[1]+1.0-this.game.player.position[1]);
			}
		}

		nextStep(){
			if (this.distance[0]<this.distance[1]) {
				this.side = 0;
				this.distance[0] += this.relativeStep[0];
				this.mapPosition[0] += this.step[0];
				this.catetos[0] += 1;
			} else {
				this.side = 1;
				this.distance[1] += this.relativeStep[1];
				this.mapPosition[1] += this.step[1];
				this.catetos[1] += 1;
			}
			if (this.mapPosition[0] >= mapa[0].length || this.mapPosition[0] < 0) {
				return false; 
			} else if (this.mapPosition[1] >= mapa.length || this.mapPosition[1] < 0) {
				return false;	
			} else if (mapa[this.mapPosition[1]][this.mapPosition[0]] != 0) {
				this.hit = 1;
				this.distance[this.side] -= this.relativeStep[this.side];
				this.mapValue = mapa[this.mapPosition[1]][this.mapPosition[0]]-1;
			}
			if (this.hit == 1) {
				this.wallHeight = HEIGHT/this.distance[this.side];
				this.startWall=Math.floor((HEIGHT-this.wallHeight)/2);
				this.endWall=Math.floor(HEIGHT-this.startWall);
				if (this.startWall < 0) { 
					this.startWall = 0; 
					this.endWall = HEIGHT;
				}
			}
			return true;
		}
	}
	class ViewGame {
		constructor(game) {
			this.game = game;
		}
	
		drawToCanvas(context, imageData){
			context.putImageData(imageData, 0, 0);
		}

		draw(context){
			let cameraX;
			for (let x = 0; x < WIDTH; x++){
				cameraX = x*2/(WIDTH+0.0) - 1;
				const ray = new Ray(this.game, cameraX);
				while (ray.hit == 0){
					if (!ray.nextStep()) { break; }
				}
				this.drawCeiling(ray, x);
				this.drawWall(ray, x);
				this.drawFloor(ray, x);
				this.drawToCanvas(context, this.game.image);
			}
		}

		drawFloor(ray, x){
			let position, color = [0, 255, 0], texture=0;
			let textureSample = [0.0, 0.0];
			let delta = (HEIGHT-ray.endWall);
			let hipotenuse = ((ray.direction[0]**2)+(ray.direction[1]**2))**0.5;
			let distances = [
				(ray.distance[ray.side]-hipotenuse)/ray.direction[0],
				(ray.distance[ray.side]-hipotenuse)/ray.direction[1]
			];
			let stepSize = [
				distances[0]/delta,
				distances[1]/delta
			];
			let texturePosition = [
				this.game.player.position[0]+ray.direction[0],
				this.game.player.position[1]+ray.direction[1]
			];
			for(let y = HEIGHT-1; y>=ray.endWall; y--) { 
				//texture = mapa[Math.floor(texturePosition[1])][Math.floor(texturePosition[0])];
				textureSample = [
					Math.abs(Math.floor((texturePosition[0]-Math.floor(texturePosition[0]))/TEXTURE_STEP)),
					Math.abs(Math.floor((texturePosition[1]-Math.floor(texturePosition[1]))/TEXTURE_STEP))
				];	
				color = this.game.sampleFloorTexture(texture, textureSample, 1);
				if (this.game.keys["l"] && x == WIDTH-1){
					console.log(
						texture, "\n",
						stepSize, "\n",
						delta, "\n",
						ray.direction, "\n",
						texturePosition, "\n",
						textureSample, "\n"
					);
				}
				texturePosition[0] += stepSize[0];
				texturePosition[1] += stepSize[1];
				position = (y * WIDTH + x) * 4
				this.game.image.data[position] = color[0];
				this.game.image.data[position+1] = color[1];
				this.game.image.data[position+2] = color[2];
				this.game.image.data[position+3] = 255;
			}
		}


		drawCeiling(ray, x){
			let position, color = [0, 0, 255];
			for(let y = 0; y < ray.startWall; y++){
				position = (y * WIDTH + x) * 4
				this.game.image.data[position] = color[0];
				this.game.image.data[position+1] = color[1];
				this.game.image.data[position+2] = color[2];
				this.game.image.data[position+3] = 255;
			}
		}

		drawWall(ray, x){
			let oppositeSide, wallHeight, startDraw, endDraw, shade;
			let textureStepY, position, ratio, startTexture;
			let textureSample = [0.0,0.0];
			let color = [0 ,0 ,0];
			oppositeSide = Math.abs(ray.side - 1);
			ray.catetos[ray.side] -= 1;
			ratio=ray.relativeStep[ray.side]/ray.relativeStep[oppositeSide];
			ray.catetos[oppositeSide]=ray.catetos[ray.side]*ratio*ray.step[oppositeSide];
			textureSample[0]=this.game.player.position[oppositeSide]+ray.catetos[oppositeSide];
			textureSample[0] = textureSample[0] - Math.floor(textureSample[0]);
			if (ray.step[ray.side]<0 && ray.side==0) { 
				textureSample[0] = 1 - textureSample[0]; 
			}
			if (ray.step[ray.side]>0 && ray.side==1) { 
				textureSample[0] = 1 - textureSample[0]; 
			}
			textureSample[0]=Math.floor(textureSample[0]/TEXTURE_STEP);
			textureStepY = ray.wallHeight / TEXTURE_SIZE;
			startTexture = (ray.wallHeight - HEIGHT) / 2;
			if (startTexture < 0) { startTexture = 0; }
			shade=(1-(ray.startWall/HEIGHT*1.2))*(1-(ray.side*0.5));
			if (ray.hit == 1) {
				for(let y = ray.startWall; y <= ray.endWall; y++){
					textureSample[1]=Math.floor((y+startTexture-ray.startWall)/textureStepY);
					color=this.game.sampleTexture(ray.mapValue,textureSample,shade);
					position = (y * WIDTH + x) * 4
					this.game.image.data[position] = color[0];
					this.game.image.data[position+1] = color[1];
					this.game.image.data[position+2] = color[2];
					this.game.image.data[position+3] = 255;
				}
			} 
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
			this.fov = [0.0, 0.66];
		}

		draw(context) {


		}
		
		update() {
			if (this.game.keys["d"]) { 
				this.angle = this.game.rotatePoint(this.angle, -1);
				this.fov = this.game.rotatePoint(this.fov, -1);
			}
			if (this.game.keys["a"]) { 
				this.angle = this.game.rotatePoint(this.angle);
				this.fov = this.game.rotatePoint(this.fov);
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
		constructor(image){
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
			this.viewGame = new ViewGame(this);
			this.image = image;
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

		draw(context,context2) {
			context.clearRect(0,0,WIDTH/2, HEIGHT/2);
			context.fillStyle="#000000";
			context.fillRect(0,0, WIDTH/2, HEIGHT/2);
			context2.clearRect(0,0,WIDTH, HEIGHT);
			context2.fillStyle="#000000";
			context2.fillRect(0,0, WIDTH, HEIGHT);
			this.player.draw(context);
			this.view.draw(context);
			this.viewGame.draw(context2);
		}
		
		rotatePoint(points=[], direction=1){
			return [ 
				points[0]*Math.cos(direction*this.rotationStep)-points[1]*Math.sin(direction*this.rotationStep),
				points[0]*Math.sin(direction*this.rotationStep)+points[1]*Math.cos(direction*this.rotationStep)
			];
		}
		sampleTexture(textureIndex, samplePosition, shade) {
			let result = [0,0,0];
			let position = (textureIndex * TEXTURE_SIZE * 3) + (samplePosition[1] * TEXTURE_SIZE * 30) + (samplePosition[0] * 3);
			result[0] = Math.floor(textures[position]*shade);
			result[1] = Math.floor(textures[position+1]*shade);
			result[2] = Math.floor(textures[position+2]*shade);
			return result;
		}
		sampleFloorTexture(textureIndex, samplePosition, shade) {
			let result = [0,0,0];
			let position = (textureIndex * TEXTURE_SIZE * 3) + (samplePosition[1] * TEXTURE_SIZE * 30) + (samplePosition[0] * 3);
			result[0] = Math.floor(textures[position]*shade);
			result[1] = Math.floor(textures[position+1]*shade);
			result[2] = Math.floor(textures[position+2]*shade);
			return result;
		}


		getColor(index, shade=1, hexaformat=true) {
			let color;
			if (index == 1) {
				color = [255,0,0];
			} else if (index == 1) {
				color = [255,255,0];
			} else if (index == 2) {
				color = [255,0,255];
			} else if (index == 3) {
				color = [0,255,0];
			} else if (index == 4) {
				color = [0,0,255];
			} else if (index == 5) {
				color = [0,255,255];
			} else if (index == 6) {
				color = [150,0,150];
			} else if (index == 7) {
				color = [150,150,255];
			} else if (index == 8) {
				color = [255,150,0];
			} else if (index == 9) {
				color = [150,255,150];
			} else if (index == 10) {
				color = [255,255,255];
			} else {
				color = [0,0,0];
			}
			color[0] *= shade;
			color[1] *= shade;
			color[2] *= shade;
			let result = "#" + Math.floor(color[0]).toString(16);
			if(result.length != 3) { result += "0"; }
			result += Math.floor(color[1]).toString(16) 
			if(result.length != 5) { result += "0"; }
			result += Math.floor(color[2]).toString(16);
			if(result.length != 7) { result += "0"; }
			return (hexaformat ? result : color);
		}

		update() {
			this.player.update();
			this.view.update();
			this.viewGame.update();
		}
	}

	const image = context_game.createImageData(WIDTH, HEIGHT);
	const game = new Game(image);
	var lastTime;
	canvas_game.width = WIDTH;
	canvas_game.height = HEIGHT;

	function run(timestamp){
		if (lastTime === undefined) { lastTime = timestamp; }
		let elapsed = timestamp - lastTime;
		if (elapsed >= 50){
			game.update();
			game.draw(context_mapa, context_game);
			lastTime = timestamp;
		}
		window.requestAnimationFrame(run);
	}
	window.requestAnimationFrame(run);

});
