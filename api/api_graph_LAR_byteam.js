const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Support/:startDate/:finishDate", async (req, res) => {
  try {

    const { startDate ,finishDate } = req.params;
    let result = await user.sequelize.query(`

 with Supporter as (  
 SELECT DISTINCT 
    [Supporter_name], LEN([Supporter_name]) as [count_Supporter_name] 
FROM [Setlot].[dbo].[Master_Setlot]
WHERE 
    CONVERT(DATE, [Master_Setlot].Date) between '${startDate}' and '${finishDate}'
    and Supporter_name != ''

union 
 SELECT DISTINCT 
    [Supporter_name], LEN([Supporter_name]) as [count_Supporter_name] 
FROM [Temp_TransportData].[dbo].[Set_Lot]
WHERE 
    CONVERT(DATE, [Set_Lot].Date) between '${startDate}' and '${finishDate}'
    and Supporter_name != '' )

	select DISTINCT [Supporter_name] from  Supporter
	where [count_Supporter_name]= 5
  
    
    `);


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

router.get("/output/:start", async (req, res) => {
  try {
    var result = [[]];
    const { start } = req.params;

    const currentDate = new Date();
// แปลง start เป็นวันที่
const startDate = new Date(start);

// คำนวณจำนวนวันที่ต่างกันระหว่างวันปัจจุบันและ start
const diffDays = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
console.log("diffDays****************************************************",diffDays);
if (diffDays != 0) {
  var resultGraph_month = await user.sequelize.query(`
DECLARE @columns NVARCHAR(MAX), @totalSum NVARCHAR(MAX), @sql NVARCHAR(MAX), @columnsline_as NVARCHAR(MAX)

-- Step 1: Get the distinct lines from the joined tables
SELECT @columns = STRING_AGG(QUOTENAME([Line]), ', '),
       @totalSum = STRING_AGG('ISNULL(' + QUOTENAME([Line]) + ', 0)', ' + '),
	   @columnsline_as = STRING_AGG(QUOTENAME([Line]) + ' AS ' + QUOTENAME([Line]), ', ') WITHIN GROUP (ORDER BY [Line])
FROM (
    SELECT DISTINCT [DataGroupSummary].[Line]
    FROM [DataforAnalysis].[dbo].[DataGroupSummary]
    INNER JOIN [Setlot].[dbo].[This_Tactime]
    ON [DataGroupSummary].[Line] = [This_Tactime].Line
) AS DistinctLines;

-- Add a column for the total sum
SET @columns = @columns + ', [TotalSum]';

-- Step 2: Construct the dynamic PIVOT query
SET @sql = '
SELECT [Supporter_name], ' + @columnsline_as + ',
       ' + @totalSum + ' AS [TotalSum]
FROM (
    SELECT 
        [DataGroupSummary].[Line], 
        [DataGroupSummary].[Supporter_name], 
        [DataGroupSummary].[Yield]
    FROM 
        [DataforAnalysis].[dbo].[DataGroupSummary]
    INNER JOIN 
        [Setlot].[dbo].[This_Tactime]
    ON 
        [DataGroupSummary].[Line] = [This_Tactime].Line
    WHERE 
        [DataGroupSummary].[MfgDate] = ''${start}''
) AS SourceTable
PIVOT (
    MAX([Yield])
    FOR [Line] IN (' + @columns + ')
) AS PivotTable
ORDER BY [TotalSum] DESC, [Supporter_name];';
print @sql
-- Step 3: Execute the dynamic query
EXEC sp_executesql @sql;

    
    
    `);
} else {
    // ถ้า start ไม่เกิน 3 วันจากวันปัจจุบัน
    var resultGraph_month = await user.sequelize.query(`
    exec [DataforAnalysis].[dbo].[Yield_BY_TEAM_Daily]
      
      `);
}
    


    let PivotTable_month = [];

    let pivot_columns_month = Object.keys(resultGraph_month[0][0]).filter(
      (key) => key !== "Supporter_name" && key !== "TotalSum"
    );

    for (let key in pivot_columns_month) {
      let seriesData = resultGraph_month[0].map((item) => {
        let value = item[pivot_columns_month[key]];
        return value !== null ? value : 0;
      });

      let seriesType = "column"; // Default type is 'column'

      PivotTable_month.push({
        name: pivot_columns_month[key],
        type: seriesType,
        data: seriesData,
      });
    }


    var listRawData_month = [];
    listRawData_month.push(resultGraph_month[0]);


    res.json({
      result: result[0],


      resultGraph_month: resultGraph_month[0],
      listRawData_month,
      PivotTable_month: PivotTable_month,

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

router.get("/output_daily/:Support/:startDate/:finishDate", async (req, res) => {
  try {
    var result = [[]];
    const { startDate, finishDate,Support} = req.params;
    
    var resultGraph_month = await user.sequelize.query(`

exec [DataforAnalysis].[dbo].[Yield_BY_TEAM_support] '${Support}','${startDate}','${finishDate}'`);

    let PivotTable_month = [];
    let xAxis_month = resultGraph_month[0].map((item) => item.Date);
    let pivot_columns_month = Object.keys(resultGraph_month[0][0]).filter(
      (key) => key !== "Date"
    );

    for (let key in pivot_columns_month) {
      let seriesData = resultGraph_month[0].map((item) => {
        let value = item[pivot_columns_month[key]];
        return value !== null ? value : 0;
      });

      let seriesType = "column"; // Default type is 'column'

      PivotTable_month.push({
        name: pivot_columns_month[key],
        type: seriesType,
        data: seriesData,
      });
    }


    var listRawData_month = [];
    listRawData_month.push(resultGraph_month[0]);

    res.json({
      result: result[0],

     
      resultGraph_month: resultGraph_month[0],
      listRawData_month,
      PivotTable_month: PivotTable_month,

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




// WITH data_Setlot AS (
//   SELECT 
//       [Date],
//       [Supporter_name],
//       [Line_IP],
//       [Time],
//       DATEPART(hour, [Time]) AS Hour
//           ,CASE 
//           WHEN DATEPART(hour, [Time]) BETWEEN 0 AND 6 THEN FORMAT(DATEADD(day, -1, [Time]), 'yyyy-MM-dd')
//           ELSE FORMAT([Time], 'yyyy-MM-dd') 
//       END AS Mfgdate,
//       CASE
//           WHEN DATEPART(hour, [Time]) BETWEEN 19 AND 23 THEN 'N'
//           WHEN DATEPART(hour, [Time]) BETWEEN 0 AND 6 THEN 'N'
//           WHEN DATEPART(hour, [Time]) BETWEEN 7 AND 18 THEN 'M'
//       END AS Shift
//   FROM [Temp_TransportData].[dbo].[Set_Lot]
//   GROUP BY [Date], [Supporter_name], [Line_IP], [Time]
// )
// ,dataOK as (
// SELECT 
//   [Supporter_name],
//   [Line_IP],
//   Shift,
//   Hour,
//   COUNT(Shift) AS Shift_count
// FROM data_Setlot
// WHERE Mfgdate = '2024-07-12'
// GROUP BY [Supporter_name], [Line_IP], Shift, Hour
// )

// ,Summary_Actual as (
// SELECT  
//      LEFT([Line], CHARINDEX(':', [Line]) - 1) AS Line
//     , REPLACE([Summary_Actual_perHr].[Hour], '*', '') AS [Hour]
//     ,[Design]
//   ,[NG]
//   ,[Actual]

// FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]

// WHERE [MfgDate] = '2024-07-12')

// ,Data_group as (
// select [Supporter_name],sum([NG]) as [NG] ,sum([Actual]) as [Actual] ,Summary_Actual.Line from Summary_Actual
// left join dataOK
// on Summary_Actual.Line = dataOK.Line_IP
// and Summary_Actual.[Hour] = dataOK.Hour
// where [Supporter_name] is not NULL and [Supporter_name]!=''
// group by [Supporter_name],Summary_Actual.Line
// )
// select Line, [Supporter_name],[NG],[Actual],ROUND(([NG] * 100.0 / ([NG]+NULLIF([Actual], 0))), 2) AS Yield  from Data_group
// group by Line, [Supporter_name],[NG],[Actual]
// order by ROUND(([NG] * 100.0 / NULLIF([Actual], 0)), 2) desc



