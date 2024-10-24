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
    with Tray as (
      
      SELECT
    [Model] COLLATE SQL_Latin1_General_CP1_CI_AS as Model,
    SUBSTRING([Tray_no], 1, 9)   COLLATE SQL_Latin1_General_CP1_CI_AS AS [Tray_no],
    [MfgDate],
    QA_no COLLATE SQL_Latin1_General_CP1_CI_AS as QA_no,
    COUNT(QA_no) AS QA_no_count,
    [TimeStamp] AS [Hour],
    ''Tray_Record'' AS [Source] -- เพิ่มคอลัมน์เพื่อระบุแหล่งข้อมูล
FROM
    [Tray_Packing].[dbo].[Tray_Record]
WHERE
    [MfgDate] = ''${start}''
GROUP BY
    [Model], [Tray_no], [MfgDate], QA_no, [TimeStamp]

UNION 

SELECT  
    [Model],
    Item_No as Tray_no,
    Delete_Tray_Record.MfgDate,
    [QA_no],
    [Count_Tray],
    [TimStamp_Input],
    ''Delete_Tray_Record'' AS [Source] -- เพิ่มคอลัมน์เพื่อระบุแหล่งข้อมูล
FROM 
    [Tray_Packing].[dbo].[Delete_Tray_Record]
WHERE 
    Delete_Tray_Record.[MfgDate_Input] = ''${start}''

     
      )
    
     ,Tray_2 as  (
     select [Model]
      ,[Tray_no]
      ,[MfgDate]
      ,sum(QA_no_count) as [Count_Tray]   
      ,FORMAT([Hour]
      , ''HH'') as Time
      ,QA_no
      from Tray
      group by [Model],[Tray_no],QA_no,[MfgDate],FORMAT([Hour], ''HH'')
      union all 
      SELECT 
          [Model]
        ,SUBSTRING([Tray_no], 1, 9) AS [Tray_no]
          ,[MfgDate]
          ,[Count_Tray]
        ,FORMAT(TimeStamp, ''HH'') as Time
        ,QA_no
    
      FROM [Tray_Packing].[dbo].[Matching_Tray]
      where [MfgDate]=''${start}'')
    
        ,by_shif as (
      SELECT 
      ''A'' as shift ,Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Qty) AS  QTY FROM Tray_2
      LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
      ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
      LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
      ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
      where Time between ''07'' and ''14''
      and [MfgDate]=''${start}''
    
      union all
        SELECT 
        ''B'' as shift ,Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Qty) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
        ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
      where Time between ''15'' and ''22''
      and [MfgDate]=''${start}''
        union all
        SELECT 
        ''C'' as shift ,Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Qty) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
        ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
      where Time between ''23'' and ''24'' or Time between ''00'' and ''06''
      and [MfgDate]=''${start}''
    
       union all
 
       SELECT 
        ''M'' as shift ,Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Qty) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
        ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
      where Time between ''07'' and ''18''
      and [MfgDate]=''${start}''
         union all
  
       SELECT 
        ''N'' as shift ,Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Qty) AS  QTY FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
        ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
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
----*************************************************************resultGraph_model*****************************************************
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
    [Model] COLLATE SQL_Latin1_General_CP1_CI_AS as Model,
    SUBSTRING([Tray_no], 1, 9)  COLLATE SQL_Latin1_General_CP1_CI_AS AS [Tray_no],
    [MfgDate],
    QA_no COLLATE SQL_Latin1_General_CP1_CI_AS as QA_no,
    COUNT(QA_no) AS QA_no_count,
    [TimeStamp] AS [Hour],
    ''Tray_Record'' AS [Source] -- เพิ่มคอลัมน์เพื่อระบุแหล่งข้อมูล
FROM
    [Tray_Packing].[dbo].[Tray_Record]
WHERE
    [MfgDate] = ''${start}''
GROUP BY
    [Model], [Tray_no], [MfgDate], QA_no, [TimeStamp]

UNION 

SELECT  
    [Model],
    Item_No as Tray_no,
    Delete_Tray_Record.MfgDate,
    [QA_no],
    [Count_Tray],
    [TimStamp_Input],
    ''Delete_Tray_Record'' AS [Source] -- เพิ่มคอลัมน์เพื่อระบุแหล่งข้อมูล
FROM 
    [Tray_Packing].[dbo].[Delete_Tray_Record]
WHERE 
    Delete_Tray_Record.[MfgDate_Input] = ''${start}''
    
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
        ''A'' as shift ,[QA_no],Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Record_QAPrint.qty) AS  QTY 
        FROM Tray_2
        LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
        ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
        LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
        ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
        where Time between ''07'' and ''14''
        and [MfgDate]=''${start}''
    
        union all
          SELECT
          ''B'' as shift ,[QA_no],Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Record_QAPrint.qty) AS  QTY 
          FROM Tray_2
          LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
          ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
          LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
          ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
        where Time between ''15'' and ''22''
        and [MfgDate]=''${start}''
          union all
          SELECT
          ''C'' as shift ,[QA_no],Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Record_QAPrint.qty) AS  QTY 
          FROM Tray_2
          LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
          ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
          LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
          ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
        where Time between ''23'' and ''24'' or Time between ''00'' and ''06''
        and [MfgDate]=''${start}''
    
         union all
         SELECT
         ''M'' as shift ,[QA_no],Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Record_QAPrint.qty) AS  QTY 
         FROM Tray_2
         LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
         ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
         LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
         ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
        where Time between ''07'' and ''18''
        and [MfgDate]=''${start}''
           union all
         SELECT
         ''N'' as shift ,[QA_no],Time,[Tray_no],Tray_2.[Model],[MfgDate], [tbMasterItemNo].[LotSizeQA] ,[Tray_PerQA],[Count_Tray],(Record_QAPrint.qty) AS  QTY 
         FROM Tray_2
         LEFT JOIN [Component_Master].[dbo].[tbMasterItemNo]
         ON Tray_2.[Tray_no]  =  [tbMasterItemNo].[ItemNo]
         LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
         ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
        where Time between ''19'' and ''24'' or  Time between ''00'' and ''06''
        and [MfgDate]=''${start}'')
    
    
        ,final as  ( SELECT
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
      GROUP BY Model, Tray_no )
  
    select * from final
    union 
    select ''*TOTAL*'' as Model , '''' as Tray_no ,sum(count_lot) as count_lot, sum(A) as A
    ,sum(B) as B , sum(C) as C ,sum(M) as M , sum(N) as N , sum(TOTAL_ABC) as TOTAL_ABC ,sum(TOTAL_MN) as TOTAL_MN from final
    order by Model
      '
      print @DynamicPivotQuery
      -- ***************************************************************************************************************************************************model
      EXEC sp_executesql @DynamicPivotQuery
    
    
  ;
  
  
  
`);

    let PivotTable_model = [];
    let xAxis_model = resultGraph_model[0]
    .filter(item => item.Model !== 'TOTAL') // กรองเอาเฉพาะ Model ที่ไม่ใช่ 'TOTAL'
    .map(item => item.Model);


    let pivot_columns_model = Object.keys(resultGraph_model[0][0]).filter(
      (key) => key !== "Model" 
      && key !== "TOTAL_ABC" && key !== "Tray_no" && key !== "TOTAL_MN" && key !== "count_lot" && key !== "*TOTAL*"
      
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


DECLARE @inputDate NVARCHAR(10) = '${start}';

-- Parse the year, month, and day from the input date
DECLARE @year INT = CONVERT(INT, SUBSTRING(@inputDate, 1, 4));
DECLARE @month INT = CONVERT(INT, SUBSTRING(@inputDate, 6, 2));
DECLARE @day INT = CONVERT(INT, SUBSTRING(@inputDate, 9, 2));

-- Construct the start and end date strings for the entire month
DECLARE @startDate NVARCHAR(10) = CONVERT(NVARCHAR(10), DATEFROMPARTS(@year, @month, 1), 23);
DECLARE @endDate NVARCHAR(10) = CONVERT(NVARCHAR(10), EOMONTH(DATEFROMPARTS(@year, @month, 1)), 23);

WITH Tray AS (
  SELECT
  [Model] COLLATE SQL_Latin1_General_CP1_CI_AS as Model,
  SUBSTRING([Tray_no], 1, 9) COLLATE SQL_Latin1_General_CP1_CI_AS  AS [Tray_no],
  MfgDate,
  QA_no COLLATE SQL_Latin1_General_CP1_CI_AS as QA_no,
  COUNT(QA_no) AS QA_no_count,
  TimeStamp AS [Hour]
FROM
  [Tray_Packing].[dbo].[Tray_Record]
WHERE[MfgDate] >= @startDate AND [MfgDate] <= @endDate
GROUP BY
  [Model], [Tray_no], [MfgDate], QA_no, TimeStamp
union 
SELECT  
[Model],
Item_No as Tray_no,
Delete_Tray_Record.[MfgDate_Input],
[QA_no],
[Count_Tray],
[TimStamp_Input]
FROM 
[Tray_Packing].[dbo].[Delete_Tray_Record]
WHERE Delete_Tray_Record.[MfgDate_Input] >= @startDate AND [MfgDate_Input] <= @endDate
),

Tray_2 AS (
    SELECT
        [Model],
        [Tray_no],
        MfgDate,
        SUM(QA_no_count) AS [Count_Tray],
        FORMAT([Hour], 'HH') AS Time
        ,QA_no
    FROM
        Tray
    GROUP BY
        [Model], [Tray_no], QA_no, [MfgDate], FORMAT([Hour], 'HH')

    UNION ALL

    SELECT
        [Model],
        SUBSTRING([Tray_no], 1, 9) AS [Tray_no],
        MfgDate,
        [Count_Tray],
        FORMAT(TimeStamp, 'HH') AS Time
        ,QA_no
    FROM
        [Tray_Packing].[dbo].[Matching_Tray]
    WHERE
        [MfgDate] >= @startDate AND [MfgDate] <= @endDate
)

, by_shif AS (
    SELECT
        Time,
        [Tray_no],
        Tray_2.[Model],
        [MfgDate],
        [tbMasterItemNo].[LotSizeQA],
        [Tray_PerQA],
        [Count_Tray],
        SUM(Record_QAPrint.QTY) AS QTY
    FROM
        Tray_2
    LEFT JOIN
        [Component_Master].[dbo].[tbMasterItemNo] ON Tray_2.[Tray_no] = [tbMasterItemNo].[ItemNo]
        LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
        ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 
       
        
    WHERE
        [MfgDate] >= @startDate AND [MfgDate] <= @endDate
        GROUP BY Time,Tray_no,Tray_2.[Model],MfgDate,[tbMasterItemNo].[LotSizeQA],Tray_PerQA,Count_Tray
)

SELECT
    FORMAT(MfgDate, 'MM-dd') AS MfgDate,
    SUM(QTY) AS QTY
FROM
    by_shif
GROUP BY
    MfgDate
    order by MfgDate

    



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


    DECLARE @inputDate NVARCHAR(10) = '${start}';

    -- Parse the year, month, and day from the input date
    DECLARE @year INT = CONVERT(INT, SUBSTRING(@inputDate, 1, 4));
    DECLARE @month INT = CONVERT(INT, SUBSTRING(@inputDate, 6, 2));
    DECLARE @day INT = CONVERT(INT, SUBSTRING(@inputDate, 9, 2));
    
    -- Construct the start and end date strings for the entire month
    DECLARE @startDate NVARCHAR(10) = CONVERT(NVARCHAR(10), DATEFROMPARTS(@year, @month, 1), 23);
    DECLARE @endDate NVARCHAR(10) = CONVERT(NVARCHAR(10), EOMONTH(DATEFROMPARTS(@year, @month, 1)), 23);
    
    WITH Tray AS (
      SELECT
      [Model] COLLATE SQL_Latin1_General_CP1_CI_AS as Model,
      SUBSTRING([Tray_no], 1, 9) COLLATE SQL_Latin1_General_CP1_CI_AS AS  [Tray_no],
      MfgDate,
      QA_no COLLATE SQL_Latin1_General_CP1_CI_AS as QA_no,
      COUNT(QA_no) AS QA_no_count,
      TimeStamp AS [Hour]
  FROM
      [Tray_Packing].[dbo].[Tray_Record]
  WHERE[MfgDate] >= @startDate AND [MfgDate] <= @endDate
  GROUP BY
      [Model], [Tray_no], [MfgDate], QA_no, TimeStamp
union 
SELECT  
  [Model],
  [Item_No] as Tray_no,
  Delete_Tray_Record.[MfgDate_Input],
  [QA_no],
  [Count_Tray],
  [TimStamp_Input]
FROM 
  [Tray_Packing].[dbo].[Delete_Tray_Record]
WHERE Delete_Tray_Record.[MfgDate_Input] >= @startDate AND [MfgDate_Input] <= @endDate
    ),
    
    Tray_2 AS (
        SELECT
            QA_no,
            [Model],
            [Tray_no],
            MfgDate,
            SUM(QA_no_count) AS [Count_Tray]
        FROM
            Tray
        GROUP BY
            [Model], [Tray_no], QA_no, [MfgDate]
    
        UNION ALL
    
        SELECT
            QA_no,
            [Model],
            SUBSTRING([Tray_no], 1, 9) AS [Tray_no],
            MfgDate,
            [Count_Tray]
        FROM
            [Tray_Packing].[dbo].[Matching_Tray]
        WHERE
            [MfgDate] >= CONVERT(DATETIME, @startDate)
            AND [MfgDate] <= CONVERT(DATETIME, @endDate)
    )
    
    SELECT
        [MfgDate],
        [Tray_no],
        Tray_2.[Model],
        QA_no,
        [Count_Tray],
        sum(Record_QAPrint.QTY) AS QTY 
    FROM
        Tray_2
    LEFT JOIN
        [Component_Master].[dbo].[tbMasterItemNo] ON Tray_2.[Tray_no] = [tbMasterItemNo].[ItemNo]
        LEFT JOIN [Setlot].[dbo].[Record_QAPrint]
        ON Tray_2.QA_no = Record_QAPrint.[Lot_QA] 

    WHERE
        [MfgDate] >= CONVERT(DATETIME, @startDate)
        AND [MfgDate] <= CONVERT(DATETIME, @endDate)
        group by MfgDate,Tray_no,Tray_2.[Model],QA_no,Count_Tray
    ORDER BY
        QA_no;
    



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
