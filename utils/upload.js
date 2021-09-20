const multer = require("multer");
const moment = require("moment");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let path = `uploads/${req.body.name}`;

    fs.stat(path, function (err) {
      if (err) {
        fs.mkdir(path, function (err) {
          if (err) throw err;
          console.log("Папку создана");
        });
      }

      cb(null, path);
    });
  },
  filename: (req, file, cb) => {
    const date = moment().format("DDMMYYYY-HHmmss_SSS");
    cb(null, `${date}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const FILE_TYPES = [
    "image/jpeg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024,
};

module.exports = multer({
  storage,
  fileFilter,
  limits
});
