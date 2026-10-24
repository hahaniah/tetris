const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK = 24;

const PIECES = [
  { shape: [[1,1,1,1]], img: 'block-i.png' },
  { shape: [[1,1],[1,1]], img: 'block-o.png' },
  { shape: [[0,1,0],[1,1,1]], img: 'block-t.png' },
  { shape: [[1,0],[1,0],[1,1]], img: 'block-l.png' },
  { shape: [[0,1],[0,1],[1,1]], img: 'block-j.png' },
  { shape: [[0,1,1],[1,1,0]], img: 'block-s.png' },
  { shape: [[1,1,0],[0,1,1]], img: 'block-z.png' },
  { shape: [[1,0],[1,1],[0,1]], img: 'block-8.png' },
  { shape: [[1,1,1],[1,0,0]], img: 'block-9.png' },
  { shape: [[1,1,1],[0,0,1]], img: 'block-10.png' },
];

var blockImages = {};
PIECES.forEach(function(p) {
  var img = new Image();
  img.src = p.img;
  blockImages[p.img] = img;
});

let board = [];
let current = null;
let next = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let paused = false;
let dropInterval = 400;
let lastTime = 0;
let dropCounter = 0;
let animId = null;

function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  var p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    shape: p.shape,
    img: p.img,
    x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2),
    y: 0
  };
}

function drawBlock(context, x, y, imgSrc) {
  var img = blockImages[imgSrc];
  if (img && img.complete && img.naturalWidth > 0) {
    context.drawImage(img, x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
  } else {
    context.fillStyle = '#888';
    context.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
  }
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
    }
  }

  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      if (board[r][c]) {
        drawBlock(ctx, c, r, board[r][c]);
      }
    }
  }
}

function drawPiece(context, piece, offsetX, offsetY) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  piece.shape.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if (cell) {
        drawBlock(context, piece.x + c + offsetX, piece.y + r + offsetY, piece.img);
      }
    });
  });
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (!next) return;
  var offsetX = Math.floor((4 - next.shape[0].length) / 2);
  var offsetY = Math.floor((4 - next.shape.length) / 2);
  next.shape.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if (cell) {
        var img = blockImages[next.img];
        if (img && img.complete && img.naturalWidth > 0) {
          nextCtx.drawImage(img, (c + offsetX) * 25, (r + offsetY) * 25, 24, 24);
        } else {
          nextCtx.fillStyle = '#888';
          nextCtx.fillRect((c + offsetX) * 25, (r + offsetY) * 25, 24, 24);
        }
      }
    });
  });
}

function collides(piece, board, dx, dy) {
  dx = dx || 0;
  dy = dy || 0;
  return piece.shape.some(function(row, r) {
    return row.some(function(cell, c) {
      if (!cell) return false;
      var nx = piece.x + c + dx;
      var ny = piece.y + r + dy;
      return nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx]);
    });
  });
}

function lockPiece() {
  current.shape.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if (cell) {
        var ny = current.y + r;
        var nx = current.x + c;
        if (ny >= 0) board[ny][nx] = current.img;
      }
    });
  });
  clearLines();
  current = next;
  next = randomPiece();
  drawNext();

  if (collides(current, board, 0, 0)) {
    endGame();
  }
}

function clearLines() {
  var cleared = 0;
  for (var r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(function(c) { return c !== 0; })) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    var points = [0, 100, 300, 500, 800];
    score += (points[cleared] || 800) * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(80, 400 - (level - 1) * 40);
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
  }
}

function rotate(piece) {
  var rows = piece.shape.length;
  var cols = piece.shape[0].length;
  var rotated = Array.from({ length: cols }, function(_, i) {
    return Array.from({ length: rows }, function(_, j) {
      return piece.shape[rows - 1 - j][i];
    });
  });
  return rotated;
}

function gameLoop(time) {
  if (!gameRunning || paused) return;
  var delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;

  if (dropCounter >= dropInterval) {
    if (!collides(current, board, 0, 1)) {
      current.y++;
    } else {
      lockPiece();
    }
    dropCounter = 0;
  }

  drawBoard();
  drawPiece(ctx, current);
  animId = requestAnimationFrame(gameLoop);
}

function startGame() {
  initBoard();
  score = 0;
  level = 1;
  lines = 0;
  dropInterval = 400;
  dropCounter = 0;
  document.getElementById('score').textContent = 0;
  document.getElementById('level').textContent = 1;
  document.getElementById('game-over').classList.remove('show');
  current = randomPiece();
  next = randomPiece();
  drawNext();
  gameRunning = true;
  paused = false;
  lastTime = performance.now();
  if (animId) cancelAnimationFrame(animId);
  animId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  document.getElementById('final-score').textContent = 'score: ' + score;
  document.getElementById('game-over').classList.add('show');
}

function restartGame() {
  startGame();
}

document.addEventListener('keydown', function(e) {
  if (!gameRunning || paused) return;
  if (e.key === 'ArrowLeft') {
    if (!collides(current, board, -1, 0)) current.x--;
  }
  if (e.key === 'ArrowRight') {
    if (!collides(current, board, 1, 0)) current.x++;
  }
  if (e.key === 'ArrowDown') {
    if (!collides(current, board, 0, 1)) current.y++;
    else lockPiece();
    dropCounter = 0;
  }
  if (e.key === 'ArrowUp') {
    var rotated = rotate(current);
    var old = current.shape;
    current.shape = rotated;
    if (collides(current, board, 0, 0)) current.shape = old;
  }
  if (e.key === ' ') {
    while (!collides(current, board, 0, 1)) current.y++;
    lockPiece();
    dropCounter = 0;
  }
  drawBoard();
  drawPiece(ctx, current);
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('pause-btn').addEventListener('click', function() {
  if (!gameRunning) return;
  paused = !paused;
  this.textContent = paused ? 'resume' : 'pause';
  if (!paused) {
    lastTime = performance.now();
    animId = requestAnimationFrame(gameLoop);
  }
});