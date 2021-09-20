const fs = require("fs");
const File = require("../models/file");

module.exports = {
  downloadFile: async (req, res) => {
    try {
      const file = await File.findOne({
        _id: req.params.id,
      });

      if (fs.existsSync(file.path)) {
        return res.download(file.path, file.filename);
      }

      return res.status(400).json({ error: "Download error" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Download error" });
    }
  },
};
