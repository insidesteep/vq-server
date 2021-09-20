const Statement = require("../models/statement");

module.exports = {
  getStatementsInfo: async (req, res) => {
    try {
      const statements = await Statement.find({
        responsiblePerson: req.user.userId,
      }).select("status");

      let pendingQauntity = statements.filter(
        (st) => st.status === "pending"
      ).length;
      let completedQauntity = statements.filter(
        (st) => st.status === "completed"
      ).length;
      let newQauntity = statements.filter((st) => st.status === "new").length;
      let allQuantity = statements.length;

      res.json({
        pending: pendingQauntity,
        all: allQuantity,
        completed: completedQauntity,
        new: newQauntity,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
