const express = require("express");
const { copySync } = require("fs-extra");
const router = express.Router();
const user = require("../database/models/user");

//DataPerHour
router.get(
  "/autoVMI/:selectDate/:model/:process/:productionline",
  async (req, res) => {
    try {
      const { selectDate, model, process, productionline } = req.params;

      let result = await user.sequelize
        .query(`select convert(Date,[TimeStamp]) as [Date],[Model],[Line],[Status],count([Status]) as [Count],[Process]
      FROM [KeepPicture].[dbo].[Imagedata]
      where [Model] = '${model}' 
      and [Line] = '${productionline}'
      and convert(Date,[TimeStamp]) = '${selectDate}' 
      and [Process] = '${process}'
      group by convert(Date,[TimeStamp]),[Model],[Line],[Status],[Process]
      order by convert(Date,[TimeStamp]),[Model],[Line]`);

      let Process = [];
      let Status = [];
      let Count = [];

      result[0].forEach(async (item) => {
        await Process.push(item.Process);
        await Status.push(item.Status);
        await Count.push(item.Count);
      });

      let series = { name: "Count", data: Count, title: Process };
      let seriesY = [series];

      res.json({
        result: result[0],
        seriesY: seriesY[0],
        api_result: "ok",
      });
    } catch (error) {
      console.log(error);
      res.json({
        error,
        api_result: "nok",
      });
    }
  }
);

// DataPerDay
router.get(
  "/autoVMIDay/:startDate/:finishDate/:model/:process/:productionline",
  async (req, res) => {
    try {
      const { selectDate, finishDate, model, process, productionline } =
        req.params;

      let resultAVG = await user.sequelize
        .query(`select convert(Date,[TimeStamp]) as [Date],[Model],[Line],[Status],count([Status]) as [Count],[Process]
      FROM [KeepPicture].[dbo].[Imagedata]
      where [Model] = '${model}' 
      and [Line] = '${productionline}'
      and convert(Date,[TimeStamp]) between '${selectDate}' and '${finishDate}'
      and [Process] = '${process}'
      group by convert(Date,[TimeStamp]),[Model],[Line],[Status],[Process]
      order by convert(Date,[TimeStamp]),[Model],[Line]`);

      res.json({
        resultAVG: resultAVG[0],
        api_result: "ok",
      });
    } catch (error) {
      console.log(error);
      res.json({
        error,
        api_result: "nok",
      });
    }
  }
);

// Select Criteria Motor
router.get("/VMIModel", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Model]
    FROM [KeepPicture].[dbo].[Imagedata]
    order by [Model]`);
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
router.get("/VMILine/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`select distinct [Model],[Line]
    FROM [KeepPicture].[dbo].[Imagedata]
    where [Model] = '${myModel}'`);
    // console.log(result);

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
router.get("/VMIProcess/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`select distinct [Process]
    FROM [KeepPicture].[dbo].[Imagedata]
    where [Model] = '${myModel}'`);
    // console.log(result);
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
