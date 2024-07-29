const socket = io();
const chess = new Chess()
const boardElement = document.querySelector(".chessboard")
let draggedpiece = null
let sourcesq = null
let Role = null

const renderBoard = () => {
    const board = chess.board()
    boardElement.innerHTML = ""
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareelement = document.createElement("div")
            squareelement.classList.add("square", (rowindex + squareindex) % 2 === 0 ? "light" : "dark")
            squareelement.dataset.row = rowindex
            squareelement.dataset.col = squareindex
            if (square) {
                const pieceelement = document.createElement("div")
                pieceelement.classList.add("piece", square.color === "w" ? "white" : "black")
                pieceelement.innerHTML = pieceUnicode(square)
                pieceelement.draggable = Role === square.color
                pieceelement.addEventListener("dragstart", (e) => {
                    if (pieceelement.draggable) {
                        draggedpiece = pieceelement
                        sourcesq = { row: rowindex, col: squareindex }
                        e.dataTransfer.setData("text/plain", "")
                    }
                })
                pieceelement.addEventListener("dragend", (e) => {
                    draggedpiece = null
                    sourcesq = null
                })
                squareelement.appendChild(pieceelement)
            }
            squareelement.addEventListener("dragover", (e) => {
                e.preventDefault()
            })
            squareelement.addEventListener("drop", (e) => {
                e.preventDefault()
                if (draggedpiece) {
                    const targetsq = {
                        row: parseInt(squareelement.dataset.row),
                        col: parseInt(squareelement.dataset.col)
                    }
                    handleMove(sourcesq, targetsq)
                }
            })
            boardElement.appendChild(squareelement)
        })
    });
    if (Role === "b") {
        boardElement.classList.add("flipped")
    } else {
        boardElement.classList.remove("flipped")
    }
    Over()
}

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    }
    socket.emit("move", move)
    Over()
}

const pieceUnicode = (piece) => {
    const unicodes = {
        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
        P: "♟︎",
        R: "♜",
        N: "♞",
        B: "♝",
        Q: "♛",
        K: "♚"
    }

    return unicodes[piece.type] || ""
}

const Over = () =>{
    let check = chess.in_checkmate()
    if (check) {
        alert("Check")
    }
}

socket.on("Role", (role) => {
    Role = role
    renderBoard()
})

socket.on("SpecRole", () => {
    Role = null
    renderBoard()
})

socket.on("boardState", (fen) => {
    chess.load(fen)
    renderBoard()
})

socket.on("move", (move) => {
    chess.move(move)
    renderBoard()
})

renderBoard()