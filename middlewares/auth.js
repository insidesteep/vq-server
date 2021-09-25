const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  console.log("www", req.headers.authorization);

  try {
    const token = req.headers.authorization.split(" ")[1]; // "Bearer TOKEN"
    if (!token) {
      return res.status(401).json({ error: "Нет авторизации" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

    console.log(decoded);

    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Нет авторизации" });
  }
};
