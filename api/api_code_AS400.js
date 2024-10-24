const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`
    SELECT distinct[Component_Part]
  FROM [QAInspection].[dbo].[tbAS400Code]
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
      SELECT distinct [VendorName]
      FROM [QAInspection].[dbo].[tbAS400Code]

        union select '**ALL**'`);
    } else {
      var result = await user.sequelize.query(`
      SELECT distinct [VendorName]
      FROM [QAInspection].[dbo].[tbAS400Code]
      where [Component_Part]='${model}'
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


router.get("/confirm/:vender_name", async (req, res) => {
    const {vender_name} = req.params
  try {

    var result = [[]];
    if (vender_name == "**ALL**") {
      var result = await user.sequelize.query(`
      SELECT distinct [AS400Code]
      FROM [QAInspection].[dbo].[tbAS400Code]
        union select '**ALL**'`);
    } else {
      var result = await user.sequelize.query(`
      SELECT distinct [AS400Code]
    FROM [QAInspection].[dbo].[tbAS400Code]
    where VendorName='${vender_name}'
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

router.get(
  "/report/:model/:Line/:confirm",
  async (req, res) => {
    try {
      var result = [[]];
      const { model, Line, startDate, finishDate, confirm } = req.params;
      if (model === '**ALL**' && Line ==='**ALL**' && confirm ==='**ALL**') {
        // เงื่อนไขที่ 3
        var result = await user.sequelize.query(` 
        SELECT [Component_Part] as Component_name
        ,[VendorName]
        ,[MotorSerialCode]
        ,[AS400Code]
    FROM [QAInspection].[dbo].[tbAS400Code]
    order by Component_Part , VendorName
 
    `)
    } else if (model === '**ALL**' && Line ==='**ALL**' && confirm !='**ALL**') {
        // เงื่อนไขที่ 2
        var result = await user.sequelize.query(`  
        SELECT [Component_Part] as Component_name
        ,[VendorName]
        ,[MotorSerialCode]
        ,[AS400Code]
    FROM [QAInspection].[dbo].[tbAS400Code]
    where   AS400Code='${confirm}'
    order by Component_Part , VendorName
    `)
} else if (model === '**ALL**' && Line !='**ALL**' && confirm ==='**ALL**') {
    // เงื่อนไขที่ 2
    var result = await user.sequelize.query(`  
    SELECT [Component_Part] as Component_name
    ,[VendorName]
    ,[MotorSerialCode]
    ,[AS400Code]
FROM [QAInspection].[dbo].[tbAS400Code]
where VendorName='${Line}'
order by Component_Part , VendorName
`) 
} else if (model === '**ALL**' && Line !='**ALL**' && confirm !=='**ALL**') {
    // เงื่อนไขที่ 2
    var result = await user.sequelize.query(`  
    SELECT [Component_Part] as Component_name
    ,[VendorName]
    ,[MotorSerialCode]
    ,[AS400Code]
FROM [QAInspection].[dbo].[tbAS400Code]
where VendorName='${Line}' and AS400Code='${confirm}'
order by Component_Part , VendorName
`) 
} else if (model !== '**ALL**' && Line ==='**ALL**' && confirm ==='**ALL**') {
    // เงื่อนไขที่ 2
    var result = await user.sequelize.query(`  
    SELECT [Component_Part] as Component_name
    ,[VendorName]
    ,[MotorSerialCode]
    ,[AS400Code]
FROM [QAInspection].[dbo].[tbAS400Code]
where Component_Part ='${model}'
order by Component_Part , VendorName
`) 
} else if (model !== '**ALL**' && Line ==='**ALL**' && confirm !=='**ALL**') {
    // เงื่อนไขที่ 2
    var result = await user.sequelize.query(`  
    SELECT [Component_Part] as Component_name
    ,[VendorName]
    ,[MotorSerialCode]
    ,[AS400Code]
FROM [QAInspection].[dbo].[tbAS400Code]
where Component_Part ='${model}' and AS400Code='${confirm}'
order by Component_Part , VendorName
`) 
} else if (model !== '**ALL**' && Line !=='**ALL**' && confirm ==='**ALL**') {
    // เงื่อนไขที่ 2
    var result = await user.sequelize.query(`  
    SELECT [Component_Part] as Component_name
    ,[VendorName]
    ,[MotorSerialCode]
    ,[AS400Code]
FROM [QAInspection].[dbo].[tbAS400Code]
where VendorName='${Line}' and Component_Part='${model}'
order by Component_Part , VendorName
`) 

    } else {
        // เงื่อนไขที่ 1 (กรณีที่เหลือที่มี model, Line, confirm เป็น '**ALL**', '**ALL**', 'OK')
        var result = await user.sequelize.query(`  
        SELECT [Component_Part] as Component_name
        ,[VendorName]
        ,[MotorSerialCode]
        ,[AS400Code]
    FROM [QAInspection].[dbo].[tbAS400Code]
    where VendorName='${Line}' and AS400Code='${confirm}' and Component_Part='${model}'
    order by Component_Part , VendorName
   
        `)
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
