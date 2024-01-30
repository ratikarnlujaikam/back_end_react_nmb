const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

//motor
//DataML
router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Model] != 'EVANS'
    order by [Model]`);
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

router.get("/line/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct[Line]
    FROM [Temp_TransportData].[dbo].[Line_for_QRcode]
    where [Temp_TransportData].[dbo].[Line_for_QRcode].[Model] = '${myModel}'`);
    // console.log(result);

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

router.get("/parameter", async (req, res) => {
  try {
    let result = await user.sequelize.query(`SELECT distinct[Parameter]
    FROM [DataforAnalysis].[dbo].[parameters_all]`);
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

router.get("/table/:KPIV1", async (req, res) => {
  try {
    const { KPIV1 } = req.params;
    var selectKPIV1 = JSON.parse(KPIV1);
    var listRawData = []; // เพิ่มตัวแปรเก็บผลลัพธ์
    
    for (let index = 0; index < selectKPIV1.length; index++) {
      const arrayKPIV = selectKPIV1[index];
      
      let result = await user.sequelize.query(
        `SELECT Parameter
        FROM [DataforAnalysis].[dbo].[parameters_all]
        WHERE [Parameter] = '${arrayKPIV}'`
      );
      
      listRawData.push(result[0]); // เพิ่มผลลัพธ์ในอาร์เรย์
    }
    
    console.log(listRawData);
    
    res.json({
      result: listRawData, // ส่งผลลัพธ์ทั้งหมด
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



// router.get(
//   "/dataML/:startDate/:finishDate/:myModel/:myLine/:KPOV/:KPIV1",
//   async (req, res) => {
//     try {
//       const {
//         startDate,
//         finishDate,
//         myModel,
//         myLine,
//         KPOV,
//         KPIV1,
//       } = req.params;

//       //MBA
//       var result = [[]];
//       if (
//         KPIV1 !== "blank" 
//       ) {
//         var result = await user.sequelize
//           .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}]
//         FROM [Diecast].[dbo].[Pivot]
//         join [TransportData].[dbo].[Matching_Auto_Unit1]
//         on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
//         join [DataforAnalysis].[dbo].[DataML]
//         on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
//         WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
//         and ([${KPOV}] is not null and [${KPIV1}] is not null)
//         order by [Date]
//               `);
//       } 
//         else {
//         var result = await user.sequelize
//           .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}]
//         FROM [Diecast].[dbo].[Pivot]
//         join [TransportData].[dbo].[Matching_Auto_Unit1]
//         on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
//         join [DataforAnalysis].[dbo].[DataML]
//         on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
//         WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
//         and ([${KPOV}] is not null )
//         order by [Date]
//               `);
//       }

//       res.json({
//         result: result[0],
//         api_result: "ok",
//       });
//     } catch (error) {
//       console.log(error);
//       res.json({
//         error,
//         api_result: "nok",
//       });
//     }
//   }
// );



module.exports = router;