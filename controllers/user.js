const User = require("../models/user");

module.exports = {
  userById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findOne({ _id: id }).populate({
        path: "statements",
        model: "Statement",
        match: { responsiblePerson: req.user.userId },
        select: "createdAt status message theme",
      });

      console.log(user.statements);

      let pendingQauntity = user.statements.filter(
        (st) => st.status === "pending"
      ).length;
      let completedQauntity = user.statements.filter(
        (st) => st.status === "completed"
      ).length;
      let allQuantity = user.statements.length;

      res.json({
        user: {
          name: user.name,
          statements: user.statements,
          createdAt: user.createdAt,
          _id: user._id,
          phone: user.phone,
          email: user.email,
          statusQuantity: {
            pending: pendingQauntity,
            all: allQuantity,
            completed: completedQauntity,
          },
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getUsers: async (req, res) => {
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    let filter = {};

    try {
      // const user = await User.find(req.user.userId, filter)
      //   .populate("clients")
      //   .select("clients")
      //   .sort([[sortBy, order]])
      //   .skip(skip)
      //   .limit(limit);
      const user = await User.findOne({ _id: req.user.userId }).populate({
        path: "clients",
        model: "User",
        sort: [[sortBy, order]],
        skip,
        limit,
        populate: {
          path: "statements",
          model: "Statement",
          match: { responsiblePerson: req.user.userId },
        },
      });

      return res.json({ clients: user.clients, size: user.clients.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getLeaders: async (req, res) => {
    console.log("WWWW");
    try {
      const leaders = await User.find({ role: "leader" }, "name");

      res.json({ leaders });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
