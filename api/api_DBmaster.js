const express = require("express");
const router = express.Router();
const user = require("../database/models/user");



router.get("/DBMaster", async (req, res) => {
  try {
    const result = await user.sequelize.query(`
with Airleak as (SELECT DISTINCT Line
FROM [MasterTest].[dbo].[Master_Airleak]
WHERE Masterjudgement = 'Master match'
  AND TRY_CONVERT(date, [Date]) = CAST(GETDATE() AS date)
  AND TRY_CONVERT(time, [Time]) >= CAST(DATEADD(hour, -2, GETDATE()) AS time)
  AND TRY_CONVERT(time, [Time]) = (
      SELECT MAX(TRY_CONVERT(time, [Time]))
      FROM [MasterTest].[dbo].[Master_Airleak] AS sub
      WHERE sub.Serialnumber = [Master_Airleak].Serialnumber
        AND TRY_CONVERT(date, sub.[Date]) = CAST(GETDATE() AS date)
        AND sub.Masterjudgement = 'Master match'
  ))
,Gmeter as (SELECT DISTINCT Line
FROM [MasterTest].[dbo].[Master_Gmeter]
WHERE Masterjudgement = 'Master match'
  AND TRY_CONVERT(date, [Date]) = CAST(GETDATE() AS date)
  AND TRY_CONVERT(time, [Time]) >= CAST(DATEADD(hour, -2, GETDATE()) AS time)
  AND TRY_CONVERT(time, [Time]) = (
      SELECT MAX(TRY_CONVERT(time, [Time]))
      FROM [MasterTest].[dbo].[Master_Gmeter] AS sub
      WHERE sub.Serialnumber = [Master_Gmeter].Serialnumber
        AND TRY_CONVERT(date, sub.[Date]) = CAST(GETDATE() AS date)
        AND sub.Masterjudgement = 'Master match'
  )),
  Dymension as (SELECT DISTINCT Line
FROM [MasterTest].[dbo].[Master_Dymension]
WHERE Masterjudgement = 'Master match'
  AND TRY_CONVERT(date, [Date]) = CAST(GETDATE() AS date)
  AND TRY_CONVERT(time, [Time]) >= CAST(DATEADD(hour, -2, GETDATE()) AS time)
  AND TRY_CONVERT(time, [Time]) = (
      SELECT MAX(TRY_CONVERT(time, [Time]))
      FROM [MasterTest].[dbo].[Master_Dymension] AS sub
      WHERE sub.Serialnumber = [Master_Dymension].Serialnumber
        AND TRY_CONVERT(date, sub.[Date]) = CAST(GETDATE() AS date)
        AND sub.Masterjudgement = 'Master match'
  )),
   EWMS as (SELECT DISTINCT Line
FROM [MasterTest].[dbo].[Master_EWMS]
WHERE Masterjudgement = 'Master match'
  AND TRY_CONVERT(date, [Date]) = CAST(GETDATE() AS date)
  AND TRY_CONVERT(time, [Time]) >= CAST(DATEADD(hour, -2, GETDATE()) AS time)
  AND TRY_CONVERT(time, [Time]) = (
      SELECT MAX(TRY_CONVERT(time, [Time]))
      FROM [MasterTest].[dbo].[Master_EWMS] AS sub
      WHERE sub.Serialnumber = [Master_EWMS].Serialnumber
        AND TRY_CONVERT(date, sub.[Date]) = CAST(GETDATE() AS date)
        AND sub.Masterjudgement = 'Master match'
  )),
   Helium as (SELECT DISTINCT Line
FROM [MasterTest].[dbo].[Master_Helium]
WHERE Masterjudgement = 'Master match'
  AND TRY_CONVERT(date, [Date]) = CAST(GETDATE() AS date)
  AND TRY_CONVERT(time, [Time]) >= CAST(DATEADD(hour, -2, GETDATE()) AS time)
  AND TRY_CONVERT(time, [Time]) = (
      SELECT MAX(TRY_CONVERT(time, [Time]))
      FROM [MasterTest].[dbo].[Master_Helium] AS sub
      WHERE sub.Serialnumber = [Master_Helium].Serialnumber
        AND TRY_CONVERT(date, sub.[Date]) = CAST(GETDATE() AS date)
        AND sub.Masterjudgement = 'Master match'
  )),
   Hipot as (SELECT DISTINCT Line
FROM [MasterTest].[dbo].[Master_hipot]
WHERE Masterjudgement = 'Master match'
  AND TRY_CONVERT(date, [Date]) = CAST(GETDATE() AS date)
  AND TRY_CONVERT(time, [Time]) >= CAST(DATEADD(hour, -2, GETDATE()) AS time)
  AND TRY_CONVERT(time, [Time]) = (
      SELECT MAX(TRY_CONVERT(time, [Time]))
      FROM [MasterTest].[dbo].[Master_hipot] AS sub
      WHERE sub.Serialnumber = [Master_hipot].Serialnumber
        AND TRY_CONVERT(date, sub.[Date]) = CAST(GETDATE() AS date)
        AND sub.Masterjudgement = 'Master match'
  )),
  MasterProcess as (SELECT [Line]
      ,[Airleak]
      ,[Dymension]
      ,[EWMS]
      ,[G_meter]
      ,[Helium]
      ,[Hipot]
  FROM [Mastervalues].[dbo].[Marter_Process_Emaster])
,Running as(SELECT distinct Line_IP
  FROM [Setlot].[dbo].[Master_Setlot]
  WHERE CAST([Date] AS DATE) = CAST(GETDATE() AS DATE))


,Detail as (Select MasterProcess.Line
    , CASE 
        WHEN MasterProcess.Airleak = 'N' THEN 'NO PROCESS'
        ELSE Airleak.Line 
      END as Airleak
    , CASE 
        WHEN MasterProcess.Helium = 'N' THEN 'NO PROCESS'
        ELSE Helium.Line 
      END as Helium
    , CASE 
        WHEN MasterProcess.Dymension = 'N' THEN 'NO PROCESS'
        ELSE Dymension.Line 
      END as Dymension
    , CASE 
        WHEN MasterProcess.Hipot = 'N' THEN 'NO PROCESS'
        ELSE Hipot.Line 
      END as Hipot
    , CASE 
        WHEN MasterProcess.EWMS = 'N' THEN 'NO PROCESS'
        ELSE EWMS.Line 
      END as EWMS
    , CASE 
        WHEN MasterProcess.G_meter = 'N' THEN 'NO PROCESS'
        ELSE Gmeter.Line 
      END as Gmeter
	 , CASE 
        WHEN Running.Line_IP  IS NULL THEN 'NO PLAN'
        ELSE  Running.Line_IP 
      END as Line_running
from MasterProcess
Left join Airleak on MasterProcess.Line = Airleak.Line
Left join Helium on MasterProcess.Line = Helium.Line
Left join Dymension on MasterProcess.Line = Dymension.Line
Left join Hipot on MasterProcess.Line = Hipot.Line
Left join EWMS on MasterProcess.Line = EWMS.Line
Left join Gmeter on MasterProcess.Line = Gmeter.Line
Left join Running on MasterProcess.Line = Running.Line_IP
)
select 
Detail.Line 
,SUBSTRING(Detail.Line , 1, 1) AS order_Line ,CAST(SUBSTRING(Detail.Line, 3, 2) AS INT) AS order_by
,Line_running
,CASE 
        WHEN Airleak IS NOT NULL 
             AND Helium IS NOT NULL 
             AND Dymension IS NOT NULL 
             AND Hipot IS NOT NULL 
             AND EWMS IS NOT NULL 
             AND Gmeter IS NOT NULL 
        THEN 'Passed'
        ELSE 'Failed'
      END as Status
	  ,Airleak
,Helium
,Dymension
,Hipot
,EWMS
,Gmeter
from Detail
ORDER BY order_Line,order_by;

    `);

    const result_1 = await user.sequelize.query(`
  
    `);

    
    




    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
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