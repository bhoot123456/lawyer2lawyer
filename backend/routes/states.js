const router = require("express").Router();
const states = require("../data/states");

router.get("/", (req, res) => {
  res.json({ states });
});

module.exports = router;
