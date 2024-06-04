class Tetris {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasNS = document.getElementById('nextShape');
        this.ctxNS = this.canvasNS.getContext('2d');
        this.board = this.createBoard();
        this.pieces = 'ILJOTSZ';
        this.colors = [
            null, 'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
        ];
        this.currentPiece = this.randomPiece();
        this.nextPiece = this.randomPiece();
        this.score = 0;
        this.isPlaying = true;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.dropCounter = 0;
        this.init();
    }

    init() {
        this.update();
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    createBoard() {
        return Array.from({ length: 20 }, () => Array(10).fill(0));
    }

    randomPiece() {
        const type = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        return new Piece(type, this.colors[this.pieces.indexOf(type) + 1], this.board);
    }
    
    

    handleKeyPress(event) {
        if (this.isPlaying) {
            if (event.key === 'ArrowLeft') {
                this.currentPiece.move(-1, 0);
                if (this.currentPiece.collision(0, 0)) {
                    this.currentPiece.move(1, 0);
                }
            } else if (event.key === 'ArrowRight') {
                this.currentPiece.move(1, 0);
                if (this.currentPiece.collision(0, 0)) {
                    this.currentPiece.move(-1, 0);
                }
            } else if (event.key === 'ArrowDown') {
                this.currentPiece.move(0, 1);
                if (this.currentPiece.collision(0, 0)) {
                    this.currentPiece.move(0, -1);
                    this.mergePiece();
                }
                this.dropCounter = 0; // Reset drop counter to simulate faster fall
            } else if (event.key === 'ArrowUp') {
                this.currentPiece.rotate();
                if (this.currentPiece.collision(0, 0)) {
                    this.currentPiece.rotate(-1);
                }
            } else if (event.key === ' ') {
                while (!this.currentPiece.collision(0, 1)) {
                    this.currentPiece.move(0, 1);
                }
                this.mergePiece();
                this.dropCounter = 0; // Reset drop counter after hard drop
            }
            this.update();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        }

    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;

        if (this.dropCounter > this.dropInterval) {
            this.currentPiece.move(0, 1);
            if (this.currentPiece.collision(0, 0)) {
                this.currentPiece.move(0, -1);
                this.mergePiece();
            }
            this.dropCounter = 0;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBoard();
        this.drawPiece(this.currentPiece);
        this.drawNextPiece();
        this.drawScore();

        if (this.isPlaying) {
            requestAnimationFrame(this.update.bind(this));
        }
    }

    drawBoard() {
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x] !== 0) {
                    this.ctx.fillStyle = this.colors[this.board[y][x]];
                    this.ctx.fillRect(x * 30, y * 30, 30, 30);
                }
            }
        }
    }

    drawPiece(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.ctx.fillStyle = piece.color;
                    this.ctx.fillRect((piece.x + x) * 30, (piece.y + y) * 30, 30, 30);
                }
            });
        });
    }

    drawNextPiece() {
        this.ctxNS.clearRect(0, 0, this.canvasNS.width, this.canvasNS.height);
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.ctxNS.fillStyle = this.nextPiece.color;
                    this.ctxNS.fillRect(x * 30, y * 30, 30, 30);
                }
            });
        });
    }

    drawScore() {
        document.getElementById('score').innerText = `Score: ${this.score}`;
    }

    mergePiece() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.board[this.currentPiece.y + y][this.currentPiece.x + x] = this.colors.indexOf(this.currentPiece.color);
                }
            });
        });
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        if (this.currentPiece.collision(0, 0)) {
            this.isPlaying = false;
            alert("Game Over!");
        }
    }

    clearLines() {
        let linesCleared = 0;
        outer: for (let y = this.board.length - 1; y >= 0; y--) {
            for (let x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.board.splice(y, 1)[0].fill(0);
            this.board.unshift(row);
            linesCleared++;
            y++;
        }

        this.score += linesCleared * 10;
    }
}

class Piece {
    constructor(type, color, board) {
        this.type = type;
        this.color = color;
        this.board = board;
        this.shape = this.getShape(type);
        this.x = 3;
        this.y = 0;
    }

    getShape(type) {
        switch (type) {
            case 'I': return [[1, 1, 1, 1]];
            case 'J': return [[1, 0, 0], [1, 1, 1]];
            case 'L': return [[0, 0, 1], [1, 1, 1]];
            case 'O': return [[1, 1], [1, 1]];
            case 'S': return [[0, 1, 1], [1, 1, 0]];
            case 'T': return [[0, 1, 0], [1, 1, 1]];
            case 'Z': return [[1, 1, 0], [0, 1, 1]];
        }
    }

    move(x, y) {
        this.x += x;
        this.y += y;
    }

    rotate() {
        this.shape = this.shape[0].map((_, i) => this.shape.map(row => row[i])).reverse();
    }

    drop() {
        while (!this.collision(0, 1)) {
            this.y += 1;
        }
    }

    collision(dx, dy) {
        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                if (this.shape[y][x] !== 0) {
                    let newX = this.x + x + dx;
                    let newY = this.y + y + dy;
                    if (newX < 0 || newX >= this.board[0].length || newY >= this.board.length || this.board[newY][newX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Tetris();
});
document.addEventListener('DOMContentLoaded', () => {
    const game = new Tetris();

    document.getElementById('btnPlay').addEventListener('click', () => {
        game.isPlaying = true;
        game.isPaused = false;
        game.update();
    });
});

