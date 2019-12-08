$(function(){
    //make connection
    var socket = io.connect('http://localhost:3000')

    //buttons and inputs
    var message = $("#message")
    var username = $("#username")
    var password = $("#password")
    var send_message = $("#send_message")
    var send_password = $("#send_password")
    var chatroom = $("#chat_body")
    var feedback = $("#feedback")

    function time() {
        let time = new Date()
        let hrs = time.getHours()
        let min = time.getMinutes()
        let sec = time.getSeconds()
        return (hrs < 10 ? "0" + hrs.toString() : hrs) + ":" + (min < 10 ? "0" + min.toString() : min) + ":" + (sec < 10 ? "0" + sec.toString() : sec)
    }

    //Emit message
    send_message.click(function(){
        socket.emit('new_message', {message : message.val(), time: time()} )
    })

    //Listen on new_message
    socket.on("new_message", (data) => {
        feedback.html('');
        message.val('');
        console.log(data)
        console.log(data.username)
        chatroom.append("<div class='message'>" + data.username +  " ( "+ data.time + " )"+" ~ " + data.message + "</div>")
    })

    //Emit a username
    send_password.click(function(){
        socket.emit('change_user', {username : username.val(), password : password.val()})
        username.val("");
        password.val("");
    })

    //Emit typing
    message.bind("keypress", () => {
        socket.emit('typing')
    })

    //Listen on typing
    socket.on('typing', (data) => {
        feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
    })

    socket.on('online_changed', (data) => {
           $("#online_users").html("Online users: "+ data.online);
    })
});