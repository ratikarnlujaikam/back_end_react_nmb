const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Line", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
    SELECT Distinct [Line] as year
  FROM [Component_Master].[dbo].[Line_Cleanroom]
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

router.get("/process", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
    with set1 as (select Line,Actual as [Actual],Hour,'Output' as [Process],Design
  FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  union all
  select Line,[Plan],Hour,'Target' as [Process],Design
  FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
  union all
    select [Compare_NG_Process].Line + ' : ' + Model as [Line],[First_NG]
  ,case when Hour between 0 and 6 then '0'+ CAST(Hour AS nvarchar)
  when Hour between 7 and 9 then '*0' + CAST(Hour AS nvarchar)
  else '*' + CAST(Hour AS nvarchar) end as [Hour]
  ,Process,Design
   FROM [Oneday_ReadtimeData].[dbo].[Compare_NG_Process]
   left join [Setlot].[dbo].[This_Tactime] on [Compare_NG_Process].Line = [This_Tactime].Line
 )
   select distinct process from set1
   union all
   select '**All**' as  process
    `);

    // Extract the result array from the query result
    let process = result[0];

    // Sort the array based on the 'year' property
    process.sort((a, b) => a.process.localeCompare(b.process));

    res.json({
      result: process,
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

router.get("/daily/:year/:start", async (req, res) => {
  try {
    var result = [[]];
    const { year,start } = req.params;
    const Line = year.replace('_', '/');

    
    var resultGraph = await user.sequelize.query(`
  
    exec [Oneday_ReadtimeData].[dbo].[DT_Summary_daily] '${start}','${Line}'
    
    
  `);
  
  let PivotTable = [];
  let xAxis = resultGraph[0].map((item) => item.Date);
  let pivot_columns = Object.keys(resultGraph[0][0]).filter((key) => !['Date', 'Index', 'Line'].includes(key));

  

  for (let key in pivot_columns) {
    let seriesData = resultGraph[0].map((item) => {
      let value = item[pivot_columns[key]];
      return value !== null ? value : 0;
    });
  
    let seriesType = 'column'; // Default type is 'column'
  
    // Check if the series name is 'Output' or 'Target', and set the type to 'line' accordingly
    if ( pivot_columns[key] === 'Total_DT'|| pivot_columns[key] === 'Actual_Input' ) {
      seriesType = 'line';
    }
  
    PivotTable.push({
      name: pivot_columns[key],
      type: seriesType,
      data: seriesData,
    });
  }
  
  // Now PivotTable contains columns and lines based on the condition
  console.log(PivotTable);
  

  
  
    var listRawData = [];
    listRawData.push(resultGraph[0]);
    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      listRawData,
     
      PivotTable: PivotTable,
      xAxis,
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

router.get("/monthly/:year/:start", async (req, res) => {
  try {
    var result = [[]];
    const { year,start } = req.params;
    const Line = year.replace('_', '/');

    
    var resultGraph = await user.sequelize.query(`
  
    exec [Oneday_ReadtimeData].[dbo].[DT_Summary_Monthly] '${start}','${Line}'

    
  `);
  
  let PivotTable = [];
  let xAxis = resultGraph[0].map((item) => item.Date);
  let pivot_columns = Object.keys(resultGraph[0][0]).filter((key) => !['Month', 'Index', 'Line'].includes(key));

  

  for (let key in pivot_columns) {
    let seriesData = resultGraph[0].map((item) => {
      let value = item[pivot_columns[key]];
      return value !== null ? value : 0;
    });
  
    let seriesType = 'column'; // Default type is 'column'
  
    // Check if the series name is 'Output' or 'Target', and set the type to 'line' accordingly
    if ( pivot_columns[key] === 'Total_DT'|| pivot_columns[key] === 'Actual_Input' ) {
      seriesType = 'line';
    }
  
    PivotTable.push({
      name: pivot_columns[key],
      type: seriesType,
      data: seriesData,
    });
  }
  
  // Now PivotTable contains columns and lines based on the condition
  console.log(PivotTable);
  

  
  
    var listRawData = [];
    listRawData.push(resultGraph[0]);
    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      listRawData,
     
      PivotTable: PivotTable,
      xAxis,
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


// router.get("/LARPP/:year/:process/:start", async (req, res) => {
//   try {
//     var result = [[]];
//     const { year,start ,process} = req.params;
   
//     const Line = year.replace('_', '/');


//     var result = await user.sequelize.query(`SELECT  sum([Actual]) as Actual,
// 	  sum([Plan]) as Plan_1,
// 	  (sum([Actual]))-(sum([Plan])) as diff

//   FROM
// 	  [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//   WHERE
// 	  [Line] = '${Line}'
// 	  --AND [MfgDate] = CONVERT(DATE, GETDATE())
//     and [MfgDate] = '${start}'`);

//     var resultGraph = await user.sequelize.query(`
//   with set1 as (select Line,Actual as [Actual],Hour,'Output' as [Process],Design
//   FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//   where MfgDate = '${start}' and Line = '${Line}'
//   union all
//   select Line,[Plan],Hour,'Target' as [Process],Design
//   FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//   where MfgDate = '${start}' and Line = '${Line}'
//   union all
//   select [Compare_NG_Process].Line + ' : ' + Model as [Line],sum([First_NG]) as [First_NG]
//   ,case when Hour between 0 and 6 then '0'+ CAST(Hour AS nvarchar) 
//   when Hour between 7 and 9 then '*0' + CAST(Hour AS nvarchar)
//   else '*' + CAST(Hour AS nvarchar) end as [Hour]
//   ,Process,Design
//    FROM [Oneday_ReadtimeData].[dbo].[Compare_NG_Process]
//    left join [Setlot].[dbo].[This_Tactime] on [Compare_NG_Process].Line = [This_Tactime].Line
//    where MfgDate = '${start}' and [Compare_NG_Process].Line + ' : ' + Model = '${Line}' 
//    group by   [Compare_NG_Process].Line,[Hour],Model,Process,Design)

//    select * from set1
//    where Process='${process}'`);

//     var result_Operating = await user.sequelize.query(`
//     WITH sum_Problem AS  
//     (
//         SELECT
//             SUM([Plan]) AS Sum_Plan,
//             SUM([diff]) AS PF,
//             SUM([NG]) AS NG,
//             SUM([DT]) AS [DT]
//         FROM
//             [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//         WHERE
//             [Line] = '${Line}' 
//             and [MfgDate] = '${start}'
//             --AND [MfgDate] = CONVERT(DATE, GETDATE())
//     ),
//     set2 AS (
//         SELECT 
//             Total_Sum_Plan + Total_PF + Total_NG + Total_DT AS Grand_Total
//         FROM (
//             SELECT 
//                 SUM(Sum_Plan) AS Total_Sum_Plan,
//                 SUM(PF) AS Total_PF,
//                 SUM(NG) AS Total_NG,
//                 SUM([DT]) AS Total_DT
//             FROM sum_Problem
//         ) AS TotalSums
//     )
    
//     SELECT 
//         CAST(Sum_Plan AS DECIMAL(10, 1)) / Grand_Total * 100 AS Plen_Percentage,
//         CAST(PF AS DECIMAL(10, 1)) / Grand_Total * 100 AS PE_Percentage,
//         CAST(NG AS DECIMAL(10, 1)) / Grand_Total * 100 AS NG_Percentage,
//         CAST([DT] AS DECIMAL(10, 1)) / Grand_Total * 100 AS DT_Percentage
//     FROM sum_Problem, set2;
// `);

// var result_Pie = await user.sequelize.query(`
// WITH sum_Problem AS
//     (
//         SELECT
         
//             SUM([diff]) AS PF,
//             SUM([NG]) AS NG,
//             SUM([DT]) AS [DT]
//         FROM
//             [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//         WHERE
//            [Line] = '${Line}' 
//             and [MfgDate] = '${start}'
//             --AND [MfgDate] = CONVERT(DATE, GETDATE())
//     ),
//     set2 AS (
//         SELECT
//              Total_PF + Total_NG + Total_DT AS Grand_Total
//         FROM (
//             SELECT
               
//                 SUM(PF) AS Total_PF,
//                 SUM(NG) AS Total_NG,
//                 SUM([DT]) AS Total_DT
//             FROM sum_Problem
//         ) AS TotalSums
//     )

//     SELECT
//         CAST(PF AS DECIMAL(10, 1)) / Grand_Total * 100 AS PE_Pie,
//         CAST(NG AS DECIMAL(10, 1)) / Grand_Total * 100 AS NG_Pie,
//         CAST([DT] AS DECIMAL(10, 1)) / Grand_Total * 100 AS DT_Pie
//     FROM sum_Problem, set2;
// `);

//     // แกน  y

//     let Actual = [];
//     resultGraph[0].forEach((item) => {
//       Actual.push(item.Actual);

//     });

//     let Plen_Percentage = [];
//     let PE_Percentage = [];
//     let NG_Percentage = [];
//     let DT_Percentage = [];

//     result_Operating[0].forEach((item) => {
//       Plen_Percentage.push(item.Plen_Percentage);
//       PE_Percentage.push(item.PE_Percentage);
//       NG_Percentage.push(item.NG_Percentage);
//       DT_Percentage.push(item.DT_Percentage);
//     });
//     console.log(Plen_Percentage);
//     console.log(PE_Percentage);
//     console.log(NG_Percentage);
//     console.log(DT_Percentage);

    
//     let PE_Pie = [];
//     let NG_Pie = [];
//     let DT_Pie = [];

//     result_Pie[0].forEach((item) => {
     
//       PE_Pie.push(item.PE_Pie);
//       NG_Pie.push(item.NG_Pie);
//       DT_Pie.push(item.DT_Pie);
//     });
//     console.log(PE_Pie);
//     console.log(NG_Pie);
//     console.log(DT_Pie);

//     var result_shift = await user.sequelize.query(`

//     SELECT
//     'A'  as shift_all,
//     sum([Actual]) as Actual,
//     sum([Plan]) as [Plan],
//     sum([diff]) as [diff]
//   FROM
//     [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//   WHERE
//     [Line] = '${Line}'
//     AND [Hour] BETWEEN '*07' AND '*14'
//     and [MfgDate] = '${start}'
//   GROUP BY
//     [Line]
//     union all
//     SELECT
//     'B'  as Shift_all,
//     sum([Actual]) as Actual,
//     sum([Plan]) as [Plan],
//     sum([diff]) as [diff]
  
//   FROM
//     [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//   WHERE
//     [Line] = '${Line}'
//     AND [Hour] BETWEEN '*15' AND '*22'
//     and [MfgDate] = '${start}'
  
//     union all
//     SELECT
//     'C'  as Shift_all,
//     sum([Actual]) as Actual,
//     sum([Plan]) as [Plan],
//     sum([diff]) as [diff]
  
//   FROM
//     [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//   WHERE
//     [Line] = '${Line}'
//     AND [Hour] BETWEEN '*23' AND '06'
//     and [MfgDate] = '${start}'
  
//   union all
  
//     SELECT
//       'M'  as Shift_all,
//     sum([Actual]) as Actual,
//     sum([Plan]) as [Plan],
//     sum([diff]) as [diff]
//   FROM
//     [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//   WHERE
//     [Line] = '${Line}'
//     AND [Hour] BETWEEN '*07' AND '*18'
//     and [MfgDate] = '${start}'
//     UNION ALL
//     SELECT
//      'N'  as Shift_all,
//     sum([Actual]) as Actual,
//     sum([Plan]) as [Plan],
//     sum([diff]) as [diff]
//   FROM
//     [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//   WHERE
//     [Line] = '${Line}'
//     AND [Hour] BETWEEN '*19' AND '06'
//     and [MfgDate] = '${start}'  
// `);

// let shift_all = [];
// let Actual_shift = [];
// let Plan_shift = [];
// let diff_shift = [];

// result_shift[0].forEach((item) => {
 
//   shift_all.push(item.shift_all);
//   Actual_shift.push(item.Actual);
//   Plan_shift.push(item.Plan);
//   diff_shift.push(item.diff);
// });
// console.log("Shift_all",shift_all);
// console.log("Actual_shift",Actual_shift);
// console.log("Plan_shift",Plan_shift);
// console.log("diff_shift",diff_shift);


//     var listRawData = [];
//     listRawData.push(result[0]);
//     console.log(listRawData);

//     res.json({
//       result: result[0],
//       resultGraph: resultGraph[0],
//       result_Operating: result_Operating[0],
//       result_Pie: result_Pie[0],
//       result_shift: result_shift[0],
//       listRawData,
//       Actual,
 
//       shift_all,
//       Actual_shift,
//       Plan_shift,
//       diff_shift,
//       api_result: "ok",
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       error,
//       api_result: "nok",
//     });
//   }
// });

module.exports = router;
