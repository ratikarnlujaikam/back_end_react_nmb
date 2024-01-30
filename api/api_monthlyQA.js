const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Model_group]
    FROM [QAInspection].[dbo].[tbVisualInspection]
  where [Model_group] is not null
  and [Model_group]!='' and [Model_group]!='All'
  union 
  select '**ALL**'
    order by [Model_group]`);
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

router.get("/insType/:model", async (req, res) => {
  try {
    const { model } = req.params;
    var result = [[]];
    if (model == "**ALL**") {
      var result = await user.sequelize.query(`select distinct [InspectionType]
      FROM [QAInspection].[dbo].[tbVisualInspection]
      where InspectionType !='All'
      union 
      select '**ALL**'
      order by [InspectionType]`);
    } else {
      var result = await user.sequelize.query(`select distinct [InspectionType]
          FROM [QAInspection].[dbo].[tbVisualInspection]
          where [Model_group] = '${model}'
          and InspectionType !='All'
          union 
          select '**ALL**'
          order by [InspectionType]`);
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
  "/monthlyQA/:model/:insType/:startDate/:finishDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { model, insType, startDate, finishDate } = req.params;
      if (model == "**ALL**" && insType == "**ALL**") {
        var result = await user.sequelize
          .query(`	 WITH T1 AS (
	   select [InsNumber],[QANumber],[InspectionDate],[InspectionShift],[InspectionType],[Vis_Round],[InspectionResult],[Model_Name]
	   ,[SamplingLevel],[SamplingQTY]
   FROM [QAInspection].[dbo].[tbVisualInspection] 
),

	t2 AS (  SELECT [QANumber],[ModelGroup],[ModelNumber],[Line_No] as Line_No ,Remark,[Lotsize]
   FROM [QAInspection].[dbo].[tbQANumber] 

   GROUP BY [QANumber],[Line_No],Remark,[ModelGroup],[ModelNumber],[Lotsize])

   SELECT [InspectionType] as Type,[InspectionDate] as Date,[InspectionShift]as Shift,[ModelNumber]as Model_NO,
   [ModelGroup] as Model_Group ,[Model_Name]as Model_Name,'L'+[Line_No] as Line_No,T1.[QANumber],[Lotsize]as QA_QTY,[SamplingLevel],[SamplingQTY],[Vis_Round],[InspectionResult],QTY as Reject_QTY,Remark
   from T1 join T2 on T1.QANumber = T2.QANumber
   left join [QAInspection].[dbo].[Reject_visual] on  T1.[InsNumber] = [Reject_visual].[Inspection]
   where [InspectionDate] between '${startDate}' and '${finishDate}'
   GROUP BY [InspectionType],[InspectionDate],[InspectionShift],[ModelNumber],[ModelGroup],[Model_Name],[Line_No]
   ,T1.[QANumber],[Lotsize],[SamplingLevel],[SamplingQTY],[Vis_Round],[InspectionResult],Remark,QTY
   ORDER BY [InspectionType], [InspectionDate],[InspectionShift],[ModelNumber],[Line_No], [QANumber], [Vis_Round]`);
    
      } else if (model == "**ALL**" && insType != "**ALL**") {
        var result = await user.sequelize
          .query(`	 WITH T1 AS (
            select [InsNumber],[QANumber],[InspectionDate],[InspectionShift],[InspectionType],[Vis_Round],[InspectionResult],[Model_Name]
            ,[SamplingLevel],[SamplingQTY]
          FROM [QAInspection].[dbo].[tbVisualInspection] 
       ),
       
         t2 AS (  SELECT [QANumber],[ModelGroup],[ModelNumber],[Line_No] as Line_No ,Remark,[Lotsize]
          FROM [QAInspection].[dbo].[tbQANumber] 
       
          GROUP BY [QANumber],[Line_No],Remark,[ModelGroup],[ModelNumber],[Lotsize])
       
          SELECT [InspectionType] as Type,[InspectionDate] as Date,[InspectionShift]as Shift,[ModelNumber]as Model_NO,
          [ModelGroup] as Model_Group ,[Model_Name]as Model_Name,'L'+[Line_No] as Line_No,T1.[QANumber],[Lotsize]as QA_QTY,[SamplingLevel],[SamplingQTY],[Vis_Round],[InspectionResult],QTY as Reject_QTY,Remark
          from T1 join T2 on T1.QANumber = T2.QANumber
          left join [QAInspection].[dbo].[Reject_visual] on  T1.[InsNumber] = [Reject_visual].[Inspection]
          where [InspectionDate] between '${startDate}' and '${finishDate}'and [InspectionType] = '${insType}' 
          GROUP BY [InspectionType],[InspectionDate],[InspectionShift],[ModelNumber],[ModelGroup],[Model_Name],[Line_No]
          ,T1.[QANumber],[Lotsize],[SamplingLevel],[SamplingQTY],[Vis_Round],[InspectionResult],Remark,QTY
          ORDER BY [InspectionType], [InspectionDate],[InspectionShift],[ModelNumber],[Line_No], [QANumber], [Vis_Round]`);
      } else if (model != "**ALL**" && insType == "**ALL**") {
        var result = await user.sequelize
          .query(`	 WITH T1 AS (
            select [InsNumber],[QANumber],[InspectionDate],[InspectionShift],[InspectionType],[Vis_Round],[InspectionResult],[Model_Name]
            ,[SamplingLevel],[SamplingQTY]
          FROM [QAInspection].[dbo].[tbVisualInspection] 
       ),
       
         t2 AS (  SELECT [QANumber],[ModelGroup],[ModelNumber],[Line_No] as Line_No ,Remark,[Lotsize]
          FROM [QAInspection].[dbo].[tbQANumber] 
       
          GROUP BY [QANumber],[Line_No],Remark,[ModelGroup],[ModelNumber],[Lotsize])
       
          SELECT [InspectionType] as Type,[InspectionDate] as Date,[InspectionShift]as Shift,[ModelNumber]as Model_NO,
          [ModelGroup] as Model_Group ,[Model_Name]as Model_Name,'L'+[Line_No] as Line_No,T1.[QANumber],[Lotsize]as QA_QTY,[SamplingLevel],[SamplingQTY],[Vis_Round],[InspectionResult],QTY as Reject_QTY,Remark
          from T1 join T2 on T1.QANumber = T2.QANumber
          left join [QAInspection].[dbo].[Reject_visual] on  T1.[InsNumber] = [Reject_visual].[Inspection]
          where [InspectionDate] between '${startDate}' and '${finishDate}'and [ModelGroup] = '${model}'
          GROUP BY [InspectionType],[InspectionDate],[InspectionShift],[ModelNumber],[ModelGroup],[Model_Name],[Line_No]
          ,T1.[QANumber],[Lotsize],[SamplingLevel],[SamplingQTY],[Vis_Round],[InspectionResult],Remark,QTY
          ORDER BY [InspectionType], [InspectionDate],[InspectionShift],[ModelNumber],[Line_No], [QANumber], [Vis_Round]`);
      } else {
        var result = await user.sequelize
          .query(`	 WITH T1 AS (
            select [InsNumber],[QANumber],[InspectionDate],[InspectionShift],[InspectionType],[Vis_Round],[InspectionResult],[Model_Name]
            ,[SamplingLevel],[SamplingQTY]
          FROM [QAInspection].[dbo].[tbVisualInspection] 
       ),
       
         t2 AS (  SELECT [QANumber],[ModelGroup],[ModelNumber],[Line_No] as Line_No ,Remark,[Lotsize]
          FROM [QAInspection].[dbo].[tbQANumber] 
       
          GROUP BY [QANumber],[Line_No],Remark,[ModelGroup],[ModelNumber],[Lotsize])
       
          SELECT [InspectionType] as Type,[InspectionDate] as Date,[InspectionShift]as Shift,[ModelNumber]as Model_NO,
          [ModelGroup] as Model_Group ,[Model_Name]as Model_Name,'L'+[Line_No] as Line_No,T1.[QANumber],[Lotsize]as QA_QTY,[SamplingLevel],[SamplingQTY],[Vis_Round],[InspectionResult],QTY as Reject_QTY,Remark
          from T1 join T2 on T1.QANumber = T2.QANumber
          left join [QAInspection].[dbo].[Reject_visual] on  T1.[InsNumber] = [Reject_visual].[Inspection]
          where [InspectionDate] between '${startDate}' and '${finishDate}'and [ModelGroup] = '${model}'and [InspectionType] = '${insType}' 
          GROUP BY [InspectionType],[InspectionDate],[InspectionShift],[ModelNumber],[ModelGroup],[Model_Name],[Line_No]
          ,T1.[QANumber],[Lotsize],[SamplingLevel],[SamplingQTY],[Vis_Round],[InspectionResult],Remark,QTY
          ORDER BY [InspectionType], [InspectionDate],[InspectionShift],[ModelNumber],[Line_No], [QANumber], [Vis_Round]`);
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
    //     let result = await user.sequelize.query(`SELECT[InspectionType] as Type
    //     ,[tbQANumber].[Date]
    //      ,[InspectionShift] as Shift
    //         ,[tbQANumber].[ModelNumber] as Model
    //         ,[tbQANumber].[ModelGroup] as Model_Name
    //         ,'L'+[tbQANumber].[Line_No] as Line_No
    //         ,[tbQANumber].[QANumber]
    //       ,[tbQANumber].[Lotsize] as QA_QTY
    //       ,[SamplingLevel]
    //       ,[SamplingQTY]
    //       ,[Vis_Round]
    //       ,[InspectionResult]
    //       ,sum([Reject_visual].[QTY])as Reject_QTY
    //       ,[tbQANumber].[Remark]
    //       FROM [QAInspection].[dbo].[tbVisualInspection]
    //       INNER JOIN [QAInspection].[dbo].[tbQANumber]
    //       ON [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
    //       FULL JOIN [QAInspection].[dbo].[Reject_visual]
    //       ON [tbVisualInspection].[InsNumber]=[Reject_visual].[Inspection]
    // ON [QAInspection].[dbo].[tbQANumber].[QANumber] = [QAInspection].[dbo].[tbVisualInspection].[QANumber]
    //       where [tbVisualInspection].[QANumber] = '${QANumber}'
    //       ORDER BY [InspectionDate],[InspectionShift],[tbVisualInspection].[ModelNumber],[Line_No],
    //       [QAInspection].[dbo].[tbVisualInspection].[QANumber],[Vis_Round],[DateCode],
    //       [QAInspection].[dbo].[tbQANumber].[MONumber]`);

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
