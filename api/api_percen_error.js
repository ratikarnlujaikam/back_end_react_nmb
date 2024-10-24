const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

const user1 = require("../database/models/user_216");

router.get("/LARPP/:startDate", async (req, res) => {
  try {
    const {startDate} = req.params;
    var result = await user.sequelize.query(`
    exec [Machine DownTime].[dbo].[Error_per_day_front]'${startDate}'
  
  
    `);

    const result_1 = await user.sequelize.query(`
  


    exec [Machine DownTime].[dbo].[Error_per_day]'${startDate}'

    `);

    



    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
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
