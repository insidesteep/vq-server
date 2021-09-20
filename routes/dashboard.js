const { Router } = require("express");

const { getStatementsInfo } = require("../controllers/dashboard");
const auth = require("../middlewares/auth");

const router = Router();

router.get("/statements-info", auth, getStatementsInfo);

module.exports = router;
