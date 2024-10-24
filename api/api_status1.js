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
      ,FORMAT([DateTime], 'yyyy-MM-dd  HH:mm:ss') as [DateTime]
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
      ,FORMAT([DateTime], 'yyyy-MM-dd  HH:mm:ss') as [DateTime]
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
    let result = await user.sequelize.query(`
    SELECT 
    [MfgDate],
    FORMAT([DateTime], 'yyyy-MM-dd  HH:mm:ss') as DateTime,
    [Shift],
    [Line],
    [QA_No],
    [Qty],
    [Record_Output_CO2].Updater,
    CASE
        WHEN [QA_No] = '${QANumber}' THEN 'CO2'
        ELSE 'NOT'
    END as CO2,
    [Record_Output_CO2].Remark
FROM 
    [QAInspection].[dbo].[Record_Output_CO2]
WHERE 
    [QA_No] = '${QANumber}'
ORDER BY 
    [DateTime];
    -----------------Co2--------------------------------------
`);

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
    let result = await user.sequelize.query(`
    SELECT  [InspectionDate]
    ,[tbVisualInspection].[QANumber]
    ,[InspectionType]
    ,[InspectionResult]
  ,[Vis_Round]
  ,sum([tbQANumber].MOQTY) as MOQTY
     ,CASE
  WHEN [tbVisualInspection].[QANumber] ='${QANumber}' THEN 'QA'
  ELSE 'NOT'
END as QA_Visual
,FORMAT([Time_VMI], 'yyyy-MM-dd  HH:mm:ss') as [Time_VMI]

FROM [QAInspection].[dbo].[tbVisualInspection]
left join  [QAInspection].[dbo].[tbQANumber]
on [tbVisualInspection].QANumber =[tbQANumber].QANumber
where [tbVisualInspection].[QANumber]='${QANumber}'
group by [InspectionDate]
    ,[tbVisualInspection].[QANumber]
    ,[InspectionType]
    ,[SamplingLevel]
    ,[InspectionResult]
  ,[Vis_Round]
  ,Time_VMI`);

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
// แบบรวม เก่า
// router.get("/Tray_Packing/:QANumber", async (req, res) => {
//   try {
//     const { QANumber } = req.params;
//     let result = await user.sequelize.query(`
//     SELECT 'Packing IN C/R' as Packing_IN_Cleanroom
// 	  ,convert(date, [TimeStamp]) as Date
//       ,count([Bake_to_packing].Tray_number) as Count_Tray
//       ,[EMP_Bag1]
//       ,[EMP_Pack1]
//       ,[EMP_Pack2]
//       ,[EMP_Supporter]
//       ,[Station]
//       ,[TimeStamp]
//       ,[FinishTime]
//       ,[Produc]
// FROM [Tray_Packing].[dbo].[Tray_RecordCR]
// LEFT JOIN [GoldenLine].[dbo].[Bake_to_packing]
// ON Tray_RecordCR.QA_no = [Bake_to_packing].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS
// WHERE [QA_no] = '${QANumber}'
// group by [TimeStamp],[EMP_Bag1],[EMP_Pack1],[EMP_Pack2],[EMP_Supporter],[Station],[TimeStamp],[FinishTime],[Produc]
//     `);

//     var listRawData1 = [];
//     listRawData1.push(result[0]);

//     res.json({
//       result: result[0],
//       listRawData1,
//       api_result: "ok",
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       error,
//       api_result: "nok",
//     });
//   }
// });
//แบบแยก ใหม่
router.get("/Tray_Packing/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`

        SELECT 
        'Packing IN C/R' as Packing_IN_Cleanroom
        ,[QA_no]
        ,QTY
        ,ROW_NUMBER() OVER (ORDER BY [TimeStamp]) AS Round_no
      ,[Count_Tray]
      ,[EMP_Bag1]
      ,[EMP_Pack1]
      ,[EMP_Pack2]
      ,[EMP_Supporter]
      ,[Station]
      ,FORMAT([TimeStamp], 'yyyy-MM-dd  HH:mm:ss') as [TimeStamp]
      ,[FinishTime]
      ,[Produc]
      ,[QTY]
      ,[Date]
      ,[Shift]
      ,[Remark]
  FROM [Tray_Packing].[dbo].[Tray_RecordCR]
  where [QA_no]= '${QANumber}'

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

       with SET1 AS (
    SELECT 
	[QA_no]
    ,[MfgDate] as dateT 
    ,[Tray_Record].TimeStamp
     FROM [Tray_Packing].[dbo].[Tray_Record])

    ,Tray_Record as (
     SELECT [QA_no],dateT,'Matching Tray' as Tray_Record1
    ,FORMAT([TimeStamp], 'yyyy-MM-dd  HH:mm:ss') as [TimeStamp]

     FROM SET1
    where [QA_no]='${QANumber}')
    select top(1)* from Tray_Record

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
         
         ,FORMAT([tbPallet_waitQAtag].TimeStamp, 'yyyy-MM-dd  HH:mm:ss') as [TimeStamp]
     FROM [QAInspection].[dbo].[tbPallet_waitQAtag]
     where [QANumber]='${QANumber}'
     AND [MfgDate]=(SELECT MAX([MfgDate]) FROM [QAInspection].[dbo].[tbPallet_waitQAtag] where [QANumber]='${QANumber}')
     group by [QANumber],[Pallet_Number],[MfgDate],TimeStamp
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

      ,FORMAT([Invoice].Timpstamp, 'yyyy-MM-dd  HH:mm:ss') as [Timpstamp]
  FROM [PCMC].[dbo].[Invoice]
  where [Lot_No]='${QANumber}'
 
 group by [Invoie_ID]
      ,[Item_no]
      ,[Special_control]
      ,[Lot_No]
      ,[Date]
      ,[Invoice].Timpstamp
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
      [Reason_to_Release],
      
      FORMAT([Tag_HoldQA].DateTime, 'yyyy-MM-dd  HH:mm:ss') as DateTime
  FROM [QAInspection].[dbo].[Tag_HoldQA]
               
    where 
        [QA_No]like'${QANumber}%'
        order by Hold_DateTime
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

router.get("/Unpacking/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize
      .query(` 
  with Mathdata as (
    SELECT 
    'Sorting' as status 
    ,CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
	sum(Record.[Qty]) as [Qty],
	Record.[Baseplate],
	Record.Ramp,
	Record.[Diverter],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as sorting_return,
	Unpack.[Reason_Hold]
    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
LEFT JOIN 
    [Setlot].[dbo].[Record_QAPrint] as Record
ON 
    Unpack.[QA_no] COLLATE SQL_Latin1_General_CP1_CI_AS = Record.[Lot_QA] COLLATE SQL_Latin1_General_CP1_CI_AS
group by Unpack.[QA_no],Unpack.[Emp],Unpack.[Emp],Unpack.[Reason_Hold],Unpack.[TimeStamp_unpack],Unpack.[TimeStamp_return]
,Record.[Baseplate],Record.Ramp,Record.[Diverter])

select status,DATE,FORMAT(sorting_datetime, 'yyyy-MM-dd  HH:mm:ss') as [TimeStamp] ,[QA_no],[Qty],[Baseplate],Ramp,[Diverter],[Emp],FORMAT(sorting_return, 'yyyy-MM-dd  HH:mm:ss') as sorting_return ,[Reason_Hold],
 CASE 
        WHEN sorting_return IS NULL THEN 'Pending'
        WHEN sorting_return IS NOT NULL THEN 'Completed'
    END AS status_sort
FROM Mathdata
where [QA_no]='${QANumber}'
      `);

    var list_unpacking = [];
    list_unpacking.push(result[0]);

    res.json({
      result: result[0],
      list_unpacking,
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