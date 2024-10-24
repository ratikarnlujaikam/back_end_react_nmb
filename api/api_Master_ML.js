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
    let result = await user.sequelize.query(`

SELECT DISTINCT 
    --[tbMasterItemNo].ModelShortName AS Fullname, 
    [tbMasterItemNo].ModelGroup AS Model_group
FROM 
    [Component_Master].[dbo].[tbMasterItemNo]
WHERE 
    EndOfLife IS NULL
    AND ModelGroup NOT LIKE '3%' 
    AND ModelGroup NOT IN ('All Model', 'ALL')
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

router.get("/Process", async (req, res) => {
  try {
    let result = await user.sequelize.query(`SELECT distinct [Part] FROM [Component_Master].[dbo].[Master_matchings]`);

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
    const { model, Process } = req.query;
    console.log(model);
    console.log(Process);
    
    let result = await user.sequelize.query(`
    WITH tb_para AS (
      SELECT DISTINCT [Parameter], [Master_matchings].Part 
      FROM [Component_Master].[dbo].[Master_matchings]
      WHERE [Master_matchings].Part = '${Process}'
    ),
    where_Model AS (
      SELECT [Master_matchings].Parameter
      FROM [Component_Master].[dbo].[Master_matchings]
      WHERE [Master_matchings].Model = '${model}'
    )

    SELECT tb_para.[Parameter] AS No_Parameter
    FROM tb_para 
    LEFT JOIN where_Model ON tb_para.Parameter = where_Model.[Parameter] 
    WHERE where_Model.Parameter IS NULL`,
    {
      replacements: { model: model, Process: Process },
      type: user.sequelize.QueryTypes.SELECT,
    });

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

router.post("/INSERT_Master/:Fullname/:model/:No_Parameter/:LSL/:CL/:USL/:Part/:Machine/:empNumber", async (req, res) => {
  try {
    const { Fullname, model, No_Parameter, LSL, CL, USL, Part, Machine, empNumber } = req.params;

    // Construct query with GETDATE() for createdAt and updatedAt
    const query = `
      INSERT INTO [Component_Master].[dbo].[Master_matchings] 
      (Fullname, model, Parameter, LSL, CL, USL, Part, Machine, empNumber, [createdAt], [updatedAt]) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), GETDATE())
    `;
    const replacements = [Fullname, model, No_Parameter, LSL, CL, USL, Part, Machine, empNumber];

    // Execute query
    await user.sequelize.query(query, {
      replacements: replacements,
      type: user.sequelize.QueryTypes.INSERT,
    });

    res.json({
      api_result: "ok",
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({
      error: error.message,
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

      let result_no_parameter = await user.sequelize.query(`
        DECLARE @tb_Fullname TABLE (Fullname VARCHAR(MAX), Model VARCHAR(MAX), Machine VARCHAR(MAX));
        
        -- Insert the results of the query into the table variable
          INSERT INTO @tb_Fullname (Fullname, Model)
SELECT DISTINCT [tbMasterItemNo].ModelShortName AS Fullname, [tbMasterItemNo].ModelGroup AS Model
		FROM [Component_Master].[dbo].[tbMasterItemNo]
		WHERE ModelGroup NOT IN ('All Model', '3SEFCC','ALL','3SEFDB','3SESIN')and  ModelGroup = '${model}';
        
        -- Use the table variable in subsequent queries
        WITH tb_para AS (
            SELECT DISTINCT [Parameter], [Part], [Model] ,Machine
            FROM [Component_Master].[dbo].[Master_matchings]
            WHERE Part = '${Parameter}' 
          --and Model = '${model}'
        )
        ,tb_Machine AS (
            SELECT DISTINCT Machine
            FROM [Component_Master].[dbo].[Master_matchings]
            WHERE Part = '${Parameter}' 
          and Model = '${model}'
        ),
        where_Model AS (
            SELECT DISTINCT [Parameter]
            FROM [Component_Master].[dbo].[Master_matchings]
            WHERE Model = '${model}'
        )
        
        SELECT DISTINCT fn.Fullname, fn.Model, tb_para.Parameter AS No_Parameter, 
                        '' AS [LSL], '' AS [CL], '' AS [USL], 
                        '${Parameter}' AS [Part],'' as [Machine],'' as [empNumber],GETDATE() as [createdAt],GETDATE() as [updatedAt]
        FROM tb_para 
        LEFT JOIN where_Model
            ON tb_para.Parameter = where_Model.Parameter 
        CROSS JOIN @tb_Fullname fn  -- Cross join with the table variable
        WHERE where_Model.Parameter IS NULL`,
            {
              replacements: { model: model, Process: Parameter },
              type: user.sequelize.QueryTypes.SELECT,
            });
console.log(result_no_parameter);

      res.json({
        result: result[0],
        result_no_parameter: result_no_parameter,
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







module.exports = router;
