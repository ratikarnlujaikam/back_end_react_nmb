const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

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

router.get("/output/:start", async (req, res) => {
  try {
    var result = [[]];
    const { start } = req.params;

    var resultGraph = await user.sequelize.query(`

    DECLARE @pivot_columns NVARCHAR(MAX), @DynamicPivotQuery NVARCHAR(MAX)

    SET @pivot_columns = STUFF(
        (SELECT DISTINCT ',' + QUOTENAME(LTRIM(RTRIM([Model])))
        FROM [Tray_Packing].[dbo].[Tray_Record]
       where [MfgDate]='${start}'
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
    
    
    -- Build the dynamic pivot query
    SET @DynamicPivotQuery = 
      '
    with Tray as (SELECT
      [Model],
      SUBSTRING([Tray_no], 1, 9) AS [Tray_no],
      [MfgDate],
      QA_no,
      count(QA_no) as QA_no_count
      ,TimeStamp  AS [Hour]
    FROM
      [Tray_Packing].[dbo].[Tray_Record]
        where [MfgDate]=''${start}''
      group by [Model],[Tray_no],[MfgDate],QA_no,TimeStamp
      )
    
     ,Tray_2 as  (
     select [Model]
      ,[Tray_no]
      ,[MfgDate]
      ,sum(QA_no_count) as [Count_Tray]   
      ,FORMAT([Hour]
      , ''HH'') as Time 
      from Tray
      group by [Model],[Tray_no],QA_no,[MfgDate],FORMAT([Hour], ''HH'')
      union all 
      SELECT 
          [Model]
        ,SUBSTRING([Tray_no], 1, 9) AS [Tray_no]
          ,[MfgDate]
          ,[Count_Tray]
        ,FORMAT(TimeStamp, ''HH'') as Time
    
      FROM [Tray_Packing].[dbo].[Matching_Tray]
      where [MfgDate]=''${start}'')
    
        ,by_shif as (
      SELECT 
      ''A'' as shift ,Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
      LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
      ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
      where Time between ''07'' and ''14''
      and [MfgDate]=''${start}''
    
      union all
        SELECT 
      ''B'' as shift ,Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
      LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
      ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
      where Time between ''15'' and ''22''
      and [MfgDate]=''${start}''
        union all
        SELECT 
      ''C'' as shift ,Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
      LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
      ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
      where Time between ''23'' and ''24'' or Time between ''00'' and ''06''
      and [MfgDate]=''${start}''
    
       union all
       SELECT 
      ''M'' as shift ,Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
      LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
      ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
      where Time between ''07'' and ''18''
      and [MfgDate]=''${start}''
         union all
       SELECT 
      ''N'' as shift ,Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
      LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
      ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
      where Time between ''19'' and ''24'' or  Time between ''00'' and ''06''
      and [MfgDate]=''${start}'')

      
    
      select shift,sum(QTY) as QTY from by_shif
      group by shift'
    
    -- *********************************************************************************shift********************************************************************************
    EXEC sp_executesql @DynamicPivotQuery
    ;
    
    
    
  `);

    let PivotTable = [];
    let xAxis = resultGraph[0].map((item) => item.shift);
    let pivot_columns = Object.keys(resultGraph[0][0]).filter(
      (key) => key !== "shift"
    );

    for (let key in pivot_columns) {
      let seriesData = resultGraph[0].map((item) => {
        let value = item[pivot_columns[key]];
        return value !== null ? value : 0;
      });

      let seriesType = "column"; // Default type is 'column'

      PivotTable.push({
        name: pivot_columns[key],
        type: seriesType,
        data: seriesData,
      });
    }

    // Now PivotTable contains columns and lines based on the condition
    console.log(PivotTable);

    var resultGraph_model = await user.sequelize.query(`

    DECLARE @pivot_columns NVARCHAR(MAX), @DynamicPivotQuery NVARCHAR(MAX)


    SET @pivot_columns = STUFF(
      (
      SELECT ',' + QUOTENAME(shift_all)
      FROM (
          SELECT 'A' as shift_all
          UNION
          SELECT 'B'
          UNION
          SELECT 'C'
          UNION
          SELECT 'M'
          UNION
          SELECT 'N'
      ) AS shifts
      FOR XML PATH(''), TYPE
      ).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
    
    
      -- Build the dynamic pivot query
      SET @DynamicPivotQuery =
        '
      with Tray as (SELECT
        [Model],
        SUBSTRING([Tray_no], 1, 9) AS [Tray_no],
        [MfgDate],
        QA_no,
        count(QA_no) as QA_no_count
        ,TimeStamp  AS [Hour]
      FROM
        [Tray_Packing].[dbo].[Tray_Record]
          where [MfgDate]=''${start}''
        group by [Model],[Tray_no],[MfgDate],QA_no,TimeStamp
        )
    
       ,Tray_2 as  (
       select [Model]
        ,[Tray_no]
        ,[MfgDate]
        ,sum(QA_no_count) as [Count_Tray]
        ,FORMAT([Hour]
        , ''HH'') as Time
      ,[QA_no]
        from Tray
        group by [Model],[Tray_no],QA_no,[MfgDate],FORMAT([Hour], ''HH'')
        union all
        SELECT
            [Model]
          ,SUBSTRING([Tray_no], 1, 9) AS [Tray_no]
            ,[MfgDate]
            ,[Count_Tray]
          ,FORMAT(TimeStamp, ''HH'') as Time
        ,[QA_no]
        FROM [Tray_Packing].[dbo].[Matching_Tray]
        where [MfgDate]=''${start}'')
    
          ,by_shif as (
        SELECT
        ''A'' as shift ,[QA_no],Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        where Time between ''07'' and ''14''
        and [MfgDate]=''${start}''
    
        union all
          SELECT
        ''B'' as shift ,[QA_no],Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        where Time between ''15'' and ''22''
        and [MfgDate]=''${start}''
          union all
          SELECT
        ''C'' as shift ,[QA_no],Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        where Time between ''23'' and ''24'' or Time between ''00'' and ''06''
        and [MfgDate]=''${start}''
    
         union all
         SELECT
        ''M'' as shift ,[QA_no],Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        where Time between ''07'' and ''18''
        and [MfgDate]=''${start}''
           union all
         SELECT
        ''N'' as shift ,[QA_no],Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        where Time between ''19'' and ''24'' or  Time between ''00'' and ''06''
        and [MfgDate]=''${start}'')
    
    
      SELECT
        Model,
        Tray_no,
        COUNT([QA_no]) as count_lot,
        SUM([A]) AS A,
        SUM([B]) AS B,
        SUM([C]) AS C,
        SUM([M]) AS M,
        SUM([N]) AS N,
        ISNULL(SUM([A]), 0) + ISNULL(SUM([B]), 0) + ISNULL(SUM([C]), 0) AS TOTAL_ABC,
        ISNULL(SUM([M]), 0) + ISNULL(SUM([N]), 0) AS TOTAL_MN
    FROM (
        SELECT
            [Model],
            [Tray_no],
            [QA_no],
            [A],
            [B],
            [C],
            [M],
            [N]
        FROM (
            SELECT
                [Model],
                [shift],
                [Tray_no],
                [QA_no],
                SUM(QTY) AS QTY
            FROM by_shif
            GROUP BY [Model], [shift], [Tray_no], [QA_no]
        ) AS SourceTable
        PIVOT (
            SUM(QTY) FOR [shift] IN ([A], [B], [C], [M], [N])
        ) AS PivotTable
    ) AS PivotData
    GROUP BY Model, Tray_no
    ORDER BY Model;
      '
      print @DynamicPivotQuery
      -- ***************************************************************************************************************************************************model
      EXEC sp_executesql @DynamicPivotQuery
    
    
  ;
  
  
  
`);

    let PivotTable_model = [];
    let xAxis_model = resultGraph_model[0].map((item) => item.Model);
    let pivot_columns_model = Object.keys(resultGraph_model[0][0]).filter(
      (key) => key !== "Model" && key !== "TOTAL_ABC" && key !== "Tray_no" && key !== "TOTAL_MN" && key !== "count_lot"
      
    );

    for (let key in pivot_columns_model) {
      let seriesData = resultGraph_model[0].map((item) => {
        let value = item[pivot_columns_model[key]];
        return value !== null ? value : 0;
      });

      let seriesType = "column"; // Default type is 'column'

      PivotTable_model.push({
        name: pivot_columns_model[key],
        type: seriesType,
        data: seriesData,
      });
    }

    const dateObj = new Date(start);

// ดึงค่าปีและเดือน
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // เพิ่ม 1 เนื่องจากเดือนเริ่มที่ 0

// สร้างรูปแบบ "yyyy-mm"
    const formattedDate = `${year}-${month}`;

// formattedDate จะมีค่า "yyyy-mm"
  console.log(formattedDate);
    
    var resultGraph_month = await user.sequelize.query(`


    with Tray as (SELECT
      [Model],
      SUBSTRING([Tray_no], 1, 9) AS [Tray_no],
	  MfgDate,
      QA_no,
      count(QA_no) as QA_no_count
      ,TimeStamp  AS [Hour]
    FROM
      [Tray_Packing].[dbo].[Tray_Record]
        where FORMAT(CONVERT(DATETIME, [MfgDate]), 'yyyy-MM')='${formattedDate}'
      group by [Model],[Tray_no],[MfgDate],QA_no,TimeStamp
      )

  ,Tray_2 as  (
 select [Model]
  ,[Tray_no]
  , MfgDate
  ,sum(QA_no_count) as [Count_Tray]
  ,FORMAT([Hour], 'HH') as Time
  from Tray
  group by [Model],[Tray_no],QA_no,[MfgDate],FORMAT([Hour], 'HH')
  union all

  SELECT
      [Model]
    ,SUBSTRING([Tray_no], 1, 9) AS [Tray_no]
     ,MfgDate
      ,[Count_Tray]
    ,FORMAT(TimeStamp, 'HH') as Time
  FROM [Tray_Packing].[dbo].[Matching_Tray]
  WHERE FORMAT(CONVERT(DATETIME, [MfgDate]), 'yyyy-MM')='${formattedDate}'
  )

     ,by_shif as (
      SELECT
      Time,[Tray_no],[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY FROM Tray_2
      LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
      ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
      WHERE FORMAT(CONVERT(DATETIME, [MfgDate]), 'yyyy-MM')='${formattedDate}')

      select FORMAT(MfgDate, 'MM-dd') as MfgDate ,sum(QTY) as QTY from by_shif
      group by MfgDate



`);

    let PivotTable_month = [];
    let xAxis_month = resultGraph_model[0].map((item) => item.MfgDate);
    let pivot_columns_month = Object.keys(resultGraph_month[0][0]).filter(
      (key) => key !== "MfgDate"
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

    var details = await user.sequelize.query(`


    with Tray as (SELECT
      [Model],
      SUBSTRING([Tray_no], 1, 9) AS [Tray_no],
          MfgDate,
      QA_no,
      count(QA_no) as QA_no_count
      ,TimeStamp  AS [Hour]
    FROM
      [Tray_Packing].[dbo].[Tray_Record]
        where FORMAT(CONVERT(DATETIME, [MfgDate]), 'yyyy-MM')='${formattedDate}'
      group by [Model],[Tray_no],[MfgDate],QA_no,TimeStamp
      )

  ,Tray_2 as  (
 select QA_no,[Model]
  ,[Tray_no]
  , MfgDate
  ,sum(QA_no_count) as [Count_Tray]

  from Tray
  group by [Model],[Tray_no],QA_no,[MfgDate],FORMAT([Hour], 'HH')
  union all

  SELECT
     QA_no, [Model]
    ,SUBSTRING([Tray_no], 1, 9) AS [Tray_no]
     ,MfgDate
      ,[Count_Tray]
  FROM [Tray_Packing].[dbo].[Matching_Tray]
  WHERE FORMAT(CONVERT(DATETIME, [MfgDate]), 'yyyy-MM')='${formattedDate}'
  )

      SELECT [MfgDate],[Tray_no],[Model] ,QA_no,[Count_Tray],([LotSizeQA]/[Tray_PerQA]*[Count_Tray]) AS  QTY 
      FROM Tray_2
      LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
      ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
      WHERE FORMAT(CONVERT(DATETIME, [MfgDate]), 'yyyy-MM')='${formattedDate}'



`);
var listRawData_details = [];
listRawData_details.push(details[0]);

    var listRawData_month = [];
    listRawData_month.push(resultGraph_month[0]);

    var listRawData = [];
    listRawData.push(resultGraph[0]);

    var listRawData_model = [];
    listRawData_model.push(resultGraph_model[0]);

    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      listRawData,
      PivotTable: PivotTable,
      xAxis,

      result: result[0],
      resultGraph_model: resultGraph_model[0],
      listRawData_model,
      PivotTable_model: PivotTable_model,
      xAxis_model,


      resultGraph_month: resultGraph_month[0],
      listRawData_month,
      PivotTable_month: PivotTable_month,
      xAxis_month,


      listRawData_details,

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
