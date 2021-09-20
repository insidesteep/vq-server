const socketIo = require("socket.io");

const ids = {};

class SocketService {
  constructor(server) {
    this.io = socketIo(server, { cors: { origin: "*" } });
    this.io.on("connect", (socket) => {
      console.log("user connected");
      socket.on("user:connected", (user) => {
        console.log("user", user);
        console.log("socket", socket.id);
        ids[user.phone] = socket.id;
      });
    });
  }

  emiter(event, userPhone, body) {
    if (body) this.io.to(ids[userPhone]).emit(event, body);
  }
}

module.exports = SocketService;
