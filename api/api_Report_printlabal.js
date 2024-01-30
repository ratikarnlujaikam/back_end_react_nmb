const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
    SELECT distinct [Model]FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
    join [Temp_TransportData].[dbo].[Line_for_QRcode] on [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
    union select '**ALL**'`);
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

router.get("/Line/:model", async (req, res) => {
  try {
    const { model } = req.params; // คำสั่งที่ควรเปลี่ยน: const model = req.params.model;
    var result = [[]];
    if (model == "**ALL**") {
      var result = await user.sequelize.query(`
        SELECT distinct [Line_for_QRcode].Line FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
        join [Temp_TransportData].[dbo].[Line_for_QRcode] 
        on [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor] 
        and [Line_for_QRcode].Item_no = [Record_request].Model_ID
        union select '**ALL**'`);
    } else {
      var result = await user.sequelize.query(`
        SELECT distinct [Line_for_QRcode].Line FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
        join [Temp_TransportData].[dbo].[Line_for_QRcode] 
        on [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor] 
        and [Line_for_QRcode].Item_no = [Record_request].Model_ID
        where Model_name = '${model}'
        union select '**ALL**'`);
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


router.get("/confirm", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
   select 'OK' as confirm
   union 
   select 'wait_confirm'
   `);
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
  "/report/:model/:Line/:confirm/:startDate/:finishDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { model, Line, startDate, finishDate, confirm } = req.params;
      if (model === '**ALL**' && Line ==='**ALL**'&& confirm !== 'OK') {
        // เงื่อนไขที่ 3
        var result = await user.sequelize.query(` 
        -- model === '**ALL**' && Line ==='**ALL**'&& confirm !== 'OK'
        with Data as (SELECT
          [Model_name]
          ,[Model_ID]
          ,[Motor]
          ,[Revision]
          ,[WW]
          ,[Ramp]
          ,[Ramp_ID]
          ,[CrashStop]
          ,[CrashStop_ID]
          ,[Base]
          ,[Base_ID]
          ,'L'+[Record_request].[Line] as [CODE_Line]
         ,[Line_for_QRcode].Line as Line
          ,[MSH_name]
          ,[MSH_ID]
          ,[Qty]
          ,[Record_request].[TimeStamp]
          ,[Requester]
          ,[Tray]
          ,[Tray_Qty]
          ,[Status]
          ,[[Diverter/Airdam]
          ,[Stack]
          ,[Temperature]
          ,[Order_Number]
          ,[Time_Alarm]
         ,CASE
     WHEN [Record_request].[Confirmation] IS NULL THEN 'wait_confirm'
     ELSE [Record_request].[Confirmation]
    END AS Confirmation
          ,[User_Confirm]
          ,[Receiver]
        ,convert(date,[Record_request].[TimeStamp]) as date
        FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
        JOIN [Temp_TransportData].[dbo].[Line_for_QRcode]
            ON [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
            AND [Line_for_QRcode].Item_no = [Record_request].Model_ID
            AND [Record_request].Line = [Line_for_QRcode].Label_Digit23
      where convert(date,[Record_request].[TimeStamp]) > '2023-07-17'
    and YEAR([Record_request].[TimeStamp]) !='2565'
    and [Status]!='Deleted' and [Qty] > 10
    
    )
    --ALL--and  [Model_name]='**ALL**'
    --ALL--and [Line_for_QRcode].Line ='**ALL**'
    
 
    --date between '${startDate}' and ' ${finishDate}'            
    --and Model_name ='${model}'                                                          
    --and Line = '${Line}'                                
    --and Confirmation='${confirm}'    
    select * from Data
    where    
    Confirmation='${confirm}'         
    order by convert(date,[TimeStamp])
    `)
    } else if (model === '**ALL**' && Line !=='**ALL**'&& confirm === 'OK') {
        // เงื่อนไขที่ 2
        var result = await user.sequelize.query(`  
        with Data as (SELECT
          [Model_name]
          ,[Model_ID]
          ,[Motor]
          ,[Revision]
          ,[WW]
          ,[Ramp]
          ,[Ramp_ID]
          ,[CrashStop]
          ,[CrashStop_ID]
          ,[Base]
          ,[Base_ID]
          ,'L'+[Record_request].[Line] as [CODE_Line]
         ,[Line_for_QRcode].Line as Line
          ,[MSH_name]
          ,[MSH_ID]
          ,[Qty]
          ,[Record_request].[TimeStamp]
          ,[Requester]
          ,[Tray]
          ,[Tray_Qty]
          ,[Status]
          ,[[Diverter/Airdam]
          ,[Stack]
          ,[Temperature]
          ,[Order_Number]
          ,[Time_Alarm]
         ,CASE
     WHEN [Record_request].[Confirmation] IS NULL THEN 'wait_confirm'
     ELSE [Record_request].[Confirmation]
    END AS Confirmation
          ,[User_Confirm]
          ,[Receiver]
        ,convert(date,[Record_request].[TimeStamp]) as date
        FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
        JOIN [Temp_TransportData].[dbo].[Line_for_QRcode]
            ON [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
            AND [Line_for_QRcode].Item_no = [Record_request].Model_ID
            AND [Record_request].Line = [Line_for_QRcode].Label_Digit23
      where convert(date,[Record_request].[TimeStamp]) > '2023-07-17'
    and YEAR([Record_request].[TimeStamp]) !='2565'
    and [Status]!='Deleted' and [Qty] > 10

    )
    --ALL--and  [Model_name]='**ALL**'
    --ALL--and [Line_for_QRcode].Line ='**ALL**'
    
 
    --date between '${startDate}' and ' ${finishDate}'            
    --and Model_name ='${model}'                                                          
    --and Line = '${Line}'                                
    --and Confirmation='${confirm}'    
    select * from Data
    where 
    date between '${startDate}' and ' ${finishDate}'      
    and Line = '${Line}' 
    and Confirmation='${confirm}'          
    order by convert(date,[TimeStamp])`)
    } else if (model === '**ALL**' && Line !=='**ALL**'&& confirm !== 'OK') {

        // เงื่อนไขที่ 4
        var result = await user.sequelize.query(`  
        with Data as (SELECT
          [Model_name]
          ,[Model_ID]
          ,[Motor]
          ,[Revision]
          ,[WW]
          ,[Ramp]
          ,[Ramp_ID]
          ,[CrashStop]
          ,[CrashStop_ID]
          ,[Base]
          ,[Base_ID]
          ,'L'+[Record_request].[Line] as [CODE_Line]
         ,[Line_for_QRcode].Line as Line
          ,[MSH_name]
          ,[MSH_ID]
          ,[Qty]
          ,[Record_request].[TimeStamp]
          ,[Requester]
          ,[Tray]
          ,[Tray_Qty]
          ,[Status]
          ,[[Diverter/Airdam]
          ,[Stack]
          ,[Temperature]
          ,[Order_Number]
          ,[Time_Alarm]
         ,CASE
     WHEN [Record_request].[Confirmation] IS NULL THEN 'wait_confirm'
     ELSE [Record_request].[Confirmation]
    END AS Confirmation
          ,[User_Confirm]
          ,[Receiver]
        ,convert(date,[Record_request].[TimeStamp]) as date
        FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
        JOIN [Temp_TransportData].[dbo].[Line_for_QRcode]
            ON [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
            AND [Line_for_QRcode].Item_no = [Record_request].Model_ID
            AND [Record_request].Line = [Line_for_QRcode].Label_Digit23
      where convert(date,[Record_request].[TimeStamp]) > '2023-07-17'
    and YEAR([Record_request].[TimeStamp]) !='2565'
    and [Status]!='Deleted' and [Qty] > 10
    )
    --ALL--and  [Model_name]='**ALL**'
    --ALL--and [Line_for_QRcode].Line ='**ALL**'
    
 
    --date between '${startDate}' and ' ${finishDate}'            
    --and Model_name ='${model}'                                                          
    --and Line = '${Line}'                                
    --and Confirmation='${confirm}'    
    select * from Data
    where 
    Line = '${Line}' 
    and Confirmation='${confirm}'          
    order by convert(date,[TimeStamp])`)

    } else if (model !== '**ALL**' && Line ==='**ALL**'&& confirm === 'OK') {
        // เงื่อนไขที่ 5
        var result = await user.sequelize.query(`  
        with Data as (SELECT
          [Model_name]
          ,[Model_ID]
          ,[Motor]
          ,[Revision]
          ,[WW]
          ,[Ramp]
          ,[Ramp_ID]
          ,[CrashStop]
          ,[CrashStop_ID]
          ,[Base]
          ,[Base_ID]
          ,'L'+[Record_request].[Line] as [CODE_Line]
         ,[Line_for_QRcode].Line as Line
          ,[MSH_name]
          ,[MSH_ID]
          ,[Qty]
          ,[Record_request].[TimeStamp]
          ,[Requester]
          ,[Tray]
          ,[Tray_Qty]
          ,[Status]
          ,[[Diverter/Airdam]
          ,[Stack]
          ,[Temperature]
          ,[Order_Number]
          ,[Time_Alarm]
         ,CASE
     WHEN [Record_request].[Confirmation] IS NULL THEN 'wait_confirm'
     ELSE [Record_request].[Confirmation]
    END AS Confirmation
          ,[User_Confirm]
          ,[Receiver]
        ,convert(date,[Record_request].[TimeStamp]) as date
        FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
        JOIN [Temp_TransportData].[dbo].[Line_for_QRcode]
            ON [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
            AND [Line_for_QRcode].Item_no = [Record_request].Model_ID
            AND [Record_request].Line = [Line_for_QRcode].Label_Digit23
      where convert(date,[Record_request].[TimeStamp]) > '2023-07-17'
    and YEAR([Record_request].[TimeStamp]) !='2565'
    and [Status]!='Deleted' and [Qty] > 10
    )
    --ALL--and  [Model_name]='**ALL**'
    --ALL--and [Line_for_QRcode].Line ='**ALL**'
    
 
    --date between '${startDate}' and ' ${finishDate}'            
    --and Model_name ='${model}'                                                          
    --and Line = '${Line}'                                
    --and Confirmation='${confirm}'    
    select * from Data
    where 
    date between '${startDate}' and ' ${finishDate}'            
    and Model_name ='${model}'  
    and Confirmation='${confirm}'          
    order by convert(date,[TimeStamp])`)
    } else if (model !== '**ALL**' && Line ==='**ALL**'&& confirm !== 'OK') {
        // เงื่อนไขที่ 6
        var result = await user.sequelize.query(`  
        with Data as (SELECT
          [Model_name]
          ,[Model_ID]
          ,[Motor]
          ,[Revision]
          ,[WW]
          ,[Ramp]
          ,[Ramp_ID]
          ,[CrashStop]
          ,[CrashStop_ID]
          ,[Base]
          ,[Base_ID]
          ,'L'+[Record_request].[Line] as [CODE_Line]
         ,[Line_for_QRcode].Line as Line
          ,[MSH_name]
          ,[MSH_ID]
          ,[Qty]
          ,[Record_request].[TimeStamp]
          ,[Requester]
          ,[Tray]
          ,[Tray_Qty]
          ,[Status]
          ,[[Diverter/Airdam]
          ,[Stack]
          ,[Temperature]
          ,[Order_Number]
          ,[Time_Alarm]
         ,CASE
     WHEN [Record_request].[Confirmation] IS NULL THEN 'wait_confirm'
     ELSE [Record_request].[Confirmation]
    END AS Confirmation
          ,[User_Confirm]
          ,[Receiver]
        ,convert(date,[Record_request].[TimeStamp]) as date
        FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
        JOIN [Temp_TransportData].[dbo].[Line_for_QRcode]
            ON [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
            AND [Line_for_QRcode].Item_no = [Record_request].Model_ID
            AND [Record_request].Line = [Line_for_QRcode].Label_Digit23
      where convert(date,[Record_request].[TimeStamp]) > '2023-07-17'
    and YEAR([Record_request].[TimeStamp]) !='2565'
    and [Status]!='Deleted' and [Qty] > 10
    )
    --ALL--and  [Model_name]='**ALL**'
    --ALL--and [Line_for_QRcode].Line ='**ALL**'
    
 
    --date between '${startDate}' and ' ${finishDate}'            
    --and Model_name ='${model}'                                                          
    --and Line = '${Line}'                                
    --and Confirmation='${confirm}'    
    select * from Data
    where 
               
    Model_name ='${model}'  
    and Confirmation='${confirm}'          
    order by convert(date,[TimeStamp])`)
    } else if (model !== '**ALL**' && Line !=='**ALL**'&& confirm === 'OK') {
        // เงื่อนไขที่ 7
        var result = await user.sequelize.query(`  
        with Data as (SELECT
          [Model_name]
          ,[Model_ID]
          ,[Motor]
          ,[Revision]
          ,[WW]
          ,[Ramp]
          ,[Ramp_ID]
          ,[CrashStop]
          ,[CrashStop_ID]
          ,[Base]
          ,[Base_ID]
          ,'L'+[Record_request].[Line] as [CODE_Line]
         ,[Line_for_QRcode].Line as Line
          ,[MSH_name]
          ,[MSH_ID]
          ,[Qty]
          ,[Record_request].[TimeStamp]
          ,[Requester]
          ,[Tray]
          ,[Tray_Qty]
          ,[Status]
          ,[[Diverter/Airdam]
          ,[Stack]
          ,[Temperature]
          ,[Order_Number]
          ,[Time_Alarm]
         ,CASE
     WHEN [Record_request].[Confirmation] IS NULL THEN 'wait_confirm'
     ELSE [Record_request].[Confirmation]
    END AS Confirmation
          ,[User_Confirm]
          ,[Receiver]
        ,convert(date,[Record_request].[TimeStamp]) as date
        FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
        JOIN [Temp_TransportData].[dbo].[Line_for_QRcode]
            ON [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
            AND [Line_for_QRcode].Item_no = [Record_request].Model_ID
            AND [Record_request].Line = [Line_for_QRcode].Label_Digit23
      where convert(date,[Record_request].[TimeStamp]) > '2023-07-17'
    and YEAR([Record_request].[TimeStamp]) !='2565'
    and [Status]!='Deleted' and [Qty] > 10
    )
    --ALL--and  [Model_name]='**ALL**'
    --ALL--and [Line_for_QRcode].Line ='**ALL**'
    
 
    --date between '${startDate}' and ' ${finishDate}'            
    --and Model_name ='${model}'                                                          
    --and Line = '${Line}'                                
    --and Confirmation='${confirm}'    
    select * from Data
    where 
    date between '${startDate}' and ' ${finishDate}'            
    and Model_name ='${model}'                                                          
    and Line = '${Line}'              
    and Confirmation='${confirm}'          
    order by convert(date,[TimeStamp])`)
    } else if (model !== '**ALL**' && Line !=='**ALL**'&& confirm !== 'OK') {
      var result = await user.sequelize.query(`  
      with Data as (SELECT
        [Model_name]
        ,[Model_ID]
        ,[Motor]
        ,[Revision]
        ,[WW]
        ,[Ramp]
        ,[Ramp_ID]
        ,[CrashStop]
        ,[CrashStop_ID]
        ,[Base]
        ,[Base_ID]
        ,'L'+[Record_request].[Line] as [CODE_Line]
       ,[Line_for_QRcode].Line as Line
        ,[MSH_name]
        ,[MSH_ID]
        ,[Qty]
        ,[Record_request].[TimeStamp]
        ,[Requester]
        ,[Tray]
        ,[Tray_Qty]
        ,[Status]
        ,[[Diverter/Airdam]
        ,[Stack]
        ,[Temperature]
        ,[Order_Number]
        ,[Time_Alarm]
       ,CASE
   WHEN [Record_request].[Confirmation] IS NULL THEN 'wait_confirm'
   ELSE [Record_request].[Confirmation]
  END AS Confirmation
        ,[User_Confirm]
        ,[Receiver]
      ,convert(date,[Record_request].[TimeStamp]) as date
      FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
      JOIN [Temp_TransportData].[dbo].[Line_for_QRcode]
          ON [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
          AND [Line_for_QRcode].Item_no = [Record_request].Model_ID
          AND [Record_request].Line = [Line_for_QRcode].Label_Digit23
    where convert(date,[Record_request].[TimeStamp]) > '2023-07-17'
  and YEAR([Record_request].[TimeStamp]) !='2565'
  and [Status]!='Deleted' and [Qty] > 10
  )
  --ALL--and  [Model_name]='**ALL**'
  --ALL--and [Line_for_QRcode].Line ='**ALL**'
  

  --date between '${startDate}' and ' ${finishDate}'            
  --and Model_name ='${model}'                                                          
  --and Line = '${Line}'                                
  --and Confirmation='${confirm}'    
  select * from Data
  where 
           
  Model_name ='${model}'                                                          
  and Line = '${Line}'              
  and Confirmation='${confirm}'          
  order by convert(date,[TimeStamp])`)

    } else {
        // เงื่อนไขที่ 1 (กรณีที่เหลือที่มี model, Line, confirm เป็น '**ALL**', '**ALL**', 'OK')
        var result = await user.sequelize.query(`  
      with Data as (SELECT
        [Model_name]
        ,[Model_ID]
        ,[Motor]
        ,[Revision]
        ,[WW]
        ,[Ramp]
        ,[Ramp_ID]
        ,[CrashStop]
        ,[CrashStop_ID]
        ,[Base]
        ,[Base_ID]
        ,'L'+[Record_request].[Line] as [CODE_Line]
       ,[Line_for_QRcode].Line as Line
        ,[MSH_name]
        ,[MSH_ID]
        ,[Qty]
        ,[Record_request].[TimeStamp]
        ,[Requester]
        ,[Tray]
        ,[Tray_Qty]
        ,[Status]
        ,[[Diverter/Airdam]
        ,[Stack]
        ,[Temperature]
        ,[Order_Number]
        ,[Time_Alarm]
       ,CASE
   WHEN [Record_request].[Confirmation] IS NULL THEN 'wait_confirm'
   ELSE [Record_request].[Confirmation]
  END AS Confirmation
        ,[User_Confirm]
        ,[Receiver]
      ,convert(date,[Record_request].[TimeStamp]) as date
      FROM [LinkedServer1].[LabelPrintRequest].[dbo].[Record_request]
      JOIN [Temp_TransportData].[dbo].[Line_for_QRcode]
          ON [Line_for_QRcode].Label_Digit15 = [Record_request].[Motor]
          AND [Line_for_QRcode].Item_no = [Record_request].Model_ID
          AND [Record_request].Line = [Line_for_QRcode].Label_Digit23
    where convert(date,[Record_request].[TimeStamp]) > '2023-07-17'
  and YEAR([Record_request].[TimeStamp]) !='2565'
  and [Status]!='Deleted' and [Qty] > 10
  )
  --ALL--and  [Model_name]='**ALL**'
  --ALL--and [Line_for_QRcode].Line ='**ALL**'
  

  --date between '${startDate}' and ' ${finishDate}'            
  --and Model_name ='${model}'                                                          
  --and Line = '${Line}'                                
  --and Confirmation='${confirm}'    
  select * from Data
  where 
           
  --Model_name ='${model}'                                                          
  --and Line = '${Line}'
  date between '${startDate}' and ' ${finishDate}'  
  and           
  Confirmation='${confirm}'          
  order by convert(date,[TimeStamp])`)
    }
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
  }
);

router.get("/report2/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize
      .query(`select	[tbVisualInspection].[InspectionDate] as Date ,
    [InspectionShift] as Shift,
    [tbVisualInspection].[ModelNumber] as Model_NO,
    [tbVisualInspection].[Model_group] as Model_group,
    [tbVisualInspection].[Model_Name] as Model_Name,
    'L'+[tbQANumber].[Line_No] as Line,
    [QAInspection].[dbo].[tbVisualInspection].[QANumber] as QA_Number,
    [tbQANumber].[Lotsize] as QA_QTY,
    [QAInspection].[dbo].[tbQANumber].[MONumber] as MO_Number,
    [tbQANumber].[DateCode] as Date_Code,
    [tbQANumber].[MOQTY] as MO_QTY,
    [tbVisualInspection].[InspectionType] as Inspection_Type,
    [tbVisualInspection].[Vis_Round] as Inspection_Round,
    [tbVisualInspection].[InspectionResult] as Inspection_Result,
    [tbVisualInspection].[SamplingLevel] as Sampling_Level,
    [tbVisualInspection].[SamplingQTY] as Sampling_QTY, 
    [tbQANumber].[Base] as Base,
    [tbQANumber].[Ramp] as Ramp,
    [tbQANumber].[Hub] as Hub,
    [tbQANumber].[Magnet] as Magnet,
    [tbQANumber].[FPC] as FPC,
    [tbQANumber].[Diverter] as Diverter,
    [tbQANumber].[Crash_Stop] as Crash_Stop,
    [tbQANumber].[SupporterName] as Supporter_Name,
    [tbVisualInspection].[RecordBy] as Record_By,
    [tbVisualInspection].[VisualName] as Visual_Name,
    [tbVisualInspection].[VisualTime] as Visual_Time,
    [tbQANumber].[CO2] as MC_CO2,[Emp_CO2] as Emp_CO2,
    [tbQANumber].[SpecialControl1] as SpecialControl1 ,
    [tbQANumber].[SpecialControl2] as SpecialControl2,
    [tbQANumber].[SpecialControl3] as SpecialControl3,
    [tbQANumber].[SpecialControl4] as SpecialControl4,
    [tbQANumber].[SpecialControl5] as SpecialControl5,
    [tbVisualInspection].[InsNumber] as Inspection_Number
    ,[Reject_visual].[Location] as Location
,[Reject_visual].[Defect_NG] as Defect_NG
,[Reject_visual].[Detail] as Detail
,[Reject_visual].[QTY] as QTY
    ,[Reject_visual].[Step] as Step
    ,[Reject_visual].[Reject_level] as Reject_level
    ,[Reject_visual].[Major_Category] as Major_Category
    ,[tbVisualInspection].[Sorting_criteria] as Sorting_criteria
,[tbVisualInspection].[Time_VMI] as Time_VMI
,[tbVisualInspection].[Remark_VMI] as Remark_VMI
,[tbQANumber].[Rev] as REV
,[tbQANumber].[Remark] as Remark
FROM [QAInspection].[dbo].[tbVisualInspection]
INNER JOIN [QAInspection].[dbo].[tbQANumber]
ON [QAInspection].[dbo].[tbQANumber].[QANumber] = [QAInspection].[dbo].[tbVisualInspection].[QANumber]
FULL JOIN [QAInspection].[dbo].[Reject_visual]
ON [Reject_visual].Inspection=[tbVisualInspection].InsNumber
where [tbVisualInspection].[QANumber] like '${QANumber}%'
ORDER BY [InspectionDate],[InspectionShift],[tbVisualInspection].[ModelNumber],[tbVisualInspection].[Model_group],
[tbVisualInspection].[Model_Name],[Line_No],[QAInspection].[dbo].[tbVisualInspection].[QANumber],[Vis_Round],[DateCode],
[QAInspection].[dbo].[tbQANumber].[MONumber]`);

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
