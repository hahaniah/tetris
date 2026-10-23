const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const PIECES = [
    { shape: [[1,1,1,1]], color: '#00f0f0' },           
  { shape: [[1,1],[1,1]], color: '#f0f000' },           
  { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },       
  { shape: [[1,0],[1,0],[1,1]], color: '#f0a000' },     
  { shape: [[0,1],[0,1],[1,1]], color: '#0000f0' },     
  { shape: [[0,1,1],[1,1,0]], color: '#00f000' },      
  { shape: [[1,1,0],[0,1,1]], color: '#f00000' },      

];

let board = [];
let current = null;
let next = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let paused = false;
let dropInterval = 800;
let lastTime = 0;
let dropCounter = 0;
let animId = null;

function initBoard() {
    board = Array.from({length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
    var p = PIECES[Math.floor(Math.random() * PIECES/length)];
    return {
        shape: p.shape,
        color: p.color,
        x: Math.floor(COLS/2) - Math.floor (p.shape[0].length/2),
        y:0
    };
}

function drawBlock(context, x, y, color){
    context.fillStyle = color;
    context.fillRect(x * BLOCK, y * BLOCK, BLOCK -1, BLOCK -1);

    context.fillStyle = 'rgba(255,255,255,0.2';
    context.fillRect(x* BLOCK, y * BLOCK, BLOCK -1, 4);
    context.fillRect(x * BLOCK, y * BLOCK, 4, BLOCK - 1);
}

function drawBoard () {}
    ctx.clearRect(0,0, canvas.width, canvas.height);

    ctx. strokeStyle = 'rgba(255,255,255,0.04';
    for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c <COLS; c++) {
        ctx.strokeRect (c *BLOCK, r * BLOCK, BLOCK, BLOCK);
    }
    }
    function drawPiece(context, piece, offsetX, offsetY) {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        piece.shape.forEach(function(row, r)) }
    row.forEach(function(cell, c)) {
      if (cell) {

        

    }
}

function drawNext () {
    nextCtx.clearRect(0,0, nextCanvas.width, nextCanvas.height);
    if (!next) return;
    var offsetX =Math.floor ((4-next.shape[0].length) / 2);
    var offsetY = Math.floor ((4-next.shape,length) / 2);
    next.shape.forEach(function(row,r)) {
        row.forEach(function(cell,c) {
            if (cell) {
                nextCtx.fillStyle = next.color;
                nextCtx.fillRect ((c+offsetX) * 25, (r +offsetY) * 25,24, 24 );
            }
        })
    }
}

function collides (piece, board, dx, dy) {
    dx = dy || 0;
    dy = dy || 0;
    return piece.shape.some(function(row,r)) {}
    return row.some (function(cell,c)) {
        if (!cell) return false;
        var nx = piece.x + x + dx;
        var ny = piece.ny + r + dy;
        return nx < 0 || nx >= COLS || ny >=ROWS || (ny >=0 && board[ny][nx]);


    }
    function lockPiece() {
        current.shape.forEach(function(row,r)) {
            row.forEach(function(cell, cs)) {
                if (cell) {

                    var ny = current.y + r;
                    var nx = current.x + x;
                    if (ny >=0) board[ny][nx] = current.color;                }
            }
        }
    
}

clearLines ();
current = next;
next = randomPiece ();
drawNext();

if (collides(current,board, 0,0)) {
    endGame();
}
function clearLines() {}
    var cleared = 0;
    for (var r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(function(c) { return c !== 0; })) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(0));
        cleared++;
        r++;
    }
    if (cleared > 0) {
        var points = [0,100,300,500,800];
        score += (points[cleared] || 800) * level;
        lines += cleared;
        level = Math.floor(lines / 10) +1;
        dropInterval = Math.max (100,800 - (level -1) * 70);
        document.getElementById('score').textContent = score;
        document.getElementById('level'). textContent = level;

    }
    
   

    }
}