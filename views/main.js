const socket = io();
const can = document.querySelector('#c');
const ctx = can.getContext('2d');
const clr = document.querySelector('.clrpicker');
const clear = document.querySelector('#clear');
const brushThickness = document.querySelector('#drop');
const shapeSelector = document.getElementById('shape-selector');

shapeSelector.addEventListener('change', () => {
    if (shapeSelector.value === '') {
        canvas.isDrawingMode = true;
        updateDrawingButton();  
    } else {
        canvas.isDrawingMode = false;
        updateDrawingButton();  
    }
});


const joinSound = new Audio("./join.mp3");
joinSound.crossOrigin = "anonymous";
const leaveSound = new Audio("./leave.mp3");
leaveSound.crossOrigin = "anonymous";

var canvas = this.__canvas = new fabric.Canvas('c', {
    isDrawingMode: true,
    hoverCursor: 'pointer',
    imageSmoothingEnabled: false
});

canvas.backgroundColor = "#ffffff";
canvas.setWidth(0.98 * (window.innerWidth));
canvas.setHeight(0.87 * (window.innerHeight));
// Not working...
canvas.hoverCursor = 'default';
let isDrawingShape = false;
let shapeBeingDrawn = null;
let origX, origY;



// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

let isRestoring = false; 

function saveState() {
    if (isRestoring) return; 
    redoStack = [];
    undoStack.push(canvas.toJSON());
    if (undoStack.length > 50) undoStack.shift();
}

function undoCanvas() {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        const prevState = undoStack[undoStack.length - 1];
        isRestoring = true;
        canvas.loadFromJSON(prevState, () => {
            canvas.renderAll();
            isRestoring = false;
        });
    }
}

function redoCanvas() {
    if (redoStack.length > 0) {
        const state = redoStack.pop();
        undoStack.push(state);
        isRestoring = true;
        canvas.loadFromJSON(state, () => {
            canvas.renderAll();
            isRestoring = false;
        });
    }
}

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// Join WhiteBoard
socket.emit('joinRoom', { username, room });

let timeout;
const syncSpeed = 100;


canvas.on({ 'mouse:move': sendData });


const membersList = document.getElementById('membersList');
const memberCount = document.getElementById('numb');



// resize canvas
let sizeChange = false;

function resize() {
    
    if (!sizeChange) {
        canvas.setWidth(1920);
        canvas.setHeight(1280);
        sizeChange = true;
    } else {
        canvas.setWidth(0.98 * (window.innerWidth));
        canvas.setHeight(0.87 * (window.innerHeight));
        sizeChange = false;
    }

}

let clrw = true;

function changeClr() {
    
    if (canvas.backgroundColor == "#333333") {
        canvas.backgroundColor = "#ffffff";
        clrw = true;
    } else {
        canvas.backgroundColor = "#333333";
        clrw = false;
    }
   
    canvas.renderAll();
}

// Fabric js

function start() {
    var id = function (id) { return document.getElementById(id) };

    fabric.Object.prototype.transparentCorners = false;

    var drawingModeEl = id('drawing-mode'),
        drawingOptionsEl = id('drawing-mode-options'),
        drawingColorEl = id('drawing-color'),
        drawingShadowColorEl = id('drawing-shadow-color'),
        drawingLineWidthEl = id('drop'),
        drawingShadowWidth = id('drawing-shadow-width'),
        drawingShadowOffset = id('drawing-shadow-offset'),
        clearEl = id('clear');

    clearEl.onclick = function () {
        canvas.clear();
        canvas.backgroundColor = "#ffffff";
        socket.emit('canvas-clear', canvas.toDataURL("image/png"));
    };

    drawingModeEl.onclick = function () {
        canvas.isDrawingMode = !canvas.isDrawingMode;
        if (canvas.isDrawingMode) {
            drawingModeEl.innerHTML = 'Cancel drawing mode';
            drawingOptionsEl.style.display = '';
        }
        else {
            drawingModeEl.innerHTML = 'Enter drawing mode';
            drawingOptionsEl.style.display = 'none';
        }
    };

    if (fabric.PatternBrush) {
        var vLinePatternBrush = new fabric.PatternBrush(canvas);
        vLinePatternBrush.getPatternSrc = function () {

            var patternCanvas = fabric.document.createElement('canvas');
            patternCanvas.width = patternCanvas.height = 10;
            var ctx = patternCanvas.getContext('2d');
            // patternCanvas.hoverCursor = 'default'
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(0, 5);
            ctx.lineTo(10, 5);
            ctx.closePath();
            ctx.stroke();

            return patternCanvas;
        };

        var hLinePatternBrush = new fabric.PatternBrush(canvas);
        hLinePatternBrush.getPatternSrc = function () {

            var patternCanvas = fabric.document.createElement('canvas');
            patternCanvas.width = patternCanvas.height = 10;
            var ctx = patternCanvas.getContext('2d');
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(5, 0);
            ctx.lineTo(5, 10);
            ctx.closePath();
            ctx.stroke();

            return patternCanvas;
        };

        var squarePatternBrush = new fabric.PatternBrush(canvas);
        squarePatternBrush.getPatternSrc = function () {

            var squareWidth = 10, squareDistance = 2;

            var patternCanvas = fabric.document.createElement('canvas');
            patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
            var ctx = patternCanvas.getContext('2d');

            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, squareWidth, squareWidth);

            return patternCanvas;
        };

        var diamondPatternBrush = new fabric.PatternBrush(canvas);
        diamondPatternBrush.getPatternSrc = function () {

            var squareWidth = 10, squareDistance = 5;
            var patternCanvas = fabric.document.createElement('canvas');
            var rect = new fabric.Rect({
                width: squareWidth,
                height: squareWidth,
                angle: 45,
                fill: this.color
            });

            var canvasWidth = rect.getBoundingRect().width;

            patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
            rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

            var ctx = patternCanvas.getContext('2d');
            rect.render(ctx);

            return patternCanvas;
        };

        var img = new Image();
        img.src = './retina_wood.png';

        var texturePatternBrush = new fabric.PatternBrush(canvas);
        texturePatternBrush.source = img;

    }
    canvas.freeDrawingBrush.width = 5;

    id('drawing-mode-selector').onchange = function () {

        if (this.value === 'hline') {
            canvas.freeDrawingBrush = vLinePatternBrush;
        }
        else if (this.value === 'vline') {
            canvas.freeDrawingBrush = hLinePatternBrush;
        }
        else if (this.value === 'square') {
            canvas.freeDrawingBrush = squarePatternBrush;
        }
        else if (this.value === 'diamond') {
            canvas.freeDrawingBrush = diamondPatternBrush;
        }
        else if (this.value === 'texture') {
            canvas.freeDrawingBrush = texturePatternBrush;
        }
        else {
            canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
        }

        if (canvas.freeDrawingBrush) {
            var brush = canvas.freeDrawingBrush;
            brush.color = drawingColorEl.value;
            if (brush.getPatternSrc) {
                brush.source = brush.getPatternSrc.call(brush);
            }
            brush.width = parseInt(drawingLineWidthEl.value, 10) || 5;
            brush.shadow = new fabric.Shadow({
                blur: parseInt(drawingShadowWidth.value, 10) || 0,
                offsetX: 0,
                offsetY: 0,
                affectStroke: true,
                color: drawingShadowColorEl.value,
            });
        }
    };

    drawingColorEl.onchange = function () {
        var brush = canvas.freeDrawingBrush;
        brush.color = this.value;
        if (brush.getPatternSrc) {
            brush.source = brush.getPatternSrc.call(brush);
        }
    };
    drawingShadowColorEl.onchange = function () {
        canvas.freeDrawingBrush.shadow.color = this.value;
    };
    drawingLineWidthEl.onchange = function () {
        canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 5;
        this.previousSibling.innerHTML = this.value;
    };
    drawingShadowWidth.onchange = function () {
        canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
        this.previousSibling.innerHTML = this.value;
    };
    drawingShadowOffset.onchange = function () {
        canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
        canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
        this.previousSibling.innerHTML = this.value;
    };

    if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = drawingColorEl.value;
       
        canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 5;
        canvas.freeDrawingBrush.shadow = new fabric.Shadow({
            blur: parseInt(drawingShadowWidth.value, 10) || 0,
            offsetX: 0,
            offsetY: 0,
            affectStroke: true,
            color: drawingShadowColorEl.value,
        });
    }

}

canvas.on('mouse:down', function (o) {
    const selectedShape = document.getElementById('shape-selector').value;
    if (!selectedShape) return;

    isDrawingShape = true;
    const pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;

    switch (selectedShape) {
        case 'rectangle':
            shapeBeingDrawn = new fabric.Rect({
                left: origX,
                top: origY,
                width: 0,
                height: 0,
                fill: 'rgba(0,0,0,0.3)',
                selectable: true
            });
            break;
        case 'circle':
            shapeBeingDrawn = new fabric.Ellipse({
                left: origX,
                top: origY,
                rx: 0,
                ry: 0,
                originX: 'left',
                originY: 'top',
                fill: 'rgba(0,0,0,0.3)',
                selectable: true
            });
            break;
        case 'triangle':
            shapeBeingDrawn = new fabric.Triangle({
                left: origX,
                top: origY,
                width: 0,
                height: 0,
                fill: 'rgba(0,0,0,0.3)',
                selectable: true
            });
            break;
        default:
            return;
    }

    canvas.add(shapeBeingDrawn);
});

canvas.on('mouse:move', function (o) {
    if (!isDrawingShape || !shapeBeingDrawn) return;

    const pointer = canvas.getPointer(o.e);
    const width = pointer.x - origX;
    const height = pointer.y - origY;

    if (shapeBeingDrawn.type === 'ellipse') {
        shapeBeingDrawn.set({
            rx: Math.abs(width) / 2,
            ry: Math.abs(height) / 2,
            left: width < 0 ? pointer.x : origX,
            top: height < 0 ? pointer.y : origY
        });
    } else {
        shapeBeingDrawn.set({
            width: Math.abs(width),
            height: Math.abs(height),
            left: width < 0 ? pointer.x : origX,
            top: height < 0 ? pointer.y : origY
        });
    }

    canvas.renderAll();
});

canvas.on('mouse:up', function () {
    if (!isDrawingShape || !shapeBeingDrawn) return;

    const shapeData = shapeBeingDrawn.toJSON();
    socket.emit('add-shape', shapeData);

    isDrawingShape = false;
    shapeBeingDrawn = null;

    
    shapeSelector.value = '';
    canvas.isDrawingMode = true;
    updateDrawingButton();
});


function sendData() {
    // console.log("sending Data")
    if (timeout != undefined) clearTimeout(timeout);
    timeout = setTimeout(() => {
        let base64ImageData = canvas.toDataURL("image/png");
        socket.emit('canvas-image', base64ImageData);
    }, syncSpeed);
}

start();
canvas.renderAll();

undoStack.push(canvas.toJSON());


canvas.on('object:added', saveState);
canvas.on('object:modified', saveState);
canvas.on('object:removed', saveState);


function deleteObject() {
    canvas.remove(canvas.getActiveObject());
}

// Socket io

const context = canvas.getContext('2d');

socket.on("canvas-draw", data => {
    let image = new Image();
    image.onload = function () {

        var f_img = new fabric.Image(image);
        canvas.setBackgroundImage(f_img);
        canvas.renderAll();
        // context.drawImage(image, 0, 0);
    };
    image.src = data;
});

socket.on("canvas-wipe", data => {
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    
});

socket.on('roomUsers', ({ room, users, status }) => {
    outputRoomName(room);
    outputUsers(users, status);
});

function outputRoomName(room) {
    $('.dropbtn').html(`View member accessing this Board (${room}) (<span id="numb"></span>) <i class="fas fa-caret-down"></i>`);
}

function outputUsers(users, status) {
  if (status) joinSound.play();
  else leaveSound.play();

  memberCount.textContent = users.length;
  membersList.innerHTML = '';

  users.forEach(user => {
    const li = document.createElement('li');
    li.className = 'dropdown-item';
    li.textContent = user.username;
    membersList.appendChild(li);
  });
}



function undo() {
    undoCanvas();
}
function redo() {
    redoCanvas();
}

socket.on('wrong_Room', check => {
    window.location = '/'
});


function feature() {
    let picName = prompt("Name of the Image?", "Enter");
    if (picName == null || picName == "" || picName == "Enter") {
        alert('Invalid Name');
    }
    else {
       
        alert('Sent for Reviewing!! Stay Tuned!!\n Send the image in mail to arkaraj2017@gmail.com');
    }
}


function Save() {


    var w = canvas.width;
    var h = canvas.height;

    var data = ctx.getImageData(0, 0, w, h);

    var compositeOperation = ctx.globalCompositeOperation;

    ctx.globalCompositeOperation = "destination-over";

    // Transparent
    // ctx.fillStyle = "rgba(0, 0, 0, 0.2)";

    if (clrw) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    } else {
        ctx.fillStyle = canvas.backgroundColor;
    }

    ctx.fillRect(0, 0, w, h);

    var imageData = canvas.toDataURL("image/png");

    ctx.clearRect(0, 0, w, h);
    ctx.putImageData(data, 0, 0);
    ctx.globalCompositeOperation = compositeOperation;

    var a = document.createElement('a');
    a.href = imageData;
    a.download = 'WhiteBoard.png';
    a.click();
    // ctx.globalCompositeOperation = 'source-over';
}


