const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const { validationResult } = require("express-validator");

const User = require("../models/user");

module.exports = {
  authorization: async (req, res) => {
    const user = await User.findOne({ _id: req.user.userId }).populate(
      "statements"
    );

    let pendingQauntity = user.statements.filter(
      (st) => st.status === "pending"
    ).length;
    let completedQauntity = user.statements.filter(
      (st) => st.status === "completed"
    ).length;
    let allQuantity = user.statements.length;

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET_TOKEN,
      {
        expiresIn: "2h",
      }
    );

    res.json({
      user: {
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        _id: user._id,
        phone: user.phone,
        email: user.email,
        isLockProfile: user.isLockProfile,
        statusQuantity: {
          pending: pendingQauntity,
          all: allQuantity,
          completed: completedQauntity,
        },
      },
      token,
    });
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const user = await User.findOne({ email }).populate({
        path: "statements",
        select: "createdAt status message theme",
      });

      if (!user) {
        return res
          .status(400)
          .json({ error: "Такой пользователь не существует!" });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(400).json({ error: "Пароль неверный!" });
      }
      const token = jwt.sign(
        { userId: user._id, phone: user.phone },
        process.env.JWT_SECRET_TOKEN,
        {
          expiresIn: "2h",
        }
      );

      let pendingQauntity = user.statements.filter(
        (st) => st.status === "pending"
      ).length;
      let completedQauntity = user.statements.filter(
        (st) => st.status === "completed"
      ).length;
      let allQuantity = user.statements.length;

      res.json({
        user: {
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          _id: user._id,
          phone: user.phone,
          email: user.email,
          isLockProfile: user.isLockProfile,
          statusQuantity: {
            pending: pendingQauntity,
            all: allQuantity,
            completed: completedQauntity,
          },
        },
        token,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  unlockProfile: async (req, res) => {
    const { password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      if (!req.headers.authorization) {
        return res.status(401).json("Не найден токен!");
      }

      const token = req.headers.authorization.split(" ")[1];

      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

      if (!verifiedToken) {
        return res.status(401).json("Вы не зарегистрированы!");
      }

      const user = await User.findById(verifiedToken.userId);

      if (!user) {
        return res.status(400).json("Пользователь не найден!");
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(400).json({ error: "Пароль неверный!" });
      }

      user.isLockProfile = false;
      await user.save();

      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  lockProfile: async (req, res) => {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json("Не найден токен!");
      }

      const token = req.headers.authorization.split(" ")[1];

      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

      if (!verifiedToken) {
        return res.status(401).json("Вы не зарегистрированы!");
      }

      const user = await User.findById(verifiedToken.userId);

      if (!user) {
        return res.status(400).json("Пользователь не найден!");
      }

      user.isLockProfile = true;
      await user.save();

      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
