const express = require("express");
const router = express.Router();
const user = require("../database/models/user");




router.get("/Model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`SELECT distinct [ModelGroup] as Model
  FROM [Component_Master].[dbo].[tbMasterItemNo]
  where [ModelGroup] != 'ALL' and  [ModelGroup] != 'All Model'
UNION
SELECT '**ALL**'`);
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
router.get("/SummaryNGlot/:Model/:Startdate/:Finishdate/:Molot", async (req, res) => {
  try {
    var result = [[]];
    const { Model,Molot,Startdate,Finishdate } = req.params;
      if (Model == "**ALL**" && Molot == "-") {
      var result = await user.sequelize.query(` WITH LatestNG AS (
    SELECT
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [Emp],
        SUM([NG_Detail].[Qty]) AS [Qty],
        [NG_Detail].[TimeStamp],
        ROW_NUMBER() OVER (PARTITION BY [NG_Detail].[MO] ORDER BY [NG_Detail].[TimeStamp] DESC) AS RowNum
    FROM
        [NG_Lot_Record].[dbo].[NG_Detail]
    INNER JOIN
        [NG_Lot_Record].[dbo].[Register_MO]
        ON [NG_Detail].[MO] = [Register_MO].[MO]
    GROUP BY
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [Emp],
        [NG_Detail].[TimeStamp]
),

RawActual AS (
    SELECT
        [Model],
        [Line],
        [MO],
        [Motor],
        [Qty],
        [Emp],
        [TimeStamp],
        [MfgDate],
        [Remark],
        ROW_NUMBER() OVER (PARTITION BY [Motor] ORDER BY [TimeStamp] DESC) AS RowNum
    FROM
        [NG_Lot_Record].[dbo].[RW_SC]
),

ACTUAL AS (
    SELECT
        [MO],
        SUM([Qty]) AS Actual_receive
    FROM
        RawActual
    WHERE
        RowNum = 1
        AND Remark IS NULL
    GROUP BY
        [Model],
        [Line],
        [MO],
        [Emp],
        [TimeStamp],
        [MfgDate],
        [Remark]
),

CTE AS (
    SELECT
        [MO],
        [Status],
        SUM([Qty]) AS QTY
    FROM
        [NG_Lot_Record].[dbo].[History_InOut]
    WHERE
        Remark IS NULL
        AND [Status] IN ('O', 'I') -- Only Status 'O' and 'I'
    GROUP BY
        [MO],
        [Status]
),

Testing AS (
    SELECT
        CTE_O.[MO],
        COALESCE(CTE_O.QTY, 0) AS QTY_Status_O,
        COALESCE(CTE_I.QTY, 0) AS QTY_Status_I,
        COALESCE(CTE_O.QTY, 0) - COALESCE(CTE_I.QTY, 0) AS For_Other_Testing
    FROM
        (SELECT [MO], QTY FROM CTE WHERE [Status] = 'O') CTE_O
    LEFT JOIN
        (SELECT [MO], QTY FROM CTE WHERE [Status] = 'I') CTE_I
    ON
        CTE_O.[MO] = CTE_I.[MO]
)

SELECT
[Inventory_Month],
    LatestNG.[MfgDate] as Date ,
	State,
    LatestNG.[ModelGroup],
    LatestNG.[Item_No],
       'L' +LatestNG.[Line] as Line,
    LatestNG.[MO],
    LatestNG.[Emp],
    LatestNG.[Qty] AS NG_total,
    CASE
        WHEN Actual_receive IS NULL THEN 0
        ELSE Actual_receive
    END AS Actual_receive,
    CASE
        WHEN For_Other_Testing IS NULL THEN 0
        ELSE For_Other_Testing
    END AS For_Other_Testing
FROM
    LatestNG
LEFT JOIN
    ACTUAL ON LatestNG.MO = ACTUAL.MO
LEFT JOIN
    Testing ON LatestNG.MO = Testing.MO
LEFT JOIN [NG_Lot_Record].[dbo].[Register_MO] on LatestNG.MO = Register_MO.MO 
LEFT JOIN [NG_Lot_Record].[dbo].[Separation_Inventory] on LatestNG.MO = [Separation_Inventory].MO 
WHERE 
    RowNum = 1 
    and LatestNG.MfgDate between '${Startdate}' and '${Finishdate}'
ORDER BY
    LatestNG.[MfgDate] DESC,
    LatestNG.ModelGroup asc,
    LatestNG.Item_No asc,
    Line asc,
    [MO] ASC`, {
     
      });
    }
     else if (Model == "**ALL**" && Molot != "-") {
      var result = await user.sequelize.query(` WITH LatestNG AS (
    SELECT
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [Emp],
        SUM([NG_Detail].[Qty]) AS [Qty],
        [NG_Detail].[TimeStamp],
        ROW_NUMBER() OVER (PARTITION BY [NG_Detail].[MO] ORDER BY [NG_Detail].[TimeStamp] DESC) AS RowNum
    FROM
        [NG_Lot_Record].[dbo].[NG_Detail]
    INNER JOIN
        [NG_Lot_Record].[dbo].[Register_MO]
        ON [NG_Detail].[MO] = [Register_MO].[MO]
    GROUP BY
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [Emp],
        [NG_Detail].[TimeStamp]
),

RawActual AS (
    SELECT
        [Model],
        [Line],
        [MO],
        [Motor],
        [Qty],
        [Emp],
        [TimeStamp],
        [MfgDate],
        [Remark],
        ROW_NUMBER() OVER (PARTITION BY [Motor] ORDER BY [TimeStamp] DESC) AS RowNum
    FROM
        [NG_Lot_Record].[dbo].[RW_SC]
),

ACTUAL AS (
    SELECT
        [MO],
        SUM([Qty]) AS Actual_receive
    FROM
        RawActual
    WHERE
        RowNum = 1
        AND Remark IS NULL
    GROUP BY
        [Model],
        [Line],
        [MO],
        [Emp],
        [TimeStamp],
        [MfgDate],
        [Remark]
),

CTE AS (
    SELECT
        [MO],
        [Status],
        SUM([Qty]) AS QTY
    FROM
        [NG_Lot_Record].[dbo].[History_InOut]
    WHERE
        Remark IS NULL
        AND [Status] IN ('O', 'I') -- Only Status 'O' and 'I'
    GROUP BY
        [MO],
        [Status]
),

Testing AS (
    SELECT
        CTE_O.[MO],
        COALESCE(CTE_O.QTY, 0) AS QTY_Status_O,
        COALESCE(CTE_I.QTY, 0) AS QTY_Status_I,
        COALESCE(CTE_O.QTY, 0) - COALESCE(CTE_I.QTY, 0) AS For_Other_Testing
    FROM
        (SELECT [MO], QTY FROM CTE WHERE [Status] = 'O') CTE_O
    LEFT JOIN
        (SELECT [MO], QTY FROM CTE WHERE [Status] = 'I') CTE_I
    ON
        CTE_O.[MO] = CTE_I.[MO]
)

SELECT
[Inventory_Month],
    LatestNG.[MfgDate] as Date ,
	State,
    LatestNG.[ModelGroup],
    LatestNG.[Item_No],
       'L' +LatestNG.[Line] as Line,
    LatestNG.[MO],
    LatestNG.[Emp],
    LatestNG.[Qty] AS NG_total,
    CASE
        WHEN Actual_receive IS NULL THEN 0
        ELSE Actual_receive
    END AS Actual_receive,
    CASE
        WHEN For_Other_Testing IS NULL THEN 0
        ELSE For_Other_Testing
    END AS For_Other_Testing
FROM
    LatestNG
LEFT JOIN
    ACTUAL ON LatestNG.MO = ACTUAL.MO
LEFT JOIN
    Testing ON LatestNG.MO = Testing.MO
LEFT JOIN [NG_Lot_Record].[dbo].[Register_MO] on LatestNG.MO = Register_MO.MO 
LEFT JOIN [NG_Lot_Record].[dbo].[Separation_Inventory] on LatestNG.MO = [Separation_Inventory].MO 
WHERE 
    RowNum = 1 
       and  LatestNG.[MO] = '${Molot}'
ORDER BY
    LatestNG.[MfgDate] DESC,
    LatestNG.ModelGroup asc,
    LatestNG.Item_No asc,
    Line asc,
    [MO] ASC`, {
     
      });
    }
      else if(Model != "**ALL**" && Molot == "-") {
        var result = await user.sequelize.query(` WITH LatestNG AS (
    SELECT
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [Emp],
        SUM([NG_Detail].[Qty]) AS [Qty],
        [NG_Detail].[TimeStamp],
        ROW_NUMBER() OVER (PARTITION BY [NG_Detail].[MO] ORDER BY [NG_Detail].[TimeStamp] DESC) AS RowNum
    FROM
        [NG_Lot_Record].[dbo].[NG_Detail]
    INNER JOIN
        [NG_Lot_Record].[dbo].[Register_MO]
        ON [NG_Detail].[MO] = [Register_MO].[MO]
    GROUP BY
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [Emp],
        [NG_Detail].[TimeStamp]
),

RawActual AS (
    SELECT
        [Model],
        [Line],
        [MO],
        [Motor],
        [Qty],
        [Emp],
        [TimeStamp],
        [MfgDate],
        [Remark],
        ROW_NUMBER() OVER (PARTITION BY [Motor] ORDER BY [TimeStamp] DESC) AS RowNum
    FROM
        [NG_Lot_Record].[dbo].[RW_SC]
),

ACTUAL AS (
    SELECT
        [MO],
        SUM([Qty]) AS Actual_receive
    FROM
        RawActual
    WHERE
        RowNum = 1
        AND Remark IS NULL
    GROUP BY
        [Model],
        [Line],
        [MO],
        [Emp],
        [TimeStamp],
        [MfgDate],
        [Remark]
),

CTE AS (
    SELECT
        [MO],
        [Status],
        SUM([Qty]) AS QTY
    FROM
        [NG_Lot_Record].[dbo].[History_InOut]
    WHERE
        Remark IS NULL
        AND [Status] IN ('O', 'I') -- Only Status 'O' and 'I'
    GROUP BY
        [MO],
        [Status]
),

Testing AS (
    SELECT
        CTE_O.[MO],
        COALESCE(CTE_O.QTY, 0) AS QTY_Status_O,
        COALESCE(CTE_I.QTY, 0) AS QTY_Status_I,
        COALESCE(CTE_O.QTY, 0) - COALESCE(CTE_I.QTY, 0) AS For_Other_Testing
    FROM
        (SELECT [MO], QTY FROM CTE WHERE [Status] = 'O') CTE_O
    LEFT JOIN
        (SELECT [MO], QTY FROM CTE WHERE [Status] = 'I') CTE_I
    ON
        CTE_O.[MO] = CTE_I.[MO]
)

SELECT
[Inventory_Month],
    LatestNG.[MfgDate] as Date ,
	State,
    LatestNG.[ModelGroup],
    LatestNG.[Item_No],
       'L' +LatestNG.[Line] as Line,
    LatestNG.[MO],
    LatestNG.[Emp],
    LatestNG.[Qty] AS NG_total,
    CASE
        WHEN Actual_receive IS NULL THEN 0
        ELSE Actual_receive
    END AS Actual_receive,
    CASE
        WHEN For_Other_Testing IS NULL THEN 0
        ELSE For_Other_Testing
    END AS For_Other_Testing
FROM
    LatestNG
LEFT JOIN
    ACTUAL ON LatestNG.MO = ACTUAL.MO
LEFT JOIN
    Testing ON LatestNG.MO = Testing.MO
LEFT JOIN [NG_Lot_Record].[dbo].[Register_MO] on LatestNG.MO = Register_MO.MO 
LEFT JOIN [NG_Lot_Record].[dbo].[Separation_Inventory] on LatestNG.MO = [Separation_Inventory].MO 
WHERE 
    RowNum = 1 
    and LatestNG.MfgDate between '${Startdate}' and '${Finishdate}'
    and  LatestNG.ModelGroup = '${Model}'
ORDER BY
    LatestNG.[MfgDate] DESC,
    LatestNG.ModelGroup asc,
    LatestNG.Item_No asc,
    Line asc,
    [MO] ASC`);
      }
      else if(Model != "**ALL**" && Molot != "-") {
        var result = await user.sequelize.query(` WITH LatestNG AS (
    SELECT
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [Emp],
        SUM([NG_Detail].[Qty]) AS [Qty],
        [NG_Detail].[TimeStamp],
        ROW_NUMBER() OVER (PARTITION BY [NG_Detail].[MO] ORDER BY [NG_Detail].[TimeStamp] DESC) AS RowNum
    FROM
        [NG_Lot_Record].[dbo].[NG_Detail]
    INNER JOIN
        [NG_Lot_Record].[dbo].[Register_MO]
        ON [NG_Detail].[MO] = [Register_MO].[MO]
    GROUP BY
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [Emp],
        [NG_Detail].[TimeStamp]
),

RawActual AS (
    SELECT
        [Model],
        [Line],
        [MO],
        [Motor],
        [Qty],
        [Emp],
        [TimeStamp],
        [MfgDate],
        [Remark],
        ROW_NUMBER() OVER (PARTITION BY [Motor] ORDER BY [TimeStamp] DESC) AS RowNum
    FROM
        [NG_Lot_Record].[dbo].[RW_SC]
),

ACTUAL AS (
    SELECT
        [MO],
        SUM([Qty]) AS Actual_receive
    FROM
        RawActual
    WHERE
        RowNum = 1
        AND Remark IS NULL
    GROUP BY
        [Model],
        [Line],
        [MO],
        [Emp],
        [TimeStamp],
        [MfgDate],
        [Remark]
),

CTE AS (
    SELECT
        [MO],
        [Status],
        SUM([Qty]) AS QTY
    FROM
        [NG_Lot_Record].[dbo].[History_InOut]
    WHERE
        Remark IS NULL
        AND [Status] IN ('O', 'I') -- Only Status 'O' and 'I'
    GROUP BY
        [MO],
        [Status]
),

Testing AS (
    SELECT
        CTE_O.[MO],
        COALESCE(CTE_O.QTY, 0) AS QTY_Status_O,
        COALESCE(CTE_I.QTY, 0) AS QTY_Status_I,
        COALESCE(CTE_O.QTY, 0) - COALESCE(CTE_I.QTY, 0) AS For_Other_Testing
    FROM
        (SELECT [MO], QTY FROM CTE WHERE [Status] = 'O') CTE_O
    LEFT JOIN
        (SELECT [MO], QTY FROM CTE WHERE [Status] = 'I') CTE_I
    ON
        CTE_O.[MO] = CTE_I.[MO]
)

SELECT
[Inventory_Month],
    LatestNG.[MfgDate] as Date ,
	State,
    LatestNG.[ModelGroup],
    LatestNG.[Item_No],
       'L' +LatestNG.[Line] as Line,
    LatestNG.[MO],
    LatestNG.[Emp],
    LatestNG.[Qty] AS NG_total,
    CASE
        WHEN Actual_receive IS NULL THEN 0
        ELSE Actual_receive
    END AS Actual_receive,
    CASE
        WHEN For_Other_Testing IS NULL THEN 0
        ELSE For_Other_Testing
    END AS For_Other_Testing
FROM
    LatestNG
LEFT JOIN
    ACTUAL ON LatestNG.MO = ACTUAL.MO
LEFT JOIN
    Testing ON LatestNG.MO = Testing.MO
LEFT JOIN [NG_Lot_Record].[dbo].[Register_MO] on LatestNG.MO = Register_MO.MO 
LEFT JOIN [NG_Lot_Record].[dbo].[Separation_Inventory] on LatestNG.MO = [Separation_Inventory].MO 
WHERE 
    RowNum = 1 
    and LatestNG.MfgDate between '${Startdate}' and '${Finishdate}'
    and  LatestNG.ModelGroup = '${Model}' and LatestNG.[MO] = '${Molot}'
ORDER BY
    LatestNG.[MfgDate] DESC,
    LatestNG.ModelGroup asc,
    LatestNG.Item_No asc,
    Line asc,
    [MO] ASC`);
      }
     

    var listRawData1 = [];
    listRawData1.push(result[0]);

    res.json({
      result: result[0],
      listRawData1,
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
router.get("/DetailNGlot/:Model/:Startdate/:Finishdate/:Molot", async (req, res) => {
  try {
    var result = [[]];
    const { Model,Molot,Startdate,Finishdate } = req.params;
      if (Model == "**ALL**" && Molot == "-") {
      var result = await user.sequelize.query(`WITH LatestNG AS (
    SELECT 
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
         Line,
        [NG_Detail].[MO],
        [NG_Case],
        [NG_Detail].[Qty],
        [Item],
        [NG_Detail].[TimeStamp],
        [Emp],
        ROW_NUMBER() OVER (PARTITION BY [NG_Detail].[MO] ORDER BY [NG_Detail].[TimeStamp] DESC) AS RowNum
    FROM 
        [NG_Lot_Record].[dbo].[NG_Detail]
    INNER JOIN 
        [NG_Lot_Record].[dbo].[Register_MO] 
        ON [NG_Detail].[MO] = [Register_MO].[MO]
)
SELECT 
    [MfgDate] as Date,
    [ModelGroup],
    [Item_No],
       'L'+[Line] as Line,
    [MO],
    [NG_Case],
    [Qty] as QTY,
    [Item],
    [TimeStamp],
    [Emp]
FROM 
    LatestNG
WHERE 
    MfgDate between '${Startdate}' and '${Finishdate}'
ORDER BY 
    [MfgDate] DESC,
    ModelGroup asc,
    Item_No asc,
    Line asc,
    [MO] ASC`, {
     
      });
    }
     else if (Model == "**ALL**" && Molot != "-") {
      var result = await user.sequelize.query(`WITH LatestNG AS (
    SELECT 
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [NG_Case],
        [NG_Detail].[Qty],
        [Item],
        [NG_Detail].[TimeStamp],
        [Emp],
        ROW_NUMBER() OVER (PARTITION BY [NG_Detail].[MO] ORDER BY [NG_Detail].[TimeStamp] DESC) AS RowNum
    FROM 
        [NG_Lot_Record].[dbo].[NG_Detail]
    INNER JOIN 
        [NG_Lot_Record].[dbo].[Register_MO] 
        ON [NG_Detail].[MO] = [Register_MO].[MO]
)
SELECT 
    [MfgDate] as Date,
    [ModelGroup],
    [Item_No],
       'L'+[Line] as Line,
    [MO],
    [NG_Case],
    [Qty],
    [Item],
    [TimeStamp],
    [Emp]
FROM 
    LatestNG
WHERE 
  MO = '${Molot}'
ORDER BY 
     [MfgDate] DESC,
    ModelGroup asc,
    Item_No asc,
    Line asc,
    [MO] ASC`, {
     
      });
    }
      else if(Model != "**ALL**" && Molot == "-") {
        var result = await user.sequelize.query(`WITH LatestNG AS (
    SELECT 
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [NG_Case],
        [NG_Detail].[Qty],
        [Item],
        [NG_Detail].[TimeStamp],
        [Emp],
        ROW_NUMBER() OVER (PARTITION BY [NG_Detail].[MO] ORDER BY [NG_Detail].[TimeStamp] DESC) AS RowNum
    FROM 
        [NG_Lot_Record].[dbo].[NG_Detail]
    INNER JOIN 
        [NG_Lot_Record].[dbo].[Register_MO] 
        ON [NG_Detail].[MO] = [Register_MO].[MO]
)
SELECT 
    [MfgDate] as Date,
    [ModelGroup],
    [Item_No],
       'L'+[Line] as Line,
    [MO],
    [NG_Case],
    [Qty],
    [Item],
    [TimeStamp],
    [Emp]
FROM 
    LatestNG
WHERE 
    MfgDate between '${Startdate}' and '${Finishdate}'
    and  ModelGroup = '${Model}'
ORDER BY 
      [MfgDate] DESC,
    ModelGroup asc,
    Item_No asc,
    Line asc,
    [MO] ASC`);
      }
      else if(Model != "**ALL**" && Molot != "-") {
        var result = await user.sequelize.query(`WITH LatestNG AS (
    SELECT 
        [NG_Detail].[MfgDate],
        [ModelGroup],
        [Item_No],
        [Line],
        [NG_Detail].[MO],
        [NG_Case],
        [NG_Detail].[Qty],
        [Item],
        [NG_Detail].[TimeStamp],
        [Emp],
        ROW_NUMBER() OVER (PARTITION BY [NG_Detail].[MO] ORDER BY [NG_Detail].[TimeStamp] DESC) AS RowNum
    FROM 
        [NG_Lot_Record].[dbo].[NG_Detail]
    INNER JOIN 
        [NG_Lot_Record].[dbo].[Register_MO] 
        ON [NG_Detail].[MO] = [Register_MO].[MO]
)
SELECT 
    [MfgDate] as Date,
    [ModelGroup],
    [Item_No],
       'L'+[Line] as Line,
    [MO],
    [NG_Case],
    [Qty],
    [Item],
    [TimeStamp],
    [Emp]
FROM 
    LatestNG
WHERE 
    MfgDate between '${Startdate}' and '${Finishdate}'
    and  ModelGroup = '${Model}' and [MO] = '${Molot}'
ORDER BY 
      [MfgDate] DESC,
    ModelGroup asc,
    Item_No asc,
    Line asc,
    [MO] ASC`);
      }
     

    var listRawData2 = [];
    listRawData2.push(result[0]);

    res.json({
      result: result[0],
      listRawData2,
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
router.get("/TakeoutNGlot/:Model/:Startdate/:Finishdate/:Molot", async (req, res) => {
  try {
    var result = [[]];
    const { Model,Molot,Startdate,Finishdate } = req.params;
      if (Model == "**ALL**" && Molot == "-") {
      var result = await user.sequelize.query(`SELECT [Model]
      ,   'L'+[Line] as Line
      ,[MO]
      ,[Reason]
      ,[Motor]
      ,[Qty]
      ,[Status]
      ,[Section]
      ,[Updater]
      ,[Emp_IO]
      ,[TimeStamp]
      ,[MfgDate]
  FROM [NG_Lot_Record].[dbo].[History_InOut]

WHERE 
    MfgDate between '${Startdate}' and '${Finishdate}'
ORDER BY 
    [MfgDate] DESC,
    Model asc,
    Line asc,
    [MO] ASC;`, {
     
      });
    }
     else if (Model == "**ALL**" && Molot != "-") {
      var result = await user.sequelize.query(`SELECT [Model]
      , 'L'+[Line] as Line
      ,[MO]
      ,[Reason]
      ,[Motor]
      ,[Qty]
      ,[Status]
      ,[Section]
      ,[Updater]
      ,[Emp_IO]
      ,[TimeStamp]
      ,[MfgDate]
  FROM [NG_Lot_Record].[dbo].[History_InOut]

WHERE 
      MO = '${Molot}'
ORDER BY 
   [MfgDate] DESC,
    Model asc,
    Line asc,
    [MO] ASC;`, {
     
      });
    }
      else if(Model != "**ALL**" && Molot == "-") {
        var result = await user.sequelize.query(`SELECT [Model]
      , 'L'+[Line] as Line
      ,[MO]
      ,[Reason]
      ,[Motor]
      ,[Qty]
      ,[Status]
      ,[Section]
      ,[Updater]
      ,[Emp_IO]
      ,[TimeStamp]
      ,[MfgDate]
  FROM [NG_Lot_Record].[dbo].[History_InOut]

WHERE 
    MfgDate between '${Startdate}' and '${Finishdate}'
    and  Model = '${Model}'
ORDER BY 
    [MfgDate] DESC,
    Model asc,
    Line asc,
    [MO] ASC;`);
      }
      else if(Model != "**ALL**" && Molot != "-") {
        var result = await user.sequelize.query(`SELECT [Model]
      , 'L'+[Line] as Line
      ,[MO]
      ,[Reason]
      ,[Motor]
      ,[Qty]
      ,[Status]
      ,[Section]
      ,[Updater]
      ,[Emp_IO]
      ,[TimeStamp]
      ,[MfgDate]
  FROM [NG_Lot_Record].[dbo].[History_InOut]

WHERE 
   MfgDate between '${Startdate}' and '${Finishdate}'
    and  Model = '${Model}' and [MO] = '${Molot}'
ORDER BY 
    [MfgDate] DESC,
    Model asc,
    Line asc,
    [MO] ASC;`);
      }
     

    var listRawData3 = [];
    listRawData3.push(result[0]);

    res.json({
      result: result[0],
      listRawData3,
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