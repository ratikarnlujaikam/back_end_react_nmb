const express = require("express");
const { copySync } = require("fs-extra");
const router = express.Router();
const user = require("../database/models/user");

//DataPerHour
router.get(
  "/motordim/:selectDate/:model/:parameter/:productionline/:selectMCname",
  async (req, res) => {
    try {
      const { selectDate, model, parameter, productionline, selectMCname } =
        req.params;

      let resultAVG = await user.sequelize
        .query(`with XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as 
          (select cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as varchar) as [hr]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) < 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) >= 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) < 120 then 0 end as [D/T]
          ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] as [Parameter]
          ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model] as [model]
          ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
          ,[TransportData].[dbo].[Master_matchings].CL as [CL]
          ,[TransportData].[dbo].[Master_matchings].USL as [USL]
          ,'Average' as [AVG]
          FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [Temp_TransportData].[dbo].[Dynamic_Parallelism].Model = [TransportData].[dbo].[Master_matchings].Model
          where CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) = '${selectDate}'
          and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model] = '${model}'
          and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
          )
          select x1 + ':00' as [Time]
          ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
          convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end) 
          + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2)) as [%Yield]
          ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
          ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
          ,cast(AVG(x4) as decimal(10,3)) as [AVG]
          ,cast(stdev(x4) as decimal(10,3)) as [STD]
          ,case when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
          ,x5 as [Model]
          ,x6 as [LSL]
          ,x7 as [CL]
          ,x8 as [USL]
          ,x9 as [Machine]
          from XT
          group by x1,x5,x6,x7,x8,x9
          order by x1+0`);

      let dataAverage = [];
      let LSL = [];
      let USL = [];
      let CL = [];
      resultAVG[0].forEach(async (item) => {
        await dataAverage.push(item.AVG);
        await LSL.push(item.LSL);
        await USL.push(item.USL);
        await CL.push(item.CL);
      });

      let series = { name: "Average", data: dataAverage, title: parameter };
      let dataLSL = { name: "LSL", data: LSL };
      let dataUSL = { name: "USL", data: USL };
      let dataCL = { name: "CL", data: CL };
      let seriesY = [series];
      let seriesLSL = [dataLSL];
      let seriesUSL = [dataUSL];
      let seriesCL = [dataCL];

      // -----------------------------------

      var selectMC = JSON.parse(selectMCname);
      var listResult = [];
      var listDataAverage = [];
      var seriesMC = [];

      for (let index = 0; index < selectMC.length; index++) {
        const arrayMC = selectMC[index];

        let result = await user.sequelize
          .query(`with XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as 
          (select cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as varchar) as [hr]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) < 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) >= 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) < 120 then 0 end as [D/T]
          ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] as [Parameter]
          ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model] as [model]
          ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
          ,[TransportData].[dbo].[Master_matchings].CL as [CL]
          ,[TransportData].[dbo].[Master_matchings].USL as [USL]
          ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Machine_no] as [MC]
          FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [Temp_TransportData].[dbo].[Dynamic_Parallelism].Model = [TransportData].[dbo].[Master_matchings].Model
          where CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) = '${selectDate}'
          and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model] = '${model}'
          and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Machine_no] = '${arrayMC}'
          and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
          )
          select x1 + ':00' as [Time]
          ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
          convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end) 
          + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2)) as [%Yield]
          ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
          ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
          ,cast(AVG(x4) as decimal(10,3)) as [AVG]
          ,cast(stdev(x4) as decimal(10,3)) as [STD]
          ,case when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
          ,x5 as [Model]
          ,x9 as [Machine]
          from XT
          group by x1,x5,x6,x7,x8,x9
          order by x1+0`);

        listResult.push(result[0]);

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
      }
      console.log(seriesMC);
      console.log(seriesY);

      //-------------------------------

      let controlLimit = await user.sequelize.query(`with spec (a1,a2,a3) as 
      (select cast(stdev(case when [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL] 
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL] 
      then [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] end) as decimal(10,2))
      ,cast(AVG(case when [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL] 
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL] 
      then [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] end) as decimal(10,2))
      ,[TransportData].[dbo].[Master_matchings].[Model]
      FROM [TransportData].[dbo].[Master_matchings]
      INNER JOIN [Temp_TransportData].[dbo].[Dynamic_Parallelism]
      ON [TransportData].[dbo].[Master_matchings].[Model] = [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model]
      INNER JOIN [TransportData].[dbo].[ControlLimits]
      ON [TransportData].[dbo].[Master_matchings].[Model] = [TransportData].[dbo].[ControlLimits].[Model]
      and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlLimits].[Parameter]
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Line] = [TransportData].[dbo].[ControlLimits].[Line]
      where 
      [TransportData].[dbo].[ControlLimits].[createdAt] = (select max([TransportData].[dbo].[ControlLimits].[createdAt]) from [TransportData].[dbo].[ControlLimits])
      and CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Date]) between [TransportData].[dbo].[ControlLimits].[StartCalcDate] and [TransportData].[dbo].[ControlLimits].[FinishCalcDate]
      and [TransportData].[dbo].[Master_matchings].[Model] = '${model}'
      and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Line] = '${productionline}'
    
      group by convert(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Date])
      ,[TransportData].[dbo].[Master_matchings].[Model]
      )
      select
      cast(AVG(a2) as decimal(10,3))-(3*cast(stdev(a2) as decimal(10,3))) as [LCL]
      ,cast(AVG(a2) as decimal(10,3))+(3*cast(stdev(a2) as decimal(10,3))) as [UCL]
      ,cast(AVG(a1) as decimal(10,3))-(3*cast(stdev(a1) as decimal(10,3))) as [LCL_STD]
      ,cast(AVG(a1) as decimal(10,3))+(3*cast(stdev(a1) as decimal(10,3))) as [UCL_STD]
      from spec`);

      var LCL = [];
      var UCL = [];
      for (let i = 0; i < resultAVG[0].length; i++) {
        LCL.push(controlLimit[0][0].LCL);
        UCL.push(controlLimit[0][0].UCL);
      }

      let seriesLCL = { name: "LCL", data: LCL };
      let seriesUCL = { name: "UCL", data: UCL };

      res.json({
        resultAVG: resultAVG[0],
        seriesY: seriesY[0],

        seriesLSL: seriesLSL[0],
        seriesUSL: seriesUSL[0],
        seriesCL: seriesCL[0],
        seriesLCL,
        seriesUCL,
        controlLimit,

        listResult,
        listDataAverage,
        seriesMC,

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
  "/motordimday/:startDate/:finishDate/:model/:parameter/:productionline/:selectMCname",
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
        .query(`with XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as 
    (select [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Date] as [Date]
    ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) < 120 
    then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) 
    when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
    ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) >= 120 
    then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) 
    when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) < 120 then 0 end as [D/T]
    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] as [Parameter]
    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model] as [model]
    ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
    ,[TransportData].[dbo].[Master_matchings].CL as [CL]
    ,[TransportData].[dbo].[Master_matchings].USL as [USL]
    ,'Average' as [AVG]
    FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism]
    INNER JOIN [TransportData].[dbo].[Master_matchings]
    ON [Temp_TransportData].[dbo].[Dynamic_Parallelism].Model = [TransportData].[dbo].[Master_matchings].Model
    where [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Date] BETWEEN '${startDate}' AND '${finishDate}'
    and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model] = '${model}'
    and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Line] = '${productionline}'
    and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
    and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
    )
    select x1 as [Date]
    ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
    convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end) 
    + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2) ) as [%Yield]
    ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
    ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
    ,cast(AVG(x4) as decimal(10,3)) as [AVG]
    ,cast(stdev(x4) as decimal(10,3)) as [STD]
    ,case when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
    then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
    then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
    then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
    ,x5 as [Model]
    ,x6 as [LSL]
    ,x7 as [CL]
    ,x8 as [USL]
    ,x9 as [Machine]
    from XT
    group by x1,x5,x6,x7,x8,x9
    order by x1`);

      let dataAverageday = [];
      let LSL = [];
      let USL = [];
      let CL = [];
      resultAVGday[0].forEach(async (item) => {
        await dataAverageday.push(item.AVG);
        await LSL.push(item.LSL);
        await USL.push(item.USL);
        await CL.push(item.CL);
      });

      let seriesday = {
        name: "Average",
        data: dataAverageday,
        titleday: parameter,
      };
      let dataLSL = { name: "LSL", data: LSL };
      let dataUSL = { name: "USL", data: USL };
      let dataCL = { name: "CL", data: CL };
      let seriesYday = [seriesday];
      let seriesLSL = [dataLSL];
      let seriesUSL = [dataUSL];
      let seriesCL = [dataCL];

      // -----------------------------------

      var selectMCday = JSON.parse(selectMCname);
      var listResultday = [];
      var listDataAverageday = [];
      var seriesMCday = [];

      for (let index = 0; index < selectMCday.length; index++) {
        const arrayMC = selectMCday[index];

        let resultday = await user.sequelize
          .query(`with XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as 
          (select [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Date] as [Date]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) < 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
          ,case when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) >= 120 
          then datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) 
          when datediff(SECOND,0,cast((lag([Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) over (order by [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time] desc) - [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Time]) as time)) < 120 then 0 end as [D/T]
          ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] as [Parameter]
          ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model] as [model]
          ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
          ,[TransportData].[dbo].[Master_matchings].CL as [CL]
          ,[TransportData].[dbo].[Master_matchings].USL as [USL]
          ,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Machine_no] as [MC]
          FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [Temp_TransportData].[dbo].[Dynamic_Parallelism].Model = [TransportData].[dbo].[Master_matchings].Model
          where [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Date] BETWEEN '${startDate}' AND '${finishDate}'
          and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model] = '${model}'
          and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Machine_no] = '${arrayMC}'
          and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
          )
          select x1 as [Date]
          ,cast(convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end))/
          convert(float,count(case when x4 >= x6 and x4 <= x8 then 1 else null end) 
          + count(case when x4 < x6 or x4 > x8 then 1 else null end)) * 100 AS DECIMAL(10, 2) ) as [%Yield]
          ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
          ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)]
          ,cast(AVG(x4) as decimal(10,3)) as [AVG]
          ,cast(stdev(x4) as decimal(10,3)) as [STD]
          ,case when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) < cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) > cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2)) when cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) = cast(convert(float,((AVG(x4)-x6)/(3*STDEV(x4)))) as decimal(10,2))
          then cast(convert(float,((x8-AVG(x4))/(3*STDEV(x4)))) as decimal(10,2)) end as [CPK]
          ,x5 as [Model]
          ,x6 as [LSL]
          ,x7 as [CL]
          ,x8 as [USL]
          ,x9 as [Machine]
          from XT
          group by x1,x5,x6,x7,x8,x9
          order by x1`);

        listResultday.push(resultday[0]);

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
      }

      let controlLimit = await user.sequelize.query(`with spec (a1,a2,a3) as 
      (select cast(stdev(case when [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL] 
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL] 
      then [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] end) as decimal(10,2))
      ,cast(AVG(case when [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL] 
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL] 
      then [Temp_TransportData].[dbo].[Dynamic_Parallelism].[${parameter}] end) as decimal(10,2))
      ,[TransportData].[dbo].[Master_matchings].[Model]
      FROM [TransportData].[dbo].[Master_matchings]
      INNER JOIN [Temp_TransportData].[dbo].[Dynamic_Parallelism]
      ON [TransportData].[dbo].[Master_matchings].[Model] = [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Model]
      INNER JOIN [TransportData].[dbo].[ControlLimits]
      ON [TransportData].[dbo].[Master_matchings].[Model] = [TransportData].[dbo].[ControlLimits].[Model]
      and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlLimits].[Parameter]
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Line] = [TransportData].[dbo].[ControlLimits].[Line]
      where 
      [TransportData].[dbo].[ControlLimits].[createdAt] = (select max([TransportData].[dbo].[ControlLimits].[createdAt]) from [TransportData].[dbo].[ControlLimits])
      and CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Date]) between [TransportData].[dbo].[ControlLimits].[StartCalcDate] and [TransportData].[dbo].[ControlLimits].[FinishCalcDate]
      and [TransportData].[dbo].[Master_matchings].[Model] = '${model}'
      and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism].[Line] = '${productionline}'
    
      group by convert(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism].[Date])
      ,[TransportData].[dbo].[Master_matchings].[Model]
      )
      select
      cast(AVG(a2) as decimal(10,3))-(3*cast(stdev(a2) as decimal(10,3))) as [LCL]
      ,cast(AVG(a2) as decimal(10,3))+(3*cast(stdev(a2) as decimal(10,3))) as [UCL]
      ,cast(AVG(a1) as decimal(10,3))-(3*cast(stdev(a1) as decimal(10,3))) as [LCL_STD]
      ,cast(AVG(a1) as decimal(10,3))+(3*cast(stdev(a1) as decimal(10,3))) as [UCL_STD]
      from spec`);

      var LCL = [];
      var UCL = [];
      for (let i = 0; i < resultAVGday[0].length; i++) {
        LCL.push(controlLimit[0][0].LCL);
        UCL.push(controlLimit[0][0].UCL);
      }

      let seriesLCL = { name: "LCL", data: LCL };
      let seriesUCL = { name: "UCL", data: UCL };

      let dateswap = [];

      resultAVGday[0].forEach(async (item) => {
        await dateswap.push(item.Date);
      });

      let Dateswap = dateswap.reverse();

      res.json({
        resultAVGday: resultAVGday[0],
        seriesYday: seriesYday[0],

        seriesLSL: seriesLSL[0],
        seriesUSL: seriesUSL[0],
        seriesCL: seriesCL[0],
        seriesLCL,
        seriesUCL,
        controlLimit,

        listResultday,
        listDataAverageday,
        seriesMCday,

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
router.get("/motordimmodel", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
  FROM [TransportData].[dbo].[Master_productionlines]
  where [Part] = 'Motor_Dim'
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
router.get("/motordimline/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model], [Line]
      FROM [TransportData].[dbo].[Master_productionlines]
      where [TransportData].[dbo].[Master_productionlines].[Model] = '${myModel}'
      and [TransportData].[dbo].[Master_productionlines].[Part] = 'Motor_Dim'`);
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
router.get("/motordimparameter/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct [Parameter]
      FROM [TransportData].[dbo].[Master_matchings]
      where [Part] = 'Motor_Dim'
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
router.get("/motordimmachine/:myLine", async (req, res) => {
  try {
    const { myLine } = req.params;
    let result = await user.sequelize
      .query(`Select distinct [Machine], [Line]
      FROM [TransportData].[dbo].[Master_productionlines]
      where [TransportData].[dbo].[Master_productionlines].[Line] = '${myLine}'
      and [TransportData].[dbo].[Master_productionlines].[Part] = 'Motor_Dim'`);
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