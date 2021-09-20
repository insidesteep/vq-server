const { Router } = require("express");

const { userById, getUsers, getLeaders } = require("../controllers/user");
const auth = require("../middlewares/auth");

const router = Router();

router.get("/leaders", getLeaders);
router.get("/:id", auth, userById);
router.get("/", auth, getUsers);

module.exports = router;
