const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const user1 = require("../database/models/user_216");

router.get("/Table", async (req, res) => {
  try {
    let result = await user1.sequelize.query(`SELECT [Table]
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
    let result = await user1.sequelize.query(
      `SELECT distinct REPLACE(Line, '/', '_') as Line from [PE_maintenance].[dbo].[${Table}] order by Line `
    );
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

router.get(
  "/MC_ERROR/:Line/:startDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { Table, Line, startDate, finishDate } = req.params;
      const Lingching = Line.replace("_", "/");
 
      const dateParts = startDate.split('-');
      const month = parseInt(dateParts[1], 10); // Parsing as an integer
      const year = parseInt(dateParts[0], 10); // Assuming year is at the beginning of the date

// Display the extracted month
console.log('Month:', month);
      var resultGraph = await user.sequelize.query(`
      exec [Machine DownTime].[dbo].[Error_per_Line_month] '${Line}','${month}','${year}'
  `);

      let PivotTable = [];
      let xAxis = resultGraph[0].map((item) => item.Date);
      let pivot_columns = Object.keys(resultGraph[0][0]).filter(
        (key) => key !== "Date" && !key.includes("Line")
    );
    

      for (let key in pivot_columns) {
        let seriesData = resultGraph[0].map((item) => {
          let value = item[pivot_columns[key]];
          return value !== null ? value : 0;
        });
        PivotTable.push({
          name: pivot_columns[key],
          type: "column",
          data: seriesData,
        });
      }

      for (let i = 0; i < PivotTable.length; i++) {
        let series = PivotTable[i];
        let name = series.name;
        let type = series.type;
        let data = series.data;

        console.log("Name:", name);
        console.log("Type:", type);
        console.log("Data:", data);
        console.log(xAxis);
        console.log(PivotTable);
      }

   




      // Sorting PivotTable
      PivotTable.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );



      // Now both arrays are sorted by the 'name' property

      var listRawData = [];
      listRawData.push(resultGraph[0]);
      res.json({
        result: result[0],
        resultGraph: resultGraph[0],
        listRawData,

        PivotTable: PivotTable.map((series) => ({
          name: series.name,
          type: series.type,
          data: series.data,
        })),
        xAxis,

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
  }
);

router.get(
  "/MC_ERROR_YEAR/:Line/:startDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { Table, Line, startDate, finishDate } = req.params;
      const Lingching = Line.replace("_", "/");
 
      const dateParts = startDate.split('-');
      const month = parseInt(dateParts[1], 10); // Parsing as an integer
      const year = parseInt(dateParts[0], 10); // Assuming year is at the beginning of the date

// Display the extracted month
console.log('Month:', month);
      var resultGraph = await user.sequelize.query(`
      exec [Machine DownTime].[dbo].[Error_per_Line_year] '${Line}','${year}'

  `);

      let PivotTable = [];
      let xAxis = resultGraph[0].map((item) => item.Date);
      let pivot_columns = Object.keys(resultGraph[0][0]).filter(
        (key) => key !== "MONTH" 
    );
    

      for (let key in pivot_columns) {
        let seriesData = resultGraph[0].map((item) => {
          let value = item[pivot_columns[key]];
          return value !== null ? value : 0;
        });
        PivotTable.push({
          name: pivot_columns[key],
          type: "column",
          data: seriesData,
        });
      }

      for (let i = 0; i < PivotTable.length; i++) {
        let series = PivotTable[i];
        let name = series.name;
        let type = series.type;
        let data = series.data;

        console.log("Name:", name);
        console.log("Type:", type);
        console.log("Data:", data);
        console.log(xAxis);
        console.log(PivotTable);
      }

   




      // Sorting PivotTable
      PivotTable.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );



      // Now both arrays are sorted by the 'name' property

      var listRawData = [];
      listRawData.push(resultGraph[0]);
      res.json({
        result: result[0],
        resultGraph: resultGraph[0],
        listRawData,

        PivotTable: PivotTable.map((series) => ({
          name: series.name,
          type: series.type,
          data: series.data,
        })),
        xAxis,

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
  }
);

router.get(
  "/MC_ERROR_by_process/:Table/:Line/:startDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { Table, Line, startDate, finishDate } = req.params;
      const Lingching = Line.replace("_", "/");

      const [year, month, day] = startDate.split("-");

  var resultGraph1 = await user.sequelize.query(`
  
  DECLARE @process sysname  = '${Table}',
  @pivot_columns NVARCHAR(500),
  @query nvarchar(max), 
  @Line varchar(50) ='${Line}',
  @Monthh nvarchar(50) ='${month}',
  @yearr  nvarchar(50) ='${year}';
  --${startDate}
  
  set @query = '
  ;WITH  
  cteCalculation as(
    SELECT MfgDate as [Date],SUBSTRING([Line], 1, 4) as [Line]
        ,SUM([Actual])+SUM([NG]) as [Input] FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr] 
        WHERE SUBSTRING([Line], 1, 4)  = '''+@Line+'''
    GROUP BY [Line],[MfgDate]
  ),
  Error_data as(
   SELECT [Date],[Line]
  ,COUNT([Line]) as [Error_count],[Error]
  FROM [LinkedServer1].[PE_maintenance].[dbo].'+ QUOTENAME(@Process) +  '
  WHERE Line = CONVERT(nvarchar(50),'''+@Line+''')
  group by [Date],[Line],[Error]
  ),
  set3 as(
  select c.[Date],c.[Line],cast(CAST(c2.Error_count as float)  * 100 /NULLIF(CAST(MAX(c.Input)  as float ), 0)as  decimal(11, 2)) as [Per_cent],(CAST(MAX(c.Input)  as float )) as [Input],SUM(c2.Error_count) as [Error_count],[Error]
      from cteCalculation c
   join Error_data c2 on c2.Line = c.Line
   AND  c2.[Date] = c.[Date]
  where c.Line is not null
  group by c.[Line],c.[Date] ,c2.Error_count,[Error]
  ) 
  

  select * FROM (
    SELECT  t2.[Date],CAST(CAST(CAST((Error_count*100)as float )/(Allprocess + Input)as float )as  decimal(11, 2)) as [Per_cent],[Error]

    FROM
    (
    select [Date],SUM(Error_count) as [Allprocess] From set3
    GROUP BY [Date]
    ) t1
    FULL OUTER JOIN
    (select * From set3 ) t2
    on t1.[Date]=t2.[Date]
    )t
  

  
  where  MONTH([Date]) = '''+@Monthh+'''  and year([Date]) = '''+@yearr+'''
  
  order by Date ASC
   '
  EXEC sp_executesql @query 
  --print @query
`);
  // console.log("resultGraph1****************************************************************",resultGraph1);


  const pivotData = {};

  // Loop through each item in resultGraph1[0]
  resultGraph1[0].forEach(item => {
    const { Date, Per_cent, Error } = item;
  
    // Check if the Date exists in pivotData
    if (!pivotData[Date]) {
      // If Date doesn't exist, initialize it with an object containing the Date
      pivotData[Date] = { Date };
    }
  
    // Convert error to uppercase to standardize
    const errorKey = Error.toUpperCase();
  
    // Check if the errorKey exists in pivotData for this Date
    if (!pivotData[Date][errorKey]) {
      // If errorKey doesn't exist, initialize it with null
      pivotData[Date][errorKey] = null;
    }
  
    // Set the Per_cent value for the error
    pivotData[Date][errorKey] = Per_cent;
  });
  
  // Check for all possible errors and set them to null if they don't exist for each Date
  const allErrors = new Set();
  resultGraph1[0].forEach(item => allErrors.add(item.Error.toUpperCase()));
  
  Object.keys(pivotData).forEach(date => {
    allErrors.forEach(error => {
      if (!pivotData[date][error]) {
        pivotData[date][error] = null;
      }
    });
  });
  
  // Convert pivotData object to an array of values
  const pivotResult = Object.values(pivotData);
  
  // console.log("ok****************************************************************************", pivotResult);
  
  
  

      let PivotTable = [];
      let xAxis = pivotResult.map((item) => item.Date);
      let pivot_columns = Object.keys(pivotResult[0]).filter(
        (key) => key !== "Date" && key !== "Line"
      );

      for (let key in pivot_columns) {
        let seriesData = pivotResult.map((item) => {
          let value = item[pivot_columns[key]];
          return value !== null ? value : 0;
        });
        PivotTable.push({
          name: pivot_columns[key],
          type: "column",
          data: seriesData,
        });
      }

      for (let i = 0; i < PivotTable.length; i++) {
        let series = PivotTable[i];
        let name = series.name;
        let type = series.type;
        let data = series.data;

        console.log("Name:", name);
        console.log("Type:", type);
        console.log("Data:", data);
        console.log(xAxis);
        console.log(PivotTable);
      }

   
      // Sorting PivotTable
      PivotTable.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );



      // Now both arrays are sorted by the 'name' property

      var listRawData = [];
      listRawData.push(pivotResult);


      res.json({
        result: result[0],
        resultGraph: pivotResult,
        listRawData,

        PivotTable: PivotTable.map((series) => ({
          name: series.name,
          type: series.type,
          data: series.data,
        })),
        xAxis,

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
  }
);

router.get(
  "/by_process_year/:Table/:Line/:startDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { Table, Line, startDate, finishDate } = req.params;
      const Lingching = Line.replace("_", "/");

      const [year, month, day] = startDate.split("-");


  var resultGraph1 = await user.sequelize.query(`
  DECLARE @process sysname  = '${Table}',
  @pivot_columns NVARCHAR(500),
  @query nvarchar(max), 
  @Line varchar(50) ='${Line}',
  @Monthh nvarchar(50) ='${month}',
  @yearr  nvarchar(50) ='${year}';
  --${startDate}
  
  SET @query = '
  ;WITH
  cteCalculation as(
      SELECT MfgDate as [Date], SUBSTRING([Line], 1, 4) as [Line],
      SUM([Actual])+SUM([NG]) as [Input] FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
      WHERE SUBSTRING([Line], 1, 4) = ''' + @Line + '''
      GROUP BY [Line], [MfgDate]
  ),
  Error_data as(
      SELECT [Date], [Line], COUNT([Line]) as [Error_count], [Error]
      FROM [LinkedServer1].[PE_maintenance].[dbo].' + QUOTENAME(@Process) + '
      WHERE Line = CONVERT(nvarchar(50), ''' + @Line + ''')
      GROUP BY [Date], [Line], [Error]
  )
  ,set3 as(
    SELECT SUBSTRING(DATENAME(MONTH, c.[Date]), 1, 3) as [Date],FORMAT(c.[Date], ''MM'') as [Month],
    CAST(CAST(c2.Error_count as float) * 100 / NULLIF(CAST(MAX(c.Input) as float), 0) as decimal(11, 2)) as [Per_cent], [Error]
    FROM cteCalculation c
    JOIN Error_data c2 on c2.Line = c.Line AND c2.[Date] = c.[Date]
    WHERE c.Line IS NOT NULL
  and  YEAR(c.[Date]) = ''' + @yearr + '''
    GROUP BY c.[Line],SUBSTRING(DATENAME(MONTH, c.[Date]), 1, 3), c2.Error_count, [Error],FORMAT(c.[Date], ''MM''))
  select * from set3
  order by Month

   '
  EXEC sp_executesql @query 
  --print @query
`);
  // console.log("by_process_year*****************************resultGraph1***********************************",resultGraph1);


  const pivotData = {};

  // Loop through each item in resultGraph1[0]
  resultGraph1[0].forEach(item => {
    const { Date, Per_cent, Error } = item;
  
    // Check if the Date exists in pivotData
    if (!pivotData[Date]) {
      // If Date doesn't exist, initialize it with an object containing the Date
      pivotData[Date] = { Date };
    }
  
    // Convert error to uppercase to standardize
    const errorKey = Error.toUpperCase();
  
    // Check if the errorKey exists in pivotData for this Date
    if (!pivotData[Date][errorKey]) {
      // If errorKey doesn't exist, initialize it with null
      pivotData[Date][errorKey] = null;
    }
  
    // Set the Per_cent value for the error
    pivotData[Date][errorKey] = Per_cent;
  });
  
  // Check for all possible errors and set them to null if they don't exist for each Date
  const allErrors = new Set();
  resultGraph1[0].forEach(item => allErrors.add(item.Error.toUpperCase()));
  
  Object.keys(pivotData).forEach(date => {
    allErrors.forEach(error => {
      if (!pivotData[date][error]) {
        pivotData[date][error] = null;
      }
    });
  });
  
  // Convert pivotData object to an array of values
  const pivotResult = Object.values(pivotData);
  
  // console.log("ok****************************************************************************", pivotResult);
  
  
  

      let PivotTable = [];
      let xAxis = pivotResult.map((item) => item.Date);
      let pivot_columns = Object.keys(pivotResult[0]).filter(
        (key) => key !== "Date" && key !== "Line"
      );

      for (let key in pivot_columns) {
        let seriesData = pivotResult.map((item) => {
          let value = item[pivot_columns[key]];
          return value !== null ? value : 0;
        });
        PivotTable.push({
          name: pivot_columns[key],
          type: "column",
          data: seriesData,
        });
      }

      for (let i = 0; i < PivotTable.length; i++) {
        let series = PivotTable[i];
        let name = series.name;
        let type = series.type;
        let data = series.data;

        console.log("Name:", name);
        console.log("Type:", type);
        console.log("Data:", data);
        console.log(xAxis);
        console.log(PivotTable);
      }

      // Sorting PivotTable
      PivotTable.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );



      // Now both arrays are sorted by the 'name' property

      var listRawData = [];
      listRawData.push(pivotResult);


      res.json({
        result: result[0],
        resultGraph: pivotResult,
        listRawData,

        PivotTable: PivotTable.map((series) => ({
          name: series.name,
          type: series.type,
          data: series.data,
        })),
        xAxis,

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
  }
);
module.exports = router;
