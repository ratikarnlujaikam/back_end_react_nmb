const express = require("express");
const { copySync } = require("fs-extra");
const router = express.Router();
const user = require("../database/models/user");

// var JSON_Lines = ["1-4", "1-8", "2-10", "2-14", "2-6", "2-8", "3-10", "3-14", "3-6"];

//DataPerHour
router.get(
  "/motordim/:selectDate/:model/:parameter/:productionline/:selectMCname/:aiPress",
  async (req, res) => {
    try {
      const {
        selectDate,
        model,
        parameter,
        productionline,
        selectMCname,
        aiPress,
      } = req.params;

      var line = productionline.trim();

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
        (select cast(DATEPART(hour,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) as [hr]
        ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120 
        then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) 
        when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
        ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120 
        then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) 
        when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120 then 0 end as [D/T]
        ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] as [Parameter]
        ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] as [model]
        ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
        ,[TransportData].[dbo].[Master_matchings].CL as [CL]
        ,[TransportData].[dbo].[Master_matchings].USL as [USL]
        ,'Average' as [AVG]
        FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
        INNER JOIN [TransportData].[dbo].[Master_matchings]
        ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
        INNER JOIN [DataforAnalysis].[dbo].[Ai_press]
        ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = [DataforAnalysis].[dbo].[Ai_press].[Barcode]
        where CONVERT(DATE,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) = '${selectDate}'
        and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
        and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Line] = '${productionline}'
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
       ,X7 as [CL]
       ,x8 as [USL]
       ,x9 as [Machine]
       from XT
       group by x1,x5,x6,x7,x8,x9),
       COL (USL, CL, LSL) as
       (select distinct x11 as [USL]
       ,x10 as [CL]
       ,x9 as [LSL]
       from XO)
     
       select T  +':00' as [Time]
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
      if (parameter == "Parallelism") {
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

      var selectMC = JSON.parse(aiPress);
      var listResult = [];
      //AVG
      var listDataAverage = [];
      var seriesMC = [];
      //STD
      var listDataSTD = [];
      var seriesMCSTD = [];

      //raw data
      var listRawData = [];

      for (let index = 0; index < selectMC.length; index++) {
        const arrayMC = selectMC[index];

        let result = await user.sequelize.query(`With TimeTable (N) as
        (select     [Hour] = V.number
         FROM
             master..spt_values V
         WHERE
             V.type = 'P'
         AND
             V.number >= 0 AND V.number <= 23
         ),
     
     selectTime (T) as (select convert(varchar(10),N) as [Time] from TimeTable),
     XT (x1,x2,x3,x4,x5,x6) as
        (select cast(DATEPART(hour,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) as [hr]
        ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120
        then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time))
        when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
        ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120
        then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time))
        when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120 then 0 end as [D/T]        
        ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] as [model]         
        ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Machine_no] as [MC]
        ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] as [barcode]
        FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
          INNER JOIN [DataforAnalysis].[dbo].[Ai_press]
          ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = [DataforAnalysis].[dbo].[Ai_press].[Barcode]
        where CONVERT(DATE,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) = '${selectDate}'
        and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
        and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Line] = '${productionline}'
        and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
        and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Machine_no] = '${selectMCname}'
        and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
        )
        , Ai (y1,y2,y3,y4,y5,y6,y7,y8) as
        (select [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] as [Parameter]
        ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] as [model]
        ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
        ,[TransportData].[dbo].[Master_matchings].CL as [CL]
        ,[TransportData].[dbo].[Master_matchings].USL as [USL]
        ,cast(DATEPART(hour,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) as [hr]
        ,[DataforAnalysis].[dbo].[Ai_press].[Machine_no] as [Fixture]
        ,[DataforAnalysis].[dbo].[Ai_press].[Barcode] as [Barcode]
        FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
        INNER JOIN [TransportData].[dbo].[Master_matchings]
        ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
        INNER JOIN [DataforAnalysis].[dbo].[Ai_press]
        ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = [DataforAnalysis].[dbo].[Ai_press].[Barcode]
        where CONVERT(DATE,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) = '${selectDate}'
        and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
        and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
        and [DataforAnalysis].[dbo].[Ai_press].[Machine_no] = '${arrayMC}'
		--having  stdev([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}]) !=0
        )
        
        , XT1 (a1,a2,a3,a4,a5) as 
        (select x1 + ':00' as [Time]
        ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
        ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)] 
        ,x4 as [Model]
        ,x5 as [Machine]
        from XT
        group by x1,x4,x5
        )

        , Ai1 (b1,b2,b3,b4,b5,b6,b7) as
        (select y6 + ':00' as [Time]
        ,cast(convert(float,count(case when y1 >= y3 and y1 <= y5 then 1 else null end))/
        convert(float,count(case when y1 >= y3 and y1 <= y5 then 1 else null end)
        + count(case when y1 < y3 or y1 > y5 then 1 else null end)) * 100 AS DECIMAL(10, 2)) as [%Yield]
        ,cast(AVG(y1) as decimal(10,3)) as [AVG]
        ,cast(stdev(y1) as decimal(10,3)) as [STD]
        ,case when (cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) < cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2))) or
        ((cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) < cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2))) and y3 = 0)
        then cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) when cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) > cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2))
        then cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2)) when cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) = cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2))
        then cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) end as [CPK]
        ,y2
        ,y7
        from Ai
        group by y6,y3,y4,y5,y2,y7          
        )
        
        select T  +':00' as [Time]
        ,b2 as [%Yield]
        ,a2 as [Cycle_time (sec)]
        ,a3 as [Down time (min)]
        ,b3 as [AVG]
        ,b4 as [STD] 
        ,b5 as [CPK]
        ,a4 as [Model]
        ,a5 as [Machine]
        ,b7 as [Fixture]
        from XT1 JOIN Ai1 on XT1.a1 = Ai1.b1 full outer join selectTime on selectTime.T + ':00' = Ai1.b1
        order by T + 0`);

        listResult.push(result[0]);

        // RAW DATA
        let raw_data = await user.sequelize
          .query(`SELECT [Ai_press].[Machine_no] as [Fixture]
          ,[Dynamic_Parallelism_Tester].[Machine_no]
          ,[Dynamic_Parallelism_Tester].[Time]
          ,[Dynamic_Parallelism_Tester].[Barcode]          
          ,[Dynamic_Parallelism_Tester].[Master_Judgment]
          ,[Ai_press].[Max_force]
          ,[Ai_press].[Datum_probe]
          ,[Dynamic_Parallelism_Tester].[Set_Dim]
          ,[Dynamic_Parallelism_Tester].[Set_Dim_A]
          ,[Dynamic_Parallelism_Tester].[Set_Dim_B]
          ,[Dynamic_Parallelism_Tester].[Set_Dim_C]
          ,[Dynamic_Parallelism_Tester].[Ramp_to_Datum]
          ,[Dynamic_Parallelism_Tester].[Pivot_Height]
          ,[Dynamic_Parallelism_Tester].[Parallelism]
          ,[Dynamic_Parallelism_Tester].[FlyHeight]
          ,[Dynamic_Parallelism_Tester].[Projection1]
          FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
          INNER JOIN [DataforAnalysis].[dbo].[Ai_press]
          ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = [DataforAnalysis].[dbo].[Ai_press].[Barcode]
          where convert(Date,[Dynamic_Parallelism_Tester].[Time]) = '${selectDate}'
          and [Dynamic_Parallelism_Tester].[model] = '${model}'
          and [Dynamic_Parallelism_Tester].[line] = '${productionline}'
          and [Dynamic_Parallelism_Tester].[machine_no] = '${selectMCname}'
          and [Ai_press].[Machine_no] = '${arrayMC}'
          order by [Dynamic_Parallelism_Tester].[time]
          `);
        listRawData.push(raw_data[0]);

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
      }

      //----------------------------

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

      if (parameter == "Parallelism") {
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
        seriesCL_STD,
        seriesLCL_STD,
        seriesUCL_STD,
        controlLimit,

        listResult,
        listDataAverage,
        seriesMC,
        listDataSTD,
        seriesMCSTD,
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
  "/motordimday/:startDate/:finishDate/:model/:parameter/:productionline/:selectMCname/:aiPress",
  async (req, res) => {
    try {
      const {
        startDate,
        finishDate,
        model,
        parameter,
        productionline,
        selectMCname,
        aiPress,
      } = req.params;

      var line = productionline.trim();

      let resultAVGday = await user.sequelize
        .query(`
        --resultAVGday
        DECLARE @StartDate DATE = '${startDate}',
        @EndDate DATE = '${finishDate}';
        WITH N1 (N) AS (SELECT 1 FROM (VALUES (1), (1), (1), (1), (1), (1), (1), (1), (1), (1)) n (N)),
        N2 (N) AS (SELECT 1 FROM N1 AS N1 CROSS JOIN N1 AS N2),
        N3 (N) AS (SELECT 1 FROM N2 AS N1 CROSS JOIN N2 AS N2),
        selectDate (d) as (SELECT TOP (DATEDIFF(DAY, @StartDate, @EndDate) + 1)
        Date = DATEADD(DAY, ROW_NUMBER() OVER(ORDER BY N) - 1, @StartDate)
        FROM N3),	
        
        XT (x1,x2,x3,x4,x5,x6,x7,x8,x9) as 
    (select [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Date] as [Date]
    ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120 
    then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) 
    when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
    ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120 
    then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) 
    when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120 then 0 end as [D/T]
    ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] as [Parameter]
    ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] as [model]
    ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
    ,[TransportData].[dbo].[Master_matchings].CL as [CL]
    ,[TransportData].[dbo].[Master_matchings].USL as [USL]
    ,'Average' as [AVG]
    FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
    INNER JOIN [TransportData].[dbo].[Master_matchings]
    ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
    INNER JOIN [DataforAnalysis].[dbo].[Ai_press]
    ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = [DataforAnalysis].[dbo].[Ai_press].[Barcode]
    where [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Date] BETWEEN '${startDate}' AND '${finishDate}'
    and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
    and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Line] = '${productionline}'
    and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
 
    and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])

    and Operator='Operator'
    and [Ai_press].[Master_Judgment]!='Not Judged'
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
  order by d`);

      let dataAverageday = [];
      let dataSTDDay = [];
      let LSL = [];
      let USL = [];
      // let CL = [];
      if (parameter == "Parallelism") {
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

      var selectMCday = JSON.parse(aiPress);
      var listResultday = [];
      //AVG
      var listDataAverageday = [];
      var seriesMCday = [];
      //STD
      var listDataSTDDay = [];
      var seriesMCSTDDay = [];
      var listRawData =[];

      for (let index = 0; index < selectMCday.length; index++) {
        const arrayMC = selectMCday[index];

        let resultday = await user.sequelize
          .query(`
          --resultday
          DECLARE @StartDate DATE = '${startDate}',
    @EndDate DATE = '${finishDate}';
    WITH N1 (N) AS (SELECT 1 FROM (VALUES (1), (1), (1), (1), (1), (1), (1), (1), (1), (1)) n (N)),
    N2 (N) AS (SELECT 1 FROM N1 AS N1 CROSS JOIN N1 AS N2),
    N3 (N) AS (SELECT 1 FROM N2 AS N1 CROSS JOIN N2 AS N2),
    selectDate (d) as (SELECT TOP (DATEDIFF(DAY, @StartDate, @EndDate) + 1)
    Date = DATEADD(DAY, ROW_NUMBER() OVER(ORDER BY N) - 1, @StartDate)
    FROM N3),		
		XT (x1,x2,x3,x4,x5,x6) as
          (select [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Date] as [Date]
          ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120
          then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time))
          when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120 then 0 end as [C/T in sec]
          ,case when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) >= 120
          then datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time))
          when datediff(SECOND,0,cast((lag([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) over (order by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time] desc) - [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) as time)) < 120 then 0 end as [D/T]        
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] as [model]         
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Machine_no] as [MC]
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] as [barcode]
          FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
          INNER JOIN [DataforAnalysis].[dbo].[Ai_press]
          ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = [DataforAnalysis].[dbo].[Ai_press].[Barcode]
          where CONVERT(DATE,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) between '${startDate}' AND '${finishDate}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Machine_no] = '${selectMCname}'
          and [TransportData].[dbo].[Master_matchings].[createdAt] = (select max([TransportData].[dbo].[Master_matchings].[createdAt]) from [TransportData].[dbo].[Master_matchings])
          and Operator='Operator'
          and [Ai_press].[Master_Judgment]!='Not Judged'
	
          )
          , Ai (y1,y2,y3,y4,y5,y6,y7,y8) as
          (select [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] as [Parameter]
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] as [model]
          ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
          ,[TransportData].[dbo].[Master_matchings].CL as [CL]
          ,[TransportData].[dbo].[Master_matchings].USL as [USL]
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Date] as [Date]
          ,[DataforAnalysis].[dbo].[Ai_press].[Machine_no] as [Fixture]
          ,[DataforAnalysis].[dbo].[Ai_press].[Barcode] as [Barcode]
          FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
          INNER JOIN [TransportData].[dbo].[Master_matchings]
          ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
          INNER JOIN [DataforAnalysis].[dbo].[Ai_press]
          ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = [DataforAnalysis].[dbo].[Ai_press].[Barcode]
          where CONVERT(DATE,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) between '${startDate}' AND '${finishDate}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          and [DataforAnalysis].[dbo].[Ai_press].[Machine_no] = '${arrayMC}'
          and Operator='Operator'
          and [DataforAnalysis].[dbo].[Ai_press].[Master_Judgment]!='Not Judged'
          )
          
          , XT1 (a1,a2,a3,a4,a5) as 
          (select x1 as [Date]
          ,cast(convert(float,sum(x2))/count(x2) as DECIMAL(10, 2)) as [Cycle_time (sec)]
          ,cast(convert(float,sum(x3))/60 as decimal(10,0)) as [Down time (min)] 
          ,x4 as [Model]
          ,x5 as [Machine]
          from XT
          group by x1,x4,x5
          )

          , Ai1 (b1,b2,b3,b4,b5,b6,b7) as
          (select y6 as [Date]
          ,cast(convert(float,count(case when y1 >= y3 and y1 <= y5 then 1 else null end))/
          convert(float,count(case when y1 >= y3 and y1 <= y5 then 1 else null end)
          + count(case when y1 < y3 or y1 > y5 then 1 else null end)) * 100 AS DECIMAL(10, 2)) as [%Yield]
          ,cast(AVG(y1) as decimal(10,3)) as [AVG]
          ,cast(stdev(y1) as decimal(10,3)) as [STD]
          ,case when (cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) < cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2))) or
          ((cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) < cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2))) and y3 = 0)
          then cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) when cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) > cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2))
          then cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2)) when cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) = cast(convert(float,((AVG(y1)-y3)/(3*STDEV(y1)))) as decimal(10,2))
          then cast(convert(float,((y5-AVG(y1))/(3*STDEV(y1)))) as decimal(10,2)) end as [CPK]
          ,y2
          ,y7
          from Ai
          group by y6,y3,y4,y5,y2,y7          
          )
          
          select d as Date
          ,b2 as [%Yield]
          ,a2 as [Cycle_time (sec)]
          ,a3 as [Down time (min)]
          ,b3 as [AVG]
          ,b4 as [STD] 
          ,b5 as [CPK]
          ,a4 as [Model]
          ,a5 as [Machine]
          ,b7 as [Fixture]
          from XT1 JOIN Ai1 on XT1.a1 = Ai1.b1 full outer join selectDate on selectDate.d = Ai1.b1
		  order by d`);

        listResultday.push(resultday[0]);
// RAW DATA
        let raw_data = await user.sequelize.query(`
        select [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] as [Parameter]
        ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] as [model]
        ,[TransportData].[dbo].[Master_matchings].LSL as [LSL]
        ,[TransportData].[dbo].[Master_matchings].CL as [CL]
        ,[TransportData].[dbo].[Master_matchings].USL as [USL]
        ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Date] as [Date]
        ,[DataforAnalysis].[dbo].[Ai_press].[Machine_no] as [Fixture]
        ,[DataforAnalysis].[dbo].[Ai_press].[Barcode] as [Barcode]
        FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
        INNER JOIN [TransportData].[dbo].[Master_matchings]
        ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
        INNER JOIN [DataforAnalysis].[dbo].[Ai_press]
        ON [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] = [DataforAnalysis].[dbo].[Ai_press].[Barcode]
        where CONVERT(DATE,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Time]) between '${startDate}' AND '${finishDate}'
        and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
        and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
        and [DataforAnalysis].[dbo].[Ai_press].[Machine_no] = '${arrayMC}'
        and Operator='Operator'
        and [DataforAnalysis].[dbo].[Ai_press].[Master_Judgment]!='Not Judged'

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
          DataSeriesday = {
            name: selectMCday[i],
            data: listDataAverageday[i],
          };
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
          DataSeriesSTDDay = {
            name: selectMCday[i],
            data: listDataSTDDay[i],
          };
        }
        seriesMCSTDDay.push(DataSeriesSTDDay);
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

      if (parameter == "Parallelism") {
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
      let seriesCL_STD = { name: "UCL_STD", data: CL_STD };

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
        // seriesCL: seriesCL[0],
        seriesLCL,
        seriesUCL,
        seriesLCL_STD,
        seriesUCL_STD,
        seriesCL,
        seriesCL_STD,
        controlLimit,
        listRawData,
        listResultday,
        listDataAverageday,
        seriesMCday,
        listDataSTDDay,
        seriesMCSTDDay,

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
    FROM [DataforAnalysis].[dbo].[Ai_press]
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
    let result = await user.sequelize.query(`--select  Line
    Select distinct [Model], [Line]
    FROM [DataforAnalysis].[dbo].[Ai_press]
    where [DataforAnalysis].[dbo].[Ai_press].[Model] = '${myModel}'`);
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
router.get("/motordimmachine/:myLine/:myModel", async (req, res) => {
  try {
    const { myLine, myModel } = req.params;
    var line = myLine.trim();
    var result = await user.sequelize
      .query(`Select distinct [Machine_no], [Line]
      FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
      where [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Line] = '${myLine}'
      and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${myModel}'`);

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
router.get("/aiPress", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select 'A' as Machine_no
    union
    select 'B'`);
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
