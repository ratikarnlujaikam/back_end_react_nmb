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
  "/RejectByModel/:model/:insType/:startDate/:finishDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { model, insType, startDate, finishDate } = req.params;
      if (model == "**ALL**" && insType == "**ALL**") {
        var result = await user.sequelize.query(`
        --ALL&&ALL--
        SELECT
          [InspectionType] as Type
          ,[InspectionDate] as Date
          ,[InspectionShift] as Shift
          ,[tbVisualInspection].[ModelNumber] as Model_NO
          ,[tbVisualInspection].[Model_group] as Model_group
          ,[tbVisualInspection].[Model_Name] as Model_Name
          ,[Model_group] as Model_Name
          ,'L'+[Line_No] as Line
          ,[tbVisualInspection].[QANumber] as QA_No
          ,[Vis_Round] as Vis_Round
          ,[SamplingLevel] as Level
          ,[InspectionResult] as Result
          ,[SamplingQTY] as SamplingQTY
          ,[Defect_NG] as NG
          ,[Detail] as Detail
          ,[QTY] as QTY
          ,[tbVisualInspection].[Location] as Location
          ,[CO2] as CO2
          ,[Emp_CO2] as Emp_CO2
          ,[RecordBy] as RecordBy
          ,[VisualTime] as VisualTime
          ,[VisualName] as VisualName
          ,[InsNumber] as InsNumber
          FROM [QAInspection].[dbo].[tbVisualInspection]
          INNER JOIN [QAInspection].[dbo].[tbQANumber]
          ON [tbVisualInspection].[QANumber]=[tbQANumber].[QANumber]
          LEFT JOIN [QAInspection].[dbo].[Reject_visual]
          ON [tbVisualInspection].[InsNumber]=[Reject_visual].[Inspection]
          WHERE [tbVisualInspection].[InspectionResult]='REJECT'and [InspectionDate] between '${startDate}' and '${finishDate}'
          GROUP BY 	[QAInspection].[dbo].[tbVisualInspection].InspectionDate, 
		        [QAInspection].[dbo].[tbVisualInspection].InspectionShift,
				[QAInspection].[dbo].[tbVisualInspection].QANumber, 
				[tbVisualInspection].[ModelNumber],
          [tbVisualInspection].[Model_group],
          [tbVisualInspection].[Model_Name],
				[QAInspection].[dbo].[tbVisualInspection].InspectionType, 
				[QAInspection].[dbo].[tbVisualInspection].Vis_Round, 
                [QAInspection].[dbo].[tbVisualInspection].SamplingLevel, 
				[QAInspection].[dbo].[tbVisualInspection].SamplingQTY, 
				 [QAInspection].[dbo].[tbVisualInspection].InspectionResult, 
				[QAInspection].[dbo].[tbVisualInspection].RecordBy, 
				 [QAInspection].[dbo].[tbVisualInspection].VisualName, 
				[QAInspection].[dbo].[tbVisualInspection].VisualTime, 
                [QAInspection].[dbo].[tbVisualInspection].Model_group, 
				[QAInspection].[dbo].[tbVisualInspection].Location, 
				[QAInspection].[dbo].[Reject_visual].Defect_NG, 
				  [QAInspection].[dbo].[Reject_visual].Detail, 
				  [QAInspection].[dbo].[Reject_visual].QTY, 
				  [QAInspection].[dbo].[tbVisualInspection].InsNumber, 
				  [QAInspection].[dbo].[tbQANumber].Line_No, 
				  [QAInspection].[dbo].[tbQANumber].CO2, 
                  [QAInspection].[dbo].[tbQANumber].Emp_CO2
          ORDER BY [InspectionType],[InspectionDate],[InspectionShift],[Line_No],[tbVisualInspection].[QANumber],[Vis_Round]`);
      } else if (model == "**ALL**"  && insType != "**ALL**") {
        var result = await user.sequelize.query(`
        --ALL&&!ALL--
        SELECT
        [InspectionType] as Type
        ,[InspectionDate] as Date
        ,[InspectionShift] as Shift
        ,[tbVisualInspection].[ModelNumber] as Model_NO
        ,[tbVisualInspection].[Model_group] as Model_group
        ,[tbVisualInspection].[Model_Name] as Model_Name
        ,[Model_group] as Model_Name
        ,'L'+[Line_No]as Line
        ,[tbVisualInspection].[QANumber]as QA_No
        ,[Vis_Round] as Vis_Round
        ,[SamplingLevel] as Level
        ,[InspectionResult] as Result
        ,[SamplingQTY] as SamplingQTY
        ,[Defect_NG] as NG
        ,[Detail] as Detail
        ,[QTY] as QTY
        ,[tbVisualInspection].[Location] as Location
        ,[CO2] as CO2
        ,[Emp_CO2] as Emp_CO2
        ,[RecordBy] as RecordBy
        ,[VisualTime] as VisualTime
        ,[VisualName] as VisualName
        ,[InsNumber] as InsNumber
        FROM [QAInspection].[dbo].[tbVisualInspection]
        INNER JOIN [QAInspection].[dbo].[tbQANumber]
        ON [tbVisualInspection].[QANumber]=[tbQANumber].[QANumber]
        LEFT JOIN [QAInspection].[dbo].[Reject_visual]
        ON [tbVisualInspection].[InsNumber]=[Reject_visual].[Inspection]
          WHERE [tbVisualInspection].[InspectionResult]='REJECT'and [InspectionDate] between '${startDate}' and '${finishDate}'
          and [InspectionType]= '${insType}'
          GROUP BY 	[QAInspection].[dbo].[tbVisualInspection].InspectionDate, 
		        [QAInspection].[dbo].[tbVisualInspection].InspectionShift,
				[QAInspection].[dbo].[tbVisualInspection].QANumber, 
				[tbVisualInspection].[ModelNumber],
          [tbVisualInspection].[Model_group],
          [tbVisualInspection].[Model_Name],
				[QAInspection].[dbo].[tbVisualInspection].InspectionType, 
				[QAInspection].[dbo].[tbVisualInspection].Vis_Round, 
                [QAInspection].[dbo].[tbVisualInspection].SamplingLevel, 
				[QAInspection].[dbo].[tbVisualInspection].SamplingQTY, 
				 [QAInspection].[dbo].[tbVisualInspection].InspectionResult, 
				[QAInspection].[dbo].[tbVisualInspection].RecordBy, 
				 [QAInspection].[dbo].[tbVisualInspection].VisualName, 
				[QAInspection].[dbo].[tbVisualInspection].VisualTime, 
                [QAInspection].[dbo].[tbVisualInspection].Model_group, 
				[QAInspection].[dbo].[tbVisualInspection].Location, 
				[QAInspection].[dbo].[Reject_visual].Defect_NG, 
				  [QAInspection].[dbo].[Reject_visual].Detail, 
				  [QAInspection].[dbo].[Reject_visual].QTY, 
				  [QAInspection].[dbo].[tbVisualInspection].InsNumber, 
				  [QAInspection].[dbo].[tbQANumber].Line_No, 
				  [QAInspection].[dbo].[tbQANumber].CO2, 
                  [QAInspection].[dbo].[tbQANumber].Emp_CO2
          ORDER BY [InspectionType],[InspectionDate],[InspectionShift],[Line_No],[tbVisualInspection].[QANumber],[Vis_Round]`);
      } else if (model != "**ALL**"  &&insType == "**ALL**") {
        var result = await user.sequelize.query(`
        --!ALL&&ALL--
        SELECT
        [InspectionType] as Type
        ,[InspectionDate] as Date
        ,[InspectionShift] as Shift
        ,[tbVisualInspection].[ModelNumber] as Model_NO
        ,[tbVisualInspection].[Model_group] as Model_group
        ,[tbVisualInspection].[Model_Name] as Model_Name
        ,[Model_group] as Model_Name
        ,'L'+[Line_No]as Line
        ,[tbVisualInspection].[QANumber]as QA_No
        ,[Vis_Round] as Vis_Round
        ,[SamplingLevel] as Level
        ,[InspectionResult] as Result
        ,[SamplingQTY] as SamplingQTY
        ,[Defect_NG] as NG
        ,[Detail] as Detail
        ,[QTY] as QTY
        ,[tbVisualInspection].[Location] as Location
        ,[CO2] as CO2
        ,[Emp_CO2] as Emp_CO2
        ,[RecordBy] as RecordBy
        ,[VisualTime] as VisualTime
        ,[VisualName] as VisualName
        ,[InsNumber] as InsNumber
        FROM [QAInspection].[dbo].[tbVisualInspection]
        INNER JOIN [QAInspection].[dbo].[tbQANumber]
        ON [tbVisualInspection].[QANumber]=[tbQANumber].[QANumber]
        LEFT JOIN [QAInspection].[dbo].[Reject_visual]
        ON [tbVisualInspection].[InsNumber]=[Reject_visual].[Inspection]
          WHERE [tbVisualInspection].[InspectionResult]='REJECT'and [InspectionDate] between '${startDate}' and '${finishDate}'
          and [ModelGroup] = '${model}'
          GROUP BY 	[QAInspection].[dbo].[tbVisualInspection].InspectionDate, 
		        [QAInspection].[dbo].[tbVisualInspection].InspectionShift,
				[QAInspection].[dbo].[tbVisualInspection].QANumber, 
				[tbVisualInspection].[ModelNumber],
          [tbVisualInspection].[Model_group],
          [tbVisualInspection].[Model_Name],
				[QAInspection].[dbo].[tbVisualInspection].InspectionType, 
				[QAInspection].[dbo].[tbVisualInspection].Vis_Round, 
                [QAInspection].[dbo].[tbVisualInspection].SamplingLevel, 
				[QAInspection].[dbo].[tbVisualInspection].SamplingQTY, 
				 [QAInspection].[dbo].[tbVisualInspection].InspectionResult, 
				[QAInspection].[dbo].[tbVisualInspection].RecordBy, 
				 [QAInspection].[dbo].[tbVisualInspection].VisualName, 
				[QAInspection].[dbo].[tbVisualInspection].VisualTime, 
                [QAInspection].[dbo].[tbVisualInspection].Model_group, 
				[QAInspection].[dbo].[tbVisualInspection].Location, 
				[QAInspection].[dbo].[Reject_visual].Defect_NG, 
				  [QAInspection].[dbo].[Reject_visual].Detail, 
				  [QAInspection].[dbo].[Reject_visual].QTY, 
				  [QAInspection].[dbo].[tbVisualInspection].InsNumber, 
				  [QAInspection].[dbo].[tbQANumber].Line_No, 
				  [QAInspection].[dbo].[tbQANumber].CO2, 
                  [QAInspection].[dbo].[tbQANumber].Emp_CO2
          ORDER BY [InspectionType],[InspectionDate],[InspectionShift],[Line_No],[tbVisualInspection].[QANumber],[Vis_Round]`);
      } else {
        var result = await user.sequelize.query(`
        --!ALL&&!ALL--
        SELECT
        [InspectionType] as Type
        ,[InspectionDate] as Date
        ,[InspectionShift] as Shift
        ,[tbVisualInspection].[ModelNumber] as Model_NO
        ,[tbVisualInspection].[Model_group] as Model_group
        ,[tbVisualInspection].[Model_Name] as Model_Name
        ,[Model_group] as Model_Name
        ,'L'+[Line_No]as Line
        ,[tbVisualInspection].[QANumber]as QA_No
        ,[Vis_Round] as Vis_Round
        ,[SamplingLevel] as Level
        ,[InspectionResult] as Result
        ,[SamplingQTY] as SamplingQTY
        ,[Defect_NG] as NG
        ,[Detail] as Detail
        ,[QTY] as QTY
        ,[tbVisualInspection].[Location] as Location
        ,[CO2] as CO2
        ,[Emp_CO2] as Emp_CO2
        ,[RecordBy] as RecordBy
        ,[VisualTime] as VisualTime
        ,[VisualName] as VisualName
        ,[InsNumber] as InsNumber
        FROM [QAInspection].[dbo].[tbVisualInspection]
        INNER JOIN [QAInspection].[dbo].[tbQANumber]
        ON [tbVisualInspection].[QANumber]=[tbQANumber].[QANumber]
        LEFT JOIN [QAInspection].[dbo].[Reject_visual]
        ON [tbVisualInspection].[InsNumber]=[Reject_visual].[Inspection]
          WHERE [tbVisualInspection].[InspectionResult]='REJECT'and [InspectionDate] between '${startDate}' and '${finishDate}'
          and [ModelGroup] = '${model}' and [InspectionType]= '${insType}'
          GROUP BY 	[QAInspection].[dbo].[tbVisualInspection].InspectionDate, 
		        [QAInspection].[dbo].[tbVisualInspection].InspectionShift,
				[QAInspection].[dbo].[tbVisualInspection].QANumber, 
				[tbVisualInspection].[ModelNumber],
          [tbVisualInspection].[Model_group],
          [tbVisualInspection].[Model_Name],
				[QAInspection].[dbo].[tbVisualInspection].InspectionType, 
				[QAInspection].[dbo].[tbVisualInspection].Vis_Round, 
                [QAInspection].[dbo].[tbVisualInspection].SamplingLevel, 
				[QAInspection].[dbo].[tbVisualInspection].SamplingQTY, 
				 [QAInspection].[dbo].[tbVisualInspection].InspectionResult, 
				[QAInspection].[dbo].[tbVisualInspection].RecordBy, 
				 [QAInspection].[dbo].[tbVisualInspection].VisualName, 
				[QAInspection].[dbo].[tbVisualInspection].VisualTime, 
                [QAInspection].[dbo].[tbVisualInspection].Model_group, 
				[QAInspection].[dbo].[tbVisualInspection].Location, 
				[QAInspection].[dbo].[Reject_visual].Defect_NG, 
				  [QAInspection].[dbo].[Reject_visual].Detail, 
				  [QAInspection].[dbo].[Reject_visual].QTY, 
				  [QAInspection].[dbo].[tbVisualInspection].InsNumber, 
				  [QAInspection].[dbo].[tbQANumber].Line_No, 
				  [QAInspection].[dbo].[tbQANumber].CO2, 
                  [QAInspection].[dbo].[tbQANumber].Emp_CO2
          ORDER BY [InspectionType],[InspectionDate],[InspectionShift],[Line_No],[tbVisualInspection].[QANumber],[Vis_Round]`);
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

router.get("/RejectByQANO/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize.query(`SELECT
    [InspectionType] as Type
    ,[InspectionDate] as Date
    ,[InspectionShift] as Shift
    ,[tbVisualInspection].[ModelNumber] as Model_NO
    ,[tbVisualInspection].[Model_group] as Model_group
    ,[tbVisualInspection].[Model_Name] as Model_Name
    ,[Model_group] as Model_Name
    ,'L'+[Line_No]as Line
    ,[tbVisualInspection].[QANumber]as QA_No
    ,[Vis_Round] as Vis_Round
    ,[SamplingLevel] as Level
    ,[InspectionResult] as Result
    ,[SamplingQTY] as SamplingQTY
    ,[Defect_NG] as NG
    ,[Detail] as Detail
    ,[QTY] as QTY
    ,[tbVisualInspection].[Location] as Location
    ,[CO2] as CO2
    ,[Emp_CO2] as Emp_CO2
    ,[RecordBy] as RecordBy
    ,[VisualTime] as VisualTime
    ,[VisualName] as VisualName
    ,[InsNumber] as InsNumber
    FROM [QAInspection].[dbo].[tbVisualInspection]
    INNER JOIN [QAInspection].[dbo].[tbQANumber]
    ON [tbVisualInspection].[QANumber]=[tbQANumber].[QANumber]
    LEFT JOIN [QAInspection].[dbo].[Reject_visual]
    ON [tbVisualInspection].[InsNumber]=[Reject_visual].[Inspection]
    WHERE [tbVisualInspection].[InspectionResult]='REJECT'and [tbVisualInspection].[QANumber] = '${QANumber}'
    GROUP BY 	[QAInspection].[dbo].[tbVisualInspection].InspectionDate, 
		        [QAInspection].[dbo].[tbVisualInspection].InspectionShift,
				[QAInspection].[dbo].[tbVisualInspection].QANumber, 
				[tbVisualInspection].[ModelNumber],
          [tbVisualInspection].[Model_group],
          [tbVisualInspection].[Model_Name],
				[QAInspection].[dbo].[tbVisualInspection].InspectionType, 
				[QAInspection].[dbo].[tbVisualInspection].Vis_Round, 
                [QAInspection].[dbo].[tbVisualInspection].SamplingLevel, 
				[QAInspection].[dbo].[tbVisualInspection].SamplingQTY, 
				 [QAInspection].[dbo].[tbVisualInspection].InspectionResult, 
				[QAInspection].[dbo].[tbVisualInspection].RecordBy, 
				 [QAInspection].[dbo].[tbVisualInspection].VisualName, 
				[QAInspection].[dbo].[tbVisualInspection].VisualTime, 
                [QAInspection].[dbo].[tbVisualInspection].Model_group, 
				[QAInspection].[dbo].[tbVisualInspection].Location, 
				[QAInspection].[dbo].[Reject_visual].Defect_NG, 
				  [QAInspection].[dbo].[Reject_visual].Detail, 
				  [QAInspection].[dbo].[Reject_visual].QTY, 
				  [QAInspection].[dbo].[tbVisualInspection].InsNumber, 
				  [QAInspection].[dbo].[tbQANumber].Line_No, 
				  [QAInspection].[dbo].[tbQANumber].CO2, 
                  [QAInspection].[dbo].[tbQANumber].Emp_CO2
    ORDER BY [InspectionType],[InspectionDate],[InspectionShift],[Line_No],[tbVisualInspection].[QANumber],[Vis_Round]`);

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
