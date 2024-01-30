const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`  ---ModelGroup---
    select '*ALL*' as ModelGroup FROM [QAInspection].[dbo].[tbQANumber]
    union
    select [tbQANumber].ModelGroup 
    FROM [QAInspection].[dbo].[tbQANumber]
    left join  [QAInspection].[dbo].[Tag_HoldQA]
     on [tbQANumber].QANumber = [Tag_HoldQA].QA_No
     where [tbQANumber].ModelGroup is not null
     and [tbQANumber].ModelGroup !=''`);
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
    const { model } = req.params;
    if (model == "*ALL*") {
      var result = await user.sequelize.query(` 
      select '*ALL*' as [Line_No] FROM [QAInspection].[dbo].[tbQANumber]
      union
      SELECT distinct[Line]
     FROM [Temp_TransportData].[dbo].[Line_for_QRcode]

    `);
    } else {
      var result = await user.sequelize.query(` 
      select '*ALL*' as [Line_No] FROM [QAInspection].[dbo].[tbQANumber]
      union
      SELECT distinct [Line]
     FROM [Temp_TransportData].[dbo].[Line_for_QRcode]
     where [Model] = '${model}'  `);
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

router.get("/Status", async (req, res) => {
  try {
    let result = await user.sequelize.query(`  
    select 'Accept' as Status
	  union
	  select 'Hold'
          union
	  select '*ALL*'
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

router.get("/Access_by/:Status", async (req, res) => {
  try {
    const { Status } = req.params;
    if (Status == "Accept") {
      var result = await user.sequelize.query(`
          select '-' as Access_by 
          --select distinct Access_by from [QAInspection].[dbo].[Tag_HoldQA]
        `);
    } else {
      var result = await user.sequelize.query(`
      select distinct Access_by from [QAInspection].[dbo].[Tag_HoldQA]
      where Access_by is not null
      union 
      select '*ALL*'
      union 
      select 'QA'`);
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
router.get(
  "/report/:model/:Line/:Status/:Access_by/:startDate/:finishDate/:selectedDateOption",
  async (req, res) => {
    try {
      var result = [[]];
      const { model, Line, Status, Access_by, startDate, finishDate} =
        req.params;
      if (
        model === "*ALL*" &&
        Line === "*ALL*" &&
        Status === "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 1: model, Line, Status, และ Access_by เป็น "*ALL*"
        var result = await user.sequelize.query(`
        with [Record_QAPrint] as(
          SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
FROM [Setlot].[dbo].[Record_QAPrint] )
    
,[tbQA] as(
         select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
     ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
       ,[Base]
     ,[Ramp]
     ,[Hub]
     ,[Magnet]
     ,[FPC]
     ,[Diverter]
     ,[Crash_Stop]
     ,[CO2]
     ,[Emp_CO2]
     ,[SpecialControl1]
     ,[SpecialControl2]
     ,[SpecialControl3]
     ,[SpecialControl4]
     ,[SpecialControl5]
from  [QAInspection].[dbo].[tbVisualInspection] as s
      left join [QAInspection].[dbo].[tbQANumber]
      on s.[QANumber]=[tbQANumber].[QANumber]
      where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
      group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
          [Base]
     ,[Ramp]
     ,[Hub]
     ,[Magnet]
     ,[FPC]
     ,[Diverter]
     ,[Crash_Stop]
     ,[CO2]
     ,[Emp_CO2]
     ,[SpecialControl1]
     ,[SpecialControl2]
     ,[SpecialControl3]
     ,[SpecialControl4]
     ,[SpecialControl5]
)
     
     ,Record_TO_QA as (
         select *,case when [QANumber] is not null then [InspectionResult] 
     when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
     from [Record_QAPrint]
     left  join  [tbQA]
     on [Record_QAPrint].Lot_QA  = [tbQA].QANumber

     )

     ,[Tag_HoldQA]  as (
     select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
     ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
     ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
     else 0 end as Hold_Period
     from   [QAInspection].[dbo].[Tag_HoldQA]
         )
     
     ,Record_To_QA_To_Tag_HoldQA as (
select 
Date,
Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY

       ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
       ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
       ,Hold_detail
       ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
       ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
       ,[Tag_HoldQA].[Remark]
       ,Hold_Period
       ,QA_result
       ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
       when [Status] is not null  then [Status]
       when QA_result='Wait for QA'  then ''
       when [Status] is null  then 'Accept'
       else [Status] end as status_Hold
     ,[Base]
     ,[Ramp]
     ,[Hub]
     ,[Magnet]
     ,[FPC]
     ,[Diverter]
     ,[Crash_Stop]
     ,[CO2]
     ,[Emp_CO2]
     ,[SpecialControl1]
     ,[SpecialControl2]
     ,[SpecialControl3]
     ,[SpecialControl4]
     ,[SpecialControl5]
      from Record_TO_QA
      left  join [Tag_HoldQA]
      on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                
 )
     
     ,PCMC as ( 
SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
     FROM [PCMC].[dbo].[Invoice] as s
     where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
     
     )
     
     ,final as (
     select	
Print_Date,
Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
Hold_Date,
             Model_group,
             ModelNumber,
             Line_No as Line_No,
             Hold_index,
             Lot_QA,
             Record_To_QA_To_Tag_HoldQA.DateCode, 
             QTY,
             Hold_detail,
             Remark,
             QA_result,
             Status_Hold,
             case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
             Hold_by,
             Disposition,
             case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
      ,Record_To_QA_To_Tag_HoldQA.[Base]
     ,Record_To_QA_To_Tag_HoldQA.[Ramp]
     ,Record_To_QA_To_Tag_HoldQA.[Hub]
     ,Record_To_QA_To_Tag_HoldQA.[Magnet]
     ,Record_To_QA_To_Tag_HoldQA.[FPC]
     ,Record_To_QA_To_Tag_HoldQA.[Diverter]
     ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
     ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
     ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
     ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
     ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
     ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
      from Record_To_QA_To_Tag_HoldQA
      left join PCMC
      on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
       group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
     ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
     ,Hold_Period,status_Hold,[Lot_No],Line_No
         ,Record_To_QA_To_Tag_HoldQA.[Base]
     ,Record_To_QA_To_Tag_HoldQA.[Ramp]
     ,[Hub]
     ,[Magnet]
     ,[FPC]
     ,Record_To_QA_To_Tag_HoldQA.[Diverter]
     ,[Crash_Stop]
     ,[SpecialControl1]
     ,[SpecialControl2]
     ,[SpecialControl3]
     ,[SpecialControl4]
     ,[SpecialControl5]
,Print_Date
     )

      select * from final  
      where 
      Print_Date between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            --and status_Hold='${Status}'
            --and Hold_by='${Access_by}'
            order by Lot_QA,Hold_Date
            --- เงื่อนไขที่ 1: model, Line, Status, และ Access_by เป็น "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line === "*ALL*" &&
        Status === "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 2: model, Line, Status เป็น "*ALL*" และ Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                -- เงื่อนไขที่ 2: model, Line, Status เป็น "*ALL*" และ Access_by ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            --and status_Hold='${Status}'
            and Hold_by='${Access_by}'
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 2: model, Line, Status เป็น "*ALL*" และ Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line === "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 3: model, Line, Access_by เป็น "*ALL*" และ Status ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 3: model, Line, Access_by เป็น "*ALL*" และ Status ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            and status_Hold='${Status}'
            --and Hold_by='${Access_by}'
            order by Lot_QA,Hold_Date
            --เงื่อนไขที่ 3: model, Line, Access_by เป็น "*ALL*" และ Status ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line === "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 4: model, Line เป็น "*ALL*" และ Status, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                -- เงื่อนไขที่ 4: model, Line เป็น "*ALL*" และ Status, Access_by ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            and status_Hold='${Status}'
            and Hold_by='${Access_by}'
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 4: model, Line เป็น "*ALL*" และ Status, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line !== "*ALL*" &&
        Status === "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 5: model, Status, Access_by เป็น "*ALL*" และ Line ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                -- เงื่อนไขที่ 5: model, Status, Access_by เป็น "*ALL*" และ Line ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            --and status_Hold='${Status}'
            --and Hold_by='${Access_by}'
            and Line_No='${Line}'
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 5: model, Status, Access_by เป็น "*ALL*" และ Line ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line !== "*ALL*" &&
        Status === "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 6: model, Status เป็น "*ALL*" และ Line, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 6: model, Status เป็น "*ALL*" และ Line, Access_by ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            --and status_Hold='${Status}'
            and Hold_by='${Access_by}'
            and Line_No='${Line}'
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 6: model, Status เป็น "*ALL*" และ Line, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line !== "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 7: model, Access_by เป็น "*ALL*" และ Line, Status ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 7: model, Access_by เป็น "*ALL*" และ Line, Status ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            and status_Hold='${Status}'
            --and Hold_by='${Access_by}'
            and Line_No='${Line}'
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 7: model, Access_by เป็น "*ALL*" และ Line, Status ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line !== "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 8: model เป็น "*ALL*" และ Line, Status, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 8: model เป็น "*ALL*" และ Line, Status, Access_by ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            and status_Hold='${Status}'
            and Hold_by='${Access_by}'
            and Line_No='${Line}'
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 8: model เป็น "*ALL*" และ Line, Status, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line === "*ALL*" &&
        Status === "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 9: Line, Status, Access_by เป็น "*ALL*" และ model ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 9: Line, Status, Access_by เป็น "*ALL*" และ model ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            --and status_Hold='${Status}'
            --and Hold_by='${Access_by}'
            --and Line_No='${Line}'
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 9: Line, Status, Access_by เป็น "*ALL*" และ model ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line === "*ALL*" &&
        Status === "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 10: Line, Status เป็น "*ALL*" และ model, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                -- เงื่อนไขที่ 10: Line, Status เป็น "*ALL*" และ model, Access_by ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            --and status_Hold='${Status}'
            and Hold_by='${Access_by}'
            --and Line_No='${Line}'
            order by Lot_QA,Hold_Date
            --  เงื่อนไขที่ 10: Line, Status เป็น "*ALL*" และ model, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line === "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 11: Line, Access_by เป็น "*ALL*" และ model, Status ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --  เงื่อนไขที่ 11: Line, Access_by เป็น "*ALL*" และ model, Status ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            --and Line_No='${Line}'
            and status_Hold='${Status}'
            --and Hold_by='${Access_by}'
           
            order by Lot_QA,Hold_Date
            --   เงื่อนไขที่ 11: Line, Access_by เป็น "*ALL*" และ model, Status ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line === "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 12: Line เป็น "*ALL*" และ model, Status, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --  เงื่อนไขที่ 12: Line เป็น "*ALL*" และ model, Status, Access_by ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            --and Line_No='${Line}'
            and status_Hold='${Status}'
            and Hold_by='${Access_by}'
           
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 12: Line เป็น "*ALL*" และ model, Status, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line !== "*ALL*" &&
        Status === "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 13: Status, Access_by เป็น "*ALL*" และ model, Line ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --  เงื่อนไขที่ 13: Status, Access_by เป็น "*ALL*" และ model, Line ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            and Line_No='${Line}'
            --and status_Hold='${Status}'
            --and Hold_by='${Access_by}'
           
            order by Lot_QA,Hold_Date
            -- เงื่อนไขที่ 13: Status, Access_by เป็น "*ALL*" และ model, Line ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line !== "*ALL*" &&
        Status === "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 14: Status เป็น "*ALL*" และ model, Line, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --   เงื่อนไขที่ 14: Status เป็น "*ALL*" และ model, Line, Access_by ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            and Line_No='${Line}'
            --and status_Hold='${Status}'
            and Hold_by='${Access_by}'
           
            order by Lot_QA,Hold_Date
            --  เงื่อนไขที่ 14: Status เป็น "*ALL*" และ model, Line, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line !== "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 15: Access_by เป็น "*ALL*" และ model, Line, Status ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --   เงื่อนไขที่ 15: Access_by เป็น "*ALL*" และ model, Line, Status ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            and Line_No='${Line}'
            and status_Hold='${Status}'
            --and Hold_by='${Access_by}'
           
            order by Lot_QA,Hold_Date
            --  เงื่อนไขที่ 15: Access_by เป็น "*ALL*" และ model, Line, Status ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line !== "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 16: model, Line, Status, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --   เงื่อนไขที่ 16: model, Line, Status, Access_by ไม่ใช่ "*ALL*"
                with [Record_QAPrint] as(
                  SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
        ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
        FROM [Setlot].[dbo].[Record_QAPrint] )
            
        ,[tbQA] as(
                 select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
             ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
               ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        from  [QAInspection].[dbo].[tbVisualInspection] as s
              left join [QAInspection].[dbo].[tbQANumber]
              on s.[QANumber]=[tbQANumber].[QANumber]
              where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
              group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
                  [Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        )
             
             ,Record_TO_QA as (
                 select *,case when [QANumber] is not null then [InspectionResult] 
             when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
             from [Record_QAPrint]
             left  join  [tbQA]
             on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
        
             )
        
             ,[Tag_HoldQA]  as (
             select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
             ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
             ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
             else 0 end as Hold_Period
             from   [QAInspection].[dbo].[Tag_HoldQA]
                 )
             
             ,Record_To_QA_To_Tag_HoldQA as (
        select 
        Date,
        Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
        
               ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
               ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
               ,Hold_detail
               ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
               ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
               ,[Tag_HoldQA].[Remark]
               ,Hold_Period
               ,QA_result
               ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
               when [Status] is not null  then [Status]
               when QA_result='Wait for QA'  then ''
               when [Status] is null  then 'Accept'
               else [Status] end as status_Hold
             ,[Base]
             ,[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,[Diverter]
             ,[Crash_Stop]
             ,[CO2]
             ,[Emp_CO2]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
              from Record_TO_QA
              left  join [Tag_HoldQA]
              on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                        
         )
             
             ,PCMC as ( 
        SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
             FROM [PCMC].[dbo].[Invoice] as s
             where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
             
             )
             
             ,final as (
             select	
        Print_Date,
        Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
        Hold_Date,
                     Model_group,
                     ModelNumber,
                     Line_No as Line_No,
                     Hold_index,
                     Lot_QA,
                     Record_To_QA_To_Tag_HoldQA.DateCode, 
                     QTY,
                     Hold_detail,
                     Remark,
                     QA_result,
                     Status_Hold,
                     case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                     Hold_by,
                     Disposition,
                     case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
              ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,Record_To_QA_To_Tag_HoldQA.[Hub]
             ,Record_To_QA_To_Tag_HoldQA.[Magnet]
             ,Record_To_QA_To_Tag_HoldQA.[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
             ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
              from Record_To_QA_To_Tag_HoldQA
              left join PCMC
              on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
               group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
             ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
             ,Hold_Period,status_Hold,[Lot_No],Line_No
                 ,Record_To_QA_To_Tag_HoldQA.[Base]
             ,Record_To_QA_To_Tag_HoldQA.[Ramp]
             ,[Hub]
             ,[Magnet]
             ,[FPC]
             ,Record_To_QA_To_Tag_HoldQA.[Diverter]
             ,[Crash_Stop]
             ,[SpecialControl1]
             ,[SpecialControl2]
             ,[SpecialControl3]
             ,[SpecialControl4]
             ,[SpecialControl5]
        ,Print_Date
             )
        
              select * from final  
              where 
              Print_Date between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            and Line_No='${Line}'
            and status_Hold='${Status}'
            and Hold_by='${Access_by}'
           
            order by Lot_QA,Hold_Date
            --  เงื่อนไขที่ 16: model, Line, Status, Access_by ไม่ใช่ "*ALL*"
                  `);
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
      .query(` 
      /****** Script for SelectTopNRows command from SSMS  ******/
      with [Record_QAPrint] as(
        SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
FROM [Setlot].[dbo].[Record_QAPrint] )
  
,[tbQA] as(
       select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
   ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
     ,[Base]
   ,[Ramp]
   ,[Hub]
   ,[Magnet]
   ,[FPC]
   ,[Diverter]
   ,[Crash_Stop]
   ,[CO2]
   ,[Emp_CO2]
   ,[SpecialControl1]
   ,[SpecialControl2]
   ,[SpecialControl3]
   ,[SpecialControl4]
   ,[SpecialControl5]
from  [QAInspection].[dbo].[tbVisualInspection] as s
    left join [QAInspection].[dbo].[tbQANumber]
    on s.[QANumber]=[tbQANumber].[QANumber]
    where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
    group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
        [Base]
   ,[Ramp]
   ,[Hub]
   ,[Magnet]
   ,[FPC]
   ,[Diverter]
   ,[Crash_Stop]
   ,[CO2]
   ,[Emp_CO2]
   ,[SpecialControl1]
   ,[SpecialControl2]
   ,[SpecialControl3]
   ,[SpecialControl4]
   ,[SpecialControl5]
)
   
   ,Record_TO_QA as (
       select *,case when [QANumber] is not null then [InspectionResult] 
   when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
   from [Record_QAPrint]
   left  join  [tbQA]
   on [Record_QAPrint].Lot_QA  = [tbQA].QANumber

   )

   ,[Tag_HoldQA]  as (
   select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
   ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
   ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
   else 0 end as Hold_Period
   from   [QAInspection].[dbo].[Tag_HoldQA]
       )
   
   ,Record_To_QA_To_Tag_HoldQA as (
select 
Date,
Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY

     ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
     ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
     ,Hold_detail
     ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
     ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
     ,[Tag_HoldQA].[Remark]
     ,Hold_Period
     ,QA_result
     ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
     when [Status] is not null  then [Status]
     when QA_result='Wait for QA'  then ''
     when [Status] is null  then 'Accept'
     else [Status] end as status_Hold
   ,[Base]
   ,[Ramp]
   ,[Hub]
   ,[Magnet]
   ,[FPC]
   ,[Diverter]
   ,[Crash_Stop]
   ,[CO2]
   ,[Emp_CO2]
   ,[SpecialControl1]
   ,[SpecialControl2]
   ,[SpecialControl3]
   ,[SpecialControl4]
   ,[SpecialControl5]
    from Record_TO_QA
    left  join [Tag_HoldQA]
    on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
              
)
   
   ,PCMC as ( 
SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
   FROM [PCMC].[dbo].[Invoice] as s
   where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
   
   )
   
   ,final as (
   select	
Print_Date,
Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
Hold_Date,
           Model_group,
           ModelNumber,
           Line_No as Line_No,
           Hold_index,
           Lot_QA,
           Record_To_QA_To_Tag_HoldQA.DateCode, 
           QTY,
           Hold_detail,
           Remark,
           QA_result,
           Status_Hold,
           case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
           Hold_by,
           Disposition,
           case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
    ,Record_To_QA_To_Tag_HoldQA.[Base]
   ,Record_To_QA_To_Tag_HoldQA.[Ramp]
   ,Record_To_QA_To_Tag_HoldQA.[Hub]
   ,Record_To_QA_To_Tag_HoldQA.[Magnet]
   ,Record_To_QA_To_Tag_HoldQA.[FPC]
   ,Record_To_QA_To_Tag_HoldQA.[Diverter]
   ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
   ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
   ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
   ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
   ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
   ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
    from Record_To_QA_To_Tag_HoldQA
    left join PCMC
    on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
     group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
   ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
   ,Hold_Period,status_Hold,[Lot_No],Line_No
       ,Record_To_QA_To_Tag_HoldQA.[Base]
   ,Record_To_QA_To_Tag_HoldQA.[Ramp]
   ,[Hub]
   ,[Magnet]
   ,[FPC]
   ,Record_To_QA_To_Tag_HoldQA.[Diverter]
   ,[Crash_Stop]
   ,[SpecialControl1]
   ,[SpecialControl2]
   ,[SpecialControl3]
   ,[SpecialControl4]
   ,[SpecialControl5]
,Print_Date
   )

    select * from final  
    where 
        [Lot_QA]like'${QANumber}%'
        order by Hold_Date,Lot_QA
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
router.get("/report3/:Holdnumber", async (req, res) => {
  try {
    const { Holdnumber } = req.params;
    let result = await user.sequelize.query(` 
    /****** Script for SelectTopNRows command from SSMS  ******/
    with [Record_QAPrint] as(
      SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
FROM [Setlot].[dbo].[Record_QAPrint] )

,[tbQA] as(
     select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
 ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
   ,[Base]
 ,[Ramp]
 ,[Hub]
 ,[Magnet]
 ,[FPC]
 ,[Diverter]
 ,[Crash_Stop]
 ,[CO2]
 ,[Emp_CO2]
 ,[SpecialControl1]
 ,[SpecialControl2]
 ,[SpecialControl3]
 ,[SpecialControl4]
 ,[SpecialControl5]
from  [QAInspection].[dbo].[tbVisualInspection] as s
  left join [QAInspection].[dbo].[tbQANumber]
  on s.[QANumber]=[tbQANumber].[QANumber]
  where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
  group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
      [Base]
 ,[Ramp]
 ,[Hub]
 ,[Magnet]
 ,[FPC]
 ,[Diverter]
 ,[Crash_Stop]
 ,[CO2]
 ,[Emp_CO2]
 ,[SpecialControl1]
 ,[SpecialControl2]
 ,[SpecialControl3]
 ,[SpecialControl4]
 ,[SpecialControl5]
)
 
 ,Record_TO_QA as (
     select *,case when [QANumber] is not null then [InspectionResult] 
 when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
 from [Record_QAPrint]
 left  join  [tbQA]
 on [Record_QAPrint].Lot_QA  = [tbQA].QANumber

 )

 ,[Tag_HoldQA]  as (
 select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
 ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
 ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
 else 0 end as Hold_Period
 from   [QAInspection].[dbo].[Tag_HoldQA]
     )
 
 ,Record_To_QA_To_Tag_HoldQA as (
select 
Date,
Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY

   ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
   ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
   ,Hold_detail
   ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
   ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
   ,[Tag_HoldQA].[Remark]
   ,Hold_Period
   ,QA_result
   ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
   when [Status] is not null  then [Status]
   when QA_result='Wait for QA'  then ''
   when [Status] is null  then 'Accept'
   else [Status] end as status_Hold
 ,[Base]
 ,[Ramp]
 ,[Hub]
 ,[Magnet]
 ,[FPC]
 ,[Diverter]
 ,[Crash_Stop]
 ,[CO2]
 ,[Emp_CO2]
 ,[SpecialControl1]
 ,[SpecialControl2]
 ,[SpecialControl3]
 ,[SpecialControl4]
 ,[SpecialControl5]
  from Record_TO_QA
  left  join [Tag_HoldQA]
  on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
            
)
 
 ,PCMC as ( 
SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
 FROM [PCMC].[dbo].[Invoice] as s
 where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
 
 )
 
 ,final as (
 select	
Print_Date,
Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
Hold_Date,
         Model_group,
         ModelNumber,
         Line_No as Line_No,
         Hold_index,
         Lot_QA,
         Record_To_QA_To_Tag_HoldQA.DateCode, 
         QTY,
         Hold_detail,
         Remark,
         QA_result,
         Status_Hold,
         case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
         Hold_by,
         Disposition,
         case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
  ,Record_To_QA_To_Tag_HoldQA.[Base]
 ,Record_To_QA_To_Tag_HoldQA.[Ramp]
 ,Record_To_QA_To_Tag_HoldQA.[Hub]
 ,Record_To_QA_To_Tag_HoldQA.[Magnet]
 ,Record_To_QA_To_Tag_HoldQA.[FPC]
 ,Record_To_QA_To_Tag_HoldQA.[Diverter]
 ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
 ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
 ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
 ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
 ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
 ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
  from Record_To_QA_To_Tag_HoldQA
  left join PCMC
  on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
   group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
 ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
 ,Hold_Period,status_Hold,[Lot_No],Line_No
     ,Record_To_QA_To_Tag_HoldQA.[Base]
 ,Record_To_QA_To_Tag_HoldQA.[Ramp]
 ,[Hub]
 ,[Magnet]
 ,[FPC]
 ,Record_To_QA_To_Tag_HoldQA.[Diverter]
 ,[Crash_Stop]
 ,[SpecialControl1]
 ,[SpecialControl2]
 ,[SpecialControl3]
 ,[SpecialControl4]
 ,[SpecialControl5]
,Print_Date
 )

  select * from final  
  where  Hold_index like'${Holdnumber}%'
         order by Lot_QA,Hold_Date

      `);

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
});
router.get("/HoldALL", async (req, res) => {
        try {
          let result = await user.sequelize
            .query(`   with [Record_QAPrint] as(
              SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
    ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
    FROM [Setlot].[dbo].[Record_QAPrint] )
        
    ,[tbQA] as(
             select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
         ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
           ,[Base]
         ,[Ramp]
         ,[Hub]
         ,[Magnet]
         ,[FPC]
         ,[Diverter]
         ,[Crash_Stop]
         ,[CO2]
         ,[Emp_CO2]
         ,[SpecialControl1]
         ,[SpecialControl2]
         ,[SpecialControl3]
         ,[SpecialControl4]
         ,[SpecialControl5]
    from  [QAInspection].[dbo].[tbVisualInspection] as s
          left join [QAInspection].[dbo].[tbQANumber]
          on s.[QANumber]=[tbQANumber].[QANumber]
          where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
          group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
              [Base]
         ,[Ramp]
         ,[Hub]
         ,[Magnet]
         ,[FPC]
         ,[Diverter]
         ,[Crash_Stop]
         ,[CO2]
         ,[Emp_CO2]
         ,[SpecialControl1]
         ,[SpecialControl2]
         ,[SpecialControl3]
         ,[SpecialControl4]
         ,[SpecialControl5]
    )
         
         ,Record_TO_QA as (
             select *,case when [QANumber] is not null then [InspectionResult] 
         when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
         from [Record_QAPrint]
         left  join  [tbQA]
         on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
    
         )
    
         ,[Tag_HoldQA]  as (
         select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
         ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
         ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
         else 0 end as Hold_Period
         from   [QAInspection].[dbo].[Tag_HoldQA]
             )
         
         ,Record_To_QA_To_Tag_HoldQA as (
    select 
    Date,
    Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
    
           ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
           ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
           ,Hold_detail
           ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
           ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
           ,[Tag_HoldQA].[Remark]
           ,Hold_Period
           ,QA_result
           ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
           when [Status] is not null  then [Status]
           when QA_result='Wait for QA'  then ''
           when [Status] is null  then 'Accept'
           else [Status] end as status_Hold
         ,[Base]
         ,[Ramp]
         ,[Hub]
         ,[Magnet]
         ,[FPC]
         ,[Diverter]
         ,[Crash_Stop]
         ,[CO2]
         ,[Emp_CO2]
         ,[SpecialControl1]
         ,[SpecialControl2]
         ,[SpecialControl3]
         ,[SpecialControl4]
         ,[SpecialControl5]
          from Record_TO_QA
          left  join [Tag_HoldQA]
          on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                    
     )
         
         ,PCMC as ( 
    SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
         FROM [PCMC].[dbo].[Invoice] as s
         where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
         
         )
         
         ,final as (
         select	
    Print_Date,
    Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
    Hold_Date,
                 Model_group,
                 ModelNumber,
                 Line_No as Line_No,
                 Hold_index,
                 Lot_QA,
                 Record_To_QA_To_Tag_HoldQA.DateCode, 
                 QTY,
                 Hold_detail,
                 Remark,
                 QA_result,
                 Status_Hold,
                 case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                 Hold_by,
                 Disposition,
                 case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
          ,Record_To_QA_To_Tag_HoldQA.[Base]
         ,Record_To_QA_To_Tag_HoldQA.[Ramp]
         ,Record_To_QA_To_Tag_HoldQA.[Hub]
         ,Record_To_QA_To_Tag_HoldQA.[Magnet]
         ,Record_To_QA_To_Tag_HoldQA.[FPC]
         ,Record_To_QA_To_Tag_HoldQA.[Diverter]
         ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
          from Record_To_QA_To_Tag_HoldQA
          left join PCMC
          on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
           group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
         ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
         ,Hold_Period,status_Hold,[Lot_No],Line_No
             ,Record_To_QA_To_Tag_HoldQA.[Base]
         ,Record_To_QA_To_Tag_HoldQA.[Ramp]
         ,[Hub]
         ,[Magnet]
         ,[FPC]
         ,Record_To_QA_To_Tag_HoldQA.[Diverter]
         ,[Crash_Stop]
         ,[SpecialControl1]
         ,[SpecialControl2]
         ,[SpecialControl3]
         ,[SpecialControl4]
         ,[SpecialControl5]
    ,Print_Date
         )
    
          select * from final  
          where  status_Hold='Hold'
                    order by Hold_Date,Lot_QA
                  `);
      
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
router.get("/HoldForpc", async (req, res) => {
        try {
          let result = await user.sequelize
            .query(`    
            with [Record_QAPrint] as(
              SELECT distinct [Lot_QA], convert(date,[Record_QAPrint].DateTime) as Print_Date,[Record_QAPrint].Model,[Record_QAPrint].Model_No
    ,Line,[W/W] as Record_QAPrint_W_W,[Qty] as Record_QAPrint_Qty
    FROM [Setlot].[dbo].[Record_QAPrint] )
        
    ,[tbQA] as(
             select s.[InspectionDate] as Date,s.[Model_group],s.[ModelNumber],Line_No
         ,s.[QANumber],[tbQANumber].[DateCode],sum([tbQANumber].MOQTY) as QTY,[Vis_Round],[InspectionResult]
           ,[Base]
         ,[Ramp]
         ,[Hub]
         ,[Magnet]
         ,[FPC]
         ,[Diverter]
         ,[Crash_Stop]
         ,[CO2]
         ,[Emp_CO2]
         ,[SpecialControl1]
         ,[SpecialControl2]
         ,[SpecialControl3]
         ,[SpecialControl4]
         ,[SpecialControl5]
    from  [QAInspection].[dbo].[tbVisualInspection] as s
          left join [QAInspection].[dbo].[tbQANumber]
          on s.[QANumber]=[tbQANumber].[QANumber]
          where [Vis_Round] =(select Max([Vis_Round])from [QAInspection].[dbo].[tbVisualInspection]where [QANumber]=s.[QANumber])
          group by[InspectionDate],[Model_group],s.[ModelNumber],s.[QANumber],[DateCode],[Vis_Round],[InspectionResult],Line_No, 
              [Base]
         ,[Ramp]
         ,[Hub]
         ,[Magnet]
         ,[FPC]
         ,[Diverter]
         ,[Crash_Stop]
         ,[CO2]
         ,[Emp_CO2]
         ,[SpecialControl1]
         ,[SpecialControl2]
         ,[SpecialControl3]
         ,[SpecialControl4]
         ,[SpecialControl5]
    )
         
         ,Record_TO_QA as (
             select *,case when [QANumber] is not null then [InspectionResult] 
         when [QANumber] is null then 'Wait for QA'else [Lot_QA] end as QA_result
         from [Record_QAPrint]
         left  join  [tbQA]
         on [Record_QAPrint].Lot_QA  = [tbQA].QANumber
    
         )
    
         ,[Tag_HoldQA]  as (
         select Hold_index,[Tag_HoldQA].DateTime,[Tag_HoldQA].QA_No,[Tag_HoldQA].[Status] as [Status],[Tag_HoldQA].[Access_by] as Hold_by
         ,[Non_Conformance] as Hold_detail,[Disposition] as [Disposition],[MfgDate] as Hold_Date,[Tag_HoldQA].[Remark]
         ,case  when [Status]='Hold' then  (DATEDIFF(DAY, [MfgDate],CAST(GETDATE() AS DATE)))
         else 0 end as Hold_Period
         from   [QAInspection].[dbo].[Tag_HoldQA]
             )
         
         ,Record_To_QA_To_Tag_HoldQA as (
    select 
    Date,
    Print_Date,[Lot_QA],[QANumber],Record_QAPrint_W_W as [DateCode],Record_TO_QA.Line as Line_No, Record_QAPrint_Qty as  QTY
    
           ,[Vis_Round],[InspectionResult],Model as [Model_group],Model_No as [ModelNumber],QA_No,Hold_index
           ,case when QA_result='REJECT'  then 'QA' else Hold_by end as Hold_by
           ,Hold_detail
           ,case when QA_result='REJECT' then  'Wait sorting' else [Disposition] end as [Disposition]
           ,case when QA_result='REJECT'  then Date else Hold_Date end as Hold_Date
           ,[Tag_HoldQA].[Remark]
           ,Hold_Period
           ,QA_result
           ,case when QA_result='REJECT'  and year(Date) >'2022'then 'Hold' 
           when [Status] is not null  then [Status]
           when QA_result='Wait for QA'  then ''
           when [Status] is null  then 'Accept'
           else [Status] end as status_Hold
         ,[Base]
         ,[Ramp]
         ,[Hub]
         ,[Magnet]
         ,[FPC]
         ,[Diverter]
         ,[Crash_Stop]
         ,[CO2]
         ,[Emp_CO2]
         ,[SpecialControl1]
         ,[SpecialControl2]
         ,[SpecialControl3]
         ,[SpecialControl4]
         ,[SpecialControl5]
          from Record_TO_QA
          left  join [Tag_HoldQA]
          on [Tag_HoldQA].QA_No=Record_TO_QA.Lot_QA
                    
     )
         
         ,PCMC as ( 
    SELECT [Invoie_ID],[Model],[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date]
         FROM [PCMC].[dbo].[Invoice] as s
         where [Date]=(select max([Date]) from [PCMC].[dbo].[Invoice] where[Lot_No]=s.[Lot_No])
         
         )
         
         ,final as (
         select	
    Print_Date,
    Record_To_QA_To_Tag_HoldQA.Date as Inspection_Date,
    Hold_Date,
                 Model_group,
                 ModelNumber,
                 Line_No as Line_No,
                 Hold_index,
                 Lot_QA,
                 Record_To_QA_To_Tag_HoldQA.DateCode, 
                 QTY,
                 Hold_detail,
                 Remark,
                 QA_result,
                 Status_Hold,
                 case when [Lot_QA]=[Lot_No] then 'Shipped' else '' end as Status_Shipped,
                 Hold_by,
                 Disposition,
                 case when QA_result='REJECT' then (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date,CAST(GETDATE() AS DATE)))else Hold_Period end as Hold_Period
          ,Record_To_QA_To_Tag_HoldQA.[Base]
         ,Record_To_QA_To_Tag_HoldQA.[Ramp]
         ,Record_To_QA_To_Tag_HoldQA.[Hub]
         ,Record_To_QA_To_Tag_HoldQA.[Magnet]
         ,Record_To_QA_To_Tag_HoldQA.[FPC]
         ,Record_To_QA_To_Tag_HoldQA.[Diverter]
         ,Record_To_QA_To_Tag_HoldQA.[Crash_Stop]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl1]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl2]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl3]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl4]
         ,Record_To_QA_To_Tag_HoldQA.[SpecialControl5]       
          from Record_To_QA_To_Tag_HoldQA
          left join PCMC
          on Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
           group by[Lot_QA],Record_To_QA_To_Tag_HoldQA.Date,[QANumber],[ModelNumber],Record_To_QA_To_Tag_HoldQA.[DateCode]
         ,QTY,[Model_group],QA_result,QA_No,Hold_index,Hold_by,Hold_detail,[Disposition],Hold_Date,[Remark]
         ,Hold_Period,status_Hold,[Lot_No],Line_No
             ,Record_To_QA_To_Tag_HoldQA.[Base]
         ,Record_To_QA_To_Tag_HoldQA.[Ramp]
         ,[Hub]
         ,[Magnet]
         ,[FPC]
         ,Record_To_QA_To_Tag_HoldQA.[Diverter]
         ,[Crash_Stop]
         ,[SpecialControl1]
         ,[SpecialControl2]
         ,[SpecialControl3]
         ,[SpecialControl4]
         ,[SpecialControl5]
    ,Print_Date
         )
    
          select * from final  
          where  status_Hold='Hold'and Status_Shipped !='Shipped'
                         order by Hold_Date,Lot_QA
                  `);
      
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

module.exports = router;
