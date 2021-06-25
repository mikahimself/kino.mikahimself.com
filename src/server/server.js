const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Test</h1>');
});

server.listen(3030, () => {
    console.log('Server listening on *:3030');
})

io.on("connection", (socket) => {
    console.log("user connected: " + socket.id);
})
