/**
 * Class for managing 2D visualization/interaction for audio demos.
 * @param {Object} canvas
 * @param {Object} elements
 * @param {Function} callbackFunc
 */
 
var count = 0;
var that;
var timingAnnounced = true;
var startTime;
var stopTime;

function CanvasControl(canvas, elements, callbackFunc) {
  this._canvas = canvas;
  this._elements = elements;
  this._callbackFunc = callbackFunc;

  this._context = this._canvas.getContext('2d');
  this._cursorDown = false;

  this._selected = {
    index: -1,
    xOffset: 0,
    yOffset: 0,
  };

  this._lastMoveEventTime = 0;
  this._minimumThreshold = 16;
  that = this;
  canvas.addEventListener('touchstart', function(event) {
    that._cursorDownFunc(event);
  });

  canvas.addEventListener('mousedown', function(event) {
    that._cursorDownFunc(event);
  });

  canvas.addEventListener('touchmove', function(event) {
    let currentEventTime = Date.now();
    if (currentEventTime - that._lastMoveEventTime > that._minimumThreshold) {
      that._lastMoveEventTime = currentEventTime;
      if (that._cursorMoveFunc(event)) {
        event.preventDefault();
      }
    }
  }, true);

  canvas.addEventListener('mousemove', function(event) {
    let currentEventTime = Date.now();
    if (currentEventTime - that._lastMoveEventTime > that._minimumThreshold) {
      that._lastMoveEventTime = currentEventTime;
      that._cursorMoveFunc(event);
    }
  });

  document.addEventListener('touchend', function(event) {
    that._cursorUpFunc(event);
  });

  document.addEventListener('mouseup', function(event) {
    that._cursorUpFunc(event);
  });

  window.addEventListener('resize', function(event) {
    that.resize();
    that.draw();
  }, false);
  
  
  document.addEventListener( "keydown", function(event) {
	
    switch(event.which) {
			case 37: // left
			console.log("left press");
			updateSourcePosition(0, -1);
			that.draw();
			that.invokeCallback();
			break;

			case 39: // right
			console.log("right press");
			updateSourcePosition(0, 1);
			that.draw();
			that.invokeCallback();
			break;

			case 38: // up
			updateSourcePosition(1, 0);
			that.draw();
			that.invokeCallback();
			break;

			case 40: // down
			updateSourcePosition(-1, 0);
			that.draw();
			that.invokeCallback();
			break;

			case 32: // spacebar
			console.log("spacebar");
			if(!that.directionMode){
				playMusic();
				that.directionMode = true;
				startTime = new Date();
			}
			break;


			default: return; // exit this handler for other keys
		}
		event.preventDefault(); // prevent the default action (scroll / move caret)
		
    
  }, false);
  
  

  this.invokeCallback();
  this.resize();
  this.draw();
  
}


function updateSourcePosition(up, right){
	
	var increment = 0.005;
	var x = that._elements[1].x + right * increment;
	var y = that._elements[1].y - up * increment;
	
	//create a boundary
	if(x < 0)
		x = 0;
	else if (x > 1)
		x = 1;
	if(y < 0)
		y = 0;
	else if (y > 1)
		y = 1;
	
	
	//update position of source
	that._elements[1].x = x;
	that._elements[1].y = y;
	
	
	//if the person is near the cat
	var distance = calculateDistance(that);
	console.log(distance);
	if(distance < 0.06){
		console.log("found cat");
		foundCat();
	}
	
	
	//adjust the audio accordingly 
	//object.invokeCallback();
}



function calculateDistance(object){
	var xdiff = object._elements[0].x - object._elements[1].x;
	var ydiff = object._elements[0].y - object._elements[1].y;
	var distance = Math.sqrt(Math.pow(xdiff,2) + Math.pow(ydiff,2));
	return distance;
	
}


CanvasControl.prototype.invokeCallback = function() {
  if (this._callbackFunc !== undefined) {
    this._callbackFunc(this._elements);
  }
};

CanvasControl.prototype.resize = function() {
  let canvasWidth = this._canvas.parentNode.clientWidth;
  let maxCanvasSize = 480;
  if (canvasWidth > maxCanvasSize) {
    canvasWidth = maxCanvasSize;
  }
  this._canvas.width = canvasWidth;
  this._canvas.height = canvasWidth;
};

CanvasControl.prototype.draw = function() {
  this._context.globalAlpha = 1;
  this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

  this._context.lineWidth = 5;
  this._context.strokeStyle = '#bbb';
  this._context.strokeRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < this._elements.length; i++) {
    let icon = document.getElementById(this._elements[i].icon + "2");
    if (icon !== undefined) {
      let radiusInPixels = this._elements[i].radius * this._canvas.width;
      let x = this._elements[i].x * this._canvas.width - radiusInPixels;
      let y = this._elements[i].y * this._canvas.height - radiusInPixels;
      this._context.globalAlpha = this._elements[i].alpha;
      this._context.drawImage(
        icon, x, y, radiusInPixels * 2, radiusInPixels * 2);
    }
  }
  
  
};

CanvasControl.prototype.getCursorPosition = function(event) {
  let cursorX;
  let cursorY;
  let rect = this._canvas.getBoundingClientRect();
  if (event.touches !== undefined) {
    cursorX = event.touches[0].clientX;
    cursorY = event.touches[0].clientY;
  } else {
    cursorX = event.clientX;
    cursorY = event.clientY;
  }
  return {
    x: cursorX - rect.left,
    y: cursorY - rect.top,
  };
};

CanvasControl.prototype.getNearestElement = function(cursorPosition) {
  let minDistance = 1e8;
  let minIndex = -1;
  let minXOffset = 0;
  let minYOffset = 0;
  for (let i = 0; i < this._elements.length; i++) {
    if (this._elements[i].clickable == true) {
      let dx = this._elements[i].x * this._canvas.width - cursorPosition.x;
      let dy = this._elements[i].y * this._canvas.height - cursorPosition.y;
      let distance = Math.abs(dx) + Math.abs(dy); // Manhattan distance.
      if (distance < minDistance &&
          distance < 2 * this._elements[i].radius * this._canvas.width) {
        minDistance = distance;
        minIndex = i;
        minXOffset = dx;
        minYOffset = dy;
      }
    }
  }
  return {
    index: minIndex,
    xOffset: minXOffset,
    yOffset: minYOffset,
  };
};

CanvasControl.prototype._cursorUpdateFunc = function(cursorPosition) {
  if (this._selected.index > -1) {
    this._elements[this._selected.index].x = Math.max(0, Math.min(1,
      (cursorPosition.x + this._selected.xOffset) / this._canvas.width));
    this._elements[this._selected.index].y = Math.max(0, Math.min(1,
      (cursorPosition.y + this._selected.yOffset) / this._canvas.height));
    this.invokeCallback();
  }
  this.draw();
};

CanvasControl.prototype._cursorDownFunc = function(event) {
  this._cursorDown = true;
  let cursorPosition = this.getCursorPosition(event);
  this._selected = this.getNearestElement(cursorPosition);
  this._cursorUpdateFunc(cursorPosition);
  document.body.style = 'overflow: hidden;';
};

CanvasControl.prototype._cursorUpFunc = function(event) {
  this._cursorDown = false;
  this._selected.index = -1;
  document.body.style = '';
};

CanvasControl.prototype._cursorMoveFunc = function(event) {
  let cursorPosition = this.getCursorPosition(event);
  let selection = this.getNearestElement(cursorPosition);
  if (this._cursorDown == true) {
    this._cursorUpdateFunc(cursorPosition);
  }
  if (selection.index > -1) {
    this._canvas.style.cursor = 'pointer';
    return true;
  } else {
    this._canvas.style.cursor = 'default';
    return false;
  }
};




function foundCat(){
	
	
	
	//regenerate a new cat, if less than 3
	if(count < 3){
		
		count += 1;
	
		//stop the music
		stopMusic();
		
		//announce finding the cat and how many found
		speakText2("Hurray. You found " + count + (count==1?" cat.":" cats."));
		
		//generate random location for the cat
		  var locX = 0.15 + 0.7 * Math.random();
		  var locY = 0.15 + 0.7 * Math.random();
		  
		
		that._elements[0].x = locX;
		that._elements[0].y = locY;
		
		//display the cat 
		that.draw();
		
		that.invokeCallback();
		
		playMusic();
	}
	
	
	if(count == 3){
		if(timingAnnounced){
			stopTime = new Date();
			var timeDiff = stopTime - startTime;

			// strip the ms
			timeDiff /= 1000;
			
			// get seconds (Original had 'round' which incorrectly counts 0:28, 0:29, 1:30 ... 1:59, 1:0)
			var seconds = Math.round(timeDiff % 60);

			// remove seconds from the date
			timeDiff = Math.floor(timeDiff / 60);
			// get minutes
			var minutes = Math.round(timeDiff % 60);
			console.log("time " + minutes);
			
			stopMusic();
			//else find the total timing and say that
			speakText2("Congratulations. Your timing is " + minutes + " minutes and " + seconds + " seconds.");
			timingAnnounced = false;
		}
	}
}