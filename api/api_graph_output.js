const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Line", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
      SELECT DISTINCT REPLACE([Line], '/', '_') AS [year]
      FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr];
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


    var result = await user.sequelize.query(`SELECT  sum([Actual]) as Actual,
	  sum([Plan]) as Plan_1,
	  (sum([Actual]))-(sum([Plan])) as diff

  FROM
	  [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  WHERE
	  [Line] = '${Line}'
	  --AND [MfgDate] = CONVERT(DATE, GETDATE())
    and [MfgDate] = '${start}'`);

    var resultGraph = await user.sequelize.query(`
    SELECT
		  [MfgDate],
		  [Line],
		  [Actual] as Actual,
		  [Plan] ,
		  [diff],
		  [Accum_Actual],
		  [Accum_Plan],
		  [Hour],
		  [Design],
		  [NG],
		  [DT]
	  FROM
		  [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
	  WHERE
		  [Line] = '${Line}'
		  --AND [MfgDate] = CONVERT(DATE, GETDATE())
      and [MfgDate] = '${start}'
	  order by [Hour]`);

    var result_Operating = await user.sequelize.query(`
    WITH sum_Problem AS  
    (
        SELECT
            SUM([Plan]) AS Sum_Plan,
            SUM([diff]) AS PF,
            SUM([NG]) AS NG,
            SUM([DT]) AS [DT]
        FROM
            [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
        WHERE
            [Line] = '${Line}' 
            and [MfgDate] = '${start}'
            --AND [MfgDate] = CONVERT(DATE, GETDATE())
    ),
    set2 AS (
        SELECT 
            Total_Sum_Plan + Total_PF + Total_NG + Total_DT AS Grand_Total
        FROM (
            SELECT 
                SUM(Sum_Plan) AS Total_Sum_Plan,
                SUM(PF) AS Total_PF,
                SUM(NG) AS Total_NG,
                SUM([DT]) AS Total_DT
            FROM sum_Problem
        ) AS TotalSums
    )
    
    SELECT 
        CAST(Sum_Plan AS DECIMAL(10, 1)) / Grand_Total * 100 AS Plen_Percentage,
        CAST(PF AS DECIMAL(10, 1)) / Grand_Total * 100 AS PE_Percentage,
        CAST(NG AS DECIMAL(10, 1)) / Grand_Total * 100 AS NG_Percentage,
        CAST([DT] AS DECIMAL(10, 1)) / Grand_Total * 100 AS DT_Percentage
    FROM sum_Problem, set2;
`);

var result_Pie = await user.sequelize.query(`
WITH sum_Problem AS
    (
        SELECT
         
            SUM([diff]) AS PF,
            SUM([NG]) AS NG,
            SUM([DT]) AS [DT]
        FROM
            [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
        WHERE
           [Line] = '${Line}' 
            and [MfgDate] = '${start}'
            --AND [MfgDate] = CONVERT(DATE, GETDATE())
    ),
    set2 AS (
        SELECT
             Total_PF + Total_NG + Total_DT AS Grand_Total
        FROM (
            SELECT
               
                SUM(PF) AS Total_PF,
                SUM(NG) AS Total_NG,
                SUM([DT]) AS Total_DT
            FROM sum_Problem
        ) AS TotalSums
    )

    SELECT
        CAST(PF AS DECIMAL(10, 1)) / Grand_Total * 100 AS PE_Pie,
        CAST(NG AS DECIMAL(10, 1)) / Grand_Total * 100 AS NG_Pie,
        CAST([DT] AS DECIMAL(10, 1)) / Grand_Total * 100 AS DT_Pie
    FROM sum_Problem, set2;
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
    resultGraph[0].forEach((item) => {
      Actual.push(item.Actual);
      diff.push(item.diff);
      Accum_Actual.push(item.Accum_Actual);
      Accum_Plan.push(item.Accum_Plan);
      Plan.push(item.Plan);
      Yield.push(item.NG);
      MC_Downtime.push(item.DT);
      Loss_PF.push(item.diff);
    });

    let Plen_Percentage = [];
    let PE_Percentage = [];
    let NG_Percentage = [];
    let DT_Percentage = [];

    result_Operating[0].forEach((item) => {
      Plen_Percentage.push(item.Plen_Percentage);
      PE_Percentage.push(item.PE_Percentage);
      NG_Percentage.push(item.NG_Percentage);
      DT_Percentage.push(item.DT_Percentage);
    });
    console.log(Plen_Percentage);
    console.log(PE_Percentage);
    console.log(NG_Percentage);
    console.log(DT_Percentage);

    
    let PE_Pie = [];
    let NG_Pie = [];
    let DT_Pie = [];

    result_Pie[0].forEach((item) => {
     
      PE_Pie.push(item.PE_Pie);
      NG_Pie.push(item.NG_Pie);
      DT_Pie.push(item.DT_Pie);
    });
    console.log(PE_Pie);
    console.log(NG_Pie);
    console.log(DT_Pie);

    var result_shift = await user.sequelize.query(`

    SELECT
    'A'  as shift_all,
    sum([Actual]) as Actual,
    sum([Plan]) as [Plan],
    sum([diff]) as [diff]
  FROM
    [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  WHERE
    [Line] = '${Line}'
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
    [Line] = '${Line}'
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
    [Line] = '${Line}'
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
    [Line] = '${Line}'
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
    [Line] = '${Line}'
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
      shift_all,
      Actual_shift,
      Plan_shift,
      diff_shift,
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
