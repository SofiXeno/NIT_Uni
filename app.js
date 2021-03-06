const express = require('express');
const app = express();
const hash = require('password-hash');
let online = 0;

let xss = require('xss');

//set the template engine ejs
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index')
});
// const b = 44;

server = app.listen(4000);


//socket.io instantiation
const io = require("socket.io")(server);

const mysql = require("mysql");

const mysql_connection = mysql.createConnection({
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b5fa048bf259db',
    password: '39864794',
    database: 'heroku_cb66a8c29e3eeb5',

});
mysql_connection.connect(function (err) {
    if (err) {
        console.log("SQL not connected")
    } else {
        console.log("SQL connected!")
    }
});
setInterval(() => {
    mysql_connection.query('SELECT 1', (error) => {
        if (error) throw error
    })
}, 50000);

function removeXss(string) {
    return xss(string)
}

//listen on every connection
io.on('connection', (socket) => {
    online++;

    io.sockets.emit('online_changed', {online: online});

    console.log('New user connected');

    socket.username = "Anonymous";

    //listen on change_username.
    socket.on('change_user', (data) => {
        data.username = removeXss(data.username);
        data.password = removeXss(data.password);
        if (data.password === undefined || data.username === undefined || data.password.length === 0 || data.username.length === 0)
            return;
        verifyUser(data, socket)

    });

    //listen on new_message
    socket.on('new_message', (data) => {
        data.message = removeXss(data.message);

        //broadcast the new message
        data.username = socket.username;
        addMessageToDB(data, socket)
    });


    socket.on('disconnect', (socket) => {
        online--;
        console.log('USER DISCONNECTED');
        io.sockets.emit('online_changed', {online: online})

    });

    socket.on('delete', (id) => {
        console.log(id);
        mysql_connection.query('DELETE FROM `ChatDB`  WHERE id = ?', [id], (err, res) => {
            io.sockets.emit('message_deleted', id);
        })

    });

    showMessages(socket)

});

function showMessages(socket) {
    mysql_connection.query(
        'SELECT * FROM ChatDB',
        [],
        (error, row) => {
            if (row !== undefined) {
                for (let i = 0; i < row.length; ++i)
                    socket.emit('new_message', {
                        message: row[i].message,
                        time: row[i].time,
                        username: row[i].username,
                        id: row[i].id
                    })
            }
        }
    );
}

//const a = 0;


function registerNewUser(data, socket) {
    mysql_connection.query(
        "INSERT INTO `UserDB` VALUES (?, ?, ?)",
        [data.username, hash.generate(data.password), 0],
        () => {
            console.log(data.username + " is now registered!");
            socket.username = data.username
        }
    )
}

function verifyUser(data, socket) {
    mysql_connection.query(
        'SELECT * FROM `UserDB` u WHERE u.username = ?',
        [data.username],
        (error, row) => {
            console.log(row);
            if (typeof row !== "undefined" && row.length != 0) {
                let res = row[0];
                if (!hash.verify(data.password, res.password)) {
                    console.log("incorrect password");
                } else {
                    console.log("user is connected");
                    socket.username = data.username;
                    socket.role = res.role;
                    socket.emit("admin", data.username === "ADMIN")
                }
            } else {
                console.log("creating new user");
                registerNewUser(data, socket);
            }
        }
    );
}

function addMessageToDB(data) {
    console.log(data);
    mysql_connection.query("INSERT INTO ChatDB (username, time, message) VALUES (?, ?, ?)", [data.username, data.time, data.message],
        (err, res) => {
            console.log(res);
            if (typeof res !== "undefined") {
                data.id = res.insertId;
                data.role = data.username === "ADMIN";
                io.sockets.emit("new_message", data);
            }
        });

}



