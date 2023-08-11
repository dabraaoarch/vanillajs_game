<!-- part 4, create eventHandler and separate script to a new file -->
window.addEventListener("load", function(){
	const CANVAS_WIDTH = 640;
	const CANVAS_HEIGHT = 480;
	const COLOR_ARRAY_LENGTH = 4;
	const LIGHT_GRASS = [0, 203, 14,255];
	const DARKER_GRASS = [10,97,16,255];
	const WHITE_STRIPE = [255,255,255,255];
	const RED_STRIPE = [255,0,0,255];
	const ASPHALT = [200,200,200,255];
	const ASPHALT_MAX_WIDTH = 0.9;
	const ASPHALT_MIN_WIDTH = 0.1;
	const ASPHALT_WIDTH_STEP = (ASPHALT_MAX_WIDTH - ASPHALT_MIN_WIDTH) / (CANVAS_HEIGHT / 2);
	const STRIPE_WIDTH = 0.03;
	const TARGET_FRAME_TIME = 50
	const MAX_SPEED = 0.6;
	var canvasElement;
	var context;
	var stepControl = 2*Math.PI;	
	var previousTimestamp = 0;
	var gameTimestamp = 0;
	var countTimeFrame =0;

	class InputHandler{
		constructor(game) {
			this.game = game;
			this.commands = ["w","s","a","d"," ","p"];
			window.addEventListener("keydown", e=> {
				if (this.commands.indexOf(e.key.toLowerCase()) > -1){
					this.game.keys[e.key.toLowerCase()] = true;
				}
			});
			window.addEventListener("keyup", e => {
				this.game.keys[e.key.toLowerCase()] = false;
			});

		}

	}

	class DrawCircuit{
		constructor(game) {
			this.game = game;
			this.curve = 0;
			this.stepGrass = 2*Math.PI;
		}

		drawSky(buffer) {
			let color = [], blue = 255;
			for (let y = 0; y < CANVAS_HEIGHT/2; ++y) {
				color = [0,0, blue, 255];
				for (let x = 0; x < CANVAS_WIDTH; ++x){
					this.drawOnBuffer(x, y, color, buffer);
				}
				blue *= 0.99;
			}	
			return buffer;
		}
		
		draw(buffer) {
			if (this.game.keys["p"]) {console.log(this.curve);}
			buffer = this.drawSky(buffer);
			let stepGrass = this.stepGrass;
			let color = [], stripeWidth, grassStripe = stepGrass, laneStripe = 0;
			let stepLane = this.stepGrass / 3, asphaltLane = CANVAS_WIDTH * ASPHALT_MIN_WIDTH;
			let laneInsertionPoint = 0;
			for (let y = CANVAS_HEIGHT/2; y < CANVAS_HEIGHT; ++y){
				laneInsertionPoint = (CANVAS_WIDTH - asphaltLane) / 2;
				if (this.curve != 0) { laneInsertionPoint = this.curveInsertionPoint(y, this.curve, laneInsertionPoint);}
				stripeWidth = asphaltLane * STRIPE_WIDTH;
				for (let x = 0; x < CANVAS_WIDTH; ++x){
					color = (Math.sin(grassStripe) > 0) ? LIGHT_GRASS : DARKER_GRASS;
					if(x >= laneInsertionPoint && x < laneInsertionPoint + asphaltLane) {
						color = ASPHALT;
						if (x < laneInsertionPoint + stripeWidth || x > laneInsertionPoint + asphaltLane - stripeWidth) {
							color = (Math.sin(laneStripe) > 0) ? WHITE_STRIPE : RED_STRIPE;
						}
					}
					this.drawOnBuffer(x, y, color, buffer);
				}
				asphaltLane += CANVAS_WIDTH * ASPHALT_WIDTH_STEP;
				laneStripe += stepLane;
				grassStripe += stepGrass;
				if(grassStripe > Math.PI*2) {stepGrass =stepGrass / 2; grassStripe = 0;}
				if(laneStripe > 2*Math.PI) {stepLane = stepLane / 2; laneStripe = 0;}
			}
			return buffer;
		}

		drawOnBuffer(x, y, color, buffer) {
			buffer[((x*4) + (y * CANVAS_WIDTH * 4))] = color[0];
			buffer[((x*4) + (y * CANVAS_WIDTH * 4))+1] = color[1];
			buffer[((x*4) + (y * CANVAS_WIDTH * 4))+2] = color[2];
			buffer[((x*4) + (y * CANVAS_WIDTH * 4))+3] = color[3];
		}

		curveInsertionPoint(y, curve, currentInsertionPoint){
			if (this.game.keys["p"]) {console.log(this.curve);}
			let coeficient = Math.abs(curve);
			let xPoint = (CANVAS_HEIGHT - y) / CANVAS_HEIGHT;
			let yPoint = coeficient * xPoint * xPoint;
			return (curve > 0) ? currentInsertionPoint - yPoint : currentInsertionPoint + yPoint;
		}
	}

	class Game{
		constructor(width, height){
			this.width = width;
			this.height = height;
			this.circuit = new DrawCircuit(this);
			this.keys = {
				"a": false,
				"w": false,
				"s": false,
				"d": false,
				" ": false,
				"p": false
			};
			this.inputs = new InputHandler(this);
			this.distance = 0;
			this.speed = 0;
			this.lap = [
				[0,600],
				[1000,500],
				[3000, 100],
				[0, 1000],
				[-1000, 800],
			];
			this.currentLapPoint = 0;
			this.lapTime = 0;
			this.lastLapTime = 0;
			this.currentCurve = 0;
			this.delta = 0;
		}

		update(timestamp) {
			this.circuit.stepGrass -= this.speed;
			if(this.circuit.stepGrass < Math.PI){this.circuit.stepGrass += Math.PI;}
			if (this.keys["w"]) {this.speed = (this.speed < MAX_SPEED) ? this.speed + 0.05 : MAX_SPEED;} 
			else { this.speed = (this.speed > 0) ? this.speed - 0.03 : 0;}
			this.distance += this.speed*10;
			if (this.distance >= this.lap[this.currentLapPoint][1]) { 
				this.currentLapPoint += 1;
				if (this.currentLapPoint == this.lap.length){
					this.currentLapPoint = 0;
					this.lapTime = timestamp - this.lastLapTime;
					this.lastLapTime = timestamp;
					console.log(this.lapTime);
				}
				this.distance = 0;
				this.currentCurve = this.lap[this.currentLapPoint][0];
				this.circuit.curve = 0;
				this.delta = (this.circuit.curve - this.currentCurve) * -1;
			}
			this.circuit.curve += this.delta/6;
			if (this.delta > 0 && this.circuit.curve > this.currentCurve) { this.circuit.curve = this.currentCurve;}
			if (this.delta < 0 && this.circuit.curve < this.currentCurve) { this.circuit.curve = this.currentCurve;}
		}

		draw(context) {
			let buffer = this.initializeBuffer();
			buffer = this.circuit.draw(buffer);
			this.drawToCanvas(context, buffer);

		}

		drawToCanvas(context, buffer){
			const image = new ImageData(buffer, CANVAS_WIDTH, CANVAS_HEIGHT);
			context.putImageData(image, 0,0);
		}

		initializeBuffer(){
			const buffer = new ArrayBuffer(CANVAS_WIDTH*CANVAS_HEIGHT*COLOR_ARRAY_LENGTH);
			return new Uint8ClampedArray(buffer);
		}

	}

	function initializeCanvas(){
		canvasElement = document.getElementById("game");
		context = canvasElement.getContext("2d");
		canvasElement.width = CANVAS_WIDTH;
		canvasElement.height = CANVAS_HEIGHT;
		return context;
	}
	var context = initializeCanvas();
	var game = new Game(canvasElement.width, canvasElement.height);
	function anime(gameTimestamp=0){
		deltaFrame = gameTimestamp - previousTimestamp;
		previousTimestamp = gameTimestamp;
		countTimeFrame += deltaFrame;
		if (countTimeFrame > TARGET_FRAME_TIME) {
			context.clearRect(0,0,canvasElement.width, canvasElement.height);
			game.update(gameTimestamp);
			game.draw(context);
			countTimeFrame = 0;
		}
		requestAnimationFrame(anime);
	}
	anime();
});


