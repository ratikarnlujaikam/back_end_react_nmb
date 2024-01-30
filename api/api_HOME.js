const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Status_web", async (req, res) => {
    try {
      let result = await user.sequelize.query(`
      select 'Status_ok' as Status`);
      res.json({
        result: result[0],
        api_result: "ok",
      });
    } catch (error) {
      console.log(error);
      res.json({
        error,
        api_result: "nok",
      });
    }
  });

  module.exports = router;