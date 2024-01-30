const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/ModelGroup", async (req, res) => {
  try {
    let result = await user.sequelize
      .query(`SELECT Distinct[Model] as ModelGroup
    FROM [Component_Master].[dbo].[Line_for_QRcode]`);
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
router.get("/Line/:ModelGroup", async (req, res) => {
  try {
    const { ModelGroup } = req.params;
    var result = [[]];
    if (ModelGroup == "ALL") {
      var result = await user.sequelize.query(`
      SELECT distinct [Line] as Line
    FROM [Component_Master].[dbo].[Line_for_QRcode]`);
    } else {
      var result = await user.sequelize.query(`SELECT distinct [Line] as Line
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      where [Model]='${ModelGroup}'`);
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

router.get("/Masterline/:ModelGroup/:Line", async (req, res) => {
  try {
    var result = [[]];
    const { ModelGroup, Line } = req.params;
    if (ModelGroup == "ALL" && Line == "ALL") {
      var result = await user.sequelize.query(`
      SELECT 
      [Model] as Model_Group
    ,[Item_no] as Item_no
    ,[ItemName] as Item_Name
    ,[ModelShortName] as Model_Name
    ,'L'+[Line] as Line_No
    ,[Label_Digit15] as Label_Digit15
    ,[Label_Digit23] as Label_Digit23
    ,[Line_for_QRcode].[Updater] as Updater
    ,[Line_for_QRcode].[Timestamp] as Time_stamp
    ,[Line_for_QRcode].[Remark] as Remark
  FROM [Component_Master].[dbo].[Line_for_QRcode]
  left join [QAInspection].[dbo].[tbMasterItemNo]
  on [Line_for_QRcode].[Item_no] = [tbMasterItemNo].[ItemNo]
  order by [Item_no],[Label_Digit23]
        `);
    } else if (ModelGroup == "ALL" && Line != "ALL") {
      var result = await user.sequelize.query(` 
      SELECT 
      [Model] as Model_Group
    ,[Item_no] as Item_no
    ,[ItemName] as Item_Name
    ,[ModelShortName] as Model_Name
    ,'L'+[Line] as Line_No
    ,[Label_Digit15] as Label_Digit15
    ,[Label_Digit23] as Label_Digit23
    ,[Line_for_QRcode].[Updater] as Updater
    ,[Line_for_QRcode].[Timestamp] as Time_stamp
    ,[Line_for_QRcode].[Remark] as Remark
  FROM [Component_Master].[dbo].[Line_for_QRcode]
  left join [QAInspection].[dbo].[tbMasterItemNo]
  on [Line_for_QRcode].[Item_no] = [tbMasterItemNo].[ItemNo]
  where [Line]='${Line}'
  order by [Item_no],[Label_Digit23]
  `);
    } else if (ModelGroup != "ALL" && Line == "ALL") {
      var result = await user.sequelize.query(`    
      SELECT 
      [Model] as Model_Group
    ,[Item_no] as Item_no
    ,[ItemName] as Item_Name
    ,[ModelShortName] as Model_Name
    ,'L'+[Line] as Line_No
    ,[Label_Digit15] as Label_Digit15
    ,[Label_Digit23] as Label_Digit23
    ,[Line_for_QRcode].[Updater] as Updater
    ,[Line_for_QRcode].[Timestamp] as Time_stamp
    ,[Line_for_QRcode].[Remark] as Remark
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      left join [QAInspection].[dbo].[tbMasterItemNo]
      on [Line_for_QRcode].[Item_no] = [tbMasterItemNo].[ItemNo]
      where [Model]='${ModelGroup}'
      order by [Item_no],[Label_Digit23]
      `);
    } else {
      var result = await user.sequelize.query(`
      SELECT 
      [Model] as Model_Group
    ,[Item_no] as Item_no
    ,[ItemName] as Item_Name
    ,[ModelShortName] as Model_Name
    ,'L'+[Line] as Line_No
    ,[Label_Digit15] as Label_Digit15
    ,[Label_Digit23] as Label_Digit23
    ,[Line_for_QRcode].[Updater] as Updater
    ,[Line_for_QRcode].[Timestamp] as Time_stamp
    ,[Line_for_QRcode].[Remark] as Remark
    FROM [Component_Master].[dbo].[Line_for_QRcode]
    left join [QAInspection].[dbo].[tbMasterItemNo]
    on [Line_for_QRcode].[Item_no] = [tbMasterItemNo].[ItemNo]
    where [Model]='${ModelGroup}' and [Line]='${Line}'
    order by [Item_no],[Label_Digit23]
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
