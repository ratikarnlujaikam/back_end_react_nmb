const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
router.get("/Model", async (req, res) => {
    try {
      let result = await user.sequelize.query(`
SELECT distinct [Model_group] as  Model
  FROM [Component_Master].[dbo].[LoosePart3]
  where [Model_group] !='ALL' and [Model_group] !='TEST'
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

router.get("/Unpacking_sorting/:Model/:status/:startdate/:finishdate",async(req,res) => {
    try {
        var result = [[]];
        const { status ,startdate , finishdate , Model} = req.params;

        if (Model == "**ALL**" && status == "**ALL**"){
            var result = await user.sequelize.query(` 
   with Mathdata as (
    SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
        sum(Record.[Qty]) as [Qty],
        Record.[Baseplate],
        Record.Ramp,
        Record.[Diverter],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,Model
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS MfgDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS shift
    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
LEFT JOIN
    [Setlot].[dbo].[Record_QAPrint] as Record
ON
    Unpack.[QA_no] COLLATE SQL_Latin1_General_CP1_CI_AS = Record.[Lot_QA] COLLATE SQL_Latin1_General_CP1_CI_AS
group by Unpack.[QA_no],Unpack.[Emp],Unpack.[Emp],Unpack.[Reason_Hold],Unpack.[TimeStamp_unpack],Unpack.[TimeStamp_return]
,Record.[Baseplate],Record.Ramp,Record.[Diverter],Model)

select FORMAT(sorting_datetime, 'yyyy-MM-dd  HH:mm:ss') as [Datetime],Model,[QA_no] ,[Qty],[Baseplate],Ramp,[Diverter],[Emp],FORMAT(Sorting_return, 'yyyy-MM-dd  HH:mm:ss') as Sorting_return ,[Reason_Hold]
,Sorting_Status,MfgDate,shift
FROM Mathdata
where MfgDate between '${startdate}' and '${finishdate}'
order by [Datetime]

      
          `);
            }else if (Model == "**ALL**" && status != "**ALL**") {
              var result = await user.sequelize.query(` 

   with Mathdata as (
    SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
        sum(Record.[Qty]) as [Qty],
        Record.[Baseplate],
        Record.Ramp,
        Record.[Diverter],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,Model
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS MfgDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS shift
    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
LEFT JOIN
    [Setlot].[dbo].[Record_QAPrint] as Record
ON
    Unpack.[QA_no] COLLATE SQL_Latin1_General_CP1_CI_AS = Record.[Lot_QA] COLLATE SQL_Latin1_General_CP1_CI_AS
group by Unpack.[QA_no],Unpack.[Emp],Unpack.[Emp],Unpack.[Reason_Hold],Unpack.[TimeStamp_unpack],Unpack.[TimeStamp_return]
,Record.[Baseplate],Record.Ramp,Record.[Diverter],Model)

select FORMAT(sorting_datetime, 'yyyy-MM-dd  HH:mm:ss') as [Datetime],Model,[QA_no] ,[Qty],[Baseplate],Ramp,[Diverter],[Emp],FORMAT(Sorting_return, 'yyyy-MM-dd  HH:mm:ss') as Sorting_return ,[Reason_Hold]
,Sorting_Status,MfgDate,shift
FROM Mathdata
where Sorting_Status ='${status}' and MfgDate between '${startdate}' and '${finishdate}'
order by [Datetime]
`);
              

            }
            else if (Model != "**ALL**" && status == "**ALL**"){
              var result = await user.sequelize.query(`
                with Mathdata as (
    SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
        sum(Record.[Qty]) as [Qty],
        Record.[Baseplate],
        Record.Ramp,
        Record.[Diverter],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,Model
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS MfgDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS shift
    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
LEFT JOIN
    [Setlot].[dbo].[Record_QAPrint] as Record
ON
    Unpack.[QA_no] COLLATE SQL_Latin1_General_CP1_CI_AS = Record.[Lot_QA] COLLATE SQL_Latin1_General_CP1_CI_AS
group by Unpack.[QA_no],Unpack.[Emp],Unpack.[Emp],Unpack.[Reason_Hold],Unpack.[TimeStamp_unpack],Unpack.[TimeStamp_return]
,Record.[Baseplate],Record.Ramp,Record.[Diverter],Model)

select FORMAT(sorting_datetime, 'yyyy-MM-dd  HH:mm:ss') as [Datetime],Model,[QA_no] ,[Qty],[Baseplate],Ramp,[Diverter],[Emp],FORMAT(Sorting_return, 'yyyy-MM-dd  HH:mm:ss') as Sorting_return ,[Reason_Hold]
,Sorting_Status,MfgDate,shift
FROM Mathdata
where Model ='${Model}' and MfgDate between '${startdate}' and '${finishdate}'     
order by [Datetime]
                
                
                
                `)

            }
            else {
            var result = await user.sequelize.query(` 
                   with Mathdata as (
    SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
        sum(Record.[Qty]) as [Qty],
        Record.[Baseplate],
        Record.Ramp,
        Record.[Diverter],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,Model
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS MfgDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS shift
    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
LEFT JOIN
    [Setlot].[dbo].[Record_QAPrint] as Record
ON
    Unpack.[QA_no] COLLATE SQL_Latin1_General_CP1_CI_AS = Record.[Lot_QA] COLLATE SQL_Latin1_General_CP1_CI_AS
group by Unpack.[QA_no],Unpack.[Emp],Unpack.[Emp],Unpack.[Reason_Hold],Unpack.[TimeStamp_unpack],Unpack.[TimeStamp_return]
,Record.[Baseplate],Record.Ramp,Record.[Diverter],Model)

select FORMAT(sorting_datetime, 'yyyy-MM-dd  HH:mm:ss') as [Datetime],Model,[QA_no] ,[Qty],[Baseplate],Ramp,[Diverter],[Emp],FORMAT(Sorting_return, 'yyyy-MM-dd  HH:mm:ss') as Sorting_return ,[Reason_Hold]
,Sorting_Status,MfgDate,shift
FROM Mathdata
where Sorting_Status='${status}' and Model = '${Model}'and MfgDate between '${startdate}' and '${finishdate}' 
order by [Datetime] `);
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
});
router.get("/Unpacking_sorting_QANumber/:QANumber",async(req,res) => {
    try {
      const { QANumber } = req.params;
      let result = await user.sequelize.query(`
  
                   with Mathdata as (
    SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
        sum(Record.[Qty]) as [Qty],
        Record.[Baseplate],
        Record.Ramp,
        Record.[Diverter],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,Model
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS MfgDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS shift
    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
LEFT JOIN
    [Setlot].[dbo].[Record_QAPrint] as Record
ON
    Unpack.[QA_no] COLLATE SQL_Latin1_General_CP1_CI_AS = Record.[Lot_QA] COLLATE SQL_Latin1_General_CP1_CI_AS
group by Unpack.[QA_no],Unpack.[Emp],Unpack.[Emp],Unpack.[Reason_Hold],Unpack.[TimeStamp_unpack],Unpack.[TimeStamp_return]
,Record.[Baseplate],Record.Ramp,Record.[Diverter],Model)

select FORMAT(sorting_datetime, 'yyyy-MM-dd  HH:mm:ss') as [Datetime],Model,[QA_no] ,[Qty],[Baseplate],Ramp,[Diverter],[Emp],FORMAT(Sorting_return, 'yyyy-MM-dd  HH:mm:ss') as Sorting_return ,[Reason_Hold]
,Sorting_Status,MfgDate,shift
FROM Mathdata
where QA_no='${QANumber}'
order by [Datetime]

  
      `);
  
      var list_unpacking = [];
      list_unpacking.push(result[0]);
  console.log(list_unpacking);
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