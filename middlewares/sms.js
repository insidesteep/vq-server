const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const smsToken = req.headers.authorization.split(" ")[1]; // "Bearer TOKEN"

    if (!smsToken) {
      return res.status(401).json({ message: "Токен не действителен" });
    }

    const decoded = jwt.verify(smsToken, process.env.JWT_SECRET_TOKEN);
    req.data = decoded.data;
    next();
  } catch (e) {
    res.status(401).json({ message: "Токен не действителен" });
  }
};
