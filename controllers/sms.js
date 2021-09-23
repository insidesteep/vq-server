const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const config = require("config");
const generator = require("generate-password");

const User = require("../models/user");
const Statement = require("../models/statement");
const File = require("../models/file");

module.exports = {
  verify: async (req, res) => {
    try {
      const user = await User.findOne({
        $or: [{ phone: req.body.recipient }, { email: req.body.email }],
      });

      if (user) {
        return res.status(400).json({
          error:
            "Пользователь с такой электронной почтой или телефонным номером существует. Войдите в аккаунт чтобы продолжить",
        });
      }

      const newFile = new File({
        name: req.files,
      });

      crypto.randomBytes(3, async function (err, buffer) {
        const num_6d = parseInt(buffer.toString("hex"), 16)
          .toString()
          .substr(0, 5);
        const hashedNum_6d = await bcrypt.hash(num_6d, 10);

        const tokenData = { ...req.body, hashedNum_6d };

        if (req.files && req.files.length > 0) {
          tokenData.files = req.files;
        }

        const smsToken = jwt.sign(
          { data: tokenData },
          process.env.JWT_SECRET_TOKEN,
          {
            expiresIn: 2 * 60,
          }
        );

        console.log({
          login: process.env.LOGIN,
          pwd: process.env.PASSWORD,
          CgPN: process.env.CGPN,
          CdPN: req.body.recipient,
          text: `Подтвердите код: ${num_6d}`,
        });
        const response = await fetch(process.env.URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login: process.env.LOGIN,
            pwd: process.env.PASSWORD,
            CgPN: process.env.CGPN,
            CdPN: req.body.recipient,
            text: `Подтвердите код: ${num_6d}`,
          }),
        });
        const result = await response.json();

        if (result.query_code !== 200) {
          return res.status(401).json({ error: result.query_state });
        }

        res.json({
          smsToken,
          recipient: req.body.recipient,
        });
      });
      // if (!token) {
      //   return res.status(400).json({ error: "Не найден токен" });
      // }
      // const verifiedUser = jwt.verify(token, process.env.JWT_SECRET_TOKEN"));
      // if (!verifiedUser) {
      //   return res.status(400).json({ error: "Некорректный токен" });
      // }
      // if (!verifyCode) {
      //   return res.status(400).json({ error: "Не найден код подтверждения" });
      // }
      // const user = await User.findOne({ phone: recipient });
      // if (!user) {
      //   return res.status(400).json({ error: "Пользователь не найден" });
      // }
      // const validVeifyCode = await bcrypt.compare(verifyCode, user.verifyCode);
      // if (!validVeifyCode) {
      //   return res
      //     .status(400)
      //     .json({ error: "Введён не правильный код подтверждения" });
      // }
      // const response = await fetch(process.env.SMS.URL"), {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     login: process.env.SMS.LOGIN"),
      //     pwd: process.env.SMS.PASSWORD"),
      //     CgPN: process.env.SMS.CGPN"),
      //     CdPN: recipient,
      //     text: `Bla bla bla`,
      //   }),
      // });
      // const result = await response.json();
      // if (result.query_code !== 200) {
      //   return res.status(400).json({ error: result.query_state });
      // }
      // res.json({ message: "OK" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
    // messagebird.verify.verify(id, token, function (err, response) {
    //   if (err) {
    //     console.log(err);
    //     return res.status(400).json({ err });
    //   }
    //   console.log(response);
    //   res.json({ message: "ok" });
    // });
  },
  sendCode: async (req, res) => {
    if (!req.data) {
      res.status("Не правильный запрос");
    }

    const {
      name,
      email,
      leader,
      address,
      recipient,
      theme,
      message,
      hashedNum_6d,
    } = req.data;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          name,
          email,
          address,
          phone: recipient,
        });
      }

      const files = [];

      if (req.data.files) {
        req.data.files.forEach((file) =>
          files.push(
            new File({
              name: file.filename,
              originalName: file.originalname,
              type: file.filename.split(".").pop(),
              size: file.size,
              owner: user._id,
              path: file.path,
            })
          )
        );
      }

      const isSMSCompared = await bcrypt.compare(
        req.body.smsCode,
        hashedNum_6d
      );

      if (!isSMSCompared) {
        return res.status(400).json({ error: "Не правильный код" });
      }

      const password = generator.generate({
        length: 10,
        numbers: true,
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newStatement = new Statement({
        theme,
        message,
        responsiblePerson: leader,
        owner: user._id,
      });

      const ldr = await User.findOne({ _id: leader });

      if (!ldr) {
        return res.status(400).json({ error: "Не найдено руководство" });
      }

      if (ldr.clients.indexOf(user._id) === -1) {
        ldr.clients.push(user._id);
      }

      const idFiles = files.map((file) => file._id);

      user.password = hashedPassword;
      user.statements.push(newStatement._id);
      user.files.push(...idFiles);
      newStatement.files.push(...idFiles);

      files.forEach(async (file) => await file.save());
      await user.save();
      await newStatement.save();
      await ldr.save();

      req.app.get("socketService").emiter("new statement", {
        owner: {
          _id: user._id,
          name: user.name,
        },
        _id: newStatement._id,
        createdAt: newStatement.createdAt,
        theme: newStatement.theme,
        message: newStatement.message,
        status: newStatement.status,
      });

      console.log("GGG", recipient);
      const response = await fetch(process.env.URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: process.env.LOGIN,
          pwd: process.env.PASSWORD,
          CgPN: process.env.CGPN,
          CdPN: recipient,
          text: `
Ваша заявка принята. 
Войдите в ${process.env.CLIENT_URL} для проверки состояния ваших заявок.

Логин: ${email}
Пароль: ${password} 
          `,
        }),
      });
      const result = await response.json();
      if (result.query_code !== 200) {
        return res.status(401).json({ error: result.query_state });
      }

      res.status(201).json({ message: "Заявление отправлено" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }

    // messagebird.verify.create(recipient, params, function (err, response) {
    //   if (err) {
    //     console.log(err);
    //     return res.status(404).json(err);
    //   }
    //   return res.json({ id: response.id });
    // });
  },
};
