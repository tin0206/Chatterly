import { createServer } from "node:http"
import next from "next"
import { Server } from "socket.io"

const dev = process.env.NODE_ENV !== "production"

const hostname = process.env.HOSTNAME || "localhost"
const port = parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const httpServer = createServer(handle)
    const io = new Server(httpServer)
    io.on("connection", (socket) => {
        socket.on("join", (userId) => {
            socket.join(userId)
        })

        socket.on("message", ({ senderId, receiverId, message }) => {
            io.to(receiverId).emit("message", {
                senderId,
                receiverId,
                message,
            })

            io.to(senderId).emit("message", {
                senderId,
                receiverId,
                message,
            })
        })
    })

    httpServer.listen(port, () => {
        console.log(`Server running on http://${hostname}:${port}`)
    })
})
