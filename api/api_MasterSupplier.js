
const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Supplier", async (req, res) => {
  
  try {
    let result = await user.sequelize.query(`	SELECT distinct[Supplier]
    FROM [Component_Master].[dbo].[LoosePart3]`);
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
router.get("/ModelGroup/:Supplier", async (req, res) => {
  
  try {
    const { Supplier } = req.params;
    var result = [[]];
    if (Supplier == "ALL") {
      var result = await user.sequelize.query(`	SELECT distinct [Model_group]
      FROM [Component_Master].[dbo].[LoosePart3]
      order by [Model_group]`);
    } else {
      var result = await user.sequelize.query(`	SELECT distinct [Model_group]
      FROM [Component_Master].[dbo].[LoosePart3]
      where [Supplier]='${Supplier}'
      order by [Model_group] `);
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


router.get("/Master/:Supplier/:ModelGroup",
async (req, res) => {
  try {
    var result = [[]];
    const { Supplier,ModelGroup} = req.params;
  if (Supplier == "ALL" && ModelGroup == "ALL" ) {
    var result = await user.sequelize
      .query(`--Supplier ALL -- Model_group ALL
      SELECT [PartName] as Part_Name
            ,[Supplier] as Supplier_Name
            ,[Code] as Supplier_Code
            ,[Model_group] as Model_group
            ,[Model] as Model_Name
            ,[Remark] as Remark
            ,[Updater] as Updater
            ,[Timestamp] as Time_stamp
            
        FROM [Component_Master].[dbo].[LoosePart3]
        where [Supplier] !='ALL'
        order by [PartName],[Supplier],[Code],[Model_group]
        `);
  }else if (Supplier == "ALL" && ModelGroup != "ALL") {
    var result = await user.sequelize
      .query(`--Supplier ALL --
      SELECT [PartName] as Part_Name
      ,[Supplier] as Supplier_Name
      ,[Code] as Supplier_Code
      ,[Model_group] as Model_group
      ,[Model] as Model_Name
      ,[Remark] as Remark
      ,[Updater] as Updater
      ,[Timestamp] as Time_stamp
     
        FROM [Component_Master].[dbo].[LoosePart3]
        where [Model_group]='${ModelGroup}'
        order by [PartName],[Supplier],[Code],[Model_group]`);
      }
      else if (Supplier != "ALL" && ModelGroup == "ALL") {
        var result = await user.sequelize
          .query(`    --ModelGroup ALL --
          SELECT [PartName] as Part_Name
          ,[Supplier] as Supplier_Name
          ,[Code] as Supplier_Code
          ,[Model_group] as Model_group
          ,[Model] as Model_Name
          ,[Remark] as Remark
          ,[Updater] as Updater
          ,[Timestamp] as Time_stamp
       
            FROM [Component_Master].[dbo].[LoosePart3]
            where [Supplier]='${Supplier}'
            order by [PartName],[Supplier],[Code],[Model_group]`);
    }
     else {
      var result = await user.sequelize
        .query(`
        SELECT [PartName] as Part_Name
        ,[Supplier] as Supplier_Name
        ,[Code] as Supplier_Code
        ,[Model_group] as Model_group
        ,[Model] as Model_Name
        ,[Remark] as Remark
        ,[Updater] as Updater
        ,[Timestamp] as Time_stamp
       
    FROM [Component_Master].[dbo].[LoosePart3]
    where [Supplier]='${Supplier}' and [Model_group]='${ModelGroup}'
    order by [PartName],[Supplier],[Code],[Model_group]`);
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
