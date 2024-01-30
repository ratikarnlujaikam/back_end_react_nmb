const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/print/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`
    SELECT [Lot_QA]
      ,[Mo_number]
      ,[Model]
      ,[Model_No]
      ,[Line]
      ,[Special_control]
      ,[Supporter_name]
      ,[W/W]
      ,[Baseplate]
      ,[Ramp]
      ,[Crashstop]
      ,[Hub]
      ,[Magnet]
      ,[Diverter]
      ,[FPC]
      ,[Stack]
      ,[DateTime]
      ,[Machine_no]
      ,[CO2_EMP]
      ,[CO2_DATE]
      ,[CO2_SP1]
      ,[CO2_SP2]
      ,[SP1]
      ,[SP2]
      ,[SP3]
      ,[SP4]
      ,[SP5]
      ,[Revision]
	,CASE
      WHEN [Lot_QA]='${QANumber}' THEN 'Print_forsetlot'
      ELSE 'NOT'
  END as Print_forsetlot
        ,sum([Qty])as Qty
      ,FORMAT([DateTime], 'yyyy-MM-dd') as dateP
    FROM [Setlot].[dbo].[Record_QAPrint]
    where [Lot_QA]='${QANumber}'
    group by [Lot_QA]
      ,[Mo_number]
      ,[Qty]
      ,[Model]
      ,[Model_No]
      ,[Line]
      ,[Special_control]
      ,[Supporter_name]
      ,[W/W]
      ,[Baseplate]
      ,[Ramp]
      ,[Crashstop]
      ,[Hub]
      ,[Magnet]
      ,[Diverter]
      ,[FPC]
      ,[Stack]
      ,[DateTime]
      ,[Machine_no]
      ,[CO2_EMP]
      ,[CO2_DATE]
      ,[CO2_SP1]
      ,[CO2_SP2]
      ,[SP1]
      ,[SP2]
      ,[SP3]
      ,[SP4]
      ,[SP5]
      ,[Revision]
	  union 
SELECT  'TOTAL'
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
      ,''
	,CASE
      WHEN [Lot_QA]='${QANumber}' THEN 'Total_forsetlot'
      ELSE 'NOT'
  END as Print_forsetlot
        ,sum([Qty])as Qty
      ,FORMAT([DateTime], 'yyyy-MM-dd') as dateP
    FROM [Setlot].[dbo].[Record_QAPrint]
    where [Lot_QA]='${QANumber}'
	group by [Lot_QA],[DateTime]
	order by [Mo_number] desc`);

// '${QANumber}%'

    var listRawData = [];
    listRawData.push(result[0]);

    res.json({
      result: result[0],
      listRawData,
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
router.get("/Co2/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`SELECT [MfgDate]
    ,[Shift]
    ,[Line]
    ,[QA_No]
    ,[Qty]
  ,[Record_Output_CO2].Updater
     ,CASE
  WHEN [QA_No]='${QANumber}' THEN 'CO2'
  ELSE 'NOT'
END as CO2,[Record_Output_CO2].Remark
FROM [QAInspection].[dbo].[Record_Output_CO2]
where [QA_No]='${QANumber}'`);

// '${QANumber}%'

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
});
router.get("/QA/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`SELECT  [InspectionDate]
    ,[tbVisualInspection].[QANumber]
    ,[InspectionType]
    ,[InspectionResult]
  ,[Vis_Round]
  ,sum([tbQANumber].MOQTY) as MOQTY
     ,CASE
  WHEN [tbVisualInspection].[QANumber] ='${QANumber}' THEN 'QA'
  ELSE 'NOT'
END as QA_Visual
FROM [QAInspection].[dbo].[tbVisualInspection]
left join  [QAInspection].[dbo].[tbQANumber]
on [tbVisualInspection].QANumber =[tbQANumber].QANumber
where [tbVisualInspection].[QANumber]='${QANumber}'
group by [InspectionDate]
    ,[tbVisualInspection].[QANumber]
    ,[InspectionType]
    ,[SamplingLevel]
    ,[InspectionResult]
  ,[Vis_Round]`);

//V541A350127

// '${QANumber}%'

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
});
router.get("/Tray_Packing/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`
    SELECT 'Packing IN C/R' as Packing_IN_Cleanroom
	  ,convert(date,[TimeStamp]) as Date
      ,[Count_Tray]
      ,[EMP_Bag1]
      ,[EMP_Pack1]
      ,[EMP_Pack2]
      ,[EMP_Supporter]
      ,[Station]
      ,[TimeStamp]
      ,[FinishTime]
      ,[Produc]
  FROM [Tray_Packing].[dbo].[Tray_RecordCR]
where [QA_no]='${QANumber}'
    `);

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
});
router.get("/Tray_Record/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`
    with SET1 AS (SELECT  [QA_no]
      ,[MfgDate]
    FROM [Tray_Packing].[dbo].[Matching_Tray]
    UNION
    SELECT [QA_no]
        ,[MfgDate] as dateT
     FROM [Tray_Packing].[dbo].[Tray_Record])
    
    ,Tray_Record as (
    SELECT [QA_no]
        ,[MfgDate] as dateT
         ,CASE
      WHEN [QA_no]='${QANumber}' THEN 'Matching Tray'
      ELSE 'NOT'
    END as Tray_Record1
     FROM SET1
    where [QA_no]='${QANumber}')
    select * from Tray_Record
    `);

//V541A350127

// '${QANumber}%'

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
});
router.get("/Into_Pallet/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`
    SELECT [QANumber]
    ,CASE
       WHEN [QANumber]='${QANumber}' THEN 'Into Pallet'
       ELSE 'NOT'
   END as Pallet
         ,sum([Qty]) as [Qty]
         ,[Pallet_Number]
         ,[MfgDate] as datetbPallet
     FROM [QAInspection].[dbo].[tbPallet_waitQAtag]
     where [QANumber]='${QANumber}'
     AND [MfgDate]=(SELECT MAX([MfgDate]) FROM [QAInspection].[dbo].[tbPallet_waitQAtag] where [QANumber]='${QANumber}')
     group by [QANumber],[Pallet_Number],[MfgDate]
    `);

//V541A350127

// '${QANumber}%'

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
});
router.get("/PCMC/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`
    SELECT [Invoie_ID]
      ,[Item_no]
      ,[Special_control]
      ,[Lot_No]
	   ,CASE
    WHEN [Lot_No]='${QANumber}' THEN 'PCMC'
    ELSE 'NOT'
END as PCMC
,sum(convert(int,[QTY])) as QTY
      ,[Date]
  FROM [PCMC].[dbo].[Invoice]
  where [Lot_No]='${QANumber}'
  AND [Date]=(SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice]where [Lot_No]='${QANumber}' )
 group by [Invoie_ID]
      ,[Item_no]
      ,[Special_control]
      ,[Lot_No]
      ,[Date]
    `);

//V541A350127

// '${QANumber}%'

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
});

router.get("/report2/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize
      .query(` 
      SELECT
      'HOLD' as  process ,
convert(date,[Tag_HoldQA].DateTime) AS Hold_DateTime,
Hold_index,
      [Tag_HoldQA].[Status] AS [Status],
      [Tag_HoldQA].[Access_by] AS Access_by,
      [Tag_HoldQA].Hold_By AS Hold_by,
      [Non_Conformance] AS Hold_detail,
      [Disposition] AS [Disposition],
      [MfgDate] AS Hold_Date,
      [Tag_HoldQA].[Remark],
      [Tag_HoldQA].[Control_Ship],
      CASE
          WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
      ELSE 0 END AS Hold_Period,
      [Release_Date],
      [Reason_to_Release]
  FROM [QAInspection].[dbo].[Tag_HoldQA]
               
    where 
        [QA_No]like'${QANumber}%'
      `);

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
});




module.exports = router;