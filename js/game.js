var width, height;
var head = [], tail = [], col = [];
var hcount = parseInt(prompt("PARTICLE COUNT? <Default: 10000>")) || 10000;
var speed = parseFloat(prompt("PARTICLE SPEED? <Default: 3")) || 3;
var tlen = 100;
var mousePos = {x:400, y:400};
var pullStr = 10;
var pullDist = -2000;
var mdown = false; //left mbutton
var rmdown = false; //right mbutton
var running = true; //running or paused
var tempLineSt = {x:0,y:0};
var lastL = new Date;
var fps = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var fpsCounter = 0;
function init(){
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	width=1400;
	height=900;
	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle="#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle="#ff0000";

	//collision lines, [x1,y1,x2,y2]
	lines = [[0,30,1400,30], [1370,0,1370,900], [1400,870,0,870], [30,900,30,0], 
	[0,60,60,0], [1340,0,1400,60], [1400,840,1340,900], [60,900,0,840]];

	for(i = 0; i < hcount; i++){
		head[i] = {x:500, y:500, dir: Math.random()*2*Math.PI};
	}

	setInterval(gameloop, 16);
}

function gameloop(){

	//monitor fps
	var thisL = new Date;
	fps.push(1000 / (thisL - lastL));
	fps.shift();
    lastL = thisL;

	draw();
	if(running)
		calc();
}

function draw(){
	//blur effect
	ctx.globalAlpha = 1;
	ctx.fillStyle="#c4c4c4";
	ctx.fillRect(30, 30, width - 60, height - 60);
	ctx.globalAlpha = 1;

	ctx.fillStyle = "blue";
	for(i = 0; i < hcount; i++){
		ctx.fillRect(head[i].x, head[i].y, 2, 2);
	}

	//hide collision bugs xD
	ctx.fillStyle="black";
	ctx.fillRect(0,0,1400,30);
	ctx.fillRect(1370,0,30,900);
	ctx.fillRect(0,0,30,900);
	ctx.fillRect(0,870,1370,30);

	//draw lines
	ctx.strokeStyle="gray";
	for(j = 0; j < lines.length; j++){
		ctx.beginPath();
		ctx.moveTo(lines[j][0], lines[j][1]);
		ctx.lineTo(lines[j][2], lines[j][3]);
		ctx.stroke();
		ctx.closePath();
	}
	if(rmdown){
		ctx.strokeStyle = "green";
		ctx.moveTo(tempLineSt.x, tempLineSt.y);
		ctx.lineTo(mousePos.x, mousePos.y);
		ctx.stroke();
		ctx.closePath();
	}

	//display fps
	ctx.fillStyle = "red";
	var sum = 0;
	for(var k = 0; k < 50; k++){
		sum += fps[k];
	}
	var fpsAvg = sum/50;
	ctx.font="30px Arial";
	ctx.fillText(Math.round(fpsAvg), 50, 70)
	
}

	function calc(){
		var TmousePos = mousePos;
		for(i = 0; i < hcount; i++){

			var dx = Math.sin(head[i].dir)*speed;
			var dy = Math.cos(head[i].dir)*speed;

			head[i].x += dx;
			head[i].y -= dy;

			if(mdown){
				var vectToM = [TmousePos.x - head[i].x, TmousePos.y - head[i].y];
				var dist = (Math.sqrt((vectToM[0])*(vectToM[0]) + (vectToM[1])*(vectToM[1])));
				var vectToMAngle = Math.acos(-vectToM[1]/dist);

				if(TmousePos.x < head[i].x)
					vectToMAngle = 2*Math.PI - vectToMAngle;

				if(Math.random() < dist/pullDist){
					head[i].dir += (vectToMAngle - head[i].dir)/pullStr;
				}
			}
			//collisions
			for(j = 0; j < lines.length; j++){
				var x = head[i].x;
				var y = head[i].y;
				if(line_intersects(lines[j][0], lines[j][1], lines[j][2], lines[j][3], x, y, x+dx, y-dy)){
					//line Vector
					lv = [lines[j][2] - lines[j][0], lines[j][1] - lines[j][3]];
					dotlvDir = lv[0]*dx + lv[1]*dy;
					dotlvlv = lv[0]*lv[0] + lv[1]*lv[1];
					dotDiv = dotlvDir/dotlvlv;
					//dir vect: [dx,-dy]
					projlvDir = [dotDiv*lv[0], dotDiv*lv[1]];

					newVec = [2*projlvDir[0] - dx, 2*projlvDir[1] - dy];
					head[i].dir = Math.atan2(newVec[0],newVec[1]);
				}
			}
		}
	}

function resetParticles(x,y){
	for(i = 0; i < hcount; i++){
		head[i].x = x;
		head[i].y = y;
		head[i].dir = 2*i*Math.PI/hcount;
	}
}

function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

	var s1_x, s1_y, s2_x, s2_y;
	s1_x = p1_x - p0_x;
	s1_y = p1_y - p0_y;
	s2_x = p3_x - p2_x;
	s2_y = p3_y - p2_y;

	var s, t;
	s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

	return (s >= 0 && s <= 1 && t >= 0 && t <= 1)
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
		};
}
canvas.addEventListener('mousemove', function(evt) {
	mousePos = getMousePos(canvas, evt);
}, false);

canvas.addEventListener('mousedown', function(evt) {

	if(evt.button === 0){
		mdown = true;
		pullStr = 1;
		pullDist = 500;
	}
	else if(evt.button === 2){
		rmdown = true;
		tempLineSt.x = mousePos.x;
		tempLineSt.y = mousePos.y;
	}

}, false);

canvas.addEventListener('mouseup', function(evt) {

	mdown = false;
	pullStr = 14;
	pullDist = -2000;

	if(evt.button === 2){
		rmdown = false;
		lines.push([tempLineSt.x, tempLineSt.y, mousePos.x, mousePos.y]);
	}

}, false);

window.addEventListener('keydown', function(evt) {
	if(evt.keyCode == 32)
		running = !running;
	if(evt.keyCode == 82)
		resetParticles(mousePos.x, mousePos.y);
	if(evt.keyCode == 90){
		if(lines.length > 8)
			lines.pop();
	}
}, false);

document.body.addEventListener('contextmenu', function(ev) { ev.preventDefault(); return false; }, false);

init();