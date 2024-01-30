const express = require("express");
const router = express.Router();
const user = require("../database/models/user");



router.get(
  "/Dimension_WR",
  async (req, res) => {
    try {
      var result = [[]];
        var result = await user.sequelize.query(`
        SELECT DISTINCT
        [Date],
        [Line],
        [Dimension_WR].[Model],
        [IP],
        [Dimension_WR].[Machine_no],
        [Master_MC].Machine_No AS [Master_MC],
        CASE WHEN [Dimension_WR].[Machine_no] = [Master_MC].Machine_No THEN 'OK'
      WHEN [Master_MC].Machine_No is null THEN 'Not Master'
        ELSE 'NO' END AS MC
    FROM [DataforAnalysis].[dbo].[Dimension_WR]
    LEFT JOIN [DataforAnalysis].[dbo].[Master_MC]
      ON [Master_MC].Line_No_WR = [Dimension_WR].Line
      AND [Master_MC].[Model] = [Dimension_WR].[Model]
    ORDER BY [Date] DESC, [Master_MC].Machine_No;
`);

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
  }
);
router.get(
  "/Dynamic_Parallelism_Tester",
  async (req, res) => {
    try {
      var result = [[]];
        var result = await user.sequelize.query(`
        SELECT [Date]
        ,count([Barcode]) as [Barcode]
        ,[Line]
        ,[Model]
        ,[IP]
      ,[Dynamic_Parallelism_Tester].Machine_no
    FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
    group by 
    [Date]
        ,[Line]
        ,[Model]
        ,[IP]
    ,[Dynamic_Parallelism_Tester].Machine_no
  order by [Date] desc,count([Barcode]),[Model]

`);

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
  }
);

router.get(
  "/EWMS",
  async (req, res) => {
    try {
      var result = [[]];
        var result = await user.sequelize.query(`
        SELECT [Machine_no]
        ,Date
          ,count([Barcode]) as [Barcode]
          ,[Model]
          ,[Line]
          ,[IP]
      FROM [DataforAnalysis].[dbo].[EWMS]
      group by [Machine_no],[Model],[Line],[IP],Date
      order by Date desc ,count([Barcode])

`);

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
  }
);

router.get(
  "/Hipot",
  async (req, res) => {
    try {
      var result = [[]];
        var result = await user.sequelize.query(`
        SELECT DISTINCT
        count([Hipot_test].Barcode) as Barcode,
          [Date],
          [Line],
          [Hipot_test].[Model],
          [IP],
          [Hipot_test].[Machine_no]
      FROM [DataforAnalysis].[dbo].[Hipot_test]
      group by  [Date],
          [Line],
          [Hipot_test].[Model],
          [IP],
          [Hipot_test].[Machine_no]
      ORDER BY [Date] DESC;

`);

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
  }
);


module.exports = router;
