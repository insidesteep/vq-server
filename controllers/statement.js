const generator = require("generate-password");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Statement = require("../models/statement");
const File = require("../models/file");

module.exports = {
  create: async (req, res) => {
    try {
      let user = await User.findOne({ _id: req.user.userId });

      if(req.user.userId == leader){
        return res.status(400).json({error: "Не правильный запрос!"})
      }

      const files = [];

      if (req.files) {
        req.files.forEach((file) =>
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

      const newStatement = new Statement({
        theme: req.body.theme,
        message: req.body.message,
        responsiblePerson: req.body.leader,
        owner: user._id,
      });

      const ldr = await User.findOne({ _id: req.body.leader });

      if (!ldr) {
        return res.status(400).json({ error: "Не найдено руководство" });
      }

      if (ldr.clients.indexOf(user._id) === -1) {
        ldr.clients.push(user._id);
      }

      const idFiles = files.map((file) => file._id);

      user.statements.push(newStatement._id);
      user.files.push(...idFiles);
      newStatement.files.push(...idFiles);

      files.forEach(async (file) => await file.save());
      await user.save();
      await newStatement.save();
      await ldr.save();

      req.app.get("socketService").emiter("statement:new", ldr.phone, {
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

      res.status(201).json(newStatement);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
  getStatements: async (req, res) => {
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";
    const limit = parseInt(req.query.limit) || 6;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    let filter = {};

    if (req.query.filter && req.query.filter !== "all") {
      filter.status = req.query.filter;
    }

    console.log(filter);

    try {
      const statements = await Statement.find({
        responsiblePerson: req.user.userId,
        ...filter,
      })
        .populate({
          path: "owner",
          select: "name",
        })
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit);

      const statementsData = await Statement.find({
        responsiblePerson: req.user.userId,
        ...filter,
      });

      const size = statementsData.length;

      res.json({ statements, size });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getMyStatements: async (req, res) => {
    try {
      const statements = await Statement.find({
        owner: req.user.userId,
      }).sort({ createAt: 1 });

      res.json(statements);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  statementById: async (req, res) => {
    try {
      const { id } = req.params;

      const statement = await Statement.findById(id)
        .populate({
          path: "owner",
          select: "name email",
        })
        .populate("files");

      if (statement.status === "new") {
        statement.status = "pending";
      }

      await statement.save();

      res.json({ statement });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getUserStatement: async (req, res) => {
    try {
      const { id } = req.params;

      const statement = await Statement.findOne({ _id: id })
        .populate("owner", "name")
        .populate("responsiblePerson", "email name")
        .populate("files");

      if (!statement) {
        return res.status(400).json({ error: "Заявление не найдено!" });
      }

      console.log(statement);

      if (req.user.userId != statement.owner._id) {
        return res.status(400).json({ error: "Нет доступа!" });
      }

      res.json(statement);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
