const app = require('express')();
const httpServer = require('http').createServer(app);

const io = require('socket.io')(httpServer, {
    cors: {
        origin: "*"
    }
});


io.on("connection", (socket) => {
    console.log("user connected: " + socket.id);

    socket.on("like", (eventName) => {
        console.log(`User ${socket.id} liked ${eventName}`)
    })
    
    socket.on("hate", (eventName) => {
        console.log(`User ${socket.id} hated ${eventName}`)
    })
})

httpServer.listen(3030, () => {
    console.log('Server listening on *:3030');
})


