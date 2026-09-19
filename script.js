// 核心逻辑
let matrix = [];
let score = 0;
const gridDisplay = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const gameOverDiv = document.getElementById('game-over');

// 初始化游戏
function initGame() {
    matrix = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    scoreDisplay.innerText = 0;
    gameOverDiv.classList.add('hidden');
    
    // 清空格子（保留遮罩层）
    const cells = document.querySelectorAll('.cell');
    cells.forEach(c => c.remove());
    
    // 生成16个格子
    for(let i = 0; i < 16; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell';
        gridDisplay.insertBefore(cell, gameOverDiv);
    }
    
    spawn(); spawn();
    draw();
}

// 生成新数字 (90% 生成 2，10% 生成 4)
function spawn() {
    let empty = [];
    for(let r = 0; r < 4; r++) 
        for(let c = 0; c < 4; c++) 
            if(matrix[r][c] === 0) empty.push({r, c});
            
    if(empty.length > 0) {
        let pos = empty[Math.floor(Math.random() * empty.length)];
        matrix[pos.r][pos.c] = Math.random() < 0.9 ? 2 : 4; 
    }
}

// 绘制画面
function draw() {
    const cells = document.querySelectorAll('.cell');
    for(let i = 0; i < 16; i++) {
        let r = Math.floor(i / 4), c = i % 4;
        let val = matrix[r][c];
        
        cells[i].className = 'cell'; 
        cells[i].innerHTML = '';     
        
        if(val > 0) {
            cells[i].classList.add(`tile-${val}`);
            // 添加右上角数字提示
            let span = document.createElement('span');
            span.className = 'level-num';
            span.innerText = val; 
            cells[i].appendChild(span);
        }
    }
    scoreDisplay.innerText = score;
}

// 核心移动逻辑
function moveLeft() {
    let moved = false;
    for (let r = 0; r < 4; r++) {
        let row = matrix[r].filter(val => val !== 0); 
        for (let c = 0; c < row.length - 1; c++) {
            if (row[c] === row[c + 1]) {
                row[c] *= 2;
                score += row[c];
                row[c + 1] = 0; 
            }
        }
        row = row.filter(val => val !== 0); 
        while (row.length < 4) row.push(0);
        if (row.join(',') !== matrix[r].join(',')) moved = true;
        matrix[r] = row;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let r = 0; r < 4; r++) {
        let row = matrix[r].filter(val => val !== 0).reverse(); 
        for (let c = 0; c < row.length - 1; c++) {
            if (row[c] === row[c + 1]) {
                row[c] *= 2;
                score += row[c];
                row[c + 1] = 0; 
            }
        }
        row = row.filter(val => val !== 0).reverse(); 
        while (row.length < 4) row.unshift(0);
        if (row.join(',') !== matrix[r].join(',')) moved = true;
        matrix[r] = row;
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let c = 0; c < 4; c++) {
        let col = [matrix[0][c], matrix[1][c], matrix[2][c], matrix[3][c]];
        col = col.filter(val => val !== 0);
        for (let r = 0; r < col.length - 1; r++) {
            if (col[r] === col[r + 1]) {
                col[r] *= 2;
                score += col[r];
                col[r + 1] = 0;
            }
        }
        col = col.filter(val => val !== 0);
        while (col.length < 4) col.push(0);
        for(let r = 0; r < 4; r++) {
            if (matrix[r][c] !== col[r]) moved = true;
            matrix[r][c] = col[r];
        }
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let c = 0; c < 4; c++) {
        let col = [matrix[0][c], matrix[1][c], matrix[2][c], matrix[3][c]].reverse();
        col = col.filter(val => val !== 0);
        for (let r = 0; r < col.length - 1; r++) {
            if (col[r] === col[r + 1]) {
                col[r] *= 2;
                score += col[r];
                col[r + 1] = 0;
            }
        }
        col = col.filter(val => val !== 0).reverse();
        while (col.length < 4) col.unshift(0);
        for(let r = 0; r < 4; r++) {
            if (matrix[r][c] !== col[r]) moved = true;
            matrix[r][c] = col[r];
        }
    }
    return moved;
}

// 检查游戏结束
function checkGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (matrix[r][c] === 0) return;
        }
    }
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            let current = matrix[r][c];
            if (c < 3 && current === matrix[r][c+1]) return;
            if (r < 3 && current === matrix[r+1][c]) return;
        }
    }
    gameOverDiv.classList.remove('hidden');
}

// 键盘监听
document.addEventListener('keydown', e => {
    if(!gameOverDiv.classList.contains('hidden')) return;
    let moved = false;
    if(e.key === 'ArrowLeft') moved = moveLeft();
    if(e.key === 'ArrowRight') moved = moveRight();
    if(e.key === 'ArrowUp') moved = moveUp();
    if(e.key === 'ArrowDown') moved = moveDown();
    
    if(moved) { spawn(); draw(); checkGameOver(); }
});

// 手机触摸滑动监听
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: false });

document.addEventListener('touchend', e => {
    if(!gameOverDiv.classList.contains('hidden')) return;
    let diffX = e.changedTouches[0].clientX - touchStartX;
    let diffY = e.changedTouches[0].clientY - touchStartY;
    
    if(Math.abs(diffX) > Math.abs(diffY)) {
        if(Math.abs(diffX) > 30) {
            if(diffX > 0) moveRight(); else moveLeft();
        }
    } else {
        if(Math.abs(diffY) > 30) {
            if(diffY > 0) moveDown(); else moveUp();
        }
    }
    spawn(); draw(); checkGameOver();
}, { passive: false });

// 启动游戏
initGame();