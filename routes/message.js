const { body } = require("express-validator");

const { Router } = require("express");

const {
  send,
  getMessages,
  getMessageById,
  getNewMessages,
} = require("../controllers/message");
const auth = require("../middlewares/auth");
const validator = require("../middlewares/validator");

const router = Router();

router.post(
  "/send",
  auth,
  [
    body("to").not().isEmpty().withMessage("Поле 'to' не должно быть пустым!"),
    body("statementId")
      .not()
      .isEmpty()
      .withMessage("Поле 'statementId' не должно быть пустым!"),
    body("message")
      .not()
      .isEmpty()
      .withMessage("Поле 'message' не должно быть пустым!"),
  ],
  validator,
  send
);

router.get("/", auth, getMessages);
router.get("/new", auth, getNewMessages);
router.get("/:id", auth, getMessageById);

module.exports = router;
