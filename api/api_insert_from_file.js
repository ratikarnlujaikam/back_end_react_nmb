const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const user1 = require("../database/models/user_216");

const multer = require('multer');
const upload = multer().single('file'); // ใช้ multer เพื่อรับไฟล์ที่ส่งมาแบบ multipart/form-data


const insertfile = async (fileData) => {
  try {
    if (fileData) {
      const { name, fullname } = fileData; // สมมติว่าข้อมูลที่ส่งมาจากไฟล์มีคุณลักษณะ name และ fullname

      // เรียกใช้งาน sequelize query เพื่อทำการ insert ข้อมูลลงในฐานข้อมูล
      const result = await user.sequelize.query(
        `INSERT INTO Component_Master.dbo.test_install_data (name, fullname) VALUES (name, fullname)`,
        {
          replacements: { name: name, fullname: fullname },
          type: user.sequelize.QueryTypes.INSERT
        }
      );

      // หาก insert ข้อมูลสำเร็จ
      if (result) {
        return result; // ส่งผลลัพธ์การ insert กลับไป
      } else {
        throw new Error('Error inserting data into database');
      }
    } else {
      throw new Error('No file data provided');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};



router.post('/insert', upload, async (req, res) => {
  try {
    // รับข้อมูลจากไฟล์ที่อัปโหลดจาก frontend
    const fileData = req.file; // ข้อมูลไฟล์จะถูกเก็บใน req.file ตามที่กำหนดใน multer().single('file')
    console.log(fileData);
    // เรียกใช้ฟังก์ชัน insertfile และส่งข้อมูลไฟล์ไปด้วย
    const result = await insertfile(fileData);

    // ส่งข้อมูลกลับไปยัง client ว่า insert ข้อมูลเสร็จสิ้น
    res.json({
      api_result: 'ok',
      result: result // ถ้าต้องการส่งข้อมูลที่ได้จากการ insert กลับไปให้ client
    });
  } catch (error) {
    console.log(error);
    // ส่งข้อมูลกลับไปยัง client แสดงว่ามีข้อผิดพลาดเกิดขึ้น
    res.status(500).json({
      error,
      api_result: 'nok',
    });
  }
});





module.exports = router;