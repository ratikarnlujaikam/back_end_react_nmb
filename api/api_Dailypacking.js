const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

//motor
//DataML
router.get("/Model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`SELECT distinct[ModelGroup]
    FROM [QAInspection].[dbo].[tbMasterItemNo]
    where ModelGroup != 'ALL'
    union select '**ALL**'`);
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
  "/report1/:Model/:startDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { Model,startDate } = req.params;
      if (Model == "**ALL**") {
        var result = await user.sequelize
          .query(`with W2 as (SELECT distinct[QANumber]
            ,sum(Qty)  as Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
          from [QAInspection].[dbo].[tbPallet_waitQAtag]
          inner join [QAInspection].[dbo].[tbMasterItemNo] on[tbMasterItemNo].[ItemNo]=[tbPallet_waitQAtag].[Model_No]
          where [MfgDate]='${startDate}' 
          group by [QANumber],[Pallet_Number],[Model],[Model_No],[MfgDate],[Shift],[MotorType]
          )

      ,W3 as (
      SELECT [QANumber]
            ,Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
      FROM W2 AS S
      WHERE S.[Pallet_Number]=(
        SELECT MAX([Pallet_Number])
        FROM W2
        WHERE [QANumber]=S.[QANumber])),
            
                T2 as ( SELECT [MfgDate],[MotorType],[Model],[Model_No],
                      case when A is null then 0 else A end as SHIFT_A,
                      case when B is null then 0 else B end as SHIFT_B,
                      case when C is null then 0 else C end as SHIFT_C,
                      case when M is null then 0 else M end as SHIFT_M,
                      case when N is null then 0 else N end as SHIFT_N
                          FROM W3
                          PIVOT (sum(Qty)
                          FOR[Shift] IN (A,B,C,M,N))
                          AS pvt )
        
                          --report1
                          select [MfgDate],[MotorType],sum(SHIFT_A)as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C)as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N)as SHIFT_N
                          ,sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N) as TOTAL
                          from T2
                          group by [MfgDate],[MotorType]
                          order by TOTAL DESC`);
                          
      } else {
        var result = await user.sequelize
          .query(`with W2 as (SELECT distinct[QANumber]
            ,sum(Qty)  as Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
          from [QAInspection].[dbo].[tbPallet_waitQAtag]
          inner join [QAInspection].[dbo].[tbMasterItemNo] on[tbMasterItemNo].[ItemNo]=[tbPallet_waitQAtag].[Model_No]
         where [MfgDate]='${startDate}'  and [Model]='${Model}' 
          group by [QANumber],[Pallet_Number],[Model],[Model_No],[MfgDate],[Shift],[MotorType]
          )

      ,W3 as (
      SELECT [QANumber]
            ,Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
      FROM W2 AS S
      WHERE S.[Pallet_Number]=(
        SELECT MAX([Pallet_Number])
        FROM W2
        WHERE [QANumber]=S.[QANumber])),
            
                T2 as ( SELECT [MfgDate],[MotorType],[Model],[Model_No],
                      case when A is null then 0 else A end as SHIFT_A,
                      case when B is null then 0 else B end as SHIFT_B,
                      case when C is null then 0 else C end as SHIFT_C,
                      case when M is null then 0 else M end as SHIFT_M,
                      case when N is null then 0 else N end as SHIFT_N
                          FROM W3
                          PIVOT (sum(Qty)
                          FOR[Shift] IN (A,B,C,M,N))
                          AS pvt )
        
                          --report1
                          select [MfgDate],[MotorType],sum(SHIFT_A)as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C)as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N)as SHIFT_N
                          ,sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N) as TOTAL
                          from T2
                          group by [MfgDate],[MotorType]
                          order by TOTAL DESC`);
      }
          // แกน  y
    let SHIFT_A = [];
    let SHIFT_B = [];
    let SHIFT_C = [];
    let SHIFT_M = [];
    let SHIFT_N = [];
    let TOTAL = [];
    result[0].forEach( (item) => {
      SHIFT_A.push(item.SHIFT_A);
      SHIFT_B.push(item.SHIFT_B);
      SHIFT_C.push(item.SHIFT_C);
      SHIFT_M.push(item.SHIFT_M);
      SHIFT_N.push(item.SHIFT_N);
      TOTAL.push(item.TOTAL);
      
    });

      var listRawData1 = [];
      listRawData1.push(result[0]);

      res.json({
        result: result[0],
        listRawData1,
        SHIFT_A ,
        SHIFT_B ,
        SHIFT_C ,
        SHIFT_M ,
        SHIFT_N ,
        TOTAL ,
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
  "/report2/:Model/:startDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { Model,startDate, finishDate } = req.params;
      if (Model == "**ALL**") {
        var result = await user.sequelize
          .query(`with W2 as (SELECT distinct[QANumber]
            ,sum(Qty)  as Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
          from [QAInspection].[dbo].[tbPallet_waitQAtag]
          inner join [QAInspection].[dbo].[tbMasterItemNo] on[tbMasterItemNo].[ItemNo]=[tbPallet_waitQAtag].[Model_No]
          where [MfgDate]='${startDate}'  
          group by [QANumber],[Pallet_Number],[Model],[Model_No],[MfgDate],[Shift],[MotorType]
          )

      ,W3 as (
      SELECT [QANumber]
            ,Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
      FROM W2 AS S
      WHERE S.[Pallet_Number]=(
        SELECT MAX([Pallet_Number])
        FROM W2
        WHERE [QANumber]=S.[QANumber]))
        
            
                ,T2 as ( 
				SELECT [MfgDate],[MotorType],[Model],[Model_No],
                      case when A is null then 0 else A end as SHIFT_A,
                      case when B is null then 0 else B end as SHIFT_B,
                      case when C is null then 0 else C end as SHIFT_C,
                      case when M is null then 0 else M end as SHIFT_M,
                      case when N is null then 0 else N end as SHIFT_N
                          FROM W3
                          PIVOT (sum(Qty)
                          FOR[Shift] IN (A,B,C,M,N))
                          AS pvt )
        --report2
                 select [MfgDate],[MotorType],[Model],[Model_No],sum(SHIFT_A)as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C)as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N)as SHIFT_N
                    ,sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N) as TOTAL
                 from T2
                 group by [MfgDate],[MotorType],[Model],[Model_No]
                 order by [MotorType],[Model]`);
      } else {
        var result = await user.sequelize
          .query(`with W2 as (SELECT distinct[QANumber]
            ,sum(Qty)  as Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
          from [QAInspection].[dbo].[tbPallet_waitQAtag]
          inner join [QAInspection].[dbo].[tbMasterItemNo] on[tbMasterItemNo].[ItemNo]=[tbPallet_waitQAtag].[Model_No]
          where [MfgDate]='${startDate}'  and [Model]='${Model}' 
          group by [QANumber],[Pallet_Number],[Model],[Model_No],[MfgDate],[Shift],[MotorType]
          )

      ,W3 as (
      SELECT [QANumber]
            ,Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
      FROM W2 AS S
      WHERE S.[Pallet_Number]=(
        SELECT MAX([Pallet_Number])
        FROM W2
        WHERE [QANumber]=S.[QANumber]))
        
            
                ,T2 as ( 
				SELECT [MfgDate],[MotorType],[Model],[Model_No],
                      case when A is null then 0 else A end as SHIFT_A,
                      case when B is null then 0 else B end as SHIFT_B,
                      case when C is null then 0 else C end as SHIFT_C,
                      case when M is null then 0 else M end as SHIFT_M,
                      case when N is null then 0 else N end as SHIFT_N
                          FROM W3
                          PIVOT (sum(Qty)
                          FOR[Shift] IN (A,B,C,M,N))
                          AS pvt )
                          --report2
                          select [MfgDate],[MotorType],[Model],[Model_No],sum(SHIFT_A)as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C)as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N)as SHIFT_N
                             ,sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N) as TOTAL
                          from T2
                          group by [MfgDate],[MotorType],[Model],[Model_No]
                          order by [MotorType],[Model]`);
      }

      let SHIFT_A = [];
      let SHIFT_B = [];
      let SHIFT_C = [];
      let SHIFT_M = [];
      let SHIFT_N = [];
      let TOTAL = [];
      result[0].forEach( (item) => {
        SHIFT_A.push(item.SHIFT_A);
        SHIFT_B.push(item.SHIFT_B);
        SHIFT_C.push(item.SHIFT_C);
        SHIFT_M.push(item.SHIFT_M);
        SHIFT_N.push(item.SHIFT_N);
        TOTAL.push(item.TOTAL);
        
      });
  
        var listRawData2 = [];
        listRawData2.push(result[0]);
  
        res.json({
          result: result[0],
          listRawData2,
          SHIFT_A ,
          SHIFT_B ,
          SHIFT_C ,
          SHIFT_M ,
          SHIFT_N ,
          TOTAL ,
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
  "/report3/:Model/:startDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { Model,startDate, finishDate } = req.params;
      if (Model == "**ALL**") {
        var result = await user.sequelize
          .query(`with W2 as (SELECT distinct[QANumber]
            ,sum(Qty)  as Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
          from [QAInspection].[dbo].[tbPallet_waitQAtag]
          inner join [QAInspection].[dbo].[tbMasterItemNo] on[tbMasterItemNo].[ItemNo]=[tbPallet_waitQAtag].[Model_No]
          where [MfgDate]='${startDate}'
          group by [QANumber],[Pallet_Number],[Model],[Model_No],[MfgDate],[Shift],[MotorType]
          )
      
      ,W3 as (
      SELECT [QANumber]
            ,Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
      FROM W2 AS S 
      WHERE S.[Pallet_Number]=(
        SELECT MAX([Pallet_Number])
        FROM W2
        WHERE [QANumber]=S.[QANumber]))
      ,T2 as (
      SELECT [MfgDate],[MotorType],[Model],[Model_No],[QANumber],
                            case when A is null then 0 else A end as SHIFT_A,
                            case when B is null then 0 else B end as SHIFT_B,
                            case when C is null then 0 else C end as SHIFT_C,
                            case when M is null then 0 else M end as SHIFT_M,
                            case when N is null then 0 else N end as SHIFT_N
                                FROM W3
                                PIVOT (sum(Qty)
                                FOR[Shift] IN (A,B,C,M,N))
                                AS pvt 
                    )
              --report3
      
                       select T2.[MfgDate],T2.[MotorType],T2.[Model],T2.[Model_No],T2.[QANumber],W3.[Pallet_Number],sum(SHIFT_A)as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C)as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N)as SHIFT_N 
                          ,sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N) as TOTAL
                       from T2
               join W3 on W3.[QANumber]=T2.[QANumber]
                       group by T2.[MfgDate],T2.[MotorType],T2.[Model],T2.[Model_No],T2.[QANumber],[Pallet_Number]
                       order by [MotorType],[Model],[MfgDate]
        `);
      } else {
        var result = await user.sequelize
          .query(`with W2 as (SELECT distinct[QANumber]
            ,sum(Qty)  as Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
          from [QAInspection].[dbo].[tbPallet_waitQAtag]
          inner join [QAInspection].[dbo].[tbMasterItemNo] on[tbMasterItemNo].[ItemNo]=[tbPallet_waitQAtag].[Model_No]
          where [MfgDate]='${startDate}' and [Model]='${Model}' 
          group by [QANumber],[Pallet_Number],[Model],[Model_No],[MfgDate],[Shift],[MotorType]
          )
      
      ,W3 as (
      SELECT [QANumber]
            ,Qty
            ,[Pallet_Number]
            ,[Model]
            ,[Model_No]
            ,[MfgDate]
            ,[Shift]
          ,[MotorType]
      FROM W2 AS S 
      WHERE S.[Pallet_Number]=(
        SELECT MAX([Pallet_Number])
        FROM W2
        WHERE [QANumber]=S.[QANumber]))
      ,T2 as (
      SELECT [MfgDate],[MotorType],[Model],[Model_No],[QANumber],
                            case when A is null then 0 else A end as SHIFT_A,
                            case when B is null then 0 else B end as SHIFT_B,
                            case when C is null then 0 else C end as SHIFT_C,
                            case when M is null then 0 else M end as SHIFT_M,
                            case when N is null then 0 else N end as SHIFT_N
                                FROM W3
                                PIVOT (sum(Qty)
                                FOR[Shift] IN (A,B,C,M,N))
                                AS pvt 
                    )
              --report3
      
                       select T2.[MfgDate],T2.[MotorType],T2.[Model],T2.[Model_No],T2.[QANumber],W3.[Pallet_Number],sum(SHIFT_A)as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C)as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N)as SHIFT_N 
                          ,sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N) as TOTAL
                       from T2
               join W3 on W3.[QANumber]=T2.[QANumber]
                       group by T2.[MfgDate],T2.[MotorType],T2.[Model],T2.[Model_No],T2.[QANumber],[Pallet_Number]
                       order by [MotorType],[Model],[MfgDate]
        `);
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
