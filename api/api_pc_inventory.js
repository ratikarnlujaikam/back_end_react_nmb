const express = require("express");
const router = express.Router();
const user = require("../database/models/user");




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
     var result = await user.sequelize.query(`SELECT distinct [ModelGroup] as Model
  FROM [Component_Master].[dbo].[tbMasterItemNo]
  where [ModelGroup] != 'ALL' and  [ModelGroup] != 'All Model'
UNION
SELECT '**ALL**'`)
      

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
  
  router.get("/MBAFG", async (req, res) => {
    try {
        // เรียกใช้ stored procedure โดยใช้ sequelize
        const [result] = await user.sequelize.query('EXEC [PCMC].[dbo].[MBAFG]');
        
        // สร้าง array ใหม่เพื่อจัดเก็บผลลัพธ์
        const listRawData2 = [];
        listRawData2.push(result);
        
        // ตรวจสอบว่ามีผลลัพธ์หรือไม่
        if (result && result.length > 0) {
            res.status(200).json({
                result,
                listRawData2,
                api_result: "ok",
            }); console.log(result)       } 
        else {
            res.status(404).json({
                message: "No data found",
                listRawData2,
                api_result: "ok",
            });
        }
    } catch (error) {
        // พิมพ์ข้อผิดพลาดใน console เพื่อการดีบัก
        console.error("Error executing MBAFG: ", error);
        
        // ส่งการตอบกลับข้อผิดพลาด
        res.status(500).json({
            error: error.message || "Internal server error",
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
        var result = await user.sequelize.query(`exec [PCMC].[dbo].LocationWIP `);

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
              var result = await user.sequelize.query('exec [PCMC].[dbo].Summary_All_PC', {
             
              });
            }
             else if (Model == "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "WIP") {
              var result = await user.sequelize.query('exec [PCMC].[dbo].Summary_WIP_All_PC', {
             
              });
            }
              else if(Model == "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "Shipment") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_Location_PC  @Location = '${Location}'`);
              }
              else if(Model == "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "WIP") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_WIP_Location_PC  @Location = '${Location}'`);
              }
              else if(Model == "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_StatusPC @Status = '${Status}'`);
              }
              else if(Model == "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "WIP") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_WIP_Status_PC  @Status = '${Status}'`);
              }
              else if(Model == "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_LocationStatus_PC @Status = '${Status}',@Location = '${Location}'`);
              }
              else if(Model == "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "WIP") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_WIP_LocationStatus_PC @Status = '${Status}',@Location = '${Location}'`);
              }
              else if(Model != "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_ModelStatus_PC @Model = '${Model}',@Status = '${Status}'`);
              }
              else if(Model != "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "WIP") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_WIP_ModelStatus_PC @Model = '${Model}',@Status = '${Status}'`);
              }
              else if(Model != "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_ModelLocationStatus_PC @Model = '${Model}',@Location = '${Location}',@Status = '${Status}'`);
              }
              else if(Model != "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "WIP") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_WIP_ModelLocationStatus_PC @Model = '${Model}',@Location = '${Location}',@Status = '${Status}'`);
              }
              else if(Model != "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "Shipment") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_Model_PC  @Model = '${Model}'`);
              }
              else if(Model != "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "WIP") {
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_WIP_Model_PC  @Model = '${Model}'`);
              }
              else if(Model != "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "Shipment"){
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_ModelLocation_PC @Model = '${Model}',@Location = '${Location}'`);
              }
              else if(Model != "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "WIP"){
                var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_WIP_ModelLocation_PC  @Model = '${Model}',@Location = '${Location}'`);
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
            var result = await user.sequelize.query('exec [PCMC].[dbo].Summary_DetailAll', {
             
            });}


          else if (Model == "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "WIP") {
              var result = await user.sequelize.query('exec [PCMC].[dbo].Detail_WIP_PC', {
               
              });
                              
          } 
          else if(Model != "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "Shipment") {
            var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_DetailModel @Model = '${Model}'`);
          }
          else if(Model != "**ALL**" && Location == "**ALL**" && Status == "**ALL**" && Type == "WIP") {
            var result = await user.sequelize.query(`exec [PCMC].[dbo].Detail_WIP_Model_PC @Model = '${Model}'`);
          }
          else if(Model == "**ALL**" && Location != "**ALL**"&& Status == "**ALL**" && Type == "Shipment") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_DetailLocation @Location = '${Location}'`);
            }
            else if(Model == "**ALL**" && Location != "**ALL**"&& Status == "**ALL**" && Type == "WIP") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Detail_WIP_Location_PC @Location = '${Location}'`);
            }  
            else if(Model == "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_DetailAllStatus @Status = '${Status}'`);
            }
            else if(Model == "**ALL**" && Location == "**ALL**" && Status != "**ALL**" && Type == "WIP") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Detail_WIP_Status_PC @Status = '${Status}'`);
            }
            else if(Model == "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_DetailLocationStatus @Location = '${Location}',@Status = '${Status}' `);
            }
            else if(Model == "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "WIP") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Detail_WIP_LocationStatus_PC @Location = '${Location}',@Status = '${Status}' `);
            }
            else if(Model != "**ALL**" && Location == "**ALL**" && Status != "**ALL**"&& Type == "Shipment") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_DetailModelStatus   @Model = '${Model}',@Status = '${Status}' `);
            }
            else if(Model != "**ALL**" && Location == "**ALL**" && Status != "**ALL**"&& Type == "WIP") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Detail_WIP_ModelStatus_PC   @Model = '${Model}',@Status = '${Status}' `);
            }
            else if(Model != "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "Shipment") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_DetailModel_Location_Status @Model = '${Model}',@Location = '${Location}',@Status = '${Status}'`);
            }
            else if(Model != "**ALL**" && Location != "**ALL**" && Status != "**ALL**" && Type == "WIP") {
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Detail_WIP_ModelLocationStatus_PC @Model = '${Model}',@Location = '${Location}',@Status = '${Status}'`);
            }
            else if(Model != "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "Shipment"){
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Summary_DetailModel_Location @Model = '${Model}',@Location = '${Location}'`);
            }
            else if(Model != "**ALL**" && Location != "**ALL**" && Status == "**ALL**" && Type == "WIP"){
              var result = await user.sequelize.query(`exec [PCMC].[dbo].Detail_WIP_ModelLocation_PC @Model = '${Model}',@Location = '${Location}'`);
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