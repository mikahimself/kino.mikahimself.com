const app = require('express')();
const httpServer = require('http').createServer(app);

const io = require('socket.io')(httpServer, {
    cors: {
        origin: "*"
    }
});


io.on("connection", (socket) => {
    console.log("user connected: " + socket.id);

    socket.on("reaction", (data) => {
        const reaction = data[0];
        const eventName = data[1];
        const eventId = data[2];
        if (reaction === 1) {
            console.log(`User ${socket.id} liked ${eventName} (${eventId})`)
        } else if (reaction === -1) {
            console.log(`User ${socket.id} hated ${eventName} (${eventId})`)
        }
    })
})

httpServer.listen(3030, () => {
    console.log('Server listening on *:3030');
})


