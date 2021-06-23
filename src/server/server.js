const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const ioServer = require('socket.io');
const io = ioServer(server);

app.get('/', (req, res) => {
    res.send('<h1>Test</h1>');
});

server.listen(3030, () => {
    console.log('Server listening on *:3030');
})
