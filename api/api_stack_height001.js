const express = require("express");
const { copySync } = require("fs-extra");
const router = express.Router();
const user = require("../database/models/user");

//DataPerHour
router.get(
  "/stackHeight/:selectDate/:model/:parameter/:productionline/:selectMCname",
  async (req, res) => {
    try {
      const { selectDate, model, parameter, productionline, selectMCname } =
        req.params;

      let resultAVG = await user.sequelize.query(`With TimeTable (N) as
        (select     [Hour] = V.number
         FROM
             master..spt_values V
         WHERE
             V.type = 'P'
         AND
             V.number >= 0 AND V.number <= 23
         ),
     
     selectTime (T) as (select convert(varchar(10),N) as [Time] from TimeTable),
    XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as 
          (select cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as varchar) as [hr]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) < 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) >= 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) < 120 then 0 end as [D/T]
          ,[Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] as [Parameter]
          --,case when ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
          --and ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
          --then [Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] end as [Parameter]
          ,[Temp_TransportData].[dbo].[Dimension_WR].[Model] as [model]
          ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
          ,[TransportData].[dbo].[Master_matchings].CL as [CL]
          ,[TransportData].[dbo].[Master_matchings].USL as [USL]
          ,'Average' as [AVG]
          FROM [Temp_TransportData].[dbo].[Dimension_WR]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [Temp_TransportData].[dbo].[Dimension_WR].Model = [TransportData].[dbo].[Master_matchings].Model
          where CONVERT(DATE,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) = '${selectDate}'
          and [Temp_TransportData].[dbo].[Dimension_WR].[Model] = '${model}'
          and [Temp_TransportData].[dbo].[Dimension_WR].[Line] = '${productionline}'
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
      // let CL = [];
      if (
        parameter == "Parallelism_Stack" ||
        parameter == "Parallelism_Attractive"
      ) {
        resultAVG[0].forEach(async (item) => {
          await dataAverage.push(item.AVG);
          await dataSTD.push(item.STD);
          await USL.push(item.USL);
        });
      } else {
        resultAVG[0].forEach(async (item) => {
          await dataAverage.push(item.AVG);
          await dataSTD.push(item.STD);
          await LSL.push(item.LSL);
          await USL.push(item.USL);
          // await CL.push(item.CL);
        });
      }

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
          .query(`With TimeTable (N) as (select [Hour] = V.number FROM master..spt_values V WHERE V.type = 'P' AND V.number >= 0 AND V.number <= 23),

        selectTime (T) as (select convert(varchar(10),N) as [Time] from TimeTable),
        
        removeMaster (a1,a2) as (select [Part_ID],count([Part_ID])
        FROM [Temp_TransportData].[dbo].[Dimension_WR]
        where [Model] = '${model}' and [Date] = '${selectDate}'
        group by [Part_ID]
        having count([Part_ID]) < 4),
        
        XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as
        (select cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as varchar) as [hr]
        ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) < 120
        then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time))
        when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
        ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) >= 120
        then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time))
        when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) < 120 then 0 end as [D/T]
        ,[Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] as [Parameter]
        --,case when ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
        --and ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
        --then [Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] end as [Parameter]
        ,[Temp_TransportData].[dbo].[Dimension_WR].[Model] as [model]
        ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
        ,[TransportData].[dbo].[Master_matchings].CL as [CL]
        ,[TransportData].[dbo].[Master_matchings].USL as [USL]
        ,[Temp_TransportData].[dbo].[Dimension_WR].[Machine_no] as [MC]
        FROM [Temp_TransportData].[dbo].[Dimension_WR]
        INNER JOIN [TransportData].[dbo].[Master_matchings]
        ON [Temp_TransportData].[dbo].[Dimension_WR].Model = [TransportData].[dbo].[Master_matchings].Model
        LEFT JOIN removeMaster
        ON removeMaster.a1 = [Temp_TransportData].[dbo].[Dimension_WR].[Part_ID]
        where CONVERT(DATE,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) = '${selectDate}'
        and [Temp_TransportData].[dbo].[Dimension_WR].[Model] = '${model}'
        and [Temp_TransportData].[dbo].[Dimension_WR].[Line] = '${productionline}'
        and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
        and [Temp_TransportData].[dbo].[Dimension_WR].[Machine_no] = '${arrayMC}'
        and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
        ),
        XO (x1,x2,x3,x4,x5,x6,x7,x8,x9,x10) as(
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
        ,count (x4) as [count]
        from XT
        group by x1,x5,x6,x7,x8,x9)
        
        select T  +':00' as [Time]
        ,XO.x2 as [%Yield]
        ,XO.x3 as [Cycle_time (sec)]
        ,XO.x4 as [Down time (min)]
        ,XO.x5 as [AVG]
        ,XO.x6 as [STD]
        ,XO.x7 as [CPK]
        ,XO.x8 as [Model]
        ,XO.x9 as [Machine]
        ,XO.x10 as [Count]
        
        from selectTime full outer join XO
        on selectTime.T = XO.x1
        order by T + 0`);

        listResult.push(result[0]);

        
        //RAW DATA
        let raw_data = await user.sequelize
          .query(`SELECT *
          FROM [Temp_TransportData].[dbo].[Dimension_WR]
          where [date] = '${selectDate}'
          and [model] = '${model}'
          and [line] = '${productionline}'
          and [machine_no] = '${arrayMC}'
          order by [time]
          `);
        listRawData.push(raw_data[0])


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
      }

      //-------------------------------

      let controlLimit = await user.sequelize.query(`select [LCL],[UCL],[CL],[CL_STD],[LCL_STD],[UCL_STD],[createdAt]
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
      let seriesCL = { name: "UCL", data: CL };
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

// DataPerDay
router.get(
  "/stackHeightday/:startDate/:finishDate/:model/:parameter/:productionline/:selectMCname",
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
    (select [Temp_TransportData].[dbo].[Dimension_WR].[Date] as [Date]
    ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) < 120 
    then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) 
    when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
    ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) >= 120 
    then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) 
    when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) < 120 then 0 end as [D/T]
    ,[Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] as [Parameter]
    --,case when ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
    --and ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
    --then [Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] end as [Parameter]
    ,[Temp_TransportData].[dbo].[Dimension_WR].[Model] as [model]
    ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
    ,[TransportData].[dbo].[Master_matchings].CL as [CL]
    ,[TransportData].[dbo].[Master_matchings].USL as [USL]
    ,'Average' as [AVG]
    FROM [Temp_TransportData].[dbo].[Dimension_WR]
    INNER JOIN [TransportData].[dbo].[Master_matchings]
    ON [Temp_TransportData].[dbo].[Dimension_WR].Model = [TransportData].[dbo].[Master_matchings].Model
    where [Temp_TransportData].[dbo].[Dimension_WR].[Date] BETWEEN '${startDate}' AND '${finishDate}'
    and [Temp_TransportData].[dbo].[Dimension_WR].[Model] = '${model}'
    and [Temp_TransportData].[dbo].[Dimension_WR].[Line] = '${productionline}'
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
  group by x1,x5,x6,x7,x8,x9),

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
  order by d`);

      let dataAverageday = [];
      let dataSTDDay = [];
      let LSL = [];
      let USL = [];
      // let CL = [];
      if (
        parameter == "Parallelism_Stack" ||
        parameter == "Parallelism_Attractive"
      ) {
        resultAVGday[0].forEach(async (item) => {
          await dataAverageday.push(item.AVG);
          await dataSTDDay.push(item.STD);
          await USL.push(item.USL);
        });
      } else {
        resultAVGday[0].forEach(async (item) => {
          await dataAverageday.push(item.AVG);
          await dataSTDDay.push(item.STD);
          await LSL.push(item.LSL);
          await USL.push(item.USL);
          // await CL.push(item.CL);
        });
      }

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
          (select [Temp_TransportData].[dbo].[Dimension_WR].[Date] as [Date]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) < 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) >= 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dimension_WR].[Time]) over (order by [Temp_TransportData].[dbo].[Dimension_WR].[Time] desc) - [Temp_TransportData].[dbo].[Dimension_WR].[Time]) as time)) < 120 then 0 end as [D/T]
          ,[Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] as [Parameter]
          --,case when ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
          --and ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
          --then [Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] end as [Parameter]
          ,[Temp_TransportData].[dbo].[Dimension_WR].[Model] as [model]
          ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
          ,[TransportData].[dbo].[Master_matchings].CL as [CL]
          ,[TransportData].[dbo].[Master_matchings].USL as [USL]
          ,[Temp_TransportData].[dbo].[Dimension_WR].[Machine_no] as [MC]
          FROM [Temp_TransportData].[dbo].[Dimension_WR]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [Temp_TransportData].[dbo].[Dimension_WR].Model = [TransportData].[dbo].[Master_matchings].Model
          where [Temp_TransportData].[dbo].[Dimension_WR].[Date] BETWEEN '${startDate}' AND '${finishDate}'
          and [Temp_TransportData].[dbo].[Dimension_WR].[Model] = '${model}'
          and [Temp_TransportData].[dbo].[Dimension_WR].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          and [Temp_TransportData].[dbo].[Dimension_WR].[Machine_no] = '${arrayMC}'
          and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
     ),
    XO (x1,x2,x3,x4,x5,x6,x7,x8,x9,x10) as(
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
    ,count (x4) as [count]
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
    ,XO.x10 as [Count]
    
    from selectDate full outer join XO 
    on selectDate.d = XO.x1
    order by d`);

        listResultday.push(resultday[0]);

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

      let controlLimit = await user.sequelize.query(`select [LCL],[UCL],[CL],[CL_STD],[LCL_STD],[UCL_STD],[createdAt]
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
      let seriesCL = { name: "UCL", data: CL };
      let seriesCL_STD = { name: "LCL_STD", data: CL_STD };

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

// Select Criteria Motor
router.get("/stackHeightModel", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
    FROM [Temp_TransportData].[dbo].[Dimension_WR]
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
router.get("/stackHeightLine/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model], [Line]
    FROM [Temp_TransportData].[dbo].[Dimension_WR]
    where [Temp_TransportData].[dbo].[Dimension_WR].[Model] = '${myModel}'`);
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
router.get("/stackHeightParameter/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct [Parameter]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Part] = 'Stack_Height'
    and [Model] = '${myModel}'`);
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
router.get("/stackHeightMachine/:myLine", async (req, res) => {
  try {
    const { myLine } = req.params;
    let result = await user.sequelize.query(`Select distinct [Machine_no], [Line]
    FROM [Temp_TransportData].[dbo].[Dimension_WR]
    where [Temp_TransportData].[dbo].[Dimension_WR].[Line] = '${myLine}'`);
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
