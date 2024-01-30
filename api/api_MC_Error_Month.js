const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const user1 = require("../database/models/user_216");

router.get("/Table", async (req, res) => {
  try {
    let result = await user1.sequelize
      .query(`SELECT [Table]
      FROM [PE_maintenance].[dbo].[Table_MC_Error]`);
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
router.get("/Line/:Table", async (req, res) => {
  const { Table } = req.params;
  try {
    let result = await user1.sequelize
      .query(`SELECT distinct REPLACE(Line, '/', '_') as Line from [PE_maintenance].[dbo].[${Table}] order by Line `);
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
router.get("/month_Error/:Table", async (req, res) => {
  const { Table } = req.params;
  try {
    let result = await user1.sequelize
      .query(`SELECT DISTINCT month (Date) AS month_Error FROM [PE_maintenance].[dbo].[${Table}]  order by Month_Error`);
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

router.get("/year_Error/:Table", async (req, res) => {
  const { Table } = req.params;
  try {
    let result = await user1.sequelize
      .query(`SELECT DISTINCT year (Date) AS year_Error FROM [PE_maintenance].[dbo].[${Table}] order by year_Error`);
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


router.get("/MC_ERROR/:Table/:Line/:month_start/:year_start/:month_end/:year_end", async (req, res) => {
  try {
    var result = [[]];
    const { Table, Line, month_start,year_start,month_end,year_end} = req.params;
    const Linechaing = Line.replace('_','/');
    var resultGraph = await user1.sequelize.query(`
    DECLARE @StartMonth INT = ${month_start}; -- Replace with the desired start month
DECLARE @StartYear INT = ${year_start}; -- Replace with the desired start year
DECLARE @EndMonth INT = ${month_end}; -- Replace with the desired end month
DECLARE @EndYear INT = ${year_end}; -- Replace with the desired end year
DECLARE @pivot_columns NVARCHAR(MAX);
DECLARE @query NVARCHAR(MAX);

SET @pivot_columns = STUFF(
    (SELECT DISTINCT ',' + QUOTENAME(LTRIM(RTRIM([Error])))
    FROM [PE_maintenance].[dbo].[${Table}]
    WHERE [Error] != '' AND Line='${Linechaing}' 
    FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

SET @query = '
;WITH set1 AS
(
    SELECT 
        [Error], 
        COUNT([Error]) AS Error_Qty, 
        CAST(MONTH([Date]) AS INT) AS Date_number, 
        FORMAT([Date], ''MMM'') + '' '' + CAST(YEAR([Date]) AS VARCHAR) AS Date
    FROM [PE_maintenance].[dbo].[${Table}]
    WHERE [Error] != '''' AND Line =''${Linechaing}''
    AND ([Date] >= CAST(@StartYear AS VARCHAR) + ''-'' + RIGHT(''00'' + CAST(@StartMonth AS VARCHAR), 2) + ''-01'' AND
        [Date] < DATEADD(MONTH, 1, CAST(@EndYear AS VARCHAR) + ''-'' + RIGHT(''00'' + CAST(@EndMonth AS VARCHAR), 2) + ''-01''))
    GROUP BY [Error], [Date]
)
SELECT  
    Date, ' + @pivot_columns + '
FROM (
    SELECT 
        [Error], 
        SUM(Error_Qty) AS Error_Qty, 
        Date, 
        Date_number
    FROM set1
    GROUP BY [Error], [Date], Date_number
) AS subquery
PIVOT
(
    SUM(Error_Qty)
    FOR [Error] IN (' + @pivot_columns + ')
) AS PivotTable
ORDER BY YEAR(Date), Date_number ASC;';

EXECUTE sp_executesql @query, N'@StartYear INT, @StartMonth INT, @EndYear INT, @EndMonth INT', @StartYear, @StartMonth, @EndYear, @EndMonth;
    
    
  `);
  
  let PivotTable = [];
  let xAxis = resultGraph[0].map((item) => item.Date);
  let pivot_columns = Object.keys(resultGraph[0][0]).filter((key) => key !== 'Date');
  
  for (let key in pivot_columns) {
    let seriesData = resultGraph[0].map((item) => {
      let value = item[pivot_columns[key]];
      return value !== null ? value : 0;
    });
    PivotTable.push({
      name: pivot_columns[key],
      type: 'column',
      data: seriesData,
    });
  }
  
  for (let i = 0; i < PivotTable.length; i++) {
    let series = PivotTable[i];
    let name = series.name;
    let type = series.type;
    let data = series.data;
  

    console.log('Name:', name);
    console.log('Type:', type);
    console.log('Data:', data);
    console.log(xAxis);
    console.log(PivotTable);
  

  }
  
  
  
    var listRawData = [];
    listRawData.push(resultGraph[0]);
    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      listRawData,
     
      PivotTable: PivotTable.map(series => ({
        name: series.name,
        type: series.type,
        data: series.data
      })),
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

module.exports = router;
