const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

//motor
//DataML
router.get("/Model", async (req, res) => {
  try {
    let result = await user.sequelize.query(` 
    --Model
    SELECT distinct [Model]
    FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]`);
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

router.get("/Line/:Model", async (req, res) => {
  try {
    const { Model } = req.params;
    let result = await user.sequelize.query(`
    --Line:Model
    SELECT distinct[Line],[Model]
    FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]
    where [DataforAnalysis].[dbo].[Sample_Data_ML_TEST].[Model]='${Model}'`);
    // console.log(result);

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

router.get("/DateDailyML", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
    --DateDailyML
    SELECT distinct([Date])
    FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]`);
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

router.get("/DailyMLfail/:Model/:Line/:DateDailyML", async (req, res) => {
  try {
    const { Line, Model, DateDailyML } = req.params;
    let result = await user.sequelize.query(`
    --/DailyML/:Model/:Line/:DateDailyML
    SELECT [Date]
    ,[betweenDate]
    ,[Model]
    ,[Line]
    ,[Rangeindex]
    ,[Datum_probe]
    ,[Max_force]
    ,[Set_Dim_A]
    ,[Set_Dim_B]
    ,[Set_Dim_C]
    ,[Diecast_Pivot_2]
    ,[Projection]
    ,[Support]
    ,[Confidence]
FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]
where [Model]='${Model}'and [Line]='${Line}' and [Date]='${DateDailyML}'
order by Projection,Confidence Desc`);

    var resultGraph = await user.sequelize.query(`
--Support&confidence-fail
with A2 as (SELECT [Rangeindex],
  cast([Support] as decimal(11, 3)) AS  Support_fail
  ,cast([Confidence] as decimal(11, 3)) AS  Confidence_fail
  FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]
  where [Model]='${Model}'and [Line]='${Line}' and [Date]='${DateDailyML}'
  and [Projection]='fail')
  
  select 
  [Rangeindex] as Rangeindex_fail,
  case when Support_fail  is null then 0 else Support_fail  end  as Support_fail
  ,case when Confidence_fail  is null then 0 else Confidence_fail  end  as Confidence_fail
  from A2
  order by Confidence_fail Desc
`);
    var resultGraphPass = await user.sequelize.query(`
--Support&confidence-pass
with A2 as (SELECT [Rangeindex]  ,
  cast([Support] as decimal(11, 3)) AS  Support_pass
  ,cast([Confidence] as decimal(11, 3)) AS  Confidence_pass
  FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]
  where [Model]='${Model}'and [Line]='${Line}' and [Date]='${DateDailyML}'
  and [Projection]='pass')
  
  select 
  [Rangeindex] as Rangeindex_pass,
  case when Support_pass  is null then 0 else Support_pass  end  as Support_pass
  ,case when Confidence_pass  is null then 0 else Confidence_pass  end  as Confidence_pass
  from A2
  order by Confidence_pass Desc
`);
    var Graphfail = await user.sequelize.query(`
with A2 as (SELECT [Rangeindex]  ,
  cast([Support] as decimal(11, 3)) AS  Support_fail
  ,cast([Confidence] as decimal(11, 3)) AS  Confidence_fail
  ,Datum_probe
  ,[Max_force]
  ,[Set_Dim_A]
  ,[Set_Dim_B]
  ,[Set_Dim_C]
  ,[Diecast_Pivot_2]
  FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]
  where [Model]='${Model}'and [Line]='${Line}' and [Date]='${DateDailyML}'
  and [Projection]='fail')

  select
  [Rangeindex] as Rangeindex_fail
  ,Datum_probe
  ,[Max_force]
  ,[Set_Dim_A]
  ,[Set_Dim_B]
  ,[Set_Dim_C]
  ,[Diecast_Pivot_2]
  ,Support_fail
  ,Confidence_fail
  from A2
  order by Confidence_fail Desc
`);
    var GraphPass = await user.sequelize.query(`
with A2 as (SELECT [Rangeindex]  ,
  cast([Support] as decimal(11, 3)) AS  Support_pass
  ,cast([Confidence] as decimal(11, 3)) AS  Confidence_pass
  ,[Rangeindex] as Rangeindex_fail
  ,Datum_probe
  ,[Max_force]
  ,[Set_Dim_A]
  ,[Set_Dim_B]
  ,[Set_Dim_C]
  ,[Diecast_Pivot_2]
  FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]
  where [Model]='${Model}'and [Line]='${Line}' and [Date]='${DateDailyML}'
  and [Projection]='pass')

  select
  [Rangeindex] as Rangeindex_pass
  ,Datum_probe as Datum_probe_pass
  ,[Max_force] as Max_force_pass
  ,[Set_Dim_A] as Set_Dim_A_pass
  ,[Set_Dim_B] as Set_Dim_B_pass
  ,[Set_Dim_C] as Set_Dim_C_pass
  ,[Diecast_Pivot_2] as Diecast_Pivot_2_pass
  ,Support_pass
  ,Confidence_pass
  from A2
  order by Confidence_pass Desc
`);
    let Support_fail = [];
    let Confidence_fail = [];
    let Support_pass = [];
    let Confidence_pass = [];

    let Rangeindex_fail = [];
    let Rangeindex_pass = [];


    let Datum_probe = [];
    let Max_force = [];
    let Set_Dim_A = [];
    let Set_Dim_B = [];
    let Set_Dim_C = [];
    let Diecast_Pivot_2 = [];

    let Datum_probe_pass = [];
    let Max_force_pass = [];
    let Set_Dim_A_pass = [];
    let Set_Dim_B_pass = [];
    let Set_Dim_C_pass = [];
    let Diecast_Pivot_2_pass = [];

    //Support&confidence-fail
    resultGraph[0].forEach((item) => {
      Support_fail.push(item.Support_fail);
      Confidence_fail.push(item.Confidence_fail);
    });
    //Support&confidence-pass
    resultGraphPass[0].forEach((item) => {
      Support_pass.push(item.Support_pass);
      Confidence_pass.push(item.Confidence_pass);
    });

    Graphfail[0].forEach((item) => {
      Datum_probe.push(item.Datum_probe);
      Max_force.push(item.Max_force);
      Set_Dim_A.push(item.Set_Dim_A);
      Set_Dim_B.push(item.Set_Dim_B);
      Set_Dim_C.push(item.Set_Dim_C);
      Diecast_Pivot_2.push(item.Diecast_Pivot_2);
    });

    GraphPass[0].forEach((item) => {
      Datum_probe_pass.push(item.Datum_probe_pass);
      Max_force_pass.push(item.Max_force_pass);
      Set_Dim_A_pass.push(item.Set_Dim_A_pass);
      Set_Dim_B_pass.push(item.Set_Dim_B_pass);
      Set_Dim_C_pass.push(item.Set_Dim_C_pass);
      Diecast_Pivot_2_pass.push(item.Diecast_Pivot_2_pass);
  
    });

    console.log(Datum_probe);

    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      resultGraphPass: resultGraphPass[0],
      Graphfail: Graphfail[0],
      GraphPass: GraphPass[0],
      listRawData,
      Rangeindex_fail,
      Support_fail,
      Confidence_fail,

      Support_pass,
      Confidence_pass,
      Rangeindex_pass,

      Datum_probe,
      Max_force,
      Set_Dim_A,
      Set_Dim_B,
      Set_Dim_C,
      Diecast_Pivot_2,
      Datum_probe_pass,
      Max_force_pass,
      Set_Dim_A_pass,
      Set_Dim_B_pass,
      Set_Dim_C_pass,
      Diecast_Pivot_2_pass,
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
router.get("/DailyMLDate/:Model/:Line/:DateDailyML", async (req, res) => {
  try {
    const { Line, Model, DateDailyML } = req.params;
    let result = await user.sequelize.query(`
    --/DailyMLDate/:Model/:Line/:DateDailyML
    SELECT [Date] as Date
    ,[betweenDate]
    ,[Model]
    ,[Line]
FROM [DataforAnalysis].[dbo].[Sample_Data_ML_TEST]
where [Model]='${Model}'and [Line]='${Line}' and [Date]='${DateDailyML}'
group by [Date],[betweenDate],[Model],[Line]`);

    var listRawData4 = [];
    listRawData4.push(result[0]);

    res.json({
      result: result[0],
      listRawData4,
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
router.get("/DescribeML/:Model/:Line/:DateDailyML", async (req, res) => {
  try {
    const { Line, Model, DateDailyML } = req.params;
    let result = await user.sequelize.query(`
    SELECT 
    [Date]
    ,[betweenDate]
    ,[Model]
    ,[Line]
    ,[describe1]
    ,[Datum_probe]
    ,[Max_force]
    ,[Set_Dim_A]
    ,[Set_Dim_B]
    ,[Set_Dim_C]
    ,[Diecast_Pivot_2]
    ,[Projection]
FROM [DataforAnalysis].[dbo].[DescribeML]
where [Model]='${Model}'and [Line]='${Line}' and [Date]='${DateDailyML}'`);

    var listRawData5 = [];
    listRawData5.push(result[0]);

    res.json({
      result: result[0],
      listRawData5,
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

router.get("/accuracyML/:Model/:Line/:DateDailyML", async (req, res) => {
  try {
    const { Line, DateDailyML, Model } = req.params;
    let result = await user.sequelize.query(`
    SELECT [Date]
      ,[Line]
      ,[Model]
      ,[Details]
      ,[Procision]
      ,[recall]
      ,[f1_score]
      ,[support]
  FROM [DataforAnalysis].[dbo].[accuracyDataML_Test]
  where [Model]='${Model}'and [Line]='${Line}' and [Date]='${DateDailyML}'`);

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
router.get("/Reference", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
    /****** Script for SelectTopNRows command from SSMS  ******/
    SELECT [Bin]
          ,[Bin2]
          ,[Datum_probe_Min]
          ,[Datum_probe_Max]
          ,[Max_force_Min]
          ,[Max_force_Max]
          ,[Set_Dim_A_Min]
          ,[Set_Dim_A_Max]
          ,[Set_Dim_B_Min]
          ,[Set_Dim_B_Max]
          ,[Set_Dim_C_Min]
          ,[Set_Dim_C_Max]
          ,[Pivot_Height_Min]
          ,[Pivot_Height_Max]
          ,[Pivot_2_Min]
          ,[Pivot_2_Max]
          ,[KPOV_Min]
          ,[KPOV_Max]
      FROM [DataforAnalysis].[dbo].[ReferenceType2]`);

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

module.exports = router;
