
const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/LINE", async (req, res) => {
  
  try {
    let result = await user.sequelize.query(`select distinct [Dynamic_Parallelism_Tester].Line as Line FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
    where  Line != ''`);
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
router.get("/model/:process", async (req, res) => {
  const { process} = req.params;
  try {
    let result = await user.sequelize.query(`SELECT distinct [Model] as model FROM [Temp_TransportData].[dbo].[${process}] where Model !=''`);
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
router.get("/getline_model/:model/:process", async (req, res) => {
  const { model, process } = req.params;

  try {
    // Fetch the column_line from the database
    var column_line = await user.sequelize.query(`
      SELECT [column_line]
      FROM [Web_I4].[dbo].[Table_Temp]
      WHERE [lable_process] = '${process}'
    `);

    // Extract the value of column_line from the result
    var column_line_spilt = column_line[0]?.[0]?.column_line || null;

    // Check if column_line is valid
    if (!column_line_spilt) {
      return res.json({
        api_result: "nok",
        message: "column_line not found for the specified process",
      });
    }

    // Fetch distinct lines based on the dynamically retrieved column_line
    let result = await user.sequelize.query(`
      SELECT DISTINCT ${column_line_spilt} AS Line_1 
      FROM [Temp_TransportData].[dbo].[${process}] 
      WHERE line != 'D-4' AND model = '${model}' AND line != ''
    `);

    // Send the result back as a response
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

// router.get("/getline_model/:model", async (req, res) => {
//   const { model } = req.params;
//   try {
//     let result = await user.sequelize.query(`SELECT distinct line as Line_1 FROM [Component_Master].[dbo].[${process}] where  line!='D-4' and model='${model}'`);
//     res.json({
//       result: result[0],
//       api_result: "ok",
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       error,
//       api_result: "nok",
//     });
//   }
// });
router.get("/process", async (req, res) => {
  
  try {
    let result = await user.sequelize.query(`
    SELECT  [lable_process] as process
    FROM [Web_I4].[dbo].[Table_Temp]
    where [use_lable]='yes'
    order by lable_process;
    
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


router.get("/Master/:LINE/:startDate/:finishDate",
async (req, res) => {
  try {
    const { LINE,startDate,finishDate} = req.params;
  let result = await user.sequelize
    .query(`exec [Machine DownTime].[dbo].[trace_Dym] '${LINE}','${startDate}:00','${finishDate}:00'; `);

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

router.get("/moter/:process/:model/:Line_1/:startDate/:finishDate",
async (req, res) => {
  //ที่ต้องทำ 2 เงื่อนไข เพราะ ใน oneday ไม่มี Table Dimension_WR
  try {



    const {startDate,finishDate, model,Line_1,process} = req.params;
    var line = Line_1.trim(); //trim คือการลบ spacebar ทั้งหน้าและหลัง
    
    var dbResult = await user.sequelize.query(`
      SELECT [Database_Number]
      FROM [Web_I4].[dbo].[Table_Temp]
      WHERE [lable_process] = '${process}'
  `);
  
  // Extract the value of Database_Number from the result
  var Database_Number = dbResult[0]?.[0]?.Database_Number || null;
  
  // Check if Database_Number is 1
  if (Database_Number == 1) {
    var result = await user.sequelize.query(`
      SELECT *,'Temp_TransportData' as table_name
      FROM [Temp_TransportData].[dbo].[${process}]
      WHERE Date BETWEEN '${startDate}' AND '${finishDate}'
      AND model = '${model}' AND Line = '${line}'
    `);
  } else {
    var result = await user.sequelize.query(`
      SELECT *,'Temp_TransportData' as table_name
      FROM [Temp_TransportData].[dbo].[${process}]
      WHERE Date BETWEEN '${startDate}' AND '${finishDate}'
      AND model = '${model}' AND [Line_IP] = '${line}'
      AND Date != CONVERT(date, GETDATE())
      
      UNION ALL
      
      SELECT *,'Oneday_ReadtimeData' as table_name
      FROM [Oneday_ReadtimeData].[dbo].[${process}]
      WHERE Date = CONVERT(date, GETDATE())
      AND model = '${model}' AND [Line_IP] = '${line}'
    `);
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



module.exports = router;
