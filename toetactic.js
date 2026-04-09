let PLAYER = 'X';
let BOT = 'O';
let currentTurn = 'X'; //mulai duluan si x

let board = Array(9).fill(' ');
let selected = null;
let MAX_DEPTH = 5; //kedalaman tree maximal

// kompionen gamenya
const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const difficultySelect = document.getElementById("difficulty");

//giliran random
function randomizeRoles() {
    if (Math.random() < 0.5) {
        PLAYER = 'X';
        BOT = 'O';
    } else {
        PLAYER = 'O';
        BOT = 'X';
    }

    currentTurn = Math.random() < 0.5 ? PLAYER : BOT;

    statusText.innerText =
        `Player: ${PLAYER} | Bot: ${BOT} | Start: ${currentTurn}`;
}

//atur level kesulitan
difficultySelect.addEventListener("change", () => {
    MAX_DEPTH = parseInt(difficultySelect.value); //max depthnya di ubah
    statusText.innerText = "Difficulty diubah (depth " + MAX_DEPTH + ")";
});

//render
function render() {
    boardDiv.innerHTML = "";

    board.forEach((cell, i) => {
        const div = document.createElement("div");
        div.classList.add("cell");
        div.innerText = cell;

        if (i === selected) {
            div.classList.add("selected");
        }

        div.addEventListener("click", () => playerMove(i));
        boardDiv.appendChild(div);
    });
}

//cek pemenang
function checkWinner(b) {
    const winStates = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (let line of winStates) {
        if (b[line[0]] !== ' ' &&
            line.every(i => b[i] === b[line[0]])) {
            return b[line[0]];
        }
    }
    return null;
}

function countPieces(b, p) {
    return b.filter(x => x === p).length;
}

//gerak
function getMoves(b, player) {
    let moves = [];
    let count = countPieces(b, player);

    // fase 1, letak 3 piece, tic tac toe biasa
    if (count < 3) {
        for (let i = 0; i < 9; i++) {
            if (b[i] === ' ') {
                let newBoard = [...b];
                newBoard[i] = player;
                moves.push(newBoard);
            }
        }
    }
    // fase 2, gerak
    else {
        for (let i = 0; i < 9; i++) {
            if (b[i] === player) {
                for (let j = 0; j < 9; j++) {
                    if (b[j] === ' ') {
                        let newBoard = [...b];
                        newBoard[i] = ' ';
                        newBoard[j] = player;
                        moves.push(newBoard);
                    }
                }
            }
        }
    }

    return moves;
}

// eval
function evaluate(b) {
    let winner = checkWinner(b);
    if (winner === BOT) return 10;
    if (winner === PLAYER) return -10;
    return 0;
}

//minimax dan alpha beta pruning 
function minimax(b, depth, alpha, beta, maximizing) {
    let score = evaluate(b);

    if (score === 10 || score === -10) return score;
    if (depth === 0) return 0;

    if (maximizing) {
        let maxEval = -Infinity;

        for (let move of getMoves(b, BOT)) {
            let evalVal = minimax(move, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, evalVal);
            alpha = Math.max(alpha, evalVal);
            if (beta <= alpha) break;
        }

        return maxEval;
    } else {
        let minEval = Infinity;

        for (let move of getMoves(b, PLAYER)) {
            let evalVal = minimax(move, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evalVal);
            beta = Math.min(beta, evalVal);
            if (beta <= alpha) break;
        }

        return minEval;
    }
}

//cari move terbaik 
function bestMove(b) {
    let bestVal = -Infinity;
    let bestBoard = null;

    for (let move of getMoves(b, BOT)) {
        let moveVal = minimax(move, MAX_DEPTH, -Infinity, Infinity, false);

        if (moveVal > bestVal) {
            bestVal = moveVal;
            bestBoard = move;
        }
    }

    return bestBoard;
}

// gerak bot
function botMove() {
    board = bestMove(board);

    if (checkWinner(board)) {
        statusText.innerText = "BOT MENANG";
    } else {
        currentTurn = PLAYER;
        statusText.innerText = "Giliran Player (" + PLAYER + ")";
    }

    render();
}

//gerak player
function playerMove(pos) {
    if (checkWinner(board)) return;

    //memasastikan giliran player
    if (currentTurn !== PLAYER) return;

    // fase 1
    if (countPieces(board, PLAYER) < 3) {
        if (board[pos] === ' ') {
            board[pos] = PLAYER;
            afterPlayerMove();
        }
    }
    // fase 2
    else {
        if (selected === null && board[pos] === PLAYER) {
            selected = pos;
        } else if (selected !== null && board[pos] === ' ') {
            board[selected] = ' ';
            board[pos] = PLAYER;
            selected = null;
            afterPlayerMove();
        }
    }

    render();
}

//setelah geraak player
function afterPlayerMove() {
    if (checkWinner(board)) {
        statusText.innerText = "PLAYER MENANG";
        return;
    }

    currentTurn = BOT;
    statusText.innerText = "BOT berpikir...";

    setTimeout(() => {
        botMove();
    }, 300);
}

//reset game
function resetGame() {
    board = Array(9).fill(' ');
    selected = null;

    randomizeRoles();

    render();

    if (currentTurn === BOT) {
        statusText.innerText += " | BOT mulai...";
        setTimeout(botMove, 500);
    }
}

// init

randomizeRoles();//selalu di random, biar tukar" ga x terus atau o terus
render();

//bot jalan dulu
if (currentTurn === BOT) {
    setTimeout(botMove, 500);
}