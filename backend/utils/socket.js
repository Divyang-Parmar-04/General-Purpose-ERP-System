const { Server } = require("socket.io");
const dotenv = require('dotenv')
dotenv.config()

let io;
const userSockets = new Map(); // Store userId -> socketId mapping

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        
        socket.on("register", (userId) => {
            if (userId) {
                const uid = userId.toString();
                userSockets.set(uid, socket.id);
               
            }
        });

        socket.on("disconnect", () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const sendNotification = (userId, data) => {
    if (io) {
        const uid = userId.toString();
        const socketId = userSockets.get(uid);
        if (socketId) {
            io.to(socketId).emit("notification", data);
            return true;
        } else {
        }
    }
    return false;
};

const broadcastToBusiness = (businessId, data) => {
    if (io) {
        io.to(`business_${businessId}`).emit("notification", data);
    }
};

module.exports = { initSocket, getIO, sendNotification, broadcastToBusiness, userSockets };
