const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const user_Master = require("../database/models/user_Master");

const bcrypt = require("bcryptjs"); //เอาพาสเวิร์ดที่ป้อนเข้าไปมาเข้ารหัส
const { getToken, verifyToken } = require("../passport/jwtHandler"); //ทำ JWT ให้system
const mailer = require("nodemailer");
const moment = require("moment");

router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Model_group]
    FROM [QAInspection].[dbo].[tbVisualInspection]
  where [Model_group] is not null
  and [Model_group]!='' and [Model_group]!='All'
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

router.get("/Parameter", async (req, res) => {
  try {
    const { model } = req.params;
    // var result = [[]];
    if (model == "**ALL**") {
      var result = await user.sequelize.query(` SELECT distinct [Part]
      FROM [Component_Master].[dbo].[Master_matchings]`);
    } else {
      var result = await user.sequelize.query(`SELECT distinct [Part]
      FROM [Component_Master].[dbo].[Master_matchings]`);
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
  "/report/:model/:Parameter",
  async (req, res) => {
    try {
      var result = [[]];
      const { model, Parameter } = req.params;
      
        var result = await user.sequelize
          .query(`
          SELECT [id]
          ,[Fullname]
          ,[Model]
          ,[Parameter]
          ,[LSL]
          ,[CL]
          ,[USL]
          ,[Part]
          ,[Machine]
          ,[empNumber]
          ,[createdAt]
          ,[updatedAt]
     FROM [Component_Master].[dbo].[Master_matchings]
     where [Model]='${model}'
     and Part='${Parameter}'
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
  }
);

router.post("/register", async (req, res) => {
  try {
    //encrypt password
    req.body.password = bcrypt.hashSync(req.body.password, 8);

    //insert data into database
    let result = await user_Master.create(req.body);
    // ใช้ async await เพื่อให้โปรแกรมรอให้บรรทัดแรกส่งให้เสร็จก่อน แล้วค่อยเอาค่าที่ได้ไปทำต่อ
    console.log(result);
    res.json({
      result: result,
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
router.post("/login", async (req, res) => {
  try {
    const { empNumber, password } = req.body;
    console.log(password);

    // Execute a raw SQL query to fetch user details
    const result = await user_Master.sequelize.query(
      `SELECT [ID], [Emp] as [empNumber], [Firstname], [Lastname], [Process], [Password], [MBA_sent_Email]
       FROM [Component_Master].[dbo].[User_Updater_master]
       WHERE [Emp] = :empNumber`,
      {
        replacements: { empNumber }, // Parameterized query to prevent SQL injection
        type: user_Master.sequelize.QueryTypes.SELECT,
      }
    );

    console.log("SQL Query:", result[0]);

    // Define resultlogin even if user is not found
    const resultlogin = result.length > 0 ? result[0] : null;
    console.log("resultlogin", resultlogin);

    // Directly compare the provided password with the stored hash
    if (resultlogin && password === resultlogin.Password) {
      console.log("Password comparison successful");
      let jwt = await getToken({ empNumber });
      res.json({
        jwt,
        login_result: "pass",
        resultlogin,
      });
    } else {
      console.log("Password comparison failed");
      console.log("Provided password:", password);
      console.log("Stored password hash:", resultlogin ? resultlogin.Password : null);

      res.json({
        login_result: "failed",
        message: "Incorrect password",
        details: "Password comparison failed",
      });
    }
  } catch (error) {
    console.error(error);
    res.json({
      error,
      api_result: "nok",
    });
  }
});

router.get("/update/:id/:Fullname/:model/:Parameter/:LSL/:CL/:USL/:Part/:Machine/:empNumber", async (req, res) => {
  try {
    // Extract the ID from the request parameters
    const { id, Fullname, model, Parameter, LSL, CL, USL, Part, Machine, empNumber } = req.params;

    // Extract the updated data from the request body
    const updatedData = req.body;

    // Use Sequelize to execute an INSERT query into the history table
    const insertHistoryQuery = `
      INSERT INTO [DataforAnalysis].[dbo].[History_UPDATEML] 
      (
          [id],
          [Fullname],
          [Model],
          [Parameter],
          [LSL],
          [CL],
          [USL],
          [Part],
          [Machine],
          [empNumber],
          [createdAt],
          [updatedAt]
      )
      SELECT
          [id],
          [Fullname],
          [Model],
          [Parameter],
          [LSL],
          [CL],
          [USL],
          [Part],
          [Machine],
          [empNumber],
          [createdAt],
          [updatedAt]
      FROM
      [Component_Master].[dbo].[Master_matchings]
      WHERE
          [id] = ${id};
    `;

    // Execute the query to insert into the history table
    await user.sequelize.query(insertHistoryQuery);

    // Use Sequelize to execute an UPDATE query on the main table
    const updateQuery = `
      UPDATE [Component_Master].[dbo].[Master_matchings]
      SET 
        [Fullname] = '${Fullname}',
        [Model] = '${model}',
        [Parameter] = '${Parameter}',
        [LSL] = '${LSL}',
        [CL] = '${CL}',
        [USL] = '${USL}',
        [Part] = '${Part}',
        [Machine] = '${Machine}',
        [empNumber] = '${empNumber}',
        [updatedAt] = GETDATE()
      WHERE [id] = ${id};
    `;

    // Execute the query to update the main table
    await user.sequelize.query(updateQuery);

    // Send a JSON response indicating success
    res.json({
      api_result: "ok",
      message: "Data updated successfully",
    });

  } catch (error) {
    // Log and send an error response if an error occurs
    console.log(error);
    res.status(500).json({
      error,
      api_result: "nok",
      message: "Error updating data",
    });
  }
});




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
