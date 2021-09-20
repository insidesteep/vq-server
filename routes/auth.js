const { Router } = require("express");
const { check } = require("express-validator");

const { authorization, login, unlockProfile, lockProfile } = require("../controllers/auth");
const auth = require("../middlewares/auth");

const router = Router();

router.get("/", auth, authorization);

router.post(
  "/login",
  [
    check("email", "Электронная почта не должна быть пустым!")
      .isEmail()
      .withMessage("Некорректная электронная почта!"),
    check("password", "Пароль должен быть пустым!")
      .isLength({ min: 6 })
      .withMessage("Пароль должен состоять минимум из 6 символов!"),
  ],
  login
);

router.get("/lock-profile", lockProfile);

router.post(
  "/unlock-profile",
  [
    check("password", "Пароль должен быть пустым!")
      .isLength({ min: 6 })
      .withMessage("Пароль должен состоять минимум из 6 символов!"),
  ],
  unlockProfile
);

module.exports = router;
