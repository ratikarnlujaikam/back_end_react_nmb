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
    FROM [DataforAnalysis].[dbo].[Sample_DataML]`);
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
    FROM [DataforAnalysis].[dbo].[Sample_DataML]
    where [DataforAnalysis].[dbo].[Sample_DataML].[Model]='${Model}'`);
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


router.get("/DailyMLfail/:Model/:Line/:startDate", async (req, res) => {
  try {
    const {Line ,Model,startDate } = req.params;
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
    ,[Pivot_Height]
    ,[Projection]
    ,[Support]
    ,[Confidence]
FROM [DataforAnalysis].[dbo].[Sample_DataML]
where [Model]='${Model}'and [Line]='${Line}' and [Date]='${startDate}'
order by [Projection]`);


var resultGraph = await user.sequelize
.query(`
with A2 as (SELECT [Rangeindex],
  cast([Support] as decimal(11, 3)) AS  Support_fail
  ,cast([Confidence] as decimal(11, 3)) AS  Confidence_fail
  FROM [DataforAnalysis].[dbo].[Sample_DataML]
  where [Model]='${Model}'and [Line]='${Line}' and [Date]='${startDate}'
  and [Projection]='fail')
  
  select 
  [Rangeindex] as Rangeindex_fail
   ,Support_fail
  ,Confidence_fail
  from A2
`);
var resultGraphPass = await user.sequelize
.query(`
with A2 as (SELECT [Rangeindex]  ,
  cast([Support] as decimal(11, 3)) AS  Support_pass
  ,cast([Confidence] as decimal(11, 3)) AS  Confidence_pass
  FROM [DataforAnalysis].[dbo].[Sample_DataML]
  where [Model]='${Model}'and [Line]='${Line}' and [Date]='${startDate}'
  and [Projection]='pass')
  
  select 
  [Rangeindex] as Rangeindex_pass
  ,Support_pass
  ,Confidence_pass
  from A2
`);
let Support_fail = [];
let Confidence_fail = [];
let Support_pass =[];
let Confidence_pass =[];
let Rangeindex_fail =[];
let Rangeindex_pass =[];

resultGraph[0].forEach( (item) => {
  Support_fail.push(item.Support_fail);
  Confidence_fail.push(item.Confidence_fail);

});
// console.log(LAR);
resultGraphPass[0].forEach( (item) => {
Support_pass.push(item.Support_pass);
Confidence_pass.push(item.Confidence_pass);
console.log(resultGraphPass[0]);
});



var listRawData = [];
listRawData.push(result[0]);
res.json({
result: result[0],
resultGraph: resultGraph[0],
resultGraphPass: resultGraphPass[0],
listRawData,
Rangeindex_fail,
Support_fail,
Confidence_fail,

Support_pass,
Confidence_pass,
Rangeindex_pass,
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
router.get("/DailyMLDate/:Model/:Line/:startDate", async (req, res) => {
  try {
    const {Line ,Model,startDate } = req.params;
    let result = await user.sequelize.query(`
    --/DailyMLDate/:Model/:Line/:DateDailyML
    SELECT [Date] as Date
    ,[betweenDate]
    ,[Model]
    ,[Line]
FROM [DataforAnalysis].[dbo].[Sample_DataML]
where [Model]='${Model}'and [Line]='${Line}' and [Date]='${startDate}'
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

router.get("/accuracyML/:Model/:Line/:startDate", async (req, res) => {
  try {
    const {Line ,startDate,Model } = req.params;
    let result = await user.sequelize.query(`
    SELECT [Date]
      ,[Line]
      ,[Model]
      ,[Details]
      ,[Procision]
      ,[recall]
      ,[f1_score]
      ,[support]
  FROM [DataforAnalysis].[dbo].[accuracyDataML]
  where [Model]='${Model}'and [Line]='${Line}' and [Date]='${startDate}'`);

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
router.get("/Reference", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
    SELECT [Bin]
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
      ,[KPOV_Min]
      ,[KPOV_Max]
  FROM [DataforAnalysis].[dbo].[Reference]`);



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
