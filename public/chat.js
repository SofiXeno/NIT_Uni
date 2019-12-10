$(function () {
    //make connection
    var socket = io.connect('http://localhost:4000')

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
    send_message.click(function () {
        socket.emit('new_message', {message: message.val(), time: time()})
        message.val('');
    })

    //Listen on new_message
    socket.on("new_message", (data) => {
        feedback.html('')
        console.log(data)
        console.log(data.username)
        chatroom.append("<div class='message' id='message" + data.id + "'>" + data.username + " ( " + data.time + " )" + " ~ " + "<br>" + data.message + "<div class= 'close-window' id = 'delmes" + data.id + "' >+</div></div>")
        let del = $('#delmes' + data.id);
        del.click(function () {
            console.log('clicked')
            socket.emit('delete', data.id)
        })
        data.role ? del.css('display', 'inline-block') : del.css('display', 'none')
    })

    //Emit a username
    send_password.click(function () {
        socket.emit('change_user', {username: username.val(), password: password.val()})
        username.val("")
        password.val("")
    })


    socket.on('online_changed', (data) => {
        $('#online_users').html("Online users: " + data.online);
    })

    socket.on('message_deleted', (id) => {
        $('#message' + id).remove()
    })

    socket.on('admin', (data) => {
        (data) ? $('.close-window').css("display", "inline-block") : $('.close-window').css("display", "none")

        // if (data) $('.close-window').css("display" ,"inline-block")
        // else $('.close-window').css("display" ,"none")
    })


});