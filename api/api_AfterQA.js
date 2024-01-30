const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

//select type
// router.get("/Type", async (req, res) => {
//     try {
//       let result = await user.sequelize.query(`select distinct [InspectionType]
//       FROM [QAInspection].[dbo].[tbVisualInspection]
//       order by [InspectionType]`);
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
//   });
//select model
router.get("/Model", async (req, res) => {
    try {
      let result = await user.sequelize.query(`SELECT distinct[ModelGroup]
      FROM [QAInspection].[dbo].[tbMasterItemNo]
      where [ModelGroup] !='' and [EndOfLife] is null`);
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
//select line
  router.get("/Line/:Model", async (req, res) => {
    try {
      var result = [[]];
      const { Model } = req.params;
      if (Model == "ALL") {
        var result = await user.sequelize.query(`SELECT distinct [Line] as Line
            FROM [Temp_TransportData].[dbo].[Line_for_QRcode]`);
      } else {
        var result = await user.sequelize.query(`SELECT distinct [Line] as Line
            FROM [Temp_TransportData].[dbo].[Line_for_QRcode]
            where Model='${Model}'`);
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

  router.get(
    "/SumQainspection/:Model/:Line/:startDate/:finishDate",
    async (req, res) => {
      try {
        var result = [[]];
        const { Model, Line, startDate, finishDate } = req.params;
        if (Model == "ALL" && Line == "ALL") {
          var result = await user.sequelize
            .query(`with set1 as(SELECT [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] FROM [QAInspection].[dbo].[tbVisualInspection] 
                where [InspectionResult] = 'ACCEPT' and [InspectionType]= 'MP' or [InspectionType] = 'Sample'
                group by [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] )
       ,set2 as (select [QANumber],[Line_No],[Lotsize] FROM [QAInspection].[dbo].[tbQANumber] 
        group by [QANumber],[Line_No],[Lotsize] )
       
       ,set3 as(
       select [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],set1.[QANumber],'L'+[Line_No] as Line_No ,[Lotsize]  from  set1 
        left join set2
        on set1.QANumber = set2.QANumber
        where [InspectionDate] between '${startDate}' 
        and '${finishDate}' 
        --and [Model_group] ='${Model}' 
        --and [Line_No] ='${Line}'  
        )
   
       ,set4 as (select [InspectionDate],[Line_No],[ModelNumber],[InspectionType],[Model_group],
                         case when A is null then 0 else A end as SHIFT_A,
                         case when B is null then 0 else B end as SHIFT_B,
                         case when C is null then 0 else C end as SHIFT_C,
                         case when M is null then 0 else M end as SHIFT_M,
                         case when N is null then 0 else N end as SHIFT_N
                             from set3
                             PIVOT (sum([Lotsize])
                             FOR[InspectionShift] IN (A,B,C,M,N))
                             AS pvt)
          select  [InspectionDate],[Line_No],[InspectionType],[ModelNumber],[Model_group],sum(SHIFT_A) as SHIFT_A ,sum(SHIFT_B) as SHIFT_B,sum(SHIFT_C) as SHIFT_C ,sum(SHIFT_M) as SHIFT_M ,sum(SHIFT_N) as SHIFT_N
          ,(sum(SHIFT_A)+ sum(SHIFT_B)+ sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N)) as Total	  
          from set4 
          group by [InspectionDate],[Line_No],[InspectionType],[ModelNumber],[Model_group]
          order by  Line_No `
           );
        } else if (Model == "ALL" && Line != "ALL") {
          var result = await user.sequelize
            .query(`with set1 as(SELECT [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] FROM [QAInspection].[dbo].[tbVisualInspection] 
                where [InspectionResult] = 'ACCEPT' and [InspectionType]= 'MP' or [InspectionType] = 'Sample'
                group by [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] )
       ,set2 as (select [QANumber],[Line_No],[Lotsize] FROM [QAInspection].[dbo].[tbQANumber] 
        group by [QANumber],[Line_No],[Lotsize] )
       
       ,set3 as(
       select [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],set1.[QANumber],'L'+[Line_No] as Line_No ,[Lotsize]  from  set1 
        left join set2
        on set1.QANumber = set2.QANumber
        where  [InspectionDate] between '${startDate}' 
        and '${finishDate}' 
        --and [Model_group] ='${Model}' 
        and [Line_No] ='${Line}'  
        )
   
       ,set4 as (select [InspectionDate],[Line_No],[ModelNumber],[InspectionType],[Model_group],
                         case when A is null then 0 else A end as SHIFT_A,
                         case when B is null then 0 else B end as SHIFT_B,
                         case when C is null then 0 else C end as SHIFT_C,
                         case when M is null then 0 else M end as SHIFT_M,
                         case when N is null then 0 else N end as SHIFT_N
                             from set3
                             PIVOT (sum([Lotsize])
                             FOR[InspectionShift] IN (A,B,C,M,N))
                             AS pvt)
          select  [InspectionDate],[Line_No],[InspectionType],[ModelNumber],[Model_group],sum(SHIFT_A) as SHIFT_A ,sum(SHIFT_B) as SHIFT_B,sum(SHIFT_C) as SHIFT_C ,sum(SHIFT_M) as SHIFT_M ,sum(SHIFT_N) as SHIFT_N
          ,(sum(SHIFT_A)+ sum(SHIFT_B)+ sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N)) as Total	  
          from set4 
          group by [InspectionDate],[Line_No],[InspectionType],[ModelNumber],[Model_group]
          order by  Line_No `);
        } else if (Model != "ALL" && Line == "ALL") {
          var result = await user.sequelize
            .query(`with set1 as(SELECT [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] FROM [QAInspection].[dbo].[tbVisualInspection] 
                where [InspectionResult] = 'ACCEPT' and [InspectionType]= 'MP' or [InspectionType] = 'Sample'
                group by [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] )
       ,set2 as (select [QANumber],[Line_No],[Lotsize] FROM [QAInspection].[dbo].[tbQANumber] 
        group by [QANumber],[Line_No],[Lotsize] )
       
       ,set3 as(
       select [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],set1.[QANumber],'L'+[Line_No] as Line_No ,[Lotsize]  from  set1 
        left join set2
        on set1.QANumber = set2.QANumber
        where [InspectionDate] between '${startDate}' 
        and '${finishDate}' 
        and [Model_group] ='${Model}' 
        --and [Line_No] ='${Line}'  
        )
   
       ,set4 as (select [InspectionDate],[Line_No],[ModelNumber],[InspectionType],[Model_group],
                         case when A is null then 0 else A end as SHIFT_A,
                         case when B is null then 0 else B end as SHIFT_B,
                         case when C is null then 0 else C end as SHIFT_C,
                         case when M is null then 0 else M end as SHIFT_M,
                         case when N is null then 0 else N end as SHIFT_N
                             from set3
                             PIVOT (sum([Lotsize])
                             FOR[InspectionShift] IN (A,B,C,M,N))
                             AS pvt)
          select  [InspectionDate],[Line_No],[InspectionType],[ModelNumber],[Model_group],sum(SHIFT_A) as SHIFT_A ,sum(SHIFT_B) as SHIFT_B,sum(SHIFT_C) as SHIFT_C ,sum(SHIFT_M) as SHIFT_M ,sum(SHIFT_N) as SHIFT_N
          ,(sum(SHIFT_A)+ sum(SHIFT_B)+ sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N)) as Total	  
          from set4 
          group by [InspectionDate],[Line_No],[InspectionType],[ModelNumber],[Model_group]
          order by  Line_No `);
        } else {
          var result = await user.sequelize
            .query(`with set1 as(SELECT [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] FROM [QAInspection].[dbo].[tbVisualInspection] 
                where [InspectionResult] = 'ACCEPT' and [InspectionType]= 'MP' or [InspectionType] = 'Sample'
                group by [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] )
       ,set2 as (select [QANumber],[Line_No],[Lotsize] FROM [QAInspection].[dbo].[tbQANumber] 
        group by [QANumber],[Line_No],[Lotsize] )
       
       ,set3 as(
       select [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],set1.[QANumber],'L'+[Line_No] as Line_No ,[Lotsize]  from  set1 
        left join set2
        on set1.QANumber = set2.QANumber
        where  
        [InspectionDate] between '${startDate}' 
        and '${finishDate}' 
        and [Model_group] ='${Model}' 
        and [Line_No] ='${Line}'  
        )
   
       ,set4 as (select [InspectionDate],[Line_No],[ModelNumber],[InspectionType],[Model_group],
                         case when A is null then 0 else A end as SHIFT_A,
                         case when B is null then 0 else B end as SHIFT_B,
                         case when C is null then 0 else C end as SHIFT_C,
                         case when M is null then 0 else M end as SHIFT_M,
                         case when N is null then 0 else N end as SHIFT_N
                             from set3
                             PIVOT (sum([Lotsize])
                             FOR[InspectionShift] IN (A,B,C,M,N))
                             AS pvt)
          select  [InspectionDate],[Line_No],[InspectionType],[ModelNumber],[Model_group],sum(SHIFT_A) as SHIFT_A ,sum(SHIFT_B) as SHIFT_B,sum(SHIFT_C) as SHIFT_C ,sum(SHIFT_M) as SHIFT_M ,sum(SHIFT_N) as SHIFT_N
          ,(sum(SHIFT_A)+ sum(SHIFT_B)+ sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N)) as Total	  
          from set4 
          group by [InspectionDate],[Line_No],[InspectionType],[ModelNumber],[Model_group]
          order by  Line_No `);
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

  router.get(
    "/DetailQainspection/:Model/:Line/:startDate/:finishDate",
    async (req, res) => {
      try {
        var result = [[]];
        const { Model, Line, startDate, finishDate } = req.params;
        if (Model == "ALL" && Line == "ALL") {
          var result = await user.sequelize.query(`with set1 as(SELECT [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] FROM [QAInspection].[dbo].[tbVisualInspection] 
            where [InspectionResult] = 'ACCEPT' and [InspectionType]= 'MP' or [InspectionType] = 'Sample'
            group by [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] )
   ,set2 as (select [QANumber],[Line_No],[Lotsize] FROM [QAInspection].[dbo].[tbQANumber] 
    group by [QANumber],[Line_No],[Lotsize] )
   
   ,set3 as(
   select [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],set1.[QANumber],'L'+[Line_No] as Line_No ,[Lotsize]  from  set1 
    left join set2
    on set1.QANumber = set2.QANumber 
    where [InspectionDate] between '${startDate}' 
    and '${finishDate}' 
    --and [Model_group] ='${Model}' 
    --and [Line_No] ='${Line}'  
    )

   select [InspectionDate],[Line_No],[ModelNumber],[Model_group],[QANumber],
                     case when A is null then 0 else A end as SHIFT_A,
                     case when B is null then 0 else B end as SHIFT_B,
                     case when C is null then 0 else C end as SHIFT_C,
                     case when M is null then 0 else M end as SHIFT_M,
                     case when N is null then 0 else N end as SHIFT_N
                         from set3
                         PIVOT (sum([Lotsize])
                         FOR[InspectionShift] IN (A,B,C,M,N))
                         AS pvt
                         order by  Line_No `);
        } else if  (Model == "ALL" && Line != "ALL") {
          var result = await user.sequelize
            .query(`with set1 as(SELECT [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] FROM [QAInspection].[dbo].[tbVisualInspection] 
                where [InspectionResult] = 'ACCEPT' and [InspectionType]= 'MP' or [InspectionType] = 'Sample'
                group by [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] )
       ,set2 as (select [QANumber],[Line_No],[Lotsize] FROM [QAInspection].[dbo].[tbQANumber] 
        group by [QANumber],[Line_No],[Lotsize] )
       
       ,set3 as(
       select [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],set1.[QANumber],'L'+[Line_No] as Line_No ,[Lotsize]  from  set1 
        left join set2
        on set1.QANumber = set2.QANumber 
        where [InspectionDate] between '${startDate}' 
        and '${finishDate}' 
        --and [Model_group] ='${Model}' 
        and [Line_No] ='${Line}' 
        )
   
       select [InspectionDate],[Line_No],[ModelNumber],[Model_group],[QANumber],
                         case when A is null then 0 else A end as SHIFT_A,
                         case when B is null then 0 else B end as SHIFT_B,
                         case when C is null then 0 else C end as SHIFT_C,
                         case when M is null then 0 else M end as SHIFT_M,
                         case when N is null then 0 else N end as SHIFT_N
                             from set3
                             PIVOT (sum([Lotsize])
                             FOR[InspectionShift] IN (A,B,C,M,N))
                             AS pvt
                             order by  Line_No `);
        } else if ((Model != "ALL") & (Line == "ALL")) {
          var result = await user.sequelize
            .query(`with set1 as(SELECT [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] FROM [QAInspection].[dbo].[tbVisualInspection] 
                where [InspectionResult] = 'ACCEPT' and [InspectionType]= 'MP' or [InspectionType] = 'Sample'
                group by [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] )
       ,set2 as (select [QANumber],[Line_No],[Lotsize] FROM [QAInspection].[dbo].[tbQANumber] 
        group by [QANumber],[Line_No],[Lotsize] )
       
       ,set3 as(
       select [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],set1.[QANumber],'L'+[Line_No] as Line_No ,[Lotsize]  from  set1 
        left join set2
        on set1.QANumber = set2.QANumber 
        where [InspectionDate] between '${startDate}' 
        and '${finishDate}' 
        and [Model_group] ='${Model}' 
        --and [Line_No] ='${Line}' 
         )
   
       select [InspectionDate],[Line_No],[ModelNumber],[Model_group],[QANumber],
                         case when A is null then 0 else A end as SHIFT_A,
                         case when B is null then 0 else B end as SHIFT_B,
                         case when C is null then 0 else C end as SHIFT_C,
                         case when M is null then 0 else M end as SHIFT_M,
                         case when N is null then 0 else N end as SHIFT_N
                             from set3
                             PIVOT (sum([Lotsize])
                             FOR[InspectionShift] IN (A,B,C,M,N))
                             AS pvt
                             order by  Line_No `);
        } else {
          var result = await user.sequelize.query(`with set1 as(SELECT [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] FROM [QAInspection].[dbo].[tbVisualInspection] 
            where [InspectionResult] = 'ACCEPT' and [InspectionType]= 'MP' or [InspectionType] = 'Sample'
            group by [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],[QANumber] )
   ,set2 as (select [QANumber],[Line_No],[Lotsize] FROM [QAInspection].[dbo].[tbQANumber] 
    group by [QANumber],[Line_No],[Lotsize] )
   
   ,set3 as(
   select [InspectionDate],[InspectionShift],[ModelNumber],[InspectionType],[InspectionResult],[Model_group],set1.[QANumber],'L'+[Line_No] as Line_No ,[Lotsize]  from  set1 
    left join set2
    on set1.QANumber = set2.QANumber 
    where [InspectionDate] between '${startDate}' 
    and '${finishDate}' 
    and [Model_group] ='${Model}' 
    and [Line_No] ='${Line}'  
    )

   select [InspectionDate],[Line_No],[ModelNumber],[Model_group],[QANumber],
                     case when A is null then 0 else A end as SHIFT_A,
                     case when B is null then 0 else B end as SHIFT_B,
                     case when C is null then 0 else C end as SHIFT_C,
                     case when M is null then 0 else M end as SHIFT_M,
                     case when N is null then 0 else N end as SHIFT_N
                         from set3
                         PIVOT (sum([Lotsize])
                         FOR[InspectionShift] IN (A,B,C,M,N))
                         AS pvt
                         order by  Line_No `);
        }
  
        var listRawData1 = [];
        listRawData1.push(result[0]);
  
        res.json({
          result: result[0],
          listRawData1,
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