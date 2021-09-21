const fetch = require("node-fetch");
const config = require("config");
const Message = require("../models/message");
const Statement = require("../models/statement");
const User = require("../models/user");
const { getStatements } = require("./statement");

module.exports = {
  send: async (req, res) => {
    try {
      const statement = await Statement.findOne({ _id: req.body.statementId });

      if (!statement) {
        return res.status(400).json({ error: "Заявление не существует" });
      }

      const user = await User.findOne({ _id: req.body.to });

      if (!user) {
        return res.status(400).json({ error: "Пользователь не существует" });
      }

      let message = new Message({
        owner: req.user.userId,
        to: req.body.to,
        message: req.body.message,
        statement: req.body.statementId,
      });

      statement.status = "completed";
      statement.reply = message._id;
      user.incomingMessages.push(message._id);

      await message.save();
      await statement.save();
      await user.save();

      message = await Message.populate(message, [
        {
          path: "statement",
          select: "theme",
        },
        {
          path: "owner",
          select: "name",
        },
      ]);

      console.log(message);

      req.app.get("socketService").emiter("message:new", user.phone, message);

      const response = await fetch(process.env.URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: process.env.LOGIN,
          pwd: process.env.PASSWORD,
          CgPN: process.env.CGPN,
          CdPN: user.phone,
          text: `
На ваше заявление ответили.
Тема: ${statement.theme}
Войдите в систему что-бы прочитать сообщение
          `,
        }),
      });
      const result = await response.json();
      if (result.query_code !== 200) {
        return res.status(401).json({ error: result.query_state });
      }

      res.status(201).json({ message: "Сообщение отправлено" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
  getMessages: async (req, res) => {
    try {
      const messages = await Message.find({ to: req.user.userId })
        .sort([["createdAt", "desc"]])
        .populate("statement", "theme")
        .populate("owner", "name");

      res.json(messages);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getMessageById: async (req, res) => {
    try {
      const message = await Message.findOne({ _id: req.params.id })
        .populate("statement", "theme")
        .populate("owner", "name email");

      res.json(message);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
