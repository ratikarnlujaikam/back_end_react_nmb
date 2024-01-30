
const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/LINE", async (req, res) => {
  
  try {
    let result = await user.sequelize.query(`select distinct [Dynamic_Parallelism_Tester].Line FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
    where  Line != ''`);
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


router.get("/Master/:LINE/:startDate/:finishDate",
async (req, res) => {
  try {
    const { LINE,startDate,finishDate} = req.params;
  let result = await user.sequelize
    .query(`exec [Machine DownTime].[dbo].[trace_Dym] '${LINE}','${startDate}:00','${finishDate}:00'; `);

    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      result: result[0],
      listRawData,
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
