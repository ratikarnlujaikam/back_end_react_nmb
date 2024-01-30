
const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/ModelGroup", async (req, res) => {
  
  try {
    let result = await user.sequelize.query(`SELECT distinct
    [ModelGroup]
FROM [Component_Master].[dbo].[tbMasterItemNo]
order by [ModelGroup]`);
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
router.get("/ItemNo/:ModelGroup", async (req, res) => {
  
try {
  const { ModelGroup } = req.params;
  var result = [[]];
  if (ModelGroup == "ALL") {
    var result = await user.sequelize.query(`SELECT distinct[ItemNo]
    FROM [Component_Master].[dbo].[tbMasterItemNo] 
    order by [ItemNo] `);
  } else {
    var result = await user.sequelize.query(`SELECT distinct[ItemNo]
    FROM [Component_Master].[dbo].[tbMasterItemNo]
       where [ModelGroup]='${ModelGroup}'or [ModelGroup]='ALL' 
       order by [ItemNo] `);
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





router.get("/Master/:ModelGroup/:ItemNo",
async (req, res) => {
  try {
    var result = [[]];
    const { ItemNo,ModelGroup} = req.params;
  if (ModelGroup == "ALL"  && ItemNo == "ALL" ) {
    var result = await user.sequelize
      .query(`--ALL&--ALL&--ALL
      SELECT [CustomerCode] as Customer_Code
      ,[ModelGroup] as Model_Group
      ,[ItemNo] as Item_No
      ,[ItemName] as Item_Name
      ,[ModelShortName] as Model_Name
      ,[WC_Code] as WC_Code
      ,[LotSizeFinal] as Lot_Size_Final
      ,[LotSizeQA] as Lot_Size_QA
      ,[QACode] as QA_Code
      ,[Tray_PerQA] as Tray_Per_QA
      ,[Updater] as Updater
      ,[Timestamp] as Time_stamp
      ,[BagColor] as Bag_Color
      ,[EndOfLife] as End_Of_Life
FROM [Component_Master].[dbo].[tbMasterItemNo]
  where [ModelGroup] !='ALL'
  order by [CustomerCode],[ModelGroup],[ItemNo],[ItemName]`
  );
} else if (ModelGroup == "ALL" && ItemNo != "ALL" ) {
  var result = await user.sequelize
    .query(`SELECT [CustomerCode] as Customer_Code
    ,[ModelGroup] as Model_Group
    ,[ItemNo] as Item_No
    ,[ItemName] as Item_Name
    ,[ModelShortName] as Model_Name
    ,[WC_Code] as WC_Code
    ,[LotSizeFinal] as Lot_Size_Final
    ,[LotSizeQA] as Lot_Size_QA
    ,[QACode] as QA_Code
    ,[Tray_PerQA] as Tray_Per_QA
    ,[Updater] as Updater
    ,[Timestamp] as Time_stamp
    ,[BagColor] as Bag_Color
    ,[EndOfLife] as End_Of_Life
FROM [Component_Master].[dbo].[tbMasterItemNo]
where [ItemNo]='${ItemNo}'
order by [CustomerCode],[ModelGroup],[ItemNo],[ItemName] `);
} else if(ModelGroup != "ALL" &&  ItemNo == "ALL" ) {
  var result = await user.sequelize
    .query(`SELECT [CustomerCode] as Customer_Code
    ,[ModelGroup] as Model_Group
    ,[ItemNo] as Item_No
    ,[ItemName] as Item_Name
    ,[ModelShortName] as Model_Name
    ,[WC_Code] as WC_Code
    ,[LotSizeFinal] as Lot_Size_Final
    ,[LotSizeQA] as Lot_Size_QA
    ,[QACode] as QA_Code
    ,[Tray_PerQA] as Tray_Per_QA
    ,[Updater] as Updater
    ,[Timestamp] as Time_stamp
    ,[BagColor] as Bag_Color
    ,[EndOfLife] as End_Of_Life
FROM [Component_Master].[dbo].[tbMasterItemNo]
where [ModelGroup]='${ModelGroup}' 
order by [CustomerCode],[ModelGroup],[ItemNo],[ItemName]`);
    } else {
      var result = await user.sequelize
        .query(` 
        SELECT [CustomerCode] as Customer_Code
        ,[ModelGroup] as Model_Group
        ,[ItemNo] as Item_No
        ,[ItemName] as Item_Name
        ,[ModelShortName] as Model_Name
        ,[WC_Code] as WC_Code
        ,[LotSizeFinal] as Lot_Size_Final
        ,[LotSizeQA] as Lot_Size_QA
        ,[QACode] as QA_Code
        ,[Tray_PerQA] as Tray_Per_QA
        ,[Updater] as Updater
        ,[Timestamp] as Time_stamp
        ,[BagColor] as Bag_Color
        ,[EndOfLife] as End_Of_Life
  FROM [Component_Master].[dbo].[tbMasterItemNo]
    where [ModelGroup]='${ModelGroup}' and [ItemNo]='${ItemNo}'
    order by [CustomerCode],[ModelGroup],[ItemNo],[ItemName] `);
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
