import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        socket.on("join-call", (path) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id)
            timeOnline[socket.id] = new Date;

            for (let i = 0; i <= connections[path].length; i++) {
                io.to(connections[path[i]]).emit("user-joined", socket.id, connections[path])
            }
            if (messages[path] !== undefined) {
                for (let i = 0; i <= connections[path].length; ++i) {
                    io.to(socket.id).emit("chat-message", messages[path][i]['data'],
                        messages[path][i]['sender'], messages[path][i]['socekt-id-sender']
                    )
                }
            }
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true]
                    }
                    return [room, isFound]
                }, ['', false])

            if (found == true) {
                if (messages[matchingRoom] == undefined) {
                    messages[matchingRoom] = []
                }
                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", key, ":", sender, data)
                connections[matchingRoom].forEach(element => {
                    io.to(element).emit("chat-message", data, sender, socket.id)
                });
            }
        })

        socket.on("disconnect", () => {
            let diffTime = Math.abs(timeOnline[socket.id] - new Date())
            let key
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let i = 0; i < v.lenght; ++i) {
                    if (v[i] == socket.id) {
                        key = k

                        for (let i = 0; i < connections[key].lenght; ++i) {
                            io.to(connections[key][i].emit("user-left", socket.id))
                        }

                        let index = connections[key].indexOf(socket.id)
                        connections[key].splice(index, 1)

                        if (connections[key], lenght == 0) {
                            delete connections[key]
                        }

                    }
                }
            }
        })
    })

    return io;
}