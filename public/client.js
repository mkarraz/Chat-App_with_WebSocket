const socket = io();

const totalClients = document.querySelector("#clients-total");
const messageContainer = document.querySelector("#message-container");
const nameInput = document.querySelector("#name-input");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");

const messageTone = new Audio("./message-tone.mp3");

const sendMessage = () => {
  if (messageInput.value === "") return;
  const data = {
    senderName: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit("client:message", data);
  renderMessages(true, data);
};

const scrollToBottom = () => {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
};

const renderMessages = (isOwnMessage, data) => {
  clearFeedback();
  const htmlElement = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
        <p class="message">
            ${data.message}
            <span>${data.senderName} 🔵 ${moment(
    data.dateTime
  ).fromNow()}</span>
        </p>
    </li>
    `;

  messageContainer.innerHTML += htmlElement;
  scrollToBottom();
};

const clearFeedback = () => {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
};

const renderFeedback = (data) => {
  clearFeedback();
  const htmlElement = `
  <li class="message-feedback">
    <p class="feedback" id="feedback">${data.feedback}</p>
  </li>`;

  messageContainer.innerHTML += htmlElement;
};

/* EVENT LISTENER */
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();

  messageInput.value = "";
  messageTone.play();
});

messageInput.addEventListener("keypress", (event) => {
  if (messageInput.value === "") {
    socket.emit("feedback", {
      feedback: "",
    });
  } else {
    socket.emit("feedback", {
      feedback: `✍ ${nameInput.value} is typing a message...`,
    });
  }
});

/* SERVER LISTENER */
socket.on("clients-total", (data) => {
  totalClients.innerHTML = `Total Clients: ${data}`;
});

socket.on("chat-message", (data) => {
  renderMessages(false, data);
});

socket.on("feedback-message", (data) => {
  renderFeedback(data);
});
