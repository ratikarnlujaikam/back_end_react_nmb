const express = require("express");
const router = express.Router();
const user = require("../database/models/user");


router.get(
  "/matching/:selectDate/:model/:parameter/:productionline/:selectMCname",
  async (req, res) => {
    try {
      const { selectDate, model, parameter, productionline, selectMCname } =
        req.params;

      let resultAVG = await user.sequelize.query(`With TimeTable (N) as
      (select [Hour] = V.number FROM master..spt_values V WHERE V.type = 'P'AND V.number >= 0 AND V.number <= 23
       ),
       selectTime (T) as (select convert(varchar(10),N) as [Time] from TimeTable),
       
       XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as 
     (select cast(DATEPART(hour,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as varchar) as [hr]
     ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120 
     then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) 
     when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120 then 0 end as [C/T in sec]
     ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120 
     then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) 
     when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120 then 0 end as [D/T]
     ,case when [DataforAnalysis].[dbo].[Data_matching].[${parameter}] > 0 then [DataforAnalysis].[dbo].[Data_matching].[${parameter}] end as [Parameter]
     ,[DataforAnalysis].[dbo].[Data_matching].[Model] as [model]
     ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
     ,[TransportData].[dbo].[Master_matchings].CL as [CL]
     ,[TransportData].[dbo].[Master_matchings].USL as [USL]
     ,'Average' as [AVG]
     FROM [DataforAnalysis].[dbo].[Data_matching]
     INNER JOIN [TransportData].[dbo].[Master_matchings]
     ON [DataforAnalysis].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
     where CONVERT(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) = '${selectDate}'
     and [DataforAnalysis].[dbo].[Data_matching].[Model] = '${model}'
     and [DataforAnalysis].[dbo].[Data_matching].[Line] = '${productionline}'
     and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
     and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
     ),
     XO (x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) as(
     select x1 as [Time]
     ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
     convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end)
     + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2) ) as [%Yield]
     ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
     ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
     ,cast(AVG(x4) as decimal(10,3)) as [AVG]
     ,cast(stdev(x4) as decimal(10,3)) as [STD]
     ,case when (cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) or
     ((cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) and x6 = 0)
     then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
     > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
     then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
     = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
     then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
     ,x5 as [Model]
     ,x6 as [LSL]
     ,x7 as [CL]
     ,x8 as [USL]
     ,x9 as [Machine]
     from XT
     group by x1,x5,x6,x7,x8,x9),
     COL (USL, CL, LSL) as (
     select distinct x11 as [USL]
     ,x10 as [CL]
     ,x9 as [LSL]
      from XO
     )
   
     select T + ':00' as [Time]
     ,XO.x2 as [%Yield]
     ,XO.x3 as [Cycle_time (sec)]
     ,XO.x4 as [Down time (min)]
     ,XO.x5 as [AVG]
     ,XO.x6 as [STD]
     ,XO.x7 as [CPK]
     ,XO.x8 as [Model]
     ,COL.LSL as [LSL]
     ,COL.CL as [CL]
     ,COL.USL as [USL]
     ,XO.x12 as [Machine]
   
     from selectTime full outer join XO
     on selectTime.T = XO.x1
     join COL on COL.USL is not null and COL.LSL is not null and COL.CL is not null
     order by T + 0`);

     let dataAverage = [];
     let dataSTD = [];
     let LSL = [];
     let USL = [];
     let CL = [];
     resultAVG[0].forEach(async (item) => {
       await dataAverage.push(item.AVG);
       await dataSTD.push(item.STD);
       await LSL.push(item.LSL);
       await USL.push(item.USL);
       await CL.push(item.CL);
     });

      let series = { name: "Average", data: dataAverage, title: parameter };
      let seriesSD = { name: "STD", data: dataSTD };
      let dataLSL = { name: "LSL", data: LSL };
      let dataUSL = { name: "USL", data: USL };
      // let dataCL = { name: "CL", data: CL };
      let seriesY = [series];
      let seriesSTD = [seriesSD];
      let seriesLSL = [dataLSL];
      let seriesUSL = [dataUSL];
      // let seriesCL = [dataCL];

      // -----------------------------------

      var selectMC = JSON.parse(selectMCname);
      var listResult = [];
      //AVG
      var listDataAverage = [];
      var seriesMC = [];
      //STD
      var listDataSTD = [];
      var seriesMCSTD = [];
      //Q'ty
      var listDataCount = [];
      var seriesMCCount = [];

      //raw data
      var listRawData = [];

      for (let index = 0; index < selectMC.length; index++) {
        const arrayMC = selectMC[index];

        let result = await user.sequelize
          .query(`With TimeTable (N) as
          (select [Hour] = V.number FROM master..spt_values V WHERE V.type = 'P'AND V.number >= 0 AND V.number <= 23
          ),
       
       selectTime (T) as (select convert(varchar(10),N) as [Time] from TimeTable),
       XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as 
         (select cast(DATEPART(hour,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as varchar) as [hr]
         ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120 
         then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) 
         when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120 then 0 end as [C/T in sec]
         ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120 
         then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) 
         when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120 then 0 end as [D/T]
         ,case when [DataforAnalysis].[dbo].[Data_matching].[${parameter}] > 0 then [DataforAnalysis].[dbo].[Data_matching].[${parameter}] end as [Parameter]
         ,[DataforAnalysis].[dbo].[Data_matching].[Model] as [model]
         ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
         ,[TransportData].[dbo].[Master_matchings].CL as [CL]
         ,[TransportData].[dbo].[Master_matchings].USL as [USL]
         ,[DataforAnalysis].[dbo].[Data_matching].[MC_${parameter}] as [MC]
         FROM [DataforAnalysis].[dbo].[Data_matching]
         INNER JOIN [TransportData].[dbo].[Master_matchings]
         ON [DataforAnalysis].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
         where CONVERT(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) = '${selectDate}'
         and [DataforAnalysis].[dbo].[Data_matching].[Model] = '${model}'
         and [DataforAnalysis].[dbo].[Data_matching].[Line] = '${productionline}'
         and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
         and [DataforAnalysis].[dbo].[Data_matching].[MC_${parameter}] = '${arrayMC}'
         and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
         ),
         XO (x1,x2,x3,x4,x5,x6,x7,x8,x9) as(
         select x1 as [Time]
         ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
         convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end)
         + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2) ) as [%Yield]
         ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
         ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
         ,cast(AVG(x4) as decimal(10,3)) as [AVG]
         ,cast(stdev(x4) as decimal(10,3)) as [STD]
         ,case when (cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) or
         ((cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) and x6 = 0)
         then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
         > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
         then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
         = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
         then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
         ,x5 as [Model]
         ,x9 as [Machine]
         from XT
         group by x1,x5,x6,x7,x8,x9
         having STDEV(x4) != 0 and STDEV(x4) is not null)
       
         select T  +':00' as [Time]
         ,XO.x2 as [%Yield]
         ,XO.x3 as [Cycle_time (sec)]
         ,XO.x4 as [Down time (min)]
         ,XO.x5 as [AVG]
         ,XO.x6 as [STD]
         ,XO.x7 as [CPK]
         ,XO.x8 as [Model]
         ,XO.x9 as [Machine]
       
         from selectTime full outer join XO
         on selectTime.T = XO.x1
         order by T + 0`);

        listResult.push(result[0]);

        //AVG
        let dataAverage = [];
        for (let i = 0; i < result[0].length; i++) {
          dataAverage.push(result[0][i].AVG);
        }
        listDataAverage.push(dataAverage);

        let DataSeries = [];
        for (let i = 0; i < listDataAverage.length; i++) {
          DataSeries = { name: selectMC[i], data: listDataAverage[i] };
        }
        seriesMC.push(DataSeries);

        //STD
        let dataSTD = [];
        for (let i = 0; i < result[0].length; i++) {
          dataSTD.push(result[0][i].STD);
        }
        listDataSTD.push(dataSTD);

        let DataSeriesSTD = [];
        for (let i = 0; i < listDataSTD.length; i++) {
          DataSeriesSTD = { name: selectMC[i], data: listDataSTD[i] };
        }
        seriesMCSTD.push(DataSeriesSTD);

        //Q'ty
        let dataCount = [];
        for (let i = 0; i < result[0].length; i++) {
          dataCount.push(result[0][i].Count);
        }
        listDataCount.push(dataCount);

        let DataSeriesCount = [];
        for (let i = 0; i < listDataCount.length; i++) {
          DataSeriesCount = { name: selectMC[i], data: listDataCount[i] };
        }
        seriesMCCount.push(DataSeriesCount);

        //RAW DATA
        let raw_data = await user.sequelize.query(`
        select [DataforAnalysis].[dbo].[Data_matching].*
         FROM [DataforAnalysis].[dbo].[Data_matching]
         INNER JOIN [TransportData].[dbo].[Master_matchings]
         ON [DataforAnalysis].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
         where CONVERT(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) = '${selectDate}'
         and [DataforAnalysis].[dbo].[Data_matching].[Model] = '${model}'
         and [DataforAnalysis].[dbo].[Data_matching].[Line] = '${productionline}'
         and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
         and [DataforAnalysis].[dbo].[Data_matching].[MC_${parameter}] = '${arrayMC}'
         and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])

      `);
        listRawData.push(raw_data[0]);
      }

      //-------------------------------

      let controlLimit = await user.sequelize
        .query(`select [LCL],[UCL],[CL],[CL_STD],[LCL_STD],[UCL_STD],[createdAt]
      FROM [TransportData].[dbo].[ControlSpecs]
      where [Model] = '${model}' and [Parameter] = '${parameter}' and [Line] = '${productionline}'
      and [createdAt] = (select(max([createdAt])) from [TransportData].[dbo].[ControlSpecs]
      where [Model] = '${model}' and [Parameter] = '${parameter}' and [Line] = '${productionline}')
      group by [LCL],[UCL],[CL],[CL_STD],[LCL_STD],[UCL_STD],[createdAt]`);

      var LCL = [];
      var UCL = [];
      var LCL_STD = [];
      var UCL_STD = [];
   
      var CL_STD = [];

      if (
        parameter == "Parallelism_Stack" ||
        parameter == "Parallelism_Attractive"
      ) {
        for (let i = 0; i < resultAVG[0].length; i++) {
          UCL.push(controlLimit[0][0].UCL);
          UCL_STD.push(controlLimit[0][0].UCL_STD);
        }
      } else {
        for (let i = 0; i < resultAVG[0].length; i++) {
          LCL.push(controlLimit[0][0].LCL);
          UCL.push(controlLimit[0][0].UCL);
          LCL_STD.push(controlLimit[0][0].LCL_STD);
          UCL_STD.push(controlLimit[0][0].UCL_STD);
          CL.push(controlLimit[0][0].CL);
          CL_STD.push(controlLimit[0][0].CL_STD);
        }
      }

      let seriesLCL = { name: "LCL", data: LCL };
      let seriesUCL = { name: "UCL", data: UCL };
      let seriesLCL_STD = { name: "LCL_STD", data: LCL_STD };
      let seriesUCL_STD = { name: "UCL_STD", data: UCL_STD };
      let seriesCL = { name: "CL", data: CL };
      let seriesCL_STD = { name: "LCL_STD", data: CL_STD };

      res.json({
        resultAVG: resultAVG[0],
        seriesY: seriesY[0],
        seriesSTD: seriesSTD[0],

        seriesLSL: seriesLSL[0],
        seriesUSL: seriesUSL[0],
        seriesCL,
        seriesLCL,
        seriesUCL,
        seriesLCL_STD,
        seriesUCL_STD,
        seriesCL_STD,
        controlLimit,

        listResult,
        listDataAverage,
        seriesMC,
        listDataSTD,
        seriesMCSTD,
        listDataCount,
        seriesMCCount,
        listRawData,

        controlLimit: controlLimit[0],

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
  "/matchingday/:startDate/:finishDate/:model/:parameter/:productionline/:selectMCname",
  async (req, res) => {
    try {
      const {
        startDate,
        finishDate,
        model,
        parameter,
        productionline,
        selectMCname,
      } = req.params;

      let resultAVGday = await user.sequelize
        .query(`DECLARE @StartDate DATE = '${startDate}',
        @EndDate DATE = '${finishDate}';
WITH N1 (N) AS (SELECT 1 FROM (VALUES (1), (1), (1), (1), (1), (1), (1), (1), (1), (1)) n (N)),
N2 (N) AS (SELECT 1 FROM N1 AS N1 CROSS JOIN N1 AS N2),
N3 (N) AS (SELECT 1 FROM N2 AS N1 CROSS JOIN N2 AS N2),
selectDate (d) as (SELECT TOP (DATEDIFF(DAY, @StartDate, @EndDate) + 1)
        Date = DATEADD(DAY, ROW_NUMBER() OVER(ORDER BY N) - 1, @StartDate)
FROM N3),
XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as
  (select convert(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as [Date]
  ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120
  then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time))
  when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120 then 0 end as [C/T in sec]
  ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120
  then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time))
  when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120 then 0 end as [D/T]
  ,case when [DataforAnalysis].[dbo].[Data_matching].[${parameter}] > 0 then [DataforAnalysis].[dbo].[Data_matching].[${parameter}] end as [Parameter]
  ,[DataforAnalysis].[dbo].[Data_matching].[Model] as [model]
  ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
  ,[TransportData].[dbo].[Master_matchings].CL as [CL]
  ,[TransportData].[dbo].[Master_matchings].USL as [USL]
  ,'Average' as [AVG]
  FROM [DataforAnalysis].[dbo].[Data_matching]
  INNER JOIN [TransportData].[dbo].[Master_matchings]
  ON [DataforAnalysis].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
  where CONVERT(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) BETWEEN '${startDate}' AND '${finishDate}'
  and [DataforAnalysis].[dbo].[Data_matching].[Model] = '${model}'
  and [DataforAnalysis].[dbo].[Data_matching].[Line] = '${productionline}'
  and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
  and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
  ),
  XO (x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) as(
  select x1 as [Date]
  ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
  convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end)
  + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2) ) as [%Yield]
  ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
  ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
  ,cast(AVG(x4) as decimal(10,3)) as [AVG]
  ,cast(stdev(x4) as decimal(10,3)) as [STD]
  ,case when (cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) or
  ((cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) and x6 = 0)
  then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
  > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
  then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
  = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
  then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
  ,x5 as [Model]
  ,x6 as [LSL]
  ,x7 as [CL]
  ,x8 as [USL]
  ,x9 as [Machine]
  from XT
  group by x1,x5,x6,x7,x8,x9
  having STDEV(x4) != 0 and STDEV(x4) is not null),

  COL (USL, CL, LSL) as (
	select distinct x11 as [USL]
	,x10 as [CL]
	,x9 as [LSL]
	 from XO
  )

  select d as [Date]
  ,XO.x2 as [%Yield]
  ,XO.x3 as [Cycle_time (sec)]
  ,XO.x4 as [Down time (min)]
  ,XO.x5 as [AVG]
  ,XO.x6 as [STD]
  ,XO.x7 as [CPK]
  ,XO.x8 as [Model]
  ,COL.LSL as [LSL]
  ,COL.CL as [CL]
  ,COL.USL as [USL]
  ,XO.x12 as [Machine]

  from selectDate full outer join XO
  on selectDate.d = XO.x1
  join COL on COL.USL is not null and COL.LSL is not null and COL.CL is not null
  order by d
   `);
      let dataAverageday = [];
      let dataSTDDay = [];
      let LSL = [];
      let USL = [];

      resultAVGday[0].forEach(async (item) => {
        await dataAverageday.push(item.AVG);
        await dataSTDDay.push(item.STD);
        await LSL.push(item.LSL);
        await USL.push(item.USL);
 
      });

      let seriesday = {
        name: "Average",
        data: dataAverageday,
        titleday: parameter,
      };
      let seriesSDDay = { name: "STD", data: dataSTDDay };
      let dataLSL = { name: "LSL", data: LSL };
      let dataUSL = { name: "USL", data: USL };
      // let dataCL = { name: "CL", data: CL };
      let seriesYday = [seriesday];
      let seriesSTDDay = [seriesSDDay];
      let seriesLSL = [dataLSL];
      let seriesUSL = [dataUSL];
      // let seriesCL = [dataCL];

      // -----------------------------------

      var selectMCday = JSON.parse(selectMCname);
      var listResultday = [];
      //AVG
      var listDataAverageday = [];
      var seriesMCday = [];
      //STD
      var listDataSTDDay = [];
      var seriesMCSTDDay = [];
      //Q'ty
      var listDataCountDay = [];
      var seriesMCCountDay = [];
      var listRawData = [];
      
      for (let index = 0; index < selectMCday.length; index++) {
        const arrayMC = selectMCday[index];

        let resultday = await user.sequelize
          .query(`DECLARE @StartDate DATE = '${startDate}',
          @EndDate DATE = '${finishDate}';
  WITH N1 (N) AS (SELECT 1 FROM (VALUES (1), (1), (1), (1), (1), (1), (1), (1), (1), (1)) n (N)),
  N2 (N) AS (SELECT 1 FROM N1 AS N1 CROSS JOIN N1 AS N2),
  N3 (N) AS (SELECT 1 FROM N2 AS N1 CROSS JOIN N2 AS N2),
  selectDate (d) as (SELECT TOP (DATEDIFF(DAY, @StartDate, @EndDate) + 1)
          Date = DATEADD(DAY, ROW_NUMBER() OVER(ORDER BY N) - 1, @StartDate)
  FROM N3),
  XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as
    (select convert(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as [Date]
    ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over
  (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120
    then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time))
    when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120 then 0 end as [C/T in sec]
    ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over
  (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120
    then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time))
    when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120 then 0 end as [D/T]
    ,case when [DataforAnalysis].[dbo].[Data_matching].[${parameter}] > 0 then [DataforAnalysis].[dbo].[Data_matching].[${parameter}] end as [Parameter]
    ,[DataforAnalysis].[dbo].[Data_matching].[Model] as [model]
    ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
    ,[TransportData].[dbo].[Master_matchings].CL as [CL]
    ,[TransportData].[dbo].[Master_matchings].USL as [USL]
    ,[DataforAnalysis].[dbo].[Data_matching].[MC_${parameter}] as [MC]
    FROM [DataforAnalysis].[dbo].[Data_matching]
    INNER JOIN [TransportData].[dbo].[Master_matchings]
    ON [DataforAnalysis].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
    where CONVERT(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) BETWEEN '${startDate}' AND '${finishDate}'
    and [DataforAnalysis].[dbo].[Data_matching].[Model] = '${model}'
    and [DataforAnalysis].[dbo].[Data_matching].[Line] = '${productionline}'
    and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
    and [DataforAnalysis].[dbo].[Data_matching].[MC_${parameter}] = '${arrayMC}'
    and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
    ),
    XO (x1,x2,x3,x4,x5,x6,x7,x8,x9) as(
    select x1 as [Date]
    ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
    convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end)
    + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2) ) as [%Yield]
    ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
    ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
    ,cast(AVG(x4) as decimal(10,3)) as [AVG]
    ,cast(stdev(x4) as decimal(10,3)) as [STD]
    ,case when (cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) or
    ((cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) and x6 = 0)
    then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
    > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
    then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
    = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
    then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
    ,x5 as [Model]
    ,x9 as [Machine]
    from XT
    group by x1,x5,x6,x7,x8,x9)
  
    select d as [Date]
    ,XO.x2 as [%Yield]
    ,XO.x3 as [Cycle_time (sec)]
    ,XO.x4 as [Down time (min)]
    ,XO.x5 as [AVG]
    ,XO.x6 as [STD]
    ,XO.x7 as [CPK]
    ,XO.x8 as [Model]
    ,XO.x9 as [Machine]
    
    from selectDate full outer join XO 
    on selectDate.d = XO.x1
    order by d`);

        listResultday.push(resultday[0]);

        //RAW DATA
        let raw_data = await user.sequelize.query(`
        select [DataforAnalysis].[dbo].[Data_matching].*
        FROM [DataforAnalysis].[dbo].[Data_matching]
        INNER JOIN [TransportData].[dbo].[Master_matchings]
        ON [DataforAnalysis].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
        where CONVERT(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) BETWEEN '${startDate}' AND '${finishDate}'
        and [DataforAnalysis].[dbo].[Data_matching].[Model] = '${model}'
        and [DataforAnalysis].[dbo].[Data_matching].[Line] = '${productionline}'
        and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
        and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])

       `);
        listRawData.push(raw_data[0]);

        //AVG
        let dataAverageday = [];
        for (let i = 0; i < resultday[0].length; i++) {
          dataAverageday.push(resultday[0][i].AVG);
        }
        listDataAverageday.push(dataAverageday);

        let DataSeriesday = [];
        for (let i = 0; i < listDataAverageday.length; i++) {
          DataSeriesday = { name: selectMCday[i], data: listDataAverageday[i] };
        }
        seriesMCday.push(DataSeriesday);

        //STDEV
        let dataSTDDay = [];
        for (let i = 0; i < resultday[0].length; i++) {
          dataSTDDay.push(resultday[0][i].STD);
        }
        listDataSTDDay.push(dataSTDDay);

        let DataSeriesSTDDay = [];
        for (let i = 0; i < listDataSTDDay.length; i++) {
          DataSeriesSTDDay = { name: selectMCday[i], data: listDataSTDDay[i] };
        }
        seriesMCSTDDay.push(DataSeriesSTDDay);

        //Q'ty
        let dataCountDay = [];
        for (let i = 0; i < resultday[0].length; i++) {
          dataCountDay.push(resultday[0][i].Count);
        }
        listDataCountDay.push(dataCountDay);

        let DataSeriesCountDay = [];
        for (let i = 0; i < listDataCountDay.length; i++) {
          DataSeriesCountDay = {
            name: selectMCday[i],
            data: listDataCountDay[i],
          };
        }
        seriesMCCountDay.push(DataSeriesCountDay);
      }

      let controlLimit = await user.sequelize
        .query(`
        select [LCL],[UCL],[CL],[CL_STD],[LCL_STD],[UCL_STD],[createdAt]
      FROM [TransportData].[dbo].[ControlSpecs]
      where [Model] = '${model}' and [Parameter] = '${parameter}' and [Line] = '${productionline}'
      and [createdAt] = (select(max([createdAt])) from [TransportData].[dbo].[ControlSpecs]
      where [Model] = '${model}' and [Parameter] = '${parameter}' and [Line] = '${productionline}')
      group by [LCL],[UCL],[CL],[CL_STD],[LCL_STD],[UCL_STD],[createdAt]`);
    

      var LCL = [];
      var UCL = [];
      var LCL_STD = [];
      var UCL_STD = [];
      var CL = [];
      var CL_STD = [];

      if (
        parameter == "Parallelism_Stack" ||
        parameter == "Parallelism_Attractive"
      ) {
        for (let i = 0; i < resultAVGday[0].length; i++) {
          UCL.push(controlLimit[0][0].UCL);
          UCL_STD.push(controlLimit[0][0].UCL_STD);
        }
      } else {
        for (let i = 0; i < resultAVGday[0].length; i++) {
          LCL.push(controlLimit[0][0].LCL);
          UCL.push(controlLimit[0][0].UCL);
          LCL_STD.push(controlLimit[0][0].LCL_STD);
          UCL_STD.push(controlLimit[0][0].UCL_STD);
          CL.push(controlLimit[0][0].CL);
          CL_STD.push(controlLimit[0][0].CL_STD);
        }
      }

      let seriesLCL = { name: "LCL", data: LCL };
      let seriesUCL = { name: "UCL", data: UCL };
      let seriesLCL_STD = { name: "LCL_STD", data: LCL_STD };
      let seriesUCL_STD = { name: "UCL_STD", data: UCL_STD };
      let seriesCL = { name: "CL", data: CL };
      let seriesCL_STD = { name: "CL_STD", data: CL_STD };

      let dateswap = [];

      resultAVGday[0].forEach(async (item) => {
        await dateswap.push(item.Date);
      });

      let Dateswap = dateswap.reverse();

      res.json({
        resultAVGday: resultAVGday[0],
        seriesYday: seriesYday[0],
        seriesSTDDay: seriesSTDDay[0],

        seriesLSL: seriesLSL[0],
        seriesUSL: seriesUSL[0],
        seriesCL,
        seriesLCL,
        seriesUCL,
        seriesLCL_STD,
        seriesUCL_STD,
        seriesCL_STD,
        controlLimit,

        listResultday,
        listDataAverageday,
        seriesMCday,
        listDataSTDDay,
        seriesMCSTDDay,
        listDataCountDay,
        seriesMCCountDay,

        controlLimit: controlLimit[0],

        Dateswap,
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
// //DataPerDay
// router.get(
//   "/matchingday/:startDate/:finishDate/:model/:parameter/:productionline/:selectMCname",
//   async (req, res) => {
//     try {
//       const {
//         startDate,
//         finishDate,
//         model,
//         parameter,
//         productionline,
//         selectMCname,
//       } = req.params;

//       let resultAVGday = await user.sequelize
//         .query(`DECLARE @StartDate DATE = '${startDate}',
//         @EndDate DATE = '${finishDate}';
// WITH N1 (N) AS (SELECT 1 FROM (VALUES (1), (1), (1), (1), (1), (1), (1), (1), (1), (1)) n (N)),
// N2 (N) AS (SELECT 1 FROM N1 AS N1 CROSS JOIN N1 AS N2),
// N3 (N) AS (SELECT 1 FROM N2 AS N1 CROSS JOIN N2 AS N2),
// selectDate (d) as (SELECT TOP (DATEDIFF(DAY, @StartDate, @EndDate) + 1)
//         Date = DATEADD(DAY, ROW_NUMBER() OVER(ORDER BY N) - 1, @StartDate)
// FROM N3),
// XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as
//   (select convert(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as [Date]
//   ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120
//   then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time))
//   when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120 then 0 end as [C/T in sec]
//   ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120
//   then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time))
//   when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120 then 0 end as [D/T]
//   ,case when [DataforAnalysis].[dbo].[Data_matching].[${parameter}] > 0 then [DataforAnalysis].[dbo].[Data_matching].[${parameter}] end as [Parameter]
//   ,[DataforAnalysis].[dbo].[Data_matching].[Model] as [model]
//   ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
//   ,[TransportData].[dbo].[Master_matchings].CL as [CL]
//   ,[TransportData].[dbo].[Master_matchings].USL as [USL]
//   ,'Average' as [AVG]
//   FROM [DataforAnalysis].[dbo].[Data_matching]
//   INNER JOIN [TransportData].[dbo].[Master_matchings]
//   ON [DataforAnalysis].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
//   where CONVERT(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) BETWEEN '${startDate}' AND '${finishDate}'
//   and [DataforAnalysis].[dbo].[Data_matching].[Model] = '${model}'
//   and [DataforAnalysis].[dbo].[Data_matching].[Line] = '${productionline}'
//   and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
//   and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
//   ),
//   XO (x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) as(
//   select x1 as [Date]
//   ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
//   convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end)
//   + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2) ) as [%Yield]
//   ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
//   ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
//   ,cast(AVG(x4) as decimal(10,3)) as [AVG]
//   ,cast(stdev(x4) as decimal(10,3)) as [STD]
//   ,case when (cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) or
//   ((cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) and x6 = 0)
//   then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
//   > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
//   then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
//   = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
//   then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
//   ,x5 as [Model]
//   ,x6 as [LSL]
//   ,x7 as [CL]
//   ,x8 as [USL]
//   ,x9 as [Machine]
//   from XT
//   group by x1,x5,x6,x7,x8,x9
//   having STDEV(x4) != 0 and STDEV(x4) is not null),

//   COL (USL, CL, LSL) as (
// 	select distinct x11 as [USL]
// 	,x10 as [CL]
// 	,x9 as [LSL]
// 	 from XO
//   )

//   select d as [Date]
//   ,XO.x2 as [%Yield]
//   ,XO.x3 as [Cycle_time (sec)]
//   ,XO.x4 as [Down time (min)]
//   ,XO.x5 as [AVG]
//   ,XO.x6 as [STD]
//   ,XO.x7 as [CPK]
//   ,XO.x8 as [Model]
//   ,COL.LSL as [LSL]
//   ,COL.CL as [CL]
//   ,COL.USL as [USL]
//   ,XO.x12 as [Machine]

//   from selectDate full outer join XO
//   on selectDate.d = XO.x1
//   join COL on COL.USL is not null and COL.LSL is not null and COL.CL is not null
//   order by d`);

//       let dataAverageday = [];
//       let dataSTDDay = [];
//       let LSL = [];
//       let USL = [];
//       let CL = [];
//       resultAVGday[0].forEach(async (item) => {
//         await dataAverageday.push(item.AVG);
//         await dataSTDDay.push(item.STD);
//         await LSL.push(item.LSL);
//         await USL.push(item.USL);
//         await CL.push(item.CL);
//       });

//       let seriesday = { name: "Average", data: dataAverageday, titleday: parameter, };
//       let seriesSDDay = { name: "STD", data: dataSTDDay, };
//       let dataLSL = { name: "LSL", data: LSL };
//       let dataUSL = { name: "USL", data: USL };
//       let dataCL = { name: "CL", data: CL };
//       let seriesYday = [seriesday];
//       let seriesSTDDay = [seriesSDDay];
//       let seriesLSL = [dataLSL];
//       let seriesUSL = [dataUSL];
//       let seriesCL = [dataCL];

//       // -----------------------------------

//       var selectMCday = JSON.parse(selectMCname);
//       var listResultday = [];
//       //AVG
//       var listDataAverageday = [];
//       var seriesMCday = [];
//       //STD
//       var listDataSTDDay = [];
//       var seriesMCSTDDay = [];

//       for (let index = 0; index < selectMCday.length; index++) {
//         const arrayMC = selectMCday[index];

//         let resultday = await user.sequelize
//           .query(`DECLARE @StartDate DATE = '${startDate}',
//           @EndDate DATE = '${finishDate}';
//   WITH N1 (N) AS (SELECT 1 FROM (VALUES (1), (1), (1), (1), (1), (1), (1), (1), (1), (1)) n (N)),
//   N2 (N) AS (SELECT 1 FROM N1 AS N1 CROSS JOIN N1 AS N2),
//   N3 (N) AS (SELECT 1 FROM N2 AS N1 CROSS JOIN N2 AS N2),
//   selectDate (d) as (SELECT TOP (DATEDIFF(DAY, @StartDate, @EndDate) + 1)
//           Date = DATEADD(DAY, ROW_NUMBER() OVER(ORDER BY N) - 1, @StartDate)
//   FROM N3),
//   XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as
//     (select convert(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as [Date]
//     ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over
//   (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120
//     then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time))
//     when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120 then 0 end as [C/T in sec]
//     ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over
//   (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) >= 120
//     then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time))
//     when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Data_matching].[Timestamp]) over (order by [DataforAnalysis].[dbo].[Data_matching].[Timestamp] desc) - [DataforAnalysis].[dbo].[Data_matching].[Timestamp]) as time)) < 120 then 0 end as [D/T]
//     ,case when [DataforAnalysis].[dbo].[Data_matching].[${parameter}] > 0 then [DataforAnalysis].[dbo].[Data_matching].[${parameter}] end as [Parameter]
//     ,[DataforAnalysis].[dbo].[Data_matching].[Model] as [model]
//     ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
//     ,[TransportData].[dbo].[Master_matchings].CL as [CL]
//     ,[TransportData].[dbo].[Master_matchings].USL as [USL]
//     ,[DataforAnalysis].[dbo].[Data_matching].[MC_${parameter}] as [MC]
//     FROM [DataforAnalysis].[dbo].[Data_matching]
//     INNER JOIN [TransportData].[dbo].[Master_matchings]
//     ON [DataforAnalysis].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
//     where CONVERT(DATE,[DataforAnalysis].[dbo].[Data_matching].[Timestamp]) BETWEEN '${startDate}' AND '${finishDate}'
//     and [DataforAnalysis].[dbo].[Data_matching].[Model] = '${model}'
//     and [DataforAnalysis].[dbo].[Data_matching].[Line] = '${productionline}'
//     and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
//     and [DataforAnalysis].[dbo].[Data_matching].[MC_${parameter}] = '${arrayMC}'
//     and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
//     ),
//     XO (x1,x2,x3,x4,x5,x6,x7,x8,x9) as(
//     select x1 as [Date]
//     ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
//     convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end)
//     + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2) ) as [%Yield]
//     ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
//     ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
//     ,cast(AVG(x4) as decimal(10,3)) as [AVG]
//     ,cast(stdev(x4) as decimal(10,3)) as [STD]
//     ,case when (cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) or
//     ((cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))) and x6 = 0)
//     then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
//     > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
//     then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2))
//     = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
//     then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
//     ,x5 as [Model]
//     ,x9 as [Machine]
//     from XT
//     group by x1,x5,x6,x7,x8,x9)
  
//     select d as [Date]
//     ,XO.x2 as [%Yield]
//     ,XO.x3 as [Cycle_time (sec)]
//     ,XO.x4 as [Down time (min)]
//     ,XO.x5 as [AVG]
//     ,XO.x6 as [STD]
//     ,XO.x7 as [CPK]
//     ,XO.x8 as [Model]
//     ,XO.x9 as [Machine]
    
//     from selectDate full outer join XO 
//     on selectDate.d = XO.x1
//     order by d`);

//         listResultday.push(resultday[0]);

//         //AVG
//         let dataAverageday = [];
//         for (let i = 0; i < resultday[0].length; i++) {
//           dataAverageday.push(resultday[0][i].AVG);
//         }
//         listDataAverageday.push(dataAverageday);

//         let DataSeriesday = [];
//         for (let i = 0; i < listDataAverageday.length; i++) {
//           DataSeriesday = { name: selectMCday[i], data: listDataAverageday[i] };
//         }
//         seriesMCday.push(DataSeriesday);

//         //STDEV
//         let dataSTDDay = [];
//         for (let i = 0; i < resultday[0].length; i++) {
//           dataSTDDay.push(resultday[0][i].STD);          
//         }
//         listDataSTDDay.push(dataSTDDay);

//         let DataSeriesSTDDay = [];
//         for (let i = 0; i < listDataSTDDay.length; i++) {
//           DataSeriesSTDDay = { name: selectMCday[i], data: listDataSTDDay[i] };          
//         }
//         seriesMCSTDDay.push(DataSeriesSTDDay);
//       }

//       let controlLimit = await user.sequelize.query(`select [LCL],[UCL],[CL],[CL_STD],[LCL_STD],[UCL_STD],[createdAt]
//       FROM [TransportData].[dbo].[ControlSpecs]
//       where [Model] = '${model}' and [Parameter] = '${parameter}' and [Line] = '${productionline}'
//       and [createdAt] = (select(max([createdAt])) from [TransportData].[dbo].[ControlSpecs]
//       where [Model] = '${model}' and [Parameter] = '${parameter}' and [Line] = '${productionline}')
//       group by [LCL],[UCL],[CL],[CL_STD],[LCL_STD],[UCL_STD],[createdAt]`);

//       var LCL = [];
//       var UCL = [];
//       var LCL_STD = [];
//       var UCL_STD = [];


//       for (let i = 0; i < resultAVGday[0].length; i++) {
//         LCL.push(controlLimit[0][0].LCL);
//         UCL.push(controlLimit[0][0].UCL);
//         LCL_STD.push(controlLimit[0][0].LCL_STD);
//         UCL_STD.push(controlLimit[0][0].UCL_STD);
//         CL.push(controlLimit[0][0].CL);
//       }
//       console.log(seriesMCSTDDay);

//       let seriesLCL = { name: "LCL", data: LCL };
//       let seriesUCL = { name: "UCL", data: UCL };
//       let seriesLCL_STD = { name: "LCL_STD", data: LCL_STD };
//       let seriesUCL_STD = { name: "UCL_STD", data: UCL_STD };


      
 
//       let dateswap = [];

//       resultAVGday[0].forEach(async (item) => {
//         await dateswap.push(item.Date);
//       });

//       let Dateswap = dateswap.reverse();

//       res.json({
//         resultAVGday: resultAVGday[0],
//         seriesYday: seriesYday[0],
//         seriesSTDDay: seriesSTDDay[0],

//         seriesLSL: seriesLSL[0],
//         seriesUSL: seriesUSL[0],
//         seriesCL: seriesCL[0],
//         seriesLCL,
//         seriesUCL,
//         seriesLCL_STD,
//         seriesUCL_STD,
//         controlLimit,

//         listResultday,
//         listDataAverageday,
//         seriesMCday,
//         listDataSTDDay,
//         seriesMCSTDDay,
//         controlLimit:controlLimit[0],
//         Dateswap,

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
// Select Criteria Rotor
router.get("/matchingmachine/:parameter/:myLine", async (req, res) => {
  try {
    const { parameter, myLine } = req.params;
    let Newpara = await parameter.replace("", "MC_");

    let result = await user.sequelize
      .query(`with RenameMC (MCname,Line) as (Select distinct [${Newpara}], [Line]
FROM [DataforAnalysis].[dbo].[Data_matching]
where [DataforAnalysis].[dbo].[Data_matching].[Line] ='${myLine}'
and [DataforAnalysis].[dbo].[Data_matching].[${Newpara}] != '0')
Select MCname,Line from RenameMC`);

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
router.get("/matchingmodel", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
    FROM [DataforAnalysis].[dbo].[Data_matching]
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
router.get("/matchingline/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model], [Line]
FROM [DataforAnalysis].[dbo].[Data_matching]
where [DataforAnalysis].[dbo].[Data_matching].[Model] ='${myModel}'`);

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
router.get("/matchingparameter", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Parameter]
FROM [TransportData].[dbo].[Master_matchings]
where [Part] = 'Rotor'`);
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

//trace back
router.get("/traceback/:motorno", async (req, res) => {
  try {
    const { motorno } = req.params;
    let resultrotor = await user.sequelize.query(`select
    CONVERT(VARCHAR(10),[TransportData].[dbo].[Data_matching].[Timestamp],101) as Date_rotor
    ,[TransportData].[dbo].[Data_matching].[Model] as Model_rotor
    ,[TransportData].[dbo].[Data_matching].[Line] as Line_rotor
    ,[TransportData].[dbo].[Data_matching].[Barcode] as Barcode_Rotor
    ,CONVERT(VARCHAR(10),[TransportData].[dbo].[Data_matching].[Timestamp],108) as Time_axial
    ,[TransportData].[dbo].[Data_matching].[Axial_Play]
    ,[TransportData].[dbo].[Data_matching].[MC_Axial_Play]
    ,CONVERT(VARCHAR(10),[TransportData].[dbo].[Data_matching].[Oil_Top_Time],108) as Time_oiltop
    ,[TransportData].[dbo].[Data_matching].[Oil_Top]
    ,[TransportData].[dbo].[Data_matching].[MC_Oil_Top]
    ,CONVERT(VARCHAR(10),[TransportData].[dbo].[Data_matching].[Oil_Bottom_Time],108) as Time_oilbottom
    ,[TransportData].[dbo].[Data_matching].[Oil_Bottom]
    ,[TransportData].[dbo].[Data_matching].[MC_Oil_Bottom]

    FROM [TransportData].[dbo].[Data_matching]
    INNER JOIN [TransportData].[dbo].[Matching] on [Matching].[Barcode_rotor] = [Data_matching].[Barcode]
    INNER JOIN [TransportData].[dbo].[Dynamic_Parallelism_Tester] on [Dynamic_Parallelism_Tester].[Barcode] = [Matching].Barcode_Motor
    where [TransportData].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = '${motorno}'`);

    let resultdim = await user.sequelize.query(`select
      CONVERT(VARCHAR(10),[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time],101) as Date_dim
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] as Model_dim
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line] as Line_dim
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Barcode]  as Barcode_Motor
      ,CONVERT(VARCHAR(10),[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time],108) as Time_dim
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Set_Dim]
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Pivot_Height]
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Parallelism]
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[FlyHeight]
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Projection1]
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Ramp_Pivot]
      ,[TransportData].[dbo].[Dynamic_Parallelism_Tester].[Machine_no]

      FROM [TransportData].[dbo].[Dynamic_Parallelism_Tester]
      where [TransportData].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = '${motorno}'`);

    let resultEWMS = await user.sequelize.query(`select
      [TransportData].[dbo].[EWMS].[Date]
      ,[TransportData].[dbo].[EWMS].[Line]
      ,CONVERT(VARCHAR(10),[TransportData].[dbo].[EWMS].[Time],108) as [Time EWMS]
      ,[TransportData].[dbo].[EWMS].[ke_avg]
      ,[TransportData].[dbo].[EWMS].[ke_ripple]
      ,[TransportData].[dbo].[EWMS].[run_current]
      ,[TransportData].[dbo].[EWMS].[TIR_probe_A]
      ,[TransportData].[dbo].[EWMS].[NRRO_probe_A]
      ,[TransportData].[dbo].[EWMS].[TIR_probe_B]
      ,[TransportData].[dbo].[EWMS].[NRRO_probe_B]
      ,[TransportData].[dbo].[EWMS].[RVA]
      ,[TransportData].[dbo].[EWMS].[NRRO_ax_FFT_1]
      ,[TransportData].[dbo].[EWMS].[NRRO_rad_FFT_1]
      ,[TransportData].[dbo].[EWMS].[brg_drag]
      ,[TransportData].[dbo].[EWMS].[Bemf_balance]
      ,[TransportData].[dbo].[EWMS].[Machine_no]

      FROM [TransportData].[dbo].[EWMS]
      where [TransportData].[dbo].[EWMS].[Barcode] = '${motorno}'`);

    let resulthipot = await user.sequelize.query(`select
      [TransportData].[dbo].[Hipot].[Date]
      ,[TransportData].[dbo].[Hipot].[Line]
      ,CONVERT(VARCHAR(10),[TransportData].[dbo].[Hipot].[Time],108) as [Time_Hipot]
      ,[TransportData].[dbo].[Hipot].[R1_UV]
      ,[TransportData].[dbo].[Hipot].[R2_UW]
      ,[TransportData].[dbo].[Hipot].[R3_VW]
      ,[TransportData].[dbo].[Hipot].[R_max_min]
      ,[TransportData].[dbo].[Hipot].[Machine_no]
      
      FROM [TransportData].[dbo].[Hipot]
      where [TransportData].[dbo].[Hipot].[Barcode] = '${motorno}'
      
      --63G0Z100863864PBA4022H7A0PMPPP00AP0PP000000
      --63G85100863864PBA4022H7A0PMPPP00AP0PP000000
      --63KH0100863864PBA4022H7A0PMPPP00AP0PP000000
      --469NB100860536PCM1022H3A0PMPPP00MP0PP000000`);

    res.json({
      resultrotor: resultrotor[0],
      resultdim: resultdim[0],
      resultEWMS: resultEWMS[0],
      resulthipot: resulthipot[0],
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

router.get("/tracebackRotor/:rotorno", async (req, res) => {
  try {
    const { rotorno } = req.params;
    let AutoGerman = await user.sequelize
      .query(`select [Date],CONVERT(VARCHAR(10),[Time],108) as [Time],[Model],[Line],[Mover],[Barcode],[Axial_Play_Press_Station_Number],[Axial_Play],[OilUp_1_Amount],[OilUp_2_Amount],[OilLow_1_Amount],[OilLow_2_Amount]
    FROM [SPD_Fac2].[dbo].[AxialPlay_AutoGerman]
    where [Barcode] = '${rotorno}'`);

    let AutoKZW = await user.sequelize
      .query(`select [Date],CONVERT(VARCHAR(10),[Time],108) as [Time],[Line],[Machine],[Model],[Barcode],[Axial_Play_Press_Number],[Axial_Play],[Oil_Up_number],[Oil_Up_Amount],[Oil_Low_number],[Oil_Low_Amount]
    FROM [SPD_Fac2].[dbo].[AxialPlay_Auto_Fac2]
    where [Barcode] = '${rotorno}'`);

    let ManualAX = await user.sequelize
      .query(`select [Date],CONVERT(VARCHAR(10),[Time],108) as [Time],[Line],[Machine],[Model],[Barcode],[Axial_Play]
    FROM [SPD_Fac2].[dbo].[AxialPlay_Fac2]
    where [Barcode] = '${rotorno}'`);

    let ManualOil = await user.sequelize
      .query(`select [Date],CONVERT(VARCHAR(10),[Time],108) as [Time],[Line],[Machine],[Model],[Barcode],[Oilfill]
    FROM [SPD_Fac2].[dbo].[Oilfill_Fac2]
    where [Barcode] = '${rotorno}'`);

    res.json({
      AutoGerman: AutoGerman[0],
      AutoKZW: AutoKZW[0],
      ManualAX: ManualAX[0],
      ManualOil: ManualOil[0],
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

//trace back
router.get("/alarm", async (req, res) => {
  try {
    const { alarm } = req.params;
    let result = await user.sequelize.query(`with alert (x1,x2,x3,x4,x5) as 
(select cast(DATEPART(hour,[TransportData].[dbo].[Data_matching].[Timestamp]) as varchar)
,[TransportData].[dbo].[Data_matching].[Axial_Play]
,[TransportData].[dbo].[Data_matching].[MC_Axial_Play]
,[TransportData].[dbo].[Master_matchings].[LCL]
,[TransportData].[dbo].[Master_matchings].[UCL]
FROM [TransportData].[dbo].[Data_matching]
INNER JOIN [TransportData].[dbo].[Master_matchings]
ON [TransportData].[dbo].[Data_matching].Model = [TransportData].[dbo].[Master_matchings].Model
where CONVERT(DATE,[TransportData].[dbo].[Data_matching].[Timestamp]) = '${selectDate}'
and [TransportData].[dbo].[Data_matching].[Model] = '${model}'
and [TransportData].[dbo].[Data_matching].[Line] = '${productionline}'
and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
and [TransportData].[dbo].[Master_matchings].[Model] = '${model}'
)
select x1+ ':00' as [Time]
,cast(AVG(x2) as decimal(10,2)) as ['${parameter}']
,x3 as [MC_'${parameter}']
from alert
group by x1,x3,x4,x5
having cast(AVG(x2) as decimal(10,2)) < x4 or cast(AVG(x2) as decimal(10,2)) > x5
order by x1+0`);

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

module.exports = router;
