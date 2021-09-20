const { validationResult } = require("express-validator");
const fs = require("fs");

const validator = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.files) {
        for (let file of req.files) {
          fs.unlink(file.path, (err) => {
            if (err) {
              res.status(400).send(err);
            }
            console.log(`successfully deleted ${file.path}`);
          });
        }
      }

      return res.status(400).json({ error: errors.array() });
    }

    next();
  } catch (errors) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        res.status(400).send(err);
      }
      console.log(`successfully deleted ${req.file.path}`);
    });
    // return bad request
    res.status(400).send(errors);
  }
};

module.exports = validator;
