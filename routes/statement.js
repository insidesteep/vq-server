const { Router } = require("express");
const { body } = require("express-validator");

const router = Router();

const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const validator = require("../middlewares/validator");

const {
  create,
  getStatements,
  statementById,
  getUserStatement,
  getMyStatements,
  getNewStatements
} = require("../controllers/statement");

router.post(
  "/create",
  auth,
  upload.array("files"),
  [
    body("leader").not().isEmpty().withMessage("Выберите руководство!"),
    body("theme").not().isEmpty().withMessage("Тема не должна быть пустым!"),
    body("message")
      .not()
      .isEmpty()
      .withMessage("Сообщение не должно быть пустым!"),
  ],
  validator,
  create
);

router.get("/", auth, getStatements);

router.get("/my", auth, getMyStatements);

router.get("/my/:id", auth, getUserStatement);

router.get("/:id", auth, statementById);

router.get("/new", auth, getNewStatements);

module.exports = router;
