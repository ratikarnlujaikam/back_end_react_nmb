const express = require("express");
const router = express.Router();
const user = require("../database/models/user");



router.get("/LARPP", async (req, res) => {
  try {
    // รับวันที่และเวลาปัจจุบัน
var now = new Date();

// ตรวจสอบว่าเวลาอยู่ระหว่าง 00:00 - 06:59 หรือไม่
if (now.getHours() < 7) {
    // ถ้าใช่ ลดวันที่ลงเป็น -1
    now.setDate(now.getDate() - 1);
} else {
    // ถ้าไม่ใช่ให้ใช้วันที่ปัจจุบัน
    now.setDate(now.getDate());
}

// พิมพ์วันที่ปัจจุบันหลังจากการปรับแก้
  date_modified = now.toISOString().slice(0, 10)

    const result = await user.sequelize.query(`
    exec [Oneday_ReadtimeData].[dbo].[OEE_percentage] '${date_modified}'
   
    `);

    const result_1 = await user.sequelize.query(`
  
    `);

    
    




    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
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

router.get("/monthly/:startDate", async (req, res) => {
  try {
    const { startDate } = req.params;
    const result = await user.sequelize.query(`

    exec [Oneday_ReadtimeData].[dbo].[OEE_percentage_month] '${startDate}'

   
    `);

    const result_1 = await user.sequelize.query(`
  
    `);

    
    




    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
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
