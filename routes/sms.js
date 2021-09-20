const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const crypto = require("crypto");
const { Router } = require("express");
const { body } = require("express-validator");
const User = require("../models/user");

const validator = require("../middlewares/validator");
const upload = require("../middlewares/upload");
const sms = require("../middlewares/sms");

const router = Router();
const { verify, sendSms } = require("../controllers/sms");

router.post(
  "/verify",
  upload.array("files"),
  [
    body("name").not().isEmpty().withMessage("Ф.И.О не должно быть пустым!"),
    body("email", "Электронная почта не должна быть пустым!")
      .isEmail()
      .withMessage("Некорректная электронная почта!"),
    body("leader").not().isEmpty().withMessage("Выберите руководство!"),
    body("address").not().isEmpty().withMessage("Адрес не должен быть пустым!"),
    body("recipient", "Номер телефона не должен быть пустым!")
      .isLength({ min: 12, max: 12 })
      .withMessage("Номер телефона должен состоять из 12 цифр!"),
    body("theme").not().isEmpty().withMessage("Тема не должна быть пустым!"),
    body("message")
      .not()
      .isEmpty()
      .withMessage("Сообщение не должно быть пустым!"),
  ],
  validator,
  verify
);

router.post("/send-sms", sms, sendSms);

module.exports = router;
