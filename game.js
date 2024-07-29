const Socket = require('socket.io')
const { Chess } = require('chess.js')

let players = {}
let current = "w"
const chess = new Chess()

function Gameon(server){
    const io = Socket(server)

    io.on("connection", (socket) => {
        console.log("connected")
    
        if (!players.white) {
            players.white = socket.id
            socket.emit("Role", "w")
        } else if (!players.black) {
            players.black = socket.id
            socket.emit("Role", "b")
        } else {
            socket.emit("SpecRole")
        }
        socket.on("disconnect", ()=>{
            if(socket.id = players.white){
                delete players.white
            } else if(socket.id = players.black){
                delete players.black
            }
        })
        socket.on("move", (move)=>{
            try {
                if( chess.turn() === "w" && socket.id !== players.white) return
                if( chess.turn() === "b" && socket.id !== players.black) return
    
                const result = chess.move(move)
                if(result){
                    current = chess.turn()
                    io.emit("move", move)
                    io.emit("boardState", chess.fen())
                } else { console.log("Invalid error")
                    socket.emit("Invalid Move", move)
                }
            } catch (err) {console.log(err)}
        })
    })
    return io
}

module.exports = {Gameon}