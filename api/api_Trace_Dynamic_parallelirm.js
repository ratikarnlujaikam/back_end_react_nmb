const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/LINE", async (req, res) => {
  try {
    let result = await user.sequelize
      .query(`select distinct [Dynamic_Parallelism_Tester].Line as Line FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
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
  const { process } = req.params;
  try {
    var dbResult_name = await user.sequelize.query(
      `SELECT [Database] FROM [Web_I4].[dbo].[Table_Temp] WHERE [lable_process] = ?`,
      { replacements: [process], type: user.sequelize.QueryTypes.SELECT }
    );

    var Database_name = dbResult_name?.[0]?.Database || null;

    if (!Database_name) {
      return res
        .status(404)
        .json({ message: "Database not found", api_result: "nok" });
    }

    let result = await user.sequelize.query(
      `SELECT DISTINCT [Model] AS model FROM [${Database_name}].[dbo].[${process}] WHERE Model != ''
      union 
      select '**ALL**'`
    );

    res.json({
      result: result[0],
      api_result: "ok",
    });
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({
      message: "Internal server error",
      api_result: "nok",
    });
  }
});

router.get("/getline_model/:model/:process", async (req, res) => {
  const { model, process } = req.params;

  try {
    // ดึงชื่อฐานข้อมูลอย่างปลอดภัย
    var dbResult_name = await user.sequelize.query(
      `SELECT [Database] FROM [Web_I4].[dbo].[Table_Temp] WHERE [lable_process] = ?`,
      { replacements: [process], type: user.sequelize.QueryTypes.SELECT }
    );

    var Database_name = dbResult_name?.[0]?.Database || null;

    if (!Database_name) {
      return res
        .status(404)
        .json({ message: "Database not found", api_result: "nok" });
    }

    // ดึง column_line อย่างปลอดภัย
    var column_line = await user.sequelize.query(
      `SELECT [column_line] FROM [Web_I4].[dbo].[Table_Temp] WHERE [lable_process] = ?`,
      { replacements: [process], type: user.sequelize.QueryTypes.SELECT }
    );

    var column_line_spilt = column_line?.[0]?.column_line || null;

    if (!column_line_spilt) {
      return res.status(404).json({
        api_result: "nok",
        message: "column_line not found for the specified process",
      });
    }

    // สร้าง query SQL ตามเงื่อนไขของ model
    let query;
    let replacements = [];

    if (model === "**ALL**") {
      // ถ้า model เป็น "ALL" ให้ละเงื่อนไข WHERE model ออก
      query = `
        SELECT DISTINCT ${column_line_spilt} AS Line_1 
        FROM [${Database_name}].[dbo].[${process}] 
        WHERE line != 'D-4' AND line != ''
      `;
    } else {
      // ถ้า model ไม่ใช่ "ALL" ให้ใส่เงื่อนไข WHERE model
      query = `
        SELECT DISTINCT ${column_line_spilt} AS Line_1 
        FROM [${Database_name}].[dbo].[${process}] 
        WHERE line != 'D-4' AND model = ? AND line != ''
      `;
      replacements.push(model);
    }

    // ดึงผลลัพธ์จากฐานข้อมูล
    let result = await user.sequelize.query(query, {
      replacements,
      type: user.sequelize.QueryTypes.SELECT,
    });

    console.log("Database query result:", dbResult_name);
    console.log("Resolved Database_name:", Database_name);
    console.log("Column line result:", column_line);
    console.log("Resolved column_line_spilt:", column_line_spilt);

    res.json({
      result,
      api_result: "ok",
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      message: "Internal server error",
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

router.get("/Master/:LINE/:startDate/:finishDate", async (req, res) => {
  try {
    const { LINE, startDate, finishDate } = req.params;
    let result = await user.sequelize.query(
      `exec [Machine DownTime].[dbo].[trace_Dym] '${LINE}','${startDate}:00','${finishDate}:00'; `
    );

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

router.get(
  "/moter/:process/:model/:Line_1/:startDate/:finishDate",
  async (req, res) => {
    //ที่ต้องทำ 2 เงื่อนไข เพราะ ใน oneday ไม่มี Table Dimension_WR
    try {
      const { startDate, finishDate, model, Line_1, process } = req.params;
      var line = Line_1.trim(); //trim คือการลบ spacebar ทั้งหน้าและหลัง

      var dbResult = await user.sequelize.query(`
        SELECT [Database_Number], [Database]
        FROM [Web_I4].[dbo].[Table_Temp]
        WHERE [lable_process] = ?
      `, {
        replacements: [process],
        type: user.sequelize.QueryTypes.SELECT
      });
      
      // Extract the values from the result
      var Database_Number = dbResult?.[0]?.Database_Number || null;
      var Database_name = dbResult?.[0]?.Database || null;
      
      // Debugging logs to verify data
      console.log("Database_Number:", Database_Number);
      console.log("Database_name:", Database_name);
      

// Check if Database_Number is 1
if (Database_Number == 1 && Database_name) {
  let query;
  
  if (model === "**ALL**") {
    query = `
      SELECT *, '${Database_name}' as table_name
      FROM [${Database_name}].[dbo].[${process}]
      WHERE Date BETWEEN '${startDate}' AND '${finishDate}'
      AND Line = '${line}'
    `;
  } else {
    query = `
      SELECT *, '${Database_name}' as table_name
      FROM [${Database_name}].[dbo].[${process}]
      WHERE Date BETWEEN '${startDate}' AND '${finishDate}'
      AND model = '${model}' AND Line = '${line}'
    `;
  }
  
  var result = await user.sequelize.query(query);
} else if (Database_Number !== 1) {
  let query;
  
  if (model === "**ALL**") {
    query = `
      SELECT *, 'Temp_TransportData' as table_name
      FROM [Temp_TransportData].[dbo].[${process}]
      WHERE Date BETWEEN '${startDate}' AND '${finishDate}'
      AND [Line_IP] = '${line}'
      AND Date != CONVERT(date, GETDATE())
      UNION ALL
      SELECT *, 'Oneday_ReadtimeData' as table_name
      FROM [Oneday_ReadtimeData].[dbo].[${process}]
      WHERE Date = CONVERT(date, GETDATE())
      AND [Line_IP] = '${line}'
    `;
  } else {
    query = `
      SELECT *, 'Temp_TransportData' as table_name
      FROM [Temp_TransportData].[dbo].[${process}]
      WHERE Date BETWEEN '${startDate}' AND '${finishDate}'
      AND model = '${model}' AND [Line_IP] = '${line}'
      AND Date != CONVERT(date, GETDATE())
      UNION ALL
      SELECT *, 'Oneday_ReadtimeData' as table_name
      FROM [Oneday_ReadtimeData].[dbo].[${process}]
      WHERE Date = CONVERT(date, GETDATE())
      AND model = '${model}' AND [Line_IP] = '${line}'
    `;
  }
  
  var result = await user.sequelize.query(query);
} else {
  console.error("Error: Invalid Database_Number or missing Database_name");
  return res.status(500).json({
    message: "Invalid Database configuration",
    api_result: "nok",
  });
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

module.exports = router;
