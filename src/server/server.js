const app = require('express')();
const httpServer = require('http').createServer(app);
const data = require("nedb");
const db = new data({ filename: "kino-reactions"});
db.loadDatabase();

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
        db.find({user: socket.id, "reactions.eventId": eventId }, function(err, docs) {
            if (err) {
                console.log(err);
            } else {
                if (docs.length > 0 ) {
                    console.log("Found: ", docs)
                } else {
                    console.log("Reaction not in db")
                    db.insert({ user: socket.id, reactions: { eventId, reaction }});
                }
            }
        })
    })
})

httpServer.listen(3030, () => {
    console.log('Server listening on *:3030');
})


