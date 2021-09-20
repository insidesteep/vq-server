const { Router } = require("express");
const { downloadFile } = require("../controllers/file");
const auth = require("../middlewares/auth");

const router = Router();

router.get("/download/:id", auth, downloadFile);

module.exports = router;
