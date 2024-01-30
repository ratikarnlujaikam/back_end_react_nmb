const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Hold", async (req, res) => {
  try {
    let result = await user.sequelize.query(`--Sum Co2Hold
    with set1 as (select *
    from [QAInspection].[dbo].[tbVisualInspection] [InspectionResult] 
    where InspectionResult = 'ACCEPT'
    --and InspectionDate between '2023-04-19'and '2023-04-19'
    )
    ,Set2 as (select *
    from[QAInspection].[dbo].[Record_Output_CO2]
    where [Deleter] is null 
      )
    select [MfgDate],[Line],[Item_No],[Model],[QA_No],Qty
    from Set1
    full join set2
    on set2.QA_No=set1.QANumber
    where QANumber is null
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
// router.get("/Line/:Model", async (req, res) => {
//     try {
//       var result = [[]];
//       const { Model} = req.params;
//       if (Model == "ALL") {
//         var result = await user.sequelize
//           .query(`SELECT distinct [Line] as Line
//           FROM [Temp_TransportData].[dbo].[Line_for_QRcode]`);             
//       } else {
//         var result = await user.sequelize
//           .query(`SELECT distinct [Line] as Line
//           FROM [Temp_TransportData].[dbo].[Line_for_QRcode]
// 		  where Model='${Model}'`);
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
//   });


// router.get("/SumOutputCo2/:Model/:Line/:startDate/:finishDate",
//   async (req, res) => {
//     try {
//       var result = [[]];
//       const { Model,Line,startDate,finishDate } = req.params;
//       if (Model == "ALL" && Line == "ALL") {
//         var result = await user.sequelize
//           .query(`/****** Script for SelectTopNRows command from SSMS  ******/
//           with Set1 as (SELECT [MfgDate] 
//                 ,[DateTime]
//                 ,[Shift]
//                 ,+'L'+[Line] as Line
//                 ,[Supporter]
//                 ,[Item_No]
//                 ,[Model]
//                 ,[QA_No]
//                 ,[Qty]
//                 ,[Base]
//                 ,[Ramp]
//                 ,[Diverter]
//                 ,[CrashStop]
//                 ,[Updater]
//                 ,[Remark]
//                 ,[Deleter]
//                 ,[Delete_DateTime]
//             FROM [QAInspection].[dbo].[Record_Output_CO2]
//             where [Deleter] is null 
//             and [MfgDate]between '${startDate}'and '${finishDate}'
//             )
          
//              ,set2 as (select [MfgDate],[Line],[Item_No],[Model],
//                                 case when A is null then 0 else A end as SHIFT_A,
//                                 case when B is null then 0 else B end as SHIFT_B,
//                                 case when C is null then 0 else C end as SHIFT_C,
//                                 case when M is null then 0 else M end as SHIFT_M,
//                                 case when N is null then 0 else N end as SHIFT_N
//                                     from Set1
//                                     PIVOT (sum([Qty])
//                                     FOR[Shift] IN (A,B,C,M,N))
//                                     AS pvt)
//             select [MfgDate] ,[Line],[Item_No],[Model],sum(SHIFT_A) as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C) as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N) as SHIFT_N
//             ,(sum(SHIFT_A) + sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N)) as TOTAL
//             from set2
//             group by [MfgDate],[Line],[Item_No],[Model]`);
//           } else if (Model == "All") {
//             var result = await user.sequelize.query(`/****** Script for SelectTopNRows command from SSMS  ******/
//             with Set1 as (SELECT [MfgDate]
//                   ,[DateTime]
//                   ,[Shift]
//                   ,+'L'+[Line] as Line
//                   ,[Supporter]
//                   ,[Item_No]
//                   ,[Model]
//                   ,[QA_No]
//                   ,[Qty]
//                   ,[Base]
//                   ,[Ramp]
//                   ,[Diverter]
//                   ,[CrashStop]
//                   ,[Updater]
//                   ,[Remark]
//                   ,[Deleter]
//                   ,[Delete_DateTime]
//               FROM [QAInspection].[dbo].[Record_Output_CO2]
//               where [Deleter] is null 
//               and [MfgDate]between '${startDate}'and '${finishDate}'and [Line]='${Line}'
//               )
            
//                ,set2 as (select [MfgDate],[Line],[Item_No],[Model],
//                                   case when A is null then 0 else A end as SHIFT_A,
//                                   case when B is null then 0 else B end as SHIFT_B,
//                                   case when C is null then 0 else C end as SHIFT_C,
//                                   case when M is null then 0 else M end as SHIFT_M,
//                                   case when N is null then 0 else N end as SHIFT_N
//                                       from Set1
//                                       PIVOT (sum([Qty])
//                                       FOR[Shift] IN (A,B,C,M,N))
//                                       AS pvt)
//               select [MfgDate],[Line],[Item_No],[Model],sum(SHIFT_A) as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C) as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N) as SHIFT_N
//               ,(sum(SHIFT_A) + sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N)) as TOTAL
//               from set2
//               group by [MfgDate],[Line],[Item_No],[Model]`);
                          
//       } else {
//         var result = await user.sequelize
//           .query(`/****** Script for SelectTopNRows command from SSMS  ******/
//           with Set1 as (SELECT [MfgDate]
//                 ,[DateTime]
//                 ,[Shift]
//                 ,+'L'+[Line] as Line
//                 ,[Supporter]
//                 ,[Item_No]
//                 ,[Model]
//                 ,[QA_No]
//                 ,[Qty]
//                 ,[Base]
//                 ,[Ramp]
//                 ,[Diverter]
//                 ,[CrashStop]
//                 ,[Updater]
//                 ,[Remark]
//                 ,[Deleter]
//                 ,[Delete_DateTime]
//             FROM [QAInspection].[dbo].[Record_Output_CO2]
//             where [Deleter] is null 
//             and [MfgDate]between '${startDate}'and '${finishDate}'and [Model]='${Model}'and [Line]='${Line}'
//             )
          
//              ,set2 as (select [MfgDate],[Line],[Item_No],[Model],
//                                 case when A is null then 0 else A end as SHIFT_A,
//                                 case when B is null then 0 else B end as SHIFT_B,
//                                 case when C is null then 0 else C end as SHIFT_C,
//                                 case when M is null then 0 else M end as SHIFT_M,
//                                 case when N is null then 0 else N end as SHIFT_N
//                                     from Set1
//                                     PIVOT (sum([Qty])
//                                     FOR[Shift] IN (A,B,C,M,N))
//                                     AS pvt)
//             select [MfgDate],[Line],[Item_No],[Model],sum(SHIFT_A) as SHIFT_A,sum(SHIFT_B)as SHIFT_B,sum(SHIFT_C) as SHIFT_C,sum(SHIFT_M)as SHIFT_M,sum(SHIFT_N) as SHIFT_N
//             ,(sum(SHIFT_A) + sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N)) as TOTAL
//             from set2
//             group by [MfgDate],[Line],[Item_No],[Model]`);
//       }
 

//       var listRawData = [];
//       listRawData.push(result[0]);

//       res.json({
//         result: result[0],
//         listRawData,
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

// router.get("/DetailOutputCo2/:Model/:Line/:startDate/:finishDate",
//   async (req, res) => {
//     try {
//       var result = [[]];
//       const { Model,Line,startDate,finishDate } = req.params;
//       if (Model == "ALL" && Line == "ALL") {
//         var result = await user.sequelize
//           .query(`--Detail--OutputCo2
//           /****** Script for SelectTopNRows command from SSMS  ******/
//           with Set1 as (SELECT [MfgDate]
//                 ,[DateTime]
//                 ,[Shift]
//                 ,+'L'+[Line] as Line
//                 ,[Supporter]
//                 ,[Item_No]
//                 ,[Model]
//                 ,[QA_No]
//                 ,[Qty]
//                 ,[Base]
//                 ,[Ramp]
//                 ,[Diverter]
//                 ,[CrashStop]
//                 ,[Updater]
//                 ,[Remark]
//                 ,[Deleter]
//                 ,[Delete_DateTime]
//             FROM [QAInspection].[dbo].[Record_Output_CO2]
//             where [Deleter] is null 
//             and [MfgDate]between '${startDate}'and '${finishDate}'
//             )
//              select [MfgDate],[Line],[Item_No],[Model],[QA_No],
//                                 case when A is null then 0 else A end as SHIFT_A,
//                                 case when B is null then 0 else B end as SHIFT_B,
//                                 case when C is null then 0 else C end as SHIFT_C,
//                                 case when M is null then 0 else M end as SHIFT_M,
//                                 case when N is null then 0 else N end as SHIFT_N
//                                     from Set1
//                                     PIVOT (sum([Qty])
//                                     FOR[Shift] IN (A,B,C,M,N))
//                                     AS pvt`);
//           } else if (Model == "All") {
//             var result = await user.sequelize.query(`/****** Script for SelectTopNRows command from SSMS  ******/
//             --Detail--OutputCo2
//           /****** Script for SelectTopNRows command from SSMS  ******/
//           with Set1 as (SELECT [MfgDate]
//                 ,[DateTime]
//                 ,[Shift]
//                 ,+'L'+[Line] as Line
//                 ,[Supporter]
//                 ,[Item_No]
//                 ,[Model]
//                 ,[QA_No]
//                 ,[Qty]
//                 ,[Base]
//                 ,[Ramp]
//                 ,[Diverter]
//                 ,[CrashStop]
//                 ,[Updater]
//                 ,[Remark]
//                 ,[Deleter]
//                 ,[Delete_DateTime]
//             FROM [QAInspection].[dbo].[Record_Output_CO2]
//             where [Deleter] is null 
//             and [MfgDate]between '${startDate}'and '${finishDate}'and [Model]='${Model}'and [Line]='${Line}'
//             )
//              select [MfgDate],[Line],[Item_No],[Model],[QA_No],
//                                 case when A is null then 0 else A end as SHIFT_A,
//                                 case when B is null then 0 else B end as SHIFT_B,
//                                 case when C is null then 0 else C end as SHIFT_C,
//                                 case when M is null then 0 else M end as SHIFT_M,
//                                 case when N is null then 0 else N end as SHIFT_N
//                                     from Set1
//                                     PIVOT (sum([Qty])
//                                     FOR[Shift] IN (A,B,C,M,N))
//                                     AS pvt`);
                          
//       } else {
//         var result = await user.sequelize
//           .query(`--Detail--OutputCo2
//           /****** Script for SelectTopNRows command from SSMS  ******/
//           with Set1 as (SELECT [MfgDate]
//                 ,[DateTime]
//                 ,[Shift]
//                 ,+'L'+[Line] as Line
//                 ,[Supporter]
//                 ,[Item_No]
//                 ,[Model]
//                 ,[QA_No]
//                 ,[Qty]
//                 ,[Base]
//                 ,[Ramp]
//                 ,[Diverter]
//                 ,[CrashStop]
//                 ,[Updater]
//                 ,[Remark]
//                 ,[Deleter]
//                 ,[Delete_DateTime]
//             FROM [QAInspection].[dbo].[Record_Output_CO2]
//             where [Deleter] is null 
//             and [MfgDate]between '${startDate}'and '${finishDate}'and [Line]='${Line}'and
//             )
//              select [MfgDate],[Line],[Item_No],[Model],[QA_No],
//                                 case when A is null then 0 else A end as SHIFT_A,
//                                 case when B is null then 0 else B end as SHIFT_B,
//                                 case when C is null then 0 else C end as SHIFT_C,
//                                 case when M is null then 0 else M end as SHIFT_M,
//                                 case when N is null then 0 else N end as SHIFT_N
//                                     from Set1
//                                     PIVOT (sum([Qty])
//                                     FOR[Shift] IN (A,B,C,M,N))
//                                     AS pvt`);
//       }
 

//       var listRawData1 = [];
//       listRawData1.push(result[0]);

//       res.json({
//         result: result[0],
//         listRawData1,
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
