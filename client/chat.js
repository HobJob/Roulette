var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
var EverChatSow;

$("#chat-input").focus(function() {
  if (EverChatSow == 1) {
    chatText.style.display = "inline-block";
  }

}).blur(function() {
  chatText.style.display = "none";
});


socket.on('addToChat', function(data) {

  if (data.admin === true) {
    chatText.innerHTML += '<div id = "Comment" name="admin" style ="color:' + data.color + '">' + data.message + '</div>';

  } else {
    var divisios = [];
    var numberN = 0;
    for (var i = data.message.length / 40; i >= 0; i--) {
      chatText.innerHTML += '<div id = "Comment" style ="color:' + data.color + '">' + data.message.slice(numberN, numberN + 40) + '</div>';
      numberN += 40;
    }
  }

  chatText.scrollTop = chatText.scrollHeight;
});

chatForm.onsubmit = function(e) {
  EverChatSow = 1;
  e.preventDefault();

  if (chatInput.value[0] === '@') {

    if (chatInput.value.indexOf(",") !== -1) {
      if (chatInput.value.slice(1, chatInput.value.indexOf(',')) !== Player.list[selfId].name) {

        socket.emit('sendPmToServer', {
          username: chatInput.value.slice(1, chatInput.value.indexOf(',')),
          message: chatInput.value.slice(chatInput.value.indexOf(',') + 1),
        });

      } else {
        chatText.innerHTML += '<div style ="color:#000000">Que solo estas...</div>';
      }

    } else {
      chatText.innerHTML += '<div style ="color:#000000">Error, La sintaxis requiere @USERNAME,MESSAGE</div>';
    }

  } else {
    socket.emit('sendMsgToServer', chatInput.value);
  }
  chatInput.value = '';
}