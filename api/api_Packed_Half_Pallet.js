const express = require("express");
const router = express.Router();
const user = require("../database/models/user");


router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Model_group]
      FROM [QAInspection].[dbo].[tbVisualInspection]
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

router.get(
  "/packed_half_Sum",
  async (req, res) => {
    try {
      var result = [[]];
        var result = await user.sequelize.query(`
        WITH SET1 AS (select QA_no ,MfgDate
          from [Tray_Packing].[dbo].[Matching_Tray]
                  GROUP BY QA_no ,MfgDate
          --where QA_no='LSP6A340282'
          UNION
          SELECT [QA_no],MfgDate
          FROM [Tray_Packing].[dbo].[Tray_Record]
          --where QA_no='LSP6A340282'
          )
          ,SET2 AS (
          select QA_no,MfgDate FROM SET1
                  GROUP BY QA_no,MfgDate
          --where QA_no ='LSP6A340074'
          )
          ,SET3 as(
          select QANumber from [QAInspection].[dbo].[tbPallet_waitQAtag]
          --where QANumber='LSP6A340282'
          )
          ,SET4 AS (select [ModelGroup]
            ,[ModelNumber]
                ,[MOQTY]
                                ,QA_no
           from SET2
           LEFT join SET3 on SET2.QA_no=SET3.QANumber
           INNER JOIN  [QAInspection].[dbo].[tbQANumber] on SET2.QA_no=[tbQANumber].QANumber
           WHERE SET3.QANumber is null
           and year(MfgDate) > '2022'
           and year(MfgDate) !='2565')

                   ,set5 as(SELECT [ModelGroup],[ModelNumber],QA_no as LotQty ,SUM([MOQTY])AS QTY
                         FROM SET4 GROUP BY [ModelGroup],[ModelNumber],QA_no
     )

           SELECT [ModelGroup],[ModelNumber],count(LotQty) as LotQty , SUM(QTY)AS QTY
                FROM set5
       GROUP BY [ModelGroup],[ModelNumber]
           order by QTY desc
                    
`);
var resultGraph = await user.sequelize
.query(`   
-----resultGraph-----
WITH SET1 AS (select QA_no ,MfgDate
  from [Tray_Packing].[dbo].[Matching_Tray] 
GROUP BY QA_no ,MfgDate
  --where QA_no='LSP6A340282'
  UNION
  SELECT [QA_no],MfgDate
  FROM [Tray_Packing].[dbo].[Tray_Record]
  --where QA_no='LSP6A340282'
  )
  ,SET2 AS (
  select QA_no,MfgDate FROM SET1
GROUP BY QA_no,MfgDate
  --where QA_no ='LSP6A340074'
  )
  ,SET3 as(
  select QANumber from [QAInspection].[dbo].[tbPallet_waitQAtag]
  --where QANumber='LSP6A340282'
  )
  ,SET4 AS (select [ModelGroup]
    ,[ModelNumber]
        ,[MOQTY]
,QA_no
   from SET2 
   LEFT join SET3 on SET2.QA_no=SET3.QANumber
   INNER JOIN  [QAInspection].[dbo].[tbQANumber] on SET2.QA_no=[tbQANumber].QANumber
   WHERE SET3.QANumber is null
   and year(MfgDate) > '2022' 
   and year(MfgDate) !='2565')

SELECT [ModelGroup],SUM([MOQTY])AS QTY 
FROM SET4 GROUP BY [ModelGroup]
ORDER BY [QTY] desc`);

let ModelGroup =[];
let QTY=[];
resultGraph[0].forEach( (item) => {
  ModelGroup.push(item.ModelGroup);
  QTY.push(item.QTY);
});

      var listRawData = [];
      listRawData.push(result[0]);

      res.json({
        result: result[0],
        resultGraph: resultGraph[0],
        listRawData,
        ModelGroup,
        QTY,
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
router.get(
  "/packed_half_Detail",
  async (req, res) => {
    try {
      var result = [[]];
        var result = await user.sequelize.query(`
        WITH SET1 AS (select QA_no ,MfgDate
          from [Tray_Packing].[dbo].[Matching_Tray] 
          --where QA_no='LSP6A340282'
          UNION
          SELECT [QA_no],MfgDate
          FROM [Tray_Packing].[dbo].[Tray_Record]
          --where QA_no='LSP6A340282'
          )
          
          ,SET2 AS (
          select QA_no,MfgDate FROM SET1
          --where QA_no ='LSP6A340074'
          )
          
          ,SET3 as(
          select QANumber from [QAInspection].[dbo].[tbPallet_waitQAtag]
          --where QANumber='LSP6A340282'
          )
          
           select [ModelGroup]
            ,[ModelNumber]
            ,SET2.QA_no
            ,SET2.MfgDate
                ,SUM([MOQTY]) AS  MOQTY
                ,+'L'+[Line_No] AS Line_No
                
                ,[Base]
                ,[Ramp]
                ,[Hub]
                ,[Magnet]
                ,[FPC]
                ,[Diverter]
                ,[Crash_Stop]
               
                ,[SpecialControl1]
                ,[SpecialControl2]
                ,[SpecialControl3]
                ,[SpecialControl4]
                ,[SpecialControl5]
                ,[Remark]
                ,[Time]
                ,[Lotsize]
                ,[ModelName]
                ,[Rev]
           from SET2 
           LEFT join SET3 on SET2.QA_no=SET3.QANumber
           INNER JOIN  [QAInspection].[dbo].[tbQANumber] on SET2.QA_no=[tbQANumber].QANumber
           WHERE SET3.QANumber is null
           and year(MfgDate) > '2022' 
           and year(MfgDate) !='2565'
		   GROUP BY  [ModelGroup]
            ,[ModelNumber]
            ,SET2.QA_no
            ,SET2.MfgDate               
                , Line_No
                
                ,[Base]
                ,[Ramp]
                ,[Hub]
                ,[Magnet]
                ,[FPC]
                ,[Diverter]
                ,[Crash_Stop]
                
                ,[SpecialControl1]
                ,[SpecialControl2]
                ,[SpecialControl3]
                ,[SpecialControl4]
                ,[SpecialControl5]
                ,[Remark]
                ,[Time]
                ,[Lotsize]
                ,[ModelName]
                ,[Rev]
           order by QA_no,MfgDate

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
router.get(
  "/lotqanumber/:lotqanumber",
  async (req, res) => {
    try {
      var result = [[]];
      const { lotqanumber} = req.params; {
        var result = await user.sequelize
          .query(`
          WITH SET1 AS (select QA_no ,MfgDate
            from [Tray_Packing].[dbo].[Matching_Tray]
            --where QA_no='LSP6A340282'
            UNION
            SELECT [QA_no],MfgDate
            FROM [Tray_Packing].[dbo].[Tray_Record]
            --where QA_no='LSP6A340282'
            )

            ,SET2 AS (
            select QA_no,MfgDate FROM SET1
            --where QA_no ='LSP6A340074'
            )

            ,SET3 as(
            select QANumber from [QAInspection].[dbo].[tbPallet_waitQAtag]
            --where QANumber='LSP6A340282'
            )

             select [ModelGroup]
              ,[ModelNumber]
              ,SET2.QA_no
              ,SET2.MfgDate
                  ,SUM([MOQTY]) AS MOQTY
                  ,+'L'+[Line_No] AS Line_No
                 
                  ,[Base]
                  ,[Ramp]
                  ,[Hub]
                  ,[Magnet]
                  ,[FPC]
                  ,[Diverter]
                  ,[Crash_Stop]
                  
                  ,[SpecialControl1]
                  ,[SpecialControl2]
                  ,[SpecialControl3]
                  ,[SpecialControl4]
                  ,[SpecialControl5]
                  ,[Remark]
                  ,[Time]
                  ,[Lotsize]
                  ,[ModelName]
                  ,[Rev]
             from SET2
             LEFT join SET3 on SET2.QA_no=SET3.QANumber
             INNER JOIN  [QAInspection].[dbo].[tbQANumber] on SET2.QA_no=[tbQANumber].QANumber
             WHERE SET3.QANumber is null
             and SET2.QA_no like '${lotqanumber}%'
             and year(MfgDate) > '2022'
             and year(MfgDate) !='2565'
			 GROUP BY  [ModelGroup]
            ,[ModelNumber]
            ,SET2.QA_no
            ,SET2.MfgDate               
                , Line_No
                
                ,[Base]
                ,[Ramp]
                ,[Hub]
                ,[Magnet]
                ,[FPC]
                ,[Diverter]
                ,[Crash_Stop]
                
                ,[SpecialControl1]
                ,[SpecialControl2]
                ,[SpecialControl3]
                ,[SpecialControl4]
                ,[SpecialControl5]
                ,[Remark]
                ,[Time]
                ,[Lotsize]
                ,[ModelName]
                ,[Rev]
             order by QA_no,MfgDate`
         );
      
      }       
      var listRawData3 = [];
      listRawData3.push(result[0]);

      res.json({
        result: result[0],
        listRawData3,
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
