const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const user1 = require("../database/models/user_216");

router.get("/year", async (req, res) => {
  try {
    let result = await user.sequelize
      .query(`  select distinct year([InspectionDate]) as year
    FROM [QAInspection].[dbo].[tbVisualInspection]
    order by year([InspectionDate])`);
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
router.get("/Month", async (req, res) => {
  try {
    let result = await user.sequelize
      .query(`select distinct MONTH([InspectionDate]) as Month
      FROM [QAInspection].[dbo].[tbVisualInspection]
      order by MONTH([InspectionDate])`);
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

router.get("/LAR_UPDATE/:year/:Month", async (req, res) => {
  try {
    var result = [[]];
    const { year, Month } = req.params;

    var result = await user.sequelize.query(`
      DECLARE @DateList NVARCHAR(MAX);
      DECLARE @DynamicPivotQuery NVARCHAR(MAX);
      
      -- Page 1
      WITH AA AS (
          SELECT
          FORMAT([InspectionDate], 'dd-MM') AS Date,
              [InspectionResult],
              CAST(COUNT([InspectionResult]) AS FLOAT) AS RESULT_QTY
          FROM [QAInspection].[dbo].[tbVisualInspection]
          WHERE [Vis_Round] = '1'
              AND MONTH([InspectionDate]) = '${Month}'
              AND YEAR([InspectionDate]) = '${year}'
          AND [tbVisualInspection].InspectionType='MP'
          
          GROUP BY [InspectionDate], [InspectionResult]
      ),
      BB AS (
          SELECT
              Date,
              COALESCE(ACCEPT, 0) AS ACCEPT,
              COALESCE(REJECT, 0) AS REJECT
          FROM AA
          PIVOT (
              SUM(RESULT_QTY)
              FOR [InspectionResult] IN (ACCEPT, REJECT)
          ) AS pvt
          GROUP BY Date, ACCEPT, REJECT
      )
      
      -- Create a temporary table to store BB results
      SELECT *
      INTO #TempBB
      FROM BB;
      
      SELECT @DateList = STRING_AGG(QUOTENAME(Date), ', ') WITHIN GROUP (ORDER BY Date)
      FROM (
          SELECT DISTINCT Date
          FROM #TempBB
      ) AS Dates;
      
      SET @DynamicPivotQuery = '
      SELECT *
      FROM (
          SELECT
              Date,
              ACCEPT + REJECT AS Input,
          ''Input'' AS Details
          FROM #TempBB
      ) AS SourceData
      PIVOT (
          sum(Input)
          FOR Date IN (' + @DateList + ')
      ) AS PivotTable
      union all
      SELECT *
      FROM (
          SELECT
              Date,
              ACCEPT AS Output,
          ''Output'' AS Details
      
          FROM #TempBB
      ) AS SourceData
      PIVOT (
          sum(Output)
          FOR Date IN (' + @DateList + ')
      ) AS PivotTable
      
      union all
      SELECT *
      FROM (
          SELECT
              Date,
              REJECT AS REJECT_lot,
          ''Reject'' AS Details
      
          FROM #TempBB
      ) AS SourceData
      PIVOT (
          sum(REJECT_lot)
          FOR Date IN (' + @DateList + ')
      ) AS PivotTable
      
      union all
      SELECT *
      FROM (
          SELECT
              Date,
              CAST((REJECT * 100 / NULLIF(ACCEPT + REJECT, 0)) AS DECIMAL(11, 2)) AS Reject_Percent,
          ''%Rej'' AS Details
      
          FROM #TempBB
      ) AS SourceData
      PIVOT (
          sum(Reject_Percent)
          FOR Date IN (' + @DateList + ')
      ) AS PivotTable
      
      union all
      SELECT *
      FROM (
          SELECT
              Date,
              CAST((ACCEPT * 100 / NULLIF(ACCEPT + REJECT, 0)) AS DECIMAL(11, 2)) AS LAR_Percent,
          ''%LAR'' AS Details
      
          FROM #TempBB
      ) AS SourceData
      PIVOT (
          sum(LAR_Percent)
          FOR Date IN (' + @DateList + ')
      ) AS PivotTable
      
      
      ';
      
      -- Execute the dynamic pivot query
      EXEC sp_executesql @DynamicPivotQuery;
      
      -- Drop the temporary table
      DROP TABLE #TempBB;
  `);

    var resultGraph_MC = await user.sequelize.query(`
    DECLARE @DateList NVARCHAR(MAX);
    DECLARE @DynamicPivotQuery NVARCHAR(MAX);
    
    IF OBJECT_ID('tempdb..#TempAA') IS NOT NULL
        DROP TABLE #TempAA;
    
    
    WITH AA AS (
      SELECT
      FORMAT([InspectionDate], 'dd-MM') AS Date,
          Model_group +':'+ [tbQANumber].[Line_No] as Model_group,
          [InspectionResult],
          [tbVisualInspection].[QANumber]
      FROM [QAInspection].[dbo].[tbVisualInspection]
  left join  [QAInspection].[dbo].[tbQANumber]
  on [tbVisualInspection].QANumber =[tbQANumber].QANumber
      WHERE [Vis_Round] = '1'
      AND MONTH([InspectionDate]) = '${Month}'
      AND YEAR([InspectionDate]) = '${year}'
      AND [tbVisualInspection].InspectionType='MP'

      
  
      GROUP BY [InspectionDate], Model_group, [InspectionResult],[Line_No],[tbVisualInspection].[QANumber]
      
    )
    ,AB as (select  Date,Model_group,[InspectionResult],count([InspectionResult]) as RESULT_QTY
    from  AA
    group by aa.Date,Model_group,[InspectionResult]
    )
  
  
  
      ,Data_Date as (select Distinct Date from AA)
      
      ,final as (select Data_Date.Date ,Model_group ,[InspectionResult],RESULT_QTY from Data_Date
      left join AB
      on Data_Date.Date = AB.Date
      and [InspectionResult]='REJECT')
    
    
    SELECT *
    INTO #TempAA
    FROM final;
    
    SELECT @DateList = STRING_AGG(QUOTENAME(Date), ', ') WITHIN GROUP (ORDER BY Date)
    FROM (
        SELECT DISTINCT Date
        FROM #TempAA
    ) AS Dates;
    
    -- Get distinct models
    DECLARE @Models NVARCHAR(MAX);
    SELECT @Models = STRING_AGG(QUOTENAME(Model_group), ', ') WITHIN GROUP (ORDER BY Model_group)
    FROM (
        SELECT DISTINCT Model_group
        FROM #TempAA
    ) AS Models;
    
    -- Initialize the dynamic query
    SET @DynamicPivotQuery = '
    SELECT *
    FROM (
        SELECT
            Date,
            Model_group,
            COALESCE(RESULT_QTY, 0) AS RESULT_QTY
        FROM #TempAA
    
    ) AS SourceData
    PIVOT (
        MAX(RESULT_QTY)
        FOR Model_group IN (' + @Models + ')
    ) AS FinalPivot;';
    
    
    -- Execute the dynamic pivot query
    EXEC sp_executesql @DynamicPivotQuery;
    
    
    -- Drop the temporary table
    DROP TABLE #TempAA;
    
    
    
            
`);

    let Date = [];
    let LAR_Percent = [];
    result[0].forEach((item) => {
      Date.push(item.Date);
      LAR_Percent.push(item.LAR_Percent);
    });
    
    // console.log("Date", Date);
    // console.log("LAR_Percent", LAR_Percent);

    var listRawData_MC = [];
    listRawData_MC.push(resultGraph_MC[0]);
    // console.log("listRawData_MC", listRawData_MC);

    let PivotTable_MC = [];
    let xAxis = resultGraph_MC[0].map((item) => item.Date);

    let pivot_columns_MC = Object.keys(resultGraph_MC[0][0]).filter(
      (key) => key !== "Date"
    );

    for (let key in pivot_columns_MC) {
      let series = resultGraph_MC[0].map((item) => {
        let value = item[pivot_columns_MC[key]];
        return value !== null ? value : 0;
      });

      // Check if there is at least one non-zero value in the series
      if (series.some((value) => value !== 0)) {
        PivotTable_MC.push({
          name: pivot_columns_MC[key],
          type: "column",
          data: series,
        });
      }
    }

    for (let i = 0; i < PivotTable_MC.length; i++) {
      let series_MC = PivotTable_MC[i];
      let name = series_MC.name;
      let type = series_MC.type;
      let data = series_MC.data;

      // console.log("Name:", name);
      // console.log("Type:", type);
      // console.log("Data:", data);

      // console.log("PivotTable_MC", PivotTable_MC);
    }

    // Sorting PivotTable_MC
    PivotTable_MC.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    // Now both arrays are sorted by the 'name' property

    var listRawData = [];
    listRawData.push(result[0]);

    let larData = listRawData[0].find((item) => item.Details === "%LAR");

    // Map the data for line chart
    let larSeriesData = Object.keys(larData)
      .filter((key) => key !== "Details")
      .map((date) => ({
        x: date,
        y: larData[date],
      }));

    let seriesData = [
      {
        name: "%LAR",
        type: "line",
        data: larSeriesData,
      },
    ];

    // console.log("seriesData",seriesData);

    res.json({
      result: result[0],
      listRawData,
      seriesData,
      LAR_Percent,

      xAxis,

      result: result[0],
      resultGraph: resultGraph_MC[0],

      PivotTable: PivotTable_MC.map((series) => ({
        name: series.name,
        type: series.type,
        data: series.data,
      })),

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
