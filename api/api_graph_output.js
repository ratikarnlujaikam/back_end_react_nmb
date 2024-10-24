const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const moment = require('moment');
const { QueryTypes } = require('sequelize');
router.get("/Line", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
    SELECT DISTINCT REPLACE( [Line]+' : '+[Model], '/', '_') as [year]
    FROM [Setlot].[dbo].[This_Tactime]
    `);

    // Extract the result array from the query result
    let years = result[0];

    // Sort the array based on the 'year' property
    years.sort((a, b) => a.year.localeCompare(b.year));

    res.json({
      result: years,
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


router.get("/LARPP/:year/:start", async (req, res) => {
  try {
    var result = [[]];
    const { year,start } = req.params;
   
    const Line = year.replace('_', '/');
    const Line_split = year.split(':').map(part => part.trim()).filter(part => part !== "")[0];
    var adjustedDate = start;
    var currentDateTime = moment();
    var startDate = moment(start);

    // Check if the start date is today
    if (startDate.isSame(currentDateTime, 'day')) {
      // Check if the current time is between 0:00 and 7:00 AM
      if (currentDateTime.hour() >= 0 && currentDateTime.hour() < 6) {
        adjustedDate = startDate.subtract(1, 'days').format('YYYY-MM-DD');
        var oee = await user.sequelize.query(`
          SELECT [Quality]
          ,[Performance]
          ,[Availability]
          ,[OEE]
          ,'${adjustedDate}' as MfgDate
      FROM [Oneday_ReadtimeData].[dbo].[OEE_MfgDate]
      where [Line]like '%${Line_split}%' 
      and [MfgDate] = '${adjustedDate}'`)
      console.log("adjustedDate",adjustedDate);
      } else {
        var oee = await user.sequelize.query(`
              exec [Oneday_ReadtimeData].[dbo].[OEE_MfgDate_daily] '${Line_split}'`)
      }
    } else {
      adjustedDate = startDate.format('YYYY-MM-DD');
      var oee = await user.sequelize.query(` 
        SELECT [Quality]
          ,[Performance]
          ,[Availability]
          ,[OEE]
          ,'${adjustedDate}' as MfgDate
      FROM [Oneday_ReadtimeData].[dbo].[OEE_MfgDate]
      where [Line]like '%${Line_split}%' 
      and [MfgDate] = '${adjustedDate}'`)
    }

  

    var result = await user.sequelize.query(`
    --Plan_Actual_Diff--
    SELECT  sum([Actual]) as Actual,
	  sum([Plan]) as Plan_1,
	  (sum([Actual]))-(sum([Plan])) as diff

  FROM
	  [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  WHERE
	  [Line] like '${Line}%'
	  --AND [MfgDate] = CONVERT(DATE, GETDATE())
    and [MfgDate] = '${start}'`);

    var resultGraph = await user.sequelize.query(`
      exec [Setlot].[dbo].[call_Dashboard_webI4] '${start}','${Line_split}'`);

    var result_Operating = await user.sequelize.query(`


    exec [Oneday_ReadtimeData].[dbo].[OEE_percentage_Line2] '${start}','${Line_split}'

   
`);

var result_Pie = await user.sequelize.query(`
    exec [Setlot].[dbo].[call_Dashboard_Pie] '${start}','${Line_split}'
`);

    // แกน  y

    let Actual = [];
    let diff = [];
    let Plan = [];
    let Accum_Actual = [];
    let Accum_Plan = [];
    let Yield = [];
    let MC_Downtime = [];
    let Loss_PF = [];
    let Losstime = [];
    let CT_Loss = [];
    let CKT = [];

    resultGraph[0].forEach((item) => {
      Actual.push(item.Actual);
      diff.push(item.diff);
      Accum_Actual.push(item.Accum_Actual);
      Accum_Plan.push(item.Accum_Plan);
      Plan.push(item.Plan);
      Yield.push(item.NG);
      MC_Downtime.push(item.DT);
      Loss_PF.push(item.Loss_PF);
      Losstime.push(item.Losstime);
      CT_Loss.push(item.CT_Loss);
      CKT.push(item.CKT);
 
    });

    let Plan_Percentage = [];
    let NG_Percentage = [];
    let DT_Percentage = [];
    let CKT_Percentage = [];
    let Losstime_Percentage = [];
    let CTLoss_Percentage = [];

    result_Operating[0].forEach((item) => {
      Plan_Percentage.push(item.Plan_Percentage);
      NG_Percentage.push(item.NG_Percentage);
      DT_Percentage.push(item.DT_Percentage);
      CKT_Percentage.push(item.CKT_Percentage);
      Losstime_Percentage.push(item.Losstime_Percentage);
      CTLoss_Percentage.push(item.CTLoss_Percentage);
    });
    console.log(Plan_Percentage);
    console.log(NG_Percentage);
    console.log(DT_Percentage);
    console.log(CKT_Percentage);

    

    let NG_Pie = [];
    let DT_Pie = [];
    let CKT_Pie = [];
    let CTLoss_Pie = [];
    let Losstime_Pie = [];

    result_Pie[0].forEach((item) => {
      NG_Pie.push(item.NG_Pie);
      DT_Pie.push(item.DT_Pie);
      CKT_Pie.push(item.CKT_Pie);
      CTLoss_Pie.push(item.CTLoss_Pie);
      Losstime_Pie.push(item.Losstime_Pie);
    });



    var result_shift = await user.sequelize.query(`

    SELECT
    'A'  as shift_all,
    sum([Actual]) as Actual,
    sum([Plan]) as [Plan],
    sum([diff]) as [diff]
  FROM
    [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  WHERE
    [Line] like '${Line_split}%'
    AND [Hour] BETWEEN '*07' AND '*14'
    and [MfgDate] = '${start}'
  GROUP BY
    [Line]
    union all
    SELECT
    'B'  as Shift_all,
    sum([Actual]) as Actual,
    sum([Plan]) as [Plan],
    sum([diff]) as [diff]
  
  FROM
    [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  WHERE
    [Line] like '${Line_split}%'
    AND [Hour] BETWEEN '*15' AND '*22'
    and [MfgDate] = '${start}'
  
    union all
    SELECT
    'C'  as Shift_all,
    sum([Actual]) as Actual,
    sum([Plan]) as [Plan],
    sum([diff]) as [diff]
  
  FROM
    [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  WHERE
    [Line] like '${Line_split}%'
    AND [Hour] BETWEEN '*23' AND '06'
    and [MfgDate] = '${start}'
  
  union all
  
    SELECT
      'M'  as Shift_all,
    sum([Actual]) as Actual,
    sum([Plan]) as [Plan],
    sum([diff]) as [diff]
  FROM
    [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  WHERE
    [Line] like '${Line_split}%'
    AND [Hour] BETWEEN '*07' AND '*18'
    and [MfgDate] = '${start}'
    UNION ALL
    SELECT
     'N'  as Shift_all,
    sum([Actual]) as Actual,
    sum([Plan]) as [Plan],
    sum([diff]) as [diff]
  FROM
    [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  WHERE
    [Line] like '${Line_split}%'
    AND [Hour] BETWEEN '*19' AND '06'
    and [MfgDate] = '${start}'  
`);

let shift_all = [];
let Actual_shift = [];
let Plan_shift = [];
let diff_shift = [];

result_shift[0].forEach((item) => {
 
  shift_all.push(item.shift_all);
  Actual_shift.push(item.Actual);
  Plan_shift.push(item.Plan);
  diff_shift.push(item.diff);
});
console.log("Shift_all",shift_all);
console.log("Actual_shift",Actual_shift);
console.log("Plan_shift",Plan_shift);
console.log("diff_shift",diff_shift);


    var listRawData = [];
    listRawData.push(result[0]);

    console.log(listRawData);

    res.json({
      result: result[0],
      oee: oee[0],
      resultGraph: resultGraph[0],
      result_Operating: result_Operating[0],
      result_Pie: result_Pie[0],
      result_shift: result_shift[0],
      listRawData,
      Actual,
      Accum_Plan,
      Accum_Actual,
      Plan,
      diff,
      Yield ,
      MC_Downtime ,
      Loss_PF ,
      Losstime,
      CT_Loss ,
      Loss_PF ,
      shift_all,
      Actual_shift,
      Plan_shift,
      diff_shift,
      CKT,

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
