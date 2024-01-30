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
    // var result = [[]];
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
          and  InspectionType !='All'
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
  "/report/:model/:insType/:startDate/:finishDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { model, insType, startDate, finishDate } = req.params;
      if (model == "**ALL**" && insType == "**ALL**") {
        var result = await user.sequelize
          .query(`
          ---All&&ALL--
          select	[tbVisualInspection].[InspectionDate] as Date ,
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
      ,[Remark2_QA]
      FROM [QAInspection].[dbo].[tbVisualInspection]
      INNER JOIN [QAInspection].[dbo].[tbQANumber]
      ON [QAInspection].[dbo].[tbQANumber].[QANumber] = [QAInspection].[dbo].[tbVisualInspection].[QANumber]
	  FULL JOIN [QAInspection].[dbo].[Reject_visual]
	  ON [Reject_visual].Inspection=[tbVisualInspection].InsNumber
      where [InspectionDate] between '${startDate}' and '${finishDate}'
      ORDER BY [InspectionDate],[InspectionShift],[tbVisualInspection].[ModelNumber],[tbVisualInspection].[Model_group],
      [tbVisualInspection].[Model_Name],[Line_No],[QAInspection].[dbo].[tbVisualInspection].[QANumber],[Vis_Round],[DateCode],
      [QAInspection].[dbo].[tbQANumber].[MONumber]`);
   
      } else if (model == "**ALL**" && insType != "**ALL**") {
        var result = await user.sequelize
          .query(`
          ---All&&!ALL--
          select	[tbVisualInspection].[InspectionDate] as Date ,
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
      ,[Remark2_QA]
      FROM [QAInspection].[dbo].[tbVisualInspection]
      INNER JOIN [QAInspection].[dbo].[tbQANumber]
      ON [QAInspection].[dbo].[tbQANumber].[QANumber] = [QAInspection].[dbo].[tbVisualInspection].[QANumber]
	  FULL JOIN [QAInspection].[dbo].[Reject_visual]
	  ON [Reject_visual].Inspection=[tbVisualInspection].InsNumber
      where [InspectionDate] between '${startDate}' and '${finishDate}'  and [tbVisualInspection].[InspectionType] = '${insType}'
      ORDER BY [InspectionDate],[InspectionShift],[tbVisualInspection].[ModelNumber],[tbVisualInspection].[Model_group],
      [tbVisualInspection].[Model_Name],[Line_No],[QAInspection].[dbo].[tbVisualInspection].[QANumber],[Vis_Round],[DateCode],
      [QAInspection].[dbo].[tbQANumber].[MONumber]`);
      } else if (model != "**ALL**" && insType == "**ALL**") {
        var result = await user.sequelize
          .query(`
          ---!All&&ALL--
          select	[tbVisualInspection].[InspectionDate] as Date ,
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
      ,[Remark2_QA]
      FROM [QAInspection].[dbo].[tbVisualInspection]
      INNER JOIN [QAInspection].[dbo].[tbQANumber]
      ON [QAInspection].[dbo].[tbQANumber].[QANumber] = [QAInspection].[dbo].[tbVisualInspection].[QANumber]
	  FULL JOIN [QAInspection].[dbo].[Reject_visual]
	  ON [Reject_visual].Inspection=[tbVisualInspection].InsNumber
      where [InspectionDate] between '${startDate}' and '${finishDate}'  and [tbVisualInspection].[Model_group] = '${model}'
      ORDER BY [InspectionDate],[InspectionShift],[tbVisualInspection].[ModelNumber],[tbVisualInspection].[Model_group],
      [tbVisualInspection].[Model_Name],[Line_No],[QAInspection].[dbo].[tbVisualInspection].[QANumber],[Vis_Round],[DateCode],
      [QAInspection].[dbo].[tbQANumber].[MONumber]
         `);
      } else {
        var result = await user.sequelize
          .query(`
          ---!All&&!ALL--
          select	[tbVisualInspection].[InspectionDate] as Date ,
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
      ,[Remark2_QA]
      FROM [QAInspection].[dbo].[tbVisualInspection]
      INNER JOIN [QAInspection].[dbo].[tbQANumber]
      ON [QAInspection].[dbo].[tbQANumber].[QANumber] = [QAInspection].[dbo].[tbVisualInspection].[QANumber]
	  FULL JOIN [QAInspection].[dbo].[Reject_visual]
	  ON [Reject_visual].Inspection=[tbVisualInspection].InsNumber
      where [InspectionDate] between '${startDate}' and '${finishDate}'  and [tbVisualInspection].[Model_group] = '${model}'
      and [tbVisualInspection].[InspectionType] = '${insType}'
      ORDER BY [InspectionDate],[InspectionShift],[tbVisualInspection].[ModelNumber],[tbVisualInspection].[Model_group],
      [tbVisualInspection].[Model_Name],[Line_No],[QAInspection].[dbo].[tbVisualInspection].[QANumber],[Vis_Round],[DateCode],
      [QAInspection].[dbo].[tbQANumber].[MONumber]`);
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
    let result = await user.sequelize.query(`select	[tbVisualInspection].[InspectionDate] as Date ,
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
,[Remark2_QA]
FROM [QAInspection].[dbo].[tbVisualInspection]
INNER JOIN [QAInspection].[dbo].[tbQANumber]
ON [QAInspection].[dbo].[tbQANumber].[QANumber] = [QAInspection].[dbo].[tbVisualInspection].[QANumber]
FULL JOIN [QAInspection].[dbo].[Reject_visual]
ON [Reject_visual].Inspection=[tbVisualInspection].InsNumber
where [tbVisualInspection].[QANumber] like '${QANumber}%'
ORDER BY [QAInspection].[dbo].[tbVisualInspection].[QANumber]`);

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
