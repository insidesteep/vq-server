const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();

const SocketService = require("./utils/socketService");

const http = require("http");
const server = http.createServer(app);
// const io = require("socket.io")(server, {
//   cors: {
//     origin: "*",
//   },
// });

const connectDB = require("./utils/connectDB");
const { send } = require("./controllers/message");
// const messagebird = require('messagebird')('ICOFjxyEoa03WkeDAvtPg4NzC')

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/statements", require("./routes/statement"));
app.use("/api/users", require("./routes/user"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sms", require("./routes/sms"));
app.use("/api/messages", require("./routes/message"));
app.use("/api/files", require("./routes/file"));

app.set("socketService", new SocketService(server));

app.get("/", (req, res) => {
  res.send(5555);
});

server.listen(5000, () => {
  try {
    console.log("Сервер запущен...");
  } catch (err) {
    console.log(err);
  }
});
