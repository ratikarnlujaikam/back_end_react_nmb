const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize("PCMC", "DATALYZER", "NMB54321", {
  host: "192.168.101.219",
  //  host: "10.120.122.10", //10.120.122.10
  //port: 2005,
  dialect: "mssql",
  dialectOptions: {
    options: { requestTimeout: 600000 },
  },
});
(async () => {
  await sequelize.authenticate();
})();


router.get("/Model/:Type", async (req, res) => {
  try {
    var result = [[]];
    const { Type } = req.params;
    if(Type == "Shipment"){     var result = await user.sequelize.query(`WITH LatestInvoices AS(
      SELECT *
      FROM (
        SELECT *,
            ROW_NUMBER() OVER (PARTITION BY Lot_No ORDER BY Timpstamp DESC) AS rn
        FROM [PCMC].[dbo].[Invoice]
      ) AS RankedInvoices
      WHERE rn = 1
      )
      ,
      set1 as(SELECT
        LEFT(t.[Item_No], CHARINDEX(' ', t.[Item_No] + ' ') - 1) AS [Item_No],
        t.[MO_No],
        t.[QTY],
        CASE
            WHEN t.[WH] = 'QS1' AND EXISTS (
                SELECT 1
                FROM LatestInvoices inv
                  where inv.[Invoie_ID] LIKE 'WHC%'
                  AND inv.[Lot_No] = t.[MO_No]
            ) THEN 'NAVA1(IN AS400)'
          WHEN t.[WH] = 'QS1' AND EXISTS (
                SELECT 1
                FROM LatestInvoices inv
                  where inv.[Invoie_ID] LIKE 'FDB%'
                  AND inv.[Lot_No] = t.[MO_No]
            ) THEN 'FOR DEPARTURE'
            WHEN t.[WH] = 'QS1' THEN 'SPINDLE'
            WHEN t.[WH] = 'QS9' and([Temp_DO] like 'WPD%' or[Temp_DO] like 'WPF%'
      
            ) THEN 'KORAT'
            WHEN t.[WH] = 'QS9' and([Temp_DO] like 'WPE%' or[Temp_DO] like 'V%'
            ) THEN 'PRACHIN'
            ELSE NULL
        END AS [Result],
            [WH]
          ,[LOC]
          ,[STK_CTL]
          ,[Vendor]
      
        ,t.[Temp_DO] as [invoice_id]
      FROM
        [PCMC].[dbo].[PC_Shipment] t
      ),
      set2 AS (
        SELECT
            LEFT(LatestInvoices.[Item_no], CHARINDEX(' ', LatestInvoices.[Item_no] + ' ') - 1) AS [Item_No],
            LatestInvoices.[Lot_No] AS [MO_No],
            LatestInvoices.[QTY],
            CASE
                WHEN [PC_Shipment].[MO_No] IS NULL THEN 'NAVA2(NOT IN AS400)'
                ELSE [PC_Shipment].[MO_No]
            END AS [Result]
                    ,invoie_id as invoice_id
                    ,'' as[WH]
          ,'' as [LOC]
          ,'' as[STK_CTL]
          ,'' as [Vendor]
      
      
        FROM
             LatestInvoices
        LEFT JOIN
            [PCMC].[dbo].[PC_Shipment]
            ON LatestInvoices.Lot_No = [PC_Shipment].MO_No
        WHERE
            [PC_Shipment].[MO_No] IS NULL
      )
      
      ,set3 as(SELECT [ModelGroup],[Item_No], [MO_No], [QTY],Result,invoice_id,[WH],[LOC],[STK_CTL],[Vendor],[ItemName]
      FROM set1
      inner join [Component_Master].[dbo].[tbMasterItemNo]
      on set1.[Item_No] = [tbMasterItemNo].[ItemNo]
      UNION
      SELECT [ModelGroup],[Item_No], [MO_No], [QTY],Result,invoice_id,[WH],[LOC],[STK_CTL],[Vendor],[ItemName]
      FROM set2
      inner join [Component_Master].[dbo].[tbMasterItemNo]
      on set2.[Item_No] = [tbMasterItemNo].[ItemNo]
      WHERE invoice_id LIKE 'WHC%'
      AND invoice_id > 'WHC23')
          
          select distinct [ModelGroup] as [Model]
          from set3
          union 
          select '**ALL**'`);}

    else if(Type == "WIP"){
     var result = await user.sequelize.query(`WITH Forins AS (
    SELECT [Create_TimeStamp],[Lot_QA], [Mo_number], [Qty], [Model], [Model_No], [W/W], [Baseplate],
           [Ramp], [Crashstop], [Hub], [Magnet], [Diverter], [FPC], [Stack],
           [SP1], [SP2], [SP3], [SP4], [SP5]
    FROM [Setlot].[dbo].[Record_QAPrint] AS R1
    WHERE [Create_TimeStamp] = (
        SELECT MAX(R2.[Create_TimeStamp])
        FROM [Setlot].[dbo].[Record_QAPrint] AS R2
        WHERE R2.[Lot_QA] = R1.[Lot_QA]
    )
),
LatestCO2 AS (
    SELECT CO2.[QA_No],[DateTime]
    FROM (
        SELECT [QA_No], [DateTime],ROW_NUMBER() OVER (PARTITION BY [QA_No] ORDER BY [DateTime] DESC) AS rn
        FROM [QAInspection].[dbo].[Record_Output_CO2]
    ) CO2
    WHERE CO2.rn = 1 
),
LatesttbVisualInspection AS (
    SELECT QA.[QANumber],[Time_VMI]
    FROM (
        SELECT [QANumber],[Time_VMI], ROW_NUMBER() OVER (PARTITION BY [QANumber] ORDER BY [Time_VMI] DESC) AS rn
        FROM [QAInspection].[dbo].[tbVisualInspection]
    ) QA
    WHERE QA.rn = 1    
),
Latestpacking AS (
    SELECT Packing.[Lot_QA],[Time_packing]
    FROM (
        SELECT [Lot_QA], [Time_packing],ROW_NUMBER() OVER (PARTITION BY [Lot_QA] ORDER BY [Time_packing] DESC) AS rn
        FROM [GoldenLine].[dbo].[Bake_to_packing]
    ) Packing
    WHERE Packing.rn = 1 
),
LatestMachingtray AS (
    SELECT Machingtray.[QA_no],[TimeStamp]
    FROM (
        SELECT [QA_no],[TimeStamp], ROW_NUMBER() OVER (PARTITION BY [QA_no] ORDER BY [TimeStamp] DESC) AS rn
        FROM [Tray_Packing].[dbo].[Tray_Record]
    ) Machingtray
    WHERE Machingtray.rn = 1 
),
LatesIntopallet AS (
    SELECT FG.[QANumber],[TimeStamp]
    FROM (
        SELECT [QANumber],[TimeStamp] ,ROW_NUMBER() OVER (PARTITION BY [QANumber] ORDER BY [TimeStamp] DESC) AS rn
        FROM [QAInspection].[dbo].[tbPallet_waitQAtag]
    ) FG
    WHERE FG.rn = 1 and YEAR([TimeStamp]) = 2024 AND MONTH([TimeStamp]) > 9
),
Latesshipment AS (
    SELECT Shipment.Lot_No
    FROM (
        SELECT [Lot_No], ROW_NUMBER() OVER (PARTITION BY [Lot_No] ORDER BY [Timpstamp] DESC) AS rn
        FROM [PCMC].[dbo].[Invoice]
    ) Shipment
    WHERE Shipment.rn = 1
),
LatesAS400 AS (
    SELECT AS400.[MO_No]
    FROM [PCMC].[dbo].[PC_Shipment] AS AS400
    WHERE [WH] = 'QS1' 
),
condition AS (
    SELECT 
        CASE 
		--After Shipment--
            WHEN Shipment.Lot_No is not null or AS400.[MO_No] IS Not NULL THEN 'After shipment'
		--CO2--
            WHEN F.[Lot_QA] IS NOT NULL AND CO2.[QA_No] IS NULL  AND VI.[QANumber] IS NULL  THEN 'CO2'
			--QA--
            WHEN F.[Lot_QA] IS NOT NULL AND CO2.[QA_No] IS NOT NULL AND VI.[QANumber] IS NULL   THEN 'QA'
			--Packing CR--
            WHEN VI.[QANumber] IS NOT NULL AND BP.[Lot_QA] IS NULL AND MC.[QA_no] IS NULL AND FG.[QANumber] IS NULL AND Shipment.Lot_No IS NULL THEN 'Packing CR'
			--Maching tray--
            WHEN  VI.[QANumber] IS NOT NULL AND BP.[Lot_QA] IS NOT NULL AND MC.[QA_no] IS NULL AND FG.[QANumber] IS NULL AND Shipment.Lot_No IS NULL THEN 'Maching Tray'
			--Into Pallet--
            WHEN MC.[QA_no] IS NOT NULL AND FG.[QANumber] IS NULL THEN 'Into Pallet'
			
			--Shipment--            
			WHEN FG.[QANumber] IS NOT NULL AND Shipment.Lot_No IS NULL AND AS400.[MO_No] is NULL  THEN 'Shipment'
  
		
            ELSE 'Complete'
        END AS [Location], FG.[TimeStamp] as[TimeStamp] ,F.*
    FROM Forins F
    LEFT JOIN LatestCO2 CO2 ON F.[Lot_QA] = CO2.[QA_No]
    LEFT JOIN LatesttbVisualInspection VI ON F.[Lot_QA] = VI.[QANumber]
    LEFT JOIN Latestpacking BP ON F.[Lot_QA] = BP.[Lot_QA]
    LEFT JOIN LatestMachingtray MC ON F.[Lot_QA] = MC.[QA_no]
    LEFT JOIN LatesIntopallet FG ON F.[Lot_QA] = FG.[QANumber]
    LEFT JOIN Latesshipment Shipment ON F.[Lot_QA] = Shipment.Lot_No
    LEFT JOIN LatesAS400 AS400 ON F.[Lot_QA] = AS400.[MO_No]
	where LEN(F.[Lot_QA]) >8 

),
LatesHold AS (
    SELECT 
            CASE
                WHEN [Status] = 'Hold' THEN [Hold_Index]
                ELSE '' 
            END AS Hold_NO,
            [QA_No],
            CASE
                WHEN [Status] = 'Hold' THEN [Non_Conformance]
                ELSE '' 
            END AS Hold_detail,
            [DateTime],
            CASE
                WHEN [Status] = 'Hold' THEN 'Hold'
                WHEN [Status] IS NULL THEN 'OK'
                ELSE 'OK'
            END AS Status
        FROM [QAInspection].[dbo].[Tag_HoldQA] AS R1
        WHERE [DateTime] = (
            SELECT MAX(R2.[DateTime])
            FROM [QAInspection].[dbo].[Tag_HoldQA] AS R2
            WHERE R2.[QA_No] = R1.[QA_No]
        ) 
),
Detail  as (SELECT [Location],[Lot_QA],[TimeStamp] as Time_Intopallet,case when Status is null then 'OK' else Status end Status,  case when Hold_NO is null then '' else Hold_NO end Hold_NO, case when Hold_detail is null then '' else Hold_detail end Hold_detail, [Mo_number],[Qty], [Model], [Model_No], [W/W], [Baseplate],
           [Ramp], [Crashstop], [Hub], [Magnet], [Diverter], [FPC], [Stack],
           [SP1], [SP2], [SP3], [SP4], [SP5]

FROM condition
LEFT JOIN LatesHold LHold ON condition.[Lot_QA] = LHold.[QA_No])

SELECT distinct[Model]
	
FROM Detail
where Location != 'After shipment'
union
 select '**ALL**'`)
      

    }
      
 
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
router.get("/Location/:Type", async (req, res) => {
    try {
      var result = [[]];
      const { Type } = req.params;
      if(Type == "Shipment"){
        var result = await user.sequelize.query(`WITH LatestInvoices AS(
          SELECT *
          FROM (
            SELECT *,
                ROW_NUMBER() OVER (PARTITION BY Lot_No ORDER BY Timpstamp DESC) AS rn
            FROM [PCMC].[dbo].[Invoice]
          ) AS RankedInvoices
          WHERE rn = 1
          )
          ,
          set1 as(SELECT
            LEFT(t.[Item_No], CHARINDEX(' ', t.[Item_No] + ' ') - 1) AS [Item_No],
            t.[MO_No],
            t.[QTY],
            CASE
                WHEN t.[WH] = 'QS1' AND EXISTS (
                    SELECT 1
                    FROM LatestInvoices inv
                      where inv.[Invoie_ID] LIKE 'WHC%'
                      AND inv.[Lot_No] = t.[MO_No]
                ) THEN 'NAVA1(IN AS400)'
              WHEN t.[WH] = 'QS1' AND EXISTS (
                    SELECT 1
                    FROM LatestInvoices inv
                      where inv.[Invoie_ID] LIKE 'FDB%'
                      AND inv.[Lot_No] = t.[MO_No]
                ) THEN 'FOR DEPARTURE'
                WHEN t.[WH] = 'QS1' THEN 'SPINDLE'
                WHEN t.[WH] = 'QS9' and([Temp_DO] like 'WPD%' or[Temp_DO] like 'WPF%'
          
                ) THEN 'KORAT'
                WHEN t.[WH] = 'QS9' and([Temp_DO] like 'WPE%' or[Temp_DO] like 'V%'
                ) THEN 'PRACHIN'
                ELSE NULL
            END AS [Result],
                [WH]
              ,[LOC]
              ,[STK_CTL]
              ,[Vendor]
          
            ,t.[Temp_DO] as [invoice_id]
          FROM
            [PCMC].[dbo].[PC_Shipment] t
          ),
          set2 AS (
            SELECT
                LEFT(LatestInvoices.[Item_no], CHARINDEX(' ', LatestInvoices.[Item_no] + ' ') - 1) AS [Item_No],
                LatestInvoices.[Lot_No] AS [MO_No],
                LatestInvoices.[QTY],
                CASE
                    WHEN [PC_Shipment].[MO_No] IS NULL THEN 'NAVA2(NOT IN AS400)'
                    ELSE [PC_Shipment].[MO_No]
                END AS [Result]
                        ,invoie_id as invoice_id
                        ,'' as[WH]
              ,'' as [LOC]
              ,'' as[STK_CTL]
              ,'' as [Vendor]
          
          
            FROM
                 LatestInvoices
            LEFT JOIN
                [PCMC].[dbo].[PC_Shipment]
                ON LatestInvoices.Lot_No = [PC_Shipment].MO_No
            WHERE
                [PC_Shipment].[MO_No] IS NULL
          )
          
          ,set3 as(SELECT [ModelGroup],[Item_No], [MO_No], [QTY],Result,invoice_id,[WH],[LOC],[STK_CTL],[Vendor],[ItemName]
          FROM set1
          inner join [Component_Master].[dbo].[tbMasterItemNo]
          on set1.[Item_No] = [tbMasterItemNo].[ItemNo]
          UNION
          SELECT [ModelGroup],[Item_No], [MO_No], [QTY],Result,invoice_id,[WH],[LOC],[STK_CTL],[Vendor],[ItemName]
          FROM set2
          inner join [Component_Master].[dbo].[tbMasterItemNo]
          on set2.[Item_No] = [tbMasterItemNo].[ItemNo]
          WHERE invoice_id LIKE 'WHC%'
          AND invoice_id > 'WHC23')
              
              select distinct [Result]
              from set3
              union 
              select '**ALL**'`);
      }
      else if(Type == "WIP"){
        var result = await user.sequelize.query(`WITH Forins AS (
        SELECT [Create_TimeStamp],[Lot_QA], [Mo_number], [Qty], [Model], [Model_No], [W/W], [Baseplate],
               [Ramp], [Crashstop], [Hub], [Magnet], [Diverter], [FPC], [Stack],
               [SP1], [SP2], [SP3], [SP4], [SP5]
        FROM [Setlot].[dbo].[Record_QAPrint] AS R1
        WHERE [Create_TimeStamp] = (
            SELECT MAX(R2.[Create_TimeStamp])
            FROM [Setlot].[dbo].[Record_QAPrint] AS R2
            WHERE R2.[Lot_QA] = R1.[Lot_QA]
        )
    ),
    LatestCO2 AS (
        SELECT CO2.[QA_No],[DateTime]
        FROM (
            SELECT [QA_No], [DateTime],ROW_NUMBER() OVER (PARTITION BY [QA_No] ORDER BY [DateTime] DESC) AS rn
            FROM [QAInspection].[dbo].[Record_Output_CO2]
        ) CO2
        WHERE CO2.rn = 1 
    ),
    LatesttbVisualInspection AS (
        SELECT QA.[QANumber],[Time_VMI]
        FROM (
            SELECT [QANumber],[Time_VMI], ROW_NUMBER() OVER (PARTITION BY [QANumber] ORDER BY [Time_VMI] DESC) AS rn
            FROM [QAInspection].[dbo].[tbVisualInspection]
        ) QA
        WHERE QA.rn = 1    
    ),
    Latestpacking AS (
        SELECT Packing.[Lot_QA],[Time_packing]
        FROM (
            SELECT [Lot_QA], [Time_packing],ROW_NUMBER() OVER (PARTITION BY [Lot_QA] ORDER BY [Time_packing] DESC) AS rn
            FROM [GoldenLine].[dbo].[Bake_to_packing]
        ) Packing
        WHERE Packing.rn = 1 
    ),
    LatestMachingtray AS (
        SELECT Machingtray.[QA_no],[TimeStamp]
        FROM (
            SELECT [QA_no],[TimeStamp], ROW_NUMBER() OVER (PARTITION BY [QA_no] ORDER BY [TimeStamp] DESC) AS rn
            FROM [Tray_Packing].[dbo].[Tray_Record]
        ) Machingtray
        WHERE Machingtray.rn = 1 
    ),
    LatesIntopallet AS (
        SELECT FG.[QANumber],[TimeStamp]
        FROM (
            SELECT [QANumber],[TimeStamp] ,ROW_NUMBER() OVER (PARTITION BY [QANumber] ORDER BY [TimeStamp] DESC) AS rn
            FROM [QAInspection].[dbo].[tbPallet_waitQAtag]
        ) FG
        WHERE FG.rn = 1 and YEAR([TimeStamp]) = 2024 AND MONTH([TimeStamp]) > 9
    ),
    Latesshipment AS (
        SELECT Shipment.Lot_No
        FROM (
            SELECT [Lot_No], ROW_NUMBER() OVER (PARTITION BY [Lot_No] ORDER BY [Timpstamp] DESC) AS rn
            FROM [PCMC].[dbo].[Invoice]
        ) Shipment
        WHERE Shipment.rn = 1
    ),
    LatesAS400 AS (
        SELECT AS400.[MO_No]
        FROM [PCMC].[dbo].[PC_Shipment] AS AS400
        WHERE [WH] = 'QS1' 
    ),
    condition AS (
        SELECT 
            CASE 
        --After Shipment--
                WHEN Shipment.Lot_No is not null or AS400.[MO_No] IS Not NULL THEN 'After shipment'
        --CO2--
                WHEN F.[Lot_QA] IS NOT NULL AND CO2.[QA_No] IS NULL  AND VI.[QANumber] IS NULL  THEN 'CO2'
          --QA--
                WHEN F.[Lot_QA] IS NOT NULL AND CO2.[QA_No] IS NOT NULL AND VI.[QANumber] IS NULL   THEN 'QA'
          --Packing CR--
                WHEN VI.[QANumber] IS NOT NULL AND BP.[Lot_QA] IS NULL AND MC.[QA_no] IS NULL AND FG.[QANumber] IS NULL AND Shipment.Lot_No IS NULL THEN 'Packing CR'
          --Maching tray--
                WHEN  VI.[QANumber] IS NOT NULL AND BP.[Lot_QA] IS NOT NULL AND MC.[QA_no] IS NULL AND FG.[QANumber] IS NULL AND Shipment.Lot_No IS NULL THEN 'Maching Tray'
          --Into Pallet--
                WHEN MC.[QA_no] IS NOT NULL AND FG.[QANumber] IS NULL THEN 'Into Pallet'
          
          --Shipment--            
          WHEN FG.[QANumber] IS NOT NULL AND Shipment.Lot_No IS NULL AND AS400.[MO_No] is NULL  THEN 'Shipment'
      
        
                ELSE 'Complete'
            END AS [Location], FG.[TimeStamp] as[TimeStamp] ,F.*
        FROM Forins F
        LEFT JOIN LatestCO2 CO2 ON F.[Lot_QA] = CO2.[QA_No]
        LEFT JOIN LatesttbVisualInspection VI ON F.[Lot_QA] = VI.[QANumber]
        LEFT JOIN Latestpacking BP ON F.[Lot_QA] = BP.[Lot_QA]
        LEFT JOIN LatestMachingtray MC ON F.[Lot_QA] = MC.[QA_no]
        LEFT JOIN LatesIntopallet FG ON F.[Lot_QA] = FG.[QANumber]
        LEFT JOIN Latesshipment Shipment ON F.[Lot_QA] = Shipment.Lot_No
        LEFT JOIN LatesAS400 AS400 ON F.[Lot_QA] = AS400.[MO_No]
      where LEN(F.[Lot_QA]) >8 
    
    ),
    LatesHold AS (
        SELECT 
                CASE
                    WHEN [Status] = 'Hold' THEN [Hold_Index]
                    ELSE '' 
                END AS Hold_NO,
                [QA_No],
                CASE
                    WHEN [Status] = 'Hold' THEN [Non_Conformance]
                    ELSE '' 
                END AS Hold_detail,
                [DateTime],
                CASE
                    WHEN [Status] = 'Hold' THEN 'Hold'
                    WHEN [Status] IS NULL THEN 'OK'
                    ELSE 'OK'
                END AS Status
            FROM [QAInspection].[dbo].[Tag_HoldQA] AS R1
            WHERE [DateTime] = (
                SELECT MAX(R2.[DateTime])
                FROM [QAInspection].[dbo].[Tag_HoldQA] AS R2
                WHERE R2.[QA_No] = R1.[QA_No]
            ) 
    ),
    Detail  as (SELECT [Location] as Result,[Lot_QA],[TimeStamp] as Time_Intopallet,case when Status is null then 'OK' else Status end Status,  case when Hold_NO is null then '' else Hold_NO end Hold_NO, case when Hold_detail is null then '' else Hold_detail end Hold_detail, [Mo_number],[Qty], [Model], [Model_No], [W/W], [Baseplate],
               [Ramp], [Crashstop], [Hub], [Magnet], [Diverter], [FPC], [Stack],
               [SP1], [SP2], [SP3], [SP4], [SP5]
    
    FROM condition
    LEFT JOIN LatesHold LHold ON condition.[Lot_QA] = LHold.[QA_No])
    
    SELECT distinct[Result]      
    FROM Detail
    where Result != 'After shipment'
    union
     select '**ALL**' `);

    }
    
      res.json({
        result: result[0],
       
        api_result: "ok",
      });
      console.log(result);
    } catch (error) {
      console.log(error);
      res.json({
        error,
        api_result: "nok",
      });
    }
  });
router.get("/Status", async (req, res) => {
    try {
      let result = await user.sequelize.query(`Select '**ALL**' as Status
union 
Select 'OK' as Status
union 
Select 'Hold' as Status`);
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
router.get("/Summary/:Model/:Location/:Status/:Type", async (req, res) => {
          try {
            var result = [[]];
            const { Model,Location,Status,Type } = req.params;
              if (Model == "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "Shipment") {
              var result = await sequelize.query('exec Summary_All_PC', {
             
              });
            }
             else if (Model == "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "WIP") {
              var result = await sequelize.query('exec Summary_WIP_All_PC', {
             
              });
            }
              else if(Model == "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "Shipment") {
                var result = await sequelize.query(`exec Summary_Location_PC  @Location = '${Location}'`);
              }
              else if(Model == "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "WIP") {
                var result = await sequelize.query(`exec Summary_WIP_Location_PC  @Location = '${Location}'`);
              }
              else if(Model == "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
                var result = await sequelize.query(`exec Summary_StatusPC @Status = '${Status}'`);
              }
              else if(Model == "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "WIP") {
                var result = await sequelize.query(`exec Summary_WIP_Status_PC  @Status = '${Status}'`);
              }
              else if(Model == "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
                var result = await sequelize.query(`exec Summary_LocationStatus_PC @Status = '${Status}',@Location = '${Location}'`);
              }
              else if(Model == "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "WIP") {
                var result = await sequelize.query(`exec Summary_WIP_LocationStatus_PC @Status = '${Status}',@Location = '${Location}'`);
              }
              else if(Model != "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
                var result = await sequelize.query(`exec Summary_ModelStatus_PC @Model = '${Model}',@Status = '${Status}'`);
              }
              else if(Model != "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "WIP") {
                var result = await sequelize.query(`exec Summary_WIP_ModelStatus_PC @Model = '${Model}',@Status = '${Status}'`);
              }
              else if(Model != "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
                var result = await sequelize.query(`exec Summary_ModelLocationStatus_PC @Model = '${Model}',@Location = '${Location}',@Status = '${Status}'`);
              }
              else if(Model != "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "WIP") {
                var result = await sequelize.query(`exec Summary_WIP_ModelLocationStatus_PC @Model = '${Model}',@Location = '${Location}',@Status = '${Status}'`);
              }
              else if(Model != "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "Shipment") {
                var result = await sequelize.query(`exec Summary_Model_PC  @Model = '${Model}'`);
              }
              else if(Model != "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "WIP") {
                var result = await sequelize.query(`exec Summary_WIP_Model_PC  @Model = '${Model}'`);
              }
              else if(Model != "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "Shipment"){
                var result = await sequelize.query(`exec Summary_ModelLocation_PC @Model = '${Model}',@Location = '${Location}'`);
              }
              else if(Model != "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "Shipment"){
                var result = await sequelize.query(`exec Summary_WIP_ModelLocation_PC  @Model = '${Model}',@Location = '${Location}'`);
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
router.get("/Summarydetail/:Model/:Location/:Status/:Type", async (req, res) => {
        try {
         
          const { Model,Location,Status ,Type } = req.params;
          if (Model == "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "Shipment") {
            var result = await sequelize.query('exec Summary_DetailAll', {
             
            });}


          else if (Model == "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "WIP") {
              var result = await sequelize.query('exec Detail_WIP_PC', {
               
              });
                              
          } 
          else if(Model != "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "Shipment") {
            var result = await sequelize.query(`exec Summary_DetailModel @Model = '${Model}'`);
          }
          else if(Model != "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "WIP") {
            var result = await sequelize.query(`exec Detail_WIP_Model_PC @Model = '${Model}'`);
          }
          else if(Model == "**ALL**" && Location != "**ALL**"&& Status == "**ALL**" && Type == "Shipment") {
              var result = await sequelize.query(`exec Summary_DetailLocation @Location = '${Location}'`);
            }
            else if(Model == "**ALL**" && Location != "**ALL**"&& Status == "**ALL**" && Type == "WIP") {
              var result = await sequelize.query(`exec Detail_WIP_Location_PC @Location = '${Location}'`);
            }  
            else if(Model == "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
              var result = await sequelize.query(`exec Summary_DetailAllStatus @Status = '${Status}'`);
            }
            else if(Model == "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "WIP") {
              var result = await sequelize.query(`exec Detail_WIP_Status_PC @Status = '${Status}'`);
            }
            else if(Model == "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
              var result = await sequelize.query(`exec Summary_DetailLocationStatus @Location = '${Location}',@Status = '${Status}' `);
            }
            else if(Model == "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "WIP") {
              var result = await sequelize.query(`exec Detail_WIP_LocationStatus_PC @Location = '${Location}',@Status = '${Status}' `);
            }
            else if(Model != "**ALL**" && Location == "**ALL**" && Status != "**ALL**"&& Type == "Shipment") {
              var result = await sequelize.query(`exec Summary_DetailModelStatus   @Model = '${Model}',@Status = '${Status}' `);
            }
            else if(Model != "**ALL**" && Location == "**ALL**" && Status != "**ALL**"&& Type == "WIP") {
              var result = await sequelize.query(`exec Detail_WIP_ModelStatus_PC   @Model = '${Model}',@Status = '${Status}' `);
            }
            else if(Model != "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
              var result = await sequelize.query(`exec Summary_DetailModel_Location_Status @Model = '${Model}',@Location = '${Location}',@Status = '${Status}'`);
            }
            else if(Model != "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "WIP") {
              var result = await sequelize.query(`exec Detail_WIP_ModelLocationStatus_PC @Model = '${Model}',@Location = '${Location}',@Status = '${Status}'`);
            }
            else if(Model != "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "Shipment"){
              var result = await sequelize.query(`exec Summary_DetailModel_Location @Model = '${Model}',@Location = '${Location}'`);
            }
            else if(Model != "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "WIP"){
              var result = await sequelize.query(`exec Detail_WIP_ModelLocation_PC @Model = '${Model}',@Location = '${Location}'`);
            }
          
    
          var listRawData3 = [];
          listRawData3.push(result[0]);
    
          res.json({
            result: result[0],
            listRawData3,
            api_result: "ok",
          });
        } catch (error) {
          console.error('Error executing stored procedure:', error);
          res.status(500).send('Internal Server Error');
        }
      }
    );


module.exports = router;