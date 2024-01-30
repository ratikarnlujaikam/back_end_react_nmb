const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/year", async (req, res) => {
  try {
    let result = await user.sequelize
      .query(`  select distinct year([InspectionDate]) as year
    FROM [QAInspection].[dbo].[tbVisualInspection]
    order by year([InspectionDate])`);
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
router.get("/Month", async (req, res) => {
  try {
    let result = await user.sequelize
      .query(`select distinct MONTH([InspectionDate]) as Month
      FROM [QAInspection].[dbo].[tbVisualInspection]
      order by MONTH([InspectionDate])`);
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
router.get("/Model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Model_Name]
    FROM [QAInspection].[dbo].[tbVisualInspection]
    where  Model_Name !='all'
    union 
    select '**ALL**'
    order by [Model_Name]`);
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
router.get("/insType/:Model", async (req, res) => {
  try {
    const { Model } = req.params;
    var result = [[]];
    if (Model == "**ALL**") {
      var result = await user.sequelize.query(`select distinct [InspectionType]
      FROM [QAInspection].[dbo].[tbVisualInspection]
      where InspectionType !='All'
      union 
      select '**ALL**'
      order by [InspectionType]`);
    } else {
      var result = await user.sequelize.query(`select distinct [InspectionType]
          FROM [QAInspection].[dbo].[tbVisualInspection]
          where [Model_Name] = '${Model}'
          and InspectionType !='All'
          union 
          select '**ALL**'
          order by [InspectionType]`);
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

router.get("/DefectNG/:Model/:insType/:year/:Month", async (req, res) => {
  try {
    var result = [[]];
    const { year, Month, Model, insType } = req.params;
    if (Model == "**ALL**" && insType == "**ALL**") {
      var result = await user.sequelize.query(`
      --Page 1
      with AA as (select convert(nvarchar,[InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY

               FROM [QAInspection].[dbo].[tbVisualInspection]
               where  [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'
               group by [InspectionDate],[InspectionResult])

        ,BB as (
        SELECT Date,case when ACCEPT is null then 0 else ACCEPT end as ACCEPT
        ,case when REJECT is null then 0 else REJECT end as REJECT
                  FROM AA
                  PIVOT (sum(RESULT_QTY)
                  FOR [InspectionResult] IN (ACCEPT,REJECT))
                  AS pvt
                  group by Date,ACCEPT,REJECT)


      --finalAB Reject_Percent,LAR_Percent

      , finalAB as (
      select date,
          ACCEPT+REJECT as Input,
          ACCEPT as Output,
          REJECT as REJECT_lot,
              CAST ((REJECT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS Reject_Percent,
              CAST ((ACCEPT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS LAR_Percent
              from BB)

          ,DD (d1,d2,d3,d4) as (
          SELECT [InspectionDate],[QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY]
            FROM [QAInspection].[dbo].[tbVisualInspection]
            full join [QAInspection].[dbo].[tbQANumber]on [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
            where [Vis_Round]='1'
            and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'

            GROUP BY [InspectionDate], [QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY],[InspectionType]
          )

      --finalsampling Total_inspection,Total_sampling

              ,finalsampling as (
          select d1 as [Date],
              sum(d3)  as Total_inspection,
              sum(d4)  as Total_sampling
              from DD
              GROUP BY d1
          )
      --FF defect_QTY,DPPM
          ,FF as (
          SELECT  [InspectionDate] as date, sum([QTY]) as defect_QTY
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'
        group by [InspectionDate],Total_sampling)
     ,FX as (
          SELECT  [InspectionDate] as date, sum([QTY]) as defect_QTY,[Reject_visual].[Location]
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'
        group by [InspectionDate],Total_sampling,[Reject_visual].[Location])

  

            ,FF1 as (SELECT  [InspectionDate] as date ,sum([QTY])*1000000/Total_sampling as DPPM
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'
        group by [InspectionDate],Total_sampling
        )
        ,FF2 as (SELECT  [InspectionDate] as date ,sum([QTY])*1000000/Total_sampling as DPPM ,
          [Reject_visual].[Location]
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
              and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'
        group by [InspectionDate],Total_sampling,[Reject_visual].[Location]
        )


        --Page 2จำนวน Reject Lot : by Location

        ,Plocation1 as (select [InspectionDate],[Reject_visual].[Location],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
            and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'
                  group by [InspectionDate],[InspectionResult],[Reject_visual].[Location]),

        Plocation2 as (
            SELECT [InspectionDate] as date,
            case when FDB is null then 0 else FDB end as FDB ,
            case when Washing is null then 0 else Washing end as Washing ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom,
            case when Loose_part is null then 0 else Loose_part end as Loose_part ,
            case when FAC2 is null then 0 else FAC2 end as FAC2
                  FROM Plocation1
                  PIVOT (sum(REJECT)
                  FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by [InspectionDate],Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

    ,Plo as (
            SELECT date,
            case when FDB is null then 0 else FDB end as FDB_defect_QTY ,
            case when Washing is null then 0 else Washing end as Washing_defect_QTY ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_defect_QTY ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_defect_QTY,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_defect_QTY ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_defect_QTY
                  FROM FX
                  PIVOT (sum(defect_QTY)
                  FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)
        ,Plocation3 as (
            SELECT   date,
            case when FDB is null then 0 else FDB end as FDB_DPPM ,
            case when Washing is null then 0 else Washing end as Washing_DPPM ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_DPPM ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_DPPM,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_DPPM ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_DPPM
                  FROM FF2
                  PIVOT (sum(DPPM)
                  FOR FF2.[Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

               , Pfinal   as
                 (select convert(nvarchar,Plocation2.Date) as Date,
                 CAST ((FDB*100/(REJECT_lot)) AS decimal(18,2)) AS FDB,
                 CAST ((Washing*100/(REJECT_lot)) AS decimal(18,2)) AS Washing,
                 CAST ((Whiteroom*100/(REJECT_lot)) AS decimal(18,2)) AS Whiteroom,
            CAST ((Cleanroom*100/(REJECT_lot)) AS decimal(18,2)) AS Cleanroom,
            CAST ((Loose_part*100/(REJECT_lot)) AS decimal(18,2)) AS Loose_part,
            CAST ((FAC2*100/(REJECT_lot)) AS decimal(18,2)) AS FAC2
                  from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

        --จำนวน Reject QTY : by Location
        , Pfinal1   as(
            select convert(nvarchar,Plocation2.Date) as Date,
            case when FDB is null then 0 else FDB end as FDB_QTY ,
            case when Washing is null then 0 else Washing end as Washing_QTY ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_QTY ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_QTY ,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_QTY ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_QTY
                  from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

      --จำนวน Reject QTY : by shift
        ,CC as (select [InspectionDate] as date,[InspectionShift],
          CAST(count([InspectionResult]) AS FLOAT) AS REJECT
              FROM [QAInspection].[dbo].[tbVisualInspection]
              where  [InspectionResult]='REJECT'
              and [Vis_Round]='1'
         and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'
                  group by [InspectionDate],[InspectionResult],[InspectionShift]
            )
        ,byshift as (
          SELECT convert(nvarchar,Date)as date ,
          case when A is null then 0 else A end as SHIFT_A,
          case when B is null then 0 else B end as SHIFT_B,
          case when C is null then 0 else C end as SHIFT_C,
          case when M is null then 0 else M end as SHIFT_M,
          case when N is null then 0 else N end as SHIFT_N
              FROM CC
              PIVOT (sum(REJECT)
              FOR[InspectionShift] IN (A,B,C,M,N))
              AS pvt)
       --DPPM by Location --Plocation3




       ,FinalTT as (
        Select substring(convert(nvarchar,finalAB.Date),9,2)+'/'+ substring(convert(nvarchar,finalAB.Date),6,2) as DATE,
      --Page 1
          case when INPUT is null then 0 else INPUT end as INPUT,
          case when OUTPUT is null then 0 else OUTPUT end as OUTPUT,
          case when REJECT_LOT is null then 0 else REJECT_LOT end as REJECT_LOT,
          case when REJECT_Percent is null then 0 else REJECT_Percent end as REJECT_Percent,
          case when LAR_Percent is null then 0 else LAR_Percent end as LAR_Percent,
          case when TOTAL_inspection is null then 0 else TOTAL_inspection end as TOTAL_inspection,
          case when TOTAL_sampling is null then 0 else TOTAL_sampling end as TOTAL_sampling,
          case when DPPM is null then 0 else DPPM end as DPPM,
          case when defect_QTY is null then 0 else defect_QTY end as defect_QTY,

        --Page2 จำนวน Reject Lot : by Location

          case when Pfinal.Cleanroom is null then 0 else Pfinal.Cleanroom end
          as Cleanroom_Percent,
          case when Pfinal.FDB is null then 0 else Pfinal.FDB end
          as FDB_Percent,
          case when Pfinal.Washing is null then 0 else Pfinal.Washing end
          as Washing_Percent,
          case when Pfinal.Whiteroom is null then 0 else Pfinal.Whiteroom end
          as Whiteroom_Percent,
          case when Pfinal.Loose_part is null then 0 else Pfinal.Loose_part end
          as Loose_part_Percent,
          case when Pfinal.FAC2 is null then 0 else Pfinal.FAC2 end
          as FAC2_Percent,
        --จำนวน Reject QTY : by Location
          case when Pfinal1.Cleanroom_QTY is null then 0 else Pfinal1.Cleanroom_QTY end
          as Cleanroom_QTY,
          case when Pfinal1.FDB_QTY is null then 0 else Pfinal1.FDB_QTY end
          as FDB_QTY,
          case when Pfinal1.Washing_QTY is null then 0 else Pfinal1.Washing_QTY end
          as Washing_QTY,
          case when Pfinal1.Whiteroom_QTY is null then 0 else Pfinal1.Whiteroom_QTY end
          as Whiteroom_QTY,
          case when Pfinal1.Loose_part_QTY is null then 0 else Pfinal1.Loose_part_QTY end
          as Loose_part_QTY,
          case when Pfinal1.FAC2_QTY is null then 0 else Pfinal1.FAC2_QTY end
          as FAC2_QTY,

        --จำนวน Reject QTY : by shift
          case when SHIFT_A is null then 0 else SHIFT_A end
          as REJECT_SHIFT_A,
          case when SHIFT_B is null then 0 else SHIFT_B end
          as REJECT_SHIFT_B,
          case when SHIFT_C is null then 0 else SHIFT_C end
          as REJECT_SHIFT_C,
          case when SHIFT_M is null then 0 else SHIFT_M end
          as REJECT_SHIFT_M,
          case when SHIFT_N is null then 0 else SHIFT_N end
          as REJECT_SHIFT_N,


    case when Cleanroom_defect_QTY is null then 0 else Cleanroom_defect_QTY end as Cleanroom_defect_QTY ,
    case when FDB_defect_QTY is null then 0 else FDB_defect_QTY end as FDB_defect_QTY ,
    case when Washing_defect_QTY is null then 0 else Washing_defect_QTY end as Washing_defect_QTY ,
    case when Whiteroom_defect_QTY is null then 0 else Whiteroom_defect_QTY end as Whiteroom_defect_QTY ,
    case when Loose_part_defect_QTY is null then 0 else Loose_part_defect_QTY end as Loose_part_defect_QTY ,
    case when FAC2_defect_QTY is null then 0 else FAC2_defect_QTY end as FAC2_defect_QTY ,

    case when Cleanroom_DPPM is null then 0 else Cleanroom_DPPM end as Cleanroom_DPPM,
    case when FDB_DPPM is null then 0 else FDB_DPPM end as FDB_DPPM ,
            case when Washing_DPPM is null then 0 else Washing_DPPM end as Washing_DPPM ,
            case when Whiteroom_DPPM is null then 0 else Whiteroom_DPPM end as Whiteroom_DPPM ,

            case when Loose_part_DPPM is null then 0 else Loose_part_DPPM end as Loose_part_DPPM ,
            case when FAC2_DPPM is null then 0 else FAC2_DPPM end as FAC2_DPPM


          from finalAB left join finalsampling on finalsampling.date=finalAB.date
          left join FF on  FF.date=finalAB.date
          left join FF1 on  FF1.date=finalAB.date
          left join Pfinal on Pfinal.date=finalAB.date
          left join Pfinal1 on Pfinal1.date=finalAB.date
          left join byshift on byshift.date=finalAB.date
          left join Plocation3 on Plocation3.date=finalAB.date
    left join Plo on Plo.date=finalAB.Date
          )

          select * from FinalTT
                union all
                select
              'TOTAL' as DATE  ,
           --Page 1

                sum (Input),
                sum(Output),
            sum(REJECT_lot),
            cast(sum(REJECT_lot)*100/sum(Input)as decimal(18,2)),
            cast(sum(Output)*100/sum (Input)as decimal(18,2)),
            sum(Total_inspection),
                sum(Total_sampling),
            sum(defect_QTY)*1000000/sum(Total_sampling) as DPPM,
            sum(defect_QTY ) as Defect_QTY,

            --Page2 จำนวน Reject Lot : by Location

            cast((sum(Pfinal1.Cleanroom_QTY)*100)/sum(REJECT_lot) as decimal(18,2)) AS Cleanroom_Percent,
             cast((sum(Pfinal1.FDB_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS FDB_Percent,
              cast((sum(Pfinal1.Washing_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Washing_Percent,
            cast((sum(Pfinal1.Whiteroom_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Whiteroom_Percent,
            cast((sum(Pfinal1.Loose_part_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Loose_part_Percent,
            cast((sum(Pfinal1.FAC2_QTY)*100)/sum(REJECT_lot) as decimal(18,2)) AS FAC2_Percent,

            --จำนวน Reject QTY : by Location

            sum(Pfinal1.Cleanroom_QTY) AS Cleanroom_QTY,
            sum(Pfinal1.FDB_QTY) AS FDB_QTY,
              sum(Pfinal1.Washing_QTY) AS Washing_QTY,
            sum(Pfinal1.Whiteroom_QTY) AS Whiteroom_QTY,
            sum(Pfinal1.Loose_part_QTY) AS Loose_part_QTY,
            sum(Pfinal1.FAC2_QTY) AS FAC2_QTY,

            --จำนวน Reject QTY : by shift
            sum(SHIFT_A),
            sum(SHIFT_B),
             sum(SHIFT_C),
             sum(SHIFT_M),
             sum(SHIFT_N),

    sum(Cleanroom_defect_QTY),
    SUM(FDB_defect_QTY) ,
    SUM(Washing_defect_QTY) ,
            sum(Whiteroom_defect_QTY) ,
    sum(Loose_part_defect_QTY) ,
            sum(FAC2_defect_QTY),

    sum(Cleanroom_defect_QTY)*1000000/sum(Total_sampling),
    SUM(FDB_defect_QTY)*1000000/sum(Total_sampling) ,
    SUM(Washing_defect_QTY)*1000000/sum(Total_sampling) ,
            sum(Whiteroom_defect_QTY)*1000000/sum(Total_sampling) ,
    sum(Loose_part_defect_QTY)*1000000/sum(Total_sampling) ,
            sum(FAC2_defect_QTY)*1000000/sum(Total_sampling)


            from finalAB left join finalsampling on finalsampling.date=finalAB.date
          left join FF on  FF.date=finalAB.date
          left join Pfinal on Pfinal.date=finalAB.date
          left join Pfinal1 on Pfinal1.date=finalAB.date
          left join byshift on byshift.date=finalAB.date
          left join Plocation3 on Plocation3.date=finalAB.date
    left join	Plo on Plo.date=finalAB.Date

group by  'Month'+substring(convert(nvarchar,FinalAB.date),6,2)
order by date
          `);
    } else if (Model == "**ALL**" && insType != "**ALL**") {
      var result = await user.sequelize.query(`with
      --Page 1
      AA as (select convert(nvarchar,[InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY

               FROM [QAInspection].[dbo].[tbVisualInspection]
               where  [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
               group by [InspectionDate],[InspectionResult])

        ,BB as (
        SELECT Date,case when ACCEPT is null then 0 else ACCEPT end as ACCEPT
        ,case when REJECT is null then 0 else REJECT end as REJECT
                  FROM AA
                  PIVOT (sum(RESULT_QTY)
                  FOR [InspectionResult] IN (ACCEPT,REJECT))
                  AS pvt
                  group by Date,ACCEPT,REJECT)


      --finalAB Reject_Percent,LAR_Percent

      , finalAB as (
      select date,
          ACCEPT+REJECT as Input,
          ACCEPT as Output,
          REJECT as REJECT_lot,
              CAST ((REJECT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS Reject_Percent,
              CAST ((ACCEPT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS LAR_Percent
              from BB)

          ,DD (d1,d2,d3,d4) as (
          SELECT [InspectionDate],[QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY]
            FROM [QAInspection].[dbo].[tbVisualInspection]
            full join [QAInspection].[dbo].[tbQANumber]on [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
            where [Vis_Round]='1'
       
            and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'

            GROUP BY [InspectionDate], [QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY],[InspectionType]
          )

      --finalsampling Total_inspection,Total_sampling

              ,finalsampling as (
          select d1 as [Date],
              sum(d3)  as Total_inspection,
              sum(d4)  as Total_sampling
              from DD
              GROUP BY d1
          )
      --FF defect_QTY,DPPM
          ,FF as (
          SELECT  [InspectionDate] as date, sum([QTY]) as defect_QTY
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
        group by [InspectionDate],Total_sampling)
     ,FX as (
          SELECT  [InspectionDate] as date, sum([QTY]) as defect_QTY,[Reject_visual].[Location]
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
        group by [InspectionDate],Total_sampling,[Reject_visual].[Location])

  

            ,FF1 as (SELECT  [InspectionDate] as date ,sum([QTY])*1000000/Total_sampling as DPPM
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
        group by [InspectionDate],Total_sampling
        )
        ,FF2 as (SELECT  [InspectionDate] as date ,sum([QTY])*1000000/Total_sampling as DPPM ,
          [Reject_visual].[Location]
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
              and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
        group by [InspectionDate],Total_sampling,[Reject_visual].[Location]
        )


        --Page 2จำนวน Reject Lot : by Location

        ,Plocation1 as (select [InspectionDate],[Location],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                 FROM [QAInspection].[dbo].[tbVisualInspection]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
            and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
                  group by [InspectionDate],[InspectionResult],[Location]),

        Plocation2 as (
            SELECT [InspectionDate] as date,
            case when FDB is null then 0 else FDB end as FDB ,
            case when Washing is null then 0 else Washing end as Washing ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom,
            case when Loose_part is null then 0 else Loose_part end as Loose_part ,
            case when FAC2 is null then 0 else FAC2 end as FAC2
                  FROM Plocation1
                  PIVOT (sum(REJECT)
                  FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by [InspectionDate],Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

    ,Plo as (
            SELECT date,
            case when FDB is null then 0 else FDB end as FDB_defect_QTY ,
            case when Washing is null then 0 else Washing end as Washing_defect_QTY ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_defect_QTY ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_defect_QTY,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_defect_QTY ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_defect_QTY
                  FROM FX
                  PIVOT (sum(defect_QTY)
                  FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)
        ,Plocation3 as (
            SELECT   date,
            case when FDB is null then 0 else FDB end as FDB_DPPM ,
            case when Washing is null then 0 else Washing end as Washing_DPPM ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_DPPM ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_DPPM,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_DPPM ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_DPPM
                  FROM FF2
                  PIVOT (sum(DPPM)
                  FOR FF2.[Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

               , Pfinal   as
                 (select convert(nvarchar,Plocation2.Date) as Date,
                 CAST ((FDB*100/(REJECT_lot)) AS decimal(18,2)) AS FDB,
                 CAST ((Washing*100/(REJECT_lot)) AS decimal(18,2)) AS Washing,
                 CAST ((Whiteroom*100/(REJECT_lot)) AS decimal(18,2)) AS Whiteroom,
            CAST ((Cleanroom*100/(REJECT_lot)) AS decimal(18,2)) AS Cleanroom,
            CAST ((Loose_part*100/(REJECT_lot)) AS decimal(18,2)) AS Loose_part,
            CAST ((FAC2*100/(REJECT_lot)) AS decimal(18,2)) AS FAC2
                  from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

        --จำนวน Reject QTY : by Location
        , Pfinal1   as(
            select convert(nvarchar,Plocation2.Date) as Date,
            case when FDB is null then 0 else FDB end as FDB_QTY ,
            case when Washing is null then 0 else Washing end as Washing_QTY ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_QTY ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_QTY ,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_QTY ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_QTY
                  from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

      --จำนวน Reject QTY : by shift
        ,CC as (select [InspectionDate] as date,[InspectionShift],
          CAST(count([InspectionResult]) AS FLOAT) AS REJECT
              FROM [QAInspection].[dbo].[tbVisualInspection]
              where  [InspectionResult]='REJECT'
              and [Vis_Round]='1'
         and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
                  group by [InspectionDate],[InspectionResult],[InspectionShift]
            )
        ,byshift as (
          SELECT convert(nvarchar,Date)as date ,
          case when A is null then 0 else A end as SHIFT_A,
          case when B is null then 0 else B end as SHIFT_B,
          case when C is null then 0 else C end as SHIFT_C,
          case when M is null then 0 else M end as SHIFT_M,
          case when N is null then 0 else N end as SHIFT_N
              FROM CC
              PIVOT (sum(REJECT)
              FOR[InspectionShift] IN (A,B,C,M,N))
              AS pvt)
       --DPPM by Location --Plocation3




       ,FinalTT as (
        Select substring(convert(nvarchar,finalAB.Date),9,2)+'/'+ substring(convert(nvarchar,finalAB.Date),6,2) as DATE,
      --Page 1
          case when INPUT is null then 0 else INPUT end as INPUT,
          case when OUTPUT is null then 0 else OUTPUT end as OUTPUT,
          case when REJECT_LOT is null then 0 else REJECT_LOT end as REJECT_LOT,
          case when REJECT_Percent is null then 0 else REJECT_Percent end as REJECT_Percent,
          case when LAR_Percent is null then 0 else LAR_Percent end as LAR_Percent,
          case when TOTAL_inspection is null then 0 else TOTAL_inspection end as TOTAL_inspection,
          case when TOTAL_sampling is null then 0 else TOTAL_sampling end as TOTAL_sampling,
          case when DPPM is null then 0 else DPPM end as DPPM,
          case when defect_QTY is null then 0 else defect_QTY end as defect_QTY,

        --Page2 จำนวน Reject Lot : by Location

          case when Pfinal.Cleanroom is null then 0 else Pfinal.Cleanroom end
          as Cleanroom_Percent,
          case when Pfinal.FDB is null then 0 else Pfinal.FDB end
          as FDB_Percent,
          case when Pfinal.Washing is null then 0 else Pfinal.Washing end
          as Washing_Percent,
          case when Pfinal.Whiteroom is null then 0 else Pfinal.Whiteroom end
          as Whiteroom_Percent,
          case when Pfinal.Loose_part is null then 0 else Pfinal.Loose_part end
          as Loose_part_Percent,
          case when Pfinal.FAC2 is null then 0 else Pfinal.FAC2 end
          as FAC2_Percent,
        --จำนวน Reject QTY : by Location
          case when Pfinal1.Cleanroom_QTY is null then 0 else Pfinal1.Cleanroom_QTY end
          as Cleanroom_QTY,
          case when Pfinal1.FDB_QTY is null then 0 else Pfinal1.FDB_QTY end
          as FDB_QTY,
          case when Pfinal1.Washing_QTY is null then 0 else Pfinal1.Washing_QTY end
          as Washing_QTY,
          case when Pfinal1.Whiteroom_QTY is null then 0 else Pfinal1.Whiteroom_QTY end
          as Whiteroom_QTY,
          case when Pfinal1.Loose_part_QTY is null then 0 else Pfinal1.Loose_part_QTY end
          as Loose_part_QTY,
          case when Pfinal1.FAC2_QTY is null then 0 else Pfinal1.FAC2_QTY end
          as FAC2_QTY,

        --จำนวน Reject QTY : by shift
          case when SHIFT_A is null then 0 else SHIFT_A end
          as REJECT_SHIFT_A,
          case when SHIFT_B is null then 0 else SHIFT_B end
          as REJECT_SHIFT_B,
          case when SHIFT_C is null then 0 else SHIFT_C end
          as REJECT_SHIFT_C,
          case when SHIFT_M is null then 0 else SHIFT_M end
          as REJECT_SHIFT_M,
          case when SHIFT_N is null then 0 else SHIFT_N end
          as REJECT_SHIFT_N,


    case when Cleanroom_defect_QTY is null then 0 else Cleanroom_defect_QTY end as Cleanroom_defect_QTY ,
    case when FDB_defect_QTY is null then 0 else FDB_defect_QTY end as FDB_defect_QTY ,
    case when Washing_defect_QTY is null then 0 else Washing_defect_QTY end as Washing_defect_QTY ,
    case when Whiteroom_defect_QTY is null then 0 else Whiteroom_defect_QTY end as Whiteroom_defect_QTY ,
    case when Loose_part_defect_QTY is null then 0 else Loose_part_defect_QTY end as Loose_part_defect_QTY ,
    case when FAC2_defect_QTY is null then 0 else FAC2_defect_QTY end as FAC2_defect_QTY ,

    case when Cleanroom_DPPM is null then 0 else Cleanroom_DPPM end as Cleanroom_DPPM,
    case when FDB_DPPM is null then 0 else FDB_DPPM end as FDB_DPPM ,
            case when Washing_DPPM is null then 0 else Washing_DPPM end as Washing_DPPM ,
            case when Whiteroom_DPPM is null then 0 else Whiteroom_DPPM end as Whiteroom_DPPM ,

            case when Loose_part_DPPM is null then 0 else Loose_part_DPPM end as Loose_part_DPPM ,
            case when FAC2_DPPM is null then 0 else FAC2_DPPM end as FAC2_DPPM


          from finalAB left join finalsampling on finalsampling.date=finalAB.date
          left join FF on  FF.date=finalAB.date
          left join FF1 on  FF1.date=finalAB.date
          left join Pfinal on Pfinal.date=finalAB.date
          left join Pfinal1 on Pfinal1.date=finalAB.date
          left join byshift on byshift.date=finalAB.date
          left join Plocation3 on Plocation3.date=finalAB.date
    left join Plo on Plo.date=finalAB.Date
          )

          select * from FinalTT
                union all
                select
              'TOTAL' as DATE  ,
           --Page 1

                sum (Input),
                sum(Output),
            sum(REJECT_lot),
            cast(sum(REJECT_lot)*100/sum(Input)as decimal(18,2)),
            cast(sum(Output)*100/sum (Input)as decimal(18,2)),
            sum(Total_inspection),
                sum(Total_sampling),
            sum(defect_QTY)*1000000/sum(Total_sampling) as DPPM,
            sum(defect_QTY ) as Defect_QTY,

            --Page2 จำนวน Reject Lot : by Location

            cast((sum(Pfinal1.Cleanroom_QTY)*100)/sum(REJECT_lot) as decimal(18,2)) AS Cleanroom_Percent,
             cast((sum(Pfinal1.FDB_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS FDB_Percent,
              cast((sum(Pfinal1.Washing_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Washing_Percent,
            cast((sum(Pfinal1.Whiteroom_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Whiteroom_Percent,
            cast((sum(Pfinal1.Loose_part_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Loose_part_Percent,
            cast((sum(Pfinal1.FAC2_QTY)*100)/sum(REJECT_lot) as decimal(18,2)) AS FAC2_Percent,

            --จำนวน Reject QTY : by Location

            sum(Pfinal1.Cleanroom_QTY) AS Cleanroom_QTY,
            sum(Pfinal1.FDB_QTY) AS FDB_QTY,
              sum(Pfinal1.Washing_QTY) AS Washing_QTY,
            sum(Pfinal1.Whiteroom_QTY) AS Whiteroom_QTY,
            sum(Pfinal1.Loose_part_QTY) AS Loose_part_QTY,
            sum(Pfinal1.FAC2_QTY) AS FAC2_QTY,

            --จำนวน Reject QTY : by shift
            sum(SHIFT_A),
            sum(SHIFT_B),
             sum(SHIFT_C),
             sum(SHIFT_M),
             sum(SHIFT_N),

    sum(Cleanroom_defect_QTY),
    SUM(FDB_defect_QTY) ,
    SUM(Washing_defect_QTY) ,
            sum(Whiteroom_defect_QTY) ,
    sum(Loose_part_defect_QTY) ,
            sum(FAC2_defect_QTY),

    sum(Cleanroom_defect_QTY)*1000000/sum(Total_sampling),
    SUM(FDB_defect_QTY)*1000000/sum(Total_sampling) ,
    SUM(Washing_defect_QTY)*1000000/sum(Total_sampling) ,
            sum(Whiteroom_defect_QTY)*1000000/sum(Total_sampling) ,
    sum(Loose_part_defect_QTY)*1000000/sum(Total_sampling) ,
            sum(FAC2_defect_QTY)*1000000/sum(Total_sampling)


            from finalAB left join finalsampling on finalsampling.date=finalAB.date
          left join FF on  FF.date=finalAB.date
          left join Pfinal on Pfinal.date=finalAB.date
          left join Pfinal1 on Pfinal1.date=finalAB.date
          left join byshift on byshift.date=finalAB.date
          left join Plocation3 on Plocation3.date=finalAB.date
    left join	Plo on Plo.date=finalAB.Date

group by  'Month'+substring(convert(nvarchar,FinalAB.date),6,2)
order by date
              `);
    } else if (Model != "**ALL**" && insType == "**ALL**") {
      var result = await user.sequelize.query(`
      with
      --Page 1
      AA as (select convert(nvarchar,[InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY

               FROM [QAInspection].[dbo].[tbVisualInspection]
               where  [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
               group by [InspectionDate],[InspectionResult])

        ,BB as (
        SELECT Date,case when ACCEPT is null then 0 else ACCEPT end as ACCEPT
        ,case when REJECT is null then 0 else REJECT end as REJECT
                  FROM AA
                  PIVOT (sum(RESULT_QTY)
                  FOR [InspectionResult] IN (ACCEPT,REJECT))
                  AS pvt
                  group by Date,ACCEPT,REJECT)


      --finalAB Reject_Percent,LAR_Percent

      , finalAB as (
      select date,
          ACCEPT+REJECT as Input,
          ACCEPT as Output,
          REJECT as REJECT_lot,
              CAST ((REJECT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS Reject_Percent,
              CAST ((ACCEPT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS LAR_Percent
              from BB)

          ,DD (d1,d2,d3,d4) as (
          SELECT [InspectionDate],[QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY]
            FROM [QAInspection].[dbo].[tbVisualInspection]
            full join [QAInspection].[dbo].[tbQANumber]on [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
            where [Vis_Round]='1'
       
            and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [Model_Name]='${Model}'

            GROUP BY [InspectionDate], [QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY],[InspectionType]
          )

      --finalsampling Total_inspection,Total_sampling

              ,finalsampling as (
          select d1 as [Date],
              sum(d3)  as Total_inspection,
              sum(d4)  as Total_sampling
              from DD
              GROUP BY d1
          )
      --FF defect_QTY,DPPM
          ,FF as (
          SELECT  [InspectionDate] as date, sum([QTY]) as defect_QTY
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
        group by [InspectionDate],Total_sampling)
     ,FX as (
          SELECT  [InspectionDate] as date, sum([QTY]) as defect_QTY,[Reject_visual].[Location]
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
        group by [InspectionDate],Total_sampling,[Reject_visual].[Location])

  

            ,FF1 as (SELECT  [InspectionDate] as date ,sum([QTY])*1000000/Total_sampling as DPPM
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
          and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
        group by [InspectionDate],Total_sampling
        )
        ,FF2 as (SELECT  [InspectionDate] as date ,sum([QTY])*1000000/Total_sampling as DPPM ,
          [Reject_visual].[Location]
        FROM [QAInspection].[dbo].[Reject_visual]
        full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
        full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
              and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
        group by [InspectionDate],Total_sampling,[Reject_visual].[Location]
        )


        --Page 2จำนวน Reject Lot : by Location

        ,Plocation1 as (select [InspectionDate],[Location],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                 FROM [QAInspection].[dbo].[tbVisualInspection]
                 where  [InspectionResult]='REJECT'
                 and [Vis_Round]='1'
            and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
                  group by [InspectionDate],[InspectionResult],[Location]),

        Plocation2 as (
            SELECT [InspectionDate] as date,
            case when FDB is null then 0 else FDB end as FDB ,
            case when Washing is null then 0 else Washing end as Washing ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom,
            case when Loose_part is null then 0 else Loose_part end as Loose_part ,
            case when FAC2 is null then 0 else FAC2 end as FAC2
                  FROM Plocation1
                  PIVOT (sum(REJECT)
                  FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by [InspectionDate],Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

    ,Plo as (
            SELECT date,
            case when FDB is null then 0 else FDB end as FDB_defect_QTY ,
            case when Washing is null then 0 else Washing end as Washing_defect_QTY ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_defect_QTY ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_defect_QTY,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_defect_QTY ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_defect_QTY
                  FROM FX
                  PIVOT (sum(defect_QTY)
                  FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)
        ,Plocation3 as (
            SELECT   date,
            case when FDB is null then 0 else FDB end as FDB_DPPM ,
            case when Washing is null then 0 else Washing end as Washing_DPPM ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_DPPM ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_DPPM,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_DPPM ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_DPPM
                  FROM FF2
                  PIVOT (sum(DPPM)
                  FOR FF2.[Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                  AS pvt
                  group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

               , Pfinal   as
                 (select convert(nvarchar,Plocation2.Date) as Date,
                 CAST ((FDB*100/(REJECT_lot)) AS decimal(18,2)) AS FDB,
                 CAST ((Washing*100/(REJECT_lot)) AS decimal(18,2)) AS Washing,
                 CAST ((Whiteroom*100/(REJECT_lot)) AS decimal(18,2)) AS Whiteroom,
            CAST ((Cleanroom*100/(REJECT_lot)) AS decimal(18,2)) AS Cleanroom,
            CAST ((Loose_part*100/(REJECT_lot)) AS decimal(18,2)) AS Loose_part,
            CAST ((FAC2*100/(REJECT_lot)) AS decimal(18,2)) AS FAC2
                  from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

        --จำนวน Reject QTY : by Location
        , Pfinal1   as(
            select convert(nvarchar,Plocation2.Date) as Date,
            case when FDB is null then 0 else FDB end as FDB_QTY ,
            case when Washing is null then 0 else Washing end as Washing_QTY ,
            case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_QTY ,
            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_QTY ,
            case when Loose_part is null then 0 else Loose_part end as Loose_part_QTY ,
            case when FAC2 is null then 0 else FAC2 end as FAC2_QTY
                  from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

      --จำนวน Reject QTY : by shift
        ,CC as (select [InspectionDate] as date,[InspectionShift],
          CAST(count([InspectionResult]) AS FLOAT) AS REJECT
              FROM [QAInspection].[dbo].[tbVisualInspection]
              where  [InspectionResult]='REJECT'
              and [Vis_Round]='1'
         and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and  [Model_Name]='${Model}'
                  group by [InspectionDate],[InspectionResult],[InspectionShift]
            )
        ,byshift as (
          SELECT convert(nvarchar,Date)as date ,
          case when A is null then 0 else A end as SHIFT_A,
          case when B is null then 0 else B end as SHIFT_B,
          case when C is null then 0 else C end as SHIFT_C,
          case when M is null then 0 else M end as SHIFT_M,
          case when N is null then 0 else N end as SHIFT_N
              FROM CC
              PIVOT (sum(REJECT)
              FOR[InspectionShift] IN (A,B,C,M,N))
              AS pvt)
       --DPPM by Location --Plocation3




       ,FinalTT as (
        Select substring(convert(nvarchar,finalAB.Date),9,2)+'/'+ substring(convert(nvarchar,finalAB.Date),6,2) as DATE,
      --Page 1
          case when INPUT is null then 0 else INPUT end as INPUT,
          case when OUTPUT is null then 0 else OUTPUT end as OUTPUT,
          case when REJECT_LOT is null then 0 else REJECT_LOT end as REJECT_LOT,
          case when REJECT_Percent is null then 0 else REJECT_Percent end as REJECT_Percent,
          case when LAR_Percent is null then 0 else LAR_Percent end as LAR_Percent,
          case when TOTAL_inspection is null then 0 else TOTAL_inspection end as TOTAL_inspection,
          case when TOTAL_sampling is null then 0 else TOTAL_sampling end as TOTAL_sampling,
          case when DPPM is null then 0 else DPPM end as DPPM,
          case when defect_QTY is null then 0 else defect_QTY end as defect_QTY,

        --Page2 จำนวน Reject Lot : by Location

          case when Pfinal.Cleanroom is null then 0 else Pfinal.Cleanroom end
          as Cleanroom_Percent,
          case when Pfinal.FDB is null then 0 else Pfinal.FDB end
          as FDB_Percent,
          case when Pfinal.Washing is null then 0 else Pfinal.Washing end
          as Washing_Percent,
          case when Pfinal.Whiteroom is null then 0 else Pfinal.Whiteroom end
          as Whiteroom_Percent,
          case when Pfinal.Loose_part is null then 0 else Pfinal.Loose_part end
          as Loose_part_Percent,
          case when Pfinal.FAC2 is null then 0 else Pfinal.FAC2 end
          as FAC2_Percent,
        --จำนวน Reject QTY : by Location
          case when Pfinal1.Cleanroom_QTY is null then 0 else Pfinal1.Cleanroom_QTY end
          as Cleanroom_QTY,
          case when Pfinal1.FDB_QTY is null then 0 else Pfinal1.FDB_QTY end
          as FDB_QTY,
          case when Pfinal1.Washing_QTY is null then 0 else Pfinal1.Washing_QTY end
          as Washing_QTY,
          case when Pfinal1.Whiteroom_QTY is null then 0 else Pfinal1.Whiteroom_QTY end
          as Whiteroom_QTY,
          case when Pfinal1.Loose_part_QTY is null then 0 else Pfinal1.Loose_part_QTY end
          as Loose_part_QTY,
          case when Pfinal1.FAC2_QTY is null then 0 else Pfinal1.FAC2_QTY end
          as FAC2_QTY,

        --จำนวน Reject QTY : by shift
          case when SHIFT_A is null then 0 else SHIFT_A end
          as REJECT_SHIFT_A,
          case when SHIFT_B is null then 0 else SHIFT_B end
          as REJECT_SHIFT_B,
          case when SHIFT_C is null then 0 else SHIFT_C end
          as REJECT_SHIFT_C,
          case when SHIFT_M is null then 0 else SHIFT_M end
          as REJECT_SHIFT_M,
          case when SHIFT_N is null then 0 else SHIFT_N end
          as REJECT_SHIFT_N,


    case when Cleanroom_defect_QTY is null then 0 else Cleanroom_defect_QTY end as Cleanroom_defect_QTY ,
    case when FDB_defect_QTY is null then 0 else FDB_defect_QTY end as FDB_defect_QTY ,
    case when Washing_defect_QTY is null then 0 else Washing_defect_QTY end as Washing_defect_QTY ,
    case when Whiteroom_defect_QTY is null then 0 else Whiteroom_defect_QTY end as Whiteroom_defect_QTY ,
    case when Loose_part_defect_QTY is null then 0 else Loose_part_defect_QTY end as Loose_part_defect_QTY ,
    case when FAC2_defect_QTY is null then 0 else FAC2_defect_QTY end as FAC2_defect_QTY ,

    case when Cleanroom_DPPM is null then 0 else Cleanroom_DPPM end as Cleanroom_DPPM,
    case when FDB_DPPM is null then 0 else FDB_DPPM end as FDB_DPPM ,
            case when Washing_DPPM is null then 0 else Washing_DPPM end as Washing_DPPM ,
            case when Whiteroom_DPPM is null then 0 else Whiteroom_DPPM end as Whiteroom_DPPM ,

            case when Loose_part_DPPM is null then 0 else Loose_part_DPPM end as Loose_part_DPPM ,
            case when FAC2_DPPM is null then 0 else FAC2_DPPM end as FAC2_DPPM


          from finalAB left join finalsampling on finalsampling.date=finalAB.date
          left join FF on  FF.date=finalAB.date
          left join FF1 on  FF1.date=finalAB.date
          left join Pfinal on Pfinal.date=finalAB.date
          left join Pfinal1 on Pfinal1.date=finalAB.date
          left join byshift on byshift.date=finalAB.date
          left join Plocation3 on Plocation3.date=finalAB.date
    left join Plo on Plo.date=finalAB.Date
          )

          select * from FinalTT
                union all
                select
              'TOTAL' as DATE  ,
           --Page 1

                sum (Input),
                sum(Output),
            sum(REJECT_lot),
            cast(sum(REJECT_lot)*100/sum(Input)as decimal(18,2)),
            cast(sum(Output)*100/sum (Input)as decimal(18,2)),
            sum(Total_inspection),
                sum(Total_sampling),
            sum(defect_QTY)*1000000/sum(Total_sampling) as DPPM,
            sum(defect_QTY ) as Defect_QTY,

            --Page2 จำนวน Reject Lot : by Location

            cast((sum(Pfinal1.Cleanroom_QTY)*100)/sum(REJECT_lot) as decimal(18,2)) AS Cleanroom_Percent,
             cast((sum(Pfinal1.FDB_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS FDB_Percent,
              cast((sum(Pfinal1.Washing_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Washing_Percent,
            cast((sum(Pfinal1.Whiteroom_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Whiteroom_Percent,
            cast((sum(Pfinal1.Loose_part_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Loose_part_Percent,
            cast((sum(Pfinal1.FAC2_QTY)*100)/sum(REJECT_lot) as decimal(18,2)) AS FAC2_Percent,

            --จำนวน Reject QTY : by Location

            sum(Pfinal1.Cleanroom_QTY) AS Cleanroom_QTY,
            sum(Pfinal1.FDB_QTY) AS FDB_QTY,
              sum(Pfinal1.Washing_QTY) AS Washing_QTY,
            sum(Pfinal1.Whiteroom_QTY) AS Whiteroom_QTY,
            sum(Pfinal1.Loose_part_QTY) AS Loose_part_QTY,
            sum(Pfinal1.FAC2_QTY) AS FAC2_QTY,

            --จำนวน Reject QTY : by shift
            sum(SHIFT_A),
            sum(SHIFT_B),
             sum(SHIFT_C),
             sum(SHIFT_M),
             sum(SHIFT_N),

    sum(Cleanroom_defect_QTY),
    SUM(FDB_defect_QTY) ,
    SUM(Washing_defect_QTY) ,
            sum(Whiteroom_defect_QTY) ,
    sum(Loose_part_defect_QTY) ,
            sum(FAC2_defect_QTY),

    sum(Cleanroom_defect_QTY)*1000000/sum(Total_sampling),
    SUM(FDB_defect_QTY)*1000000/sum(Total_sampling) ,
    SUM(Washing_defect_QTY)*1000000/sum(Total_sampling) ,
            sum(Whiteroom_defect_QTY)*1000000/sum(Total_sampling) ,
    sum(Loose_part_defect_QTY)*1000000/sum(Total_sampling) ,
            sum(FAC2_defect_QTY)*1000000/sum(Total_sampling)


            from finalAB left join finalsampling on finalsampling.date=finalAB.date
          left join FF on  FF.date=finalAB.date
          left join Pfinal on Pfinal.date=finalAB.date
          left join Pfinal1 on Pfinal1.date=finalAB.date
          left join byshift on byshift.date=finalAB.date
          left join Plocation3 on Plocation3.date=finalAB.date
    left join	Plo on Plo.date=finalAB.Date

group by  'Month'+substring(convert(nvarchar,FinalAB.date),6,2)
order by date
      `);
    } else {
      var result = await user.sequelize.query(`
      with
          --Page 1
          AA as (select convert(nvarchar,[InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY

                   FROM [QAInspection].[dbo].[tbVisualInspection]
                   where  [Vis_Round]='1'
              and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
                   group by [InspectionDate],[InspectionResult])

            ,BB as (
            SELECT Date,case when ACCEPT is null then 0 else ACCEPT end as ACCEPT
            ,case when REJECT is null then 0 else REJECT end as REJECT
                      FROM AA
                      PIVOT (sum(RESULT_QTY)
                      FOR [InspectionResult] IN (ACCEPT,REJECT))
                      AS pvt
                      group by Date,ACCEPT,REJECT)


          --finalAB Reject_Percent,LAR_Percent

          , finalAB as (
          select date,
              ACCEPT+REJECT as Input,
              ACCEPT as Output,
              REJECT as REJECT_lot,
                  CAST ((REJECT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS Reject_Percent,
                  CAST ((ACCEPT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS LAR_Percent
                  from BB)

              ,DD (d1,d2,d3,d4) as (
              SELECT [InspectionDate],[QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY]
                FROM [QAInspection].[dbo].[tbVisualInspection]
                full join [QAInspection].[dbo].[tbQANumber]on [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
                where [Vis_Round]='1'
           
                and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'

                GROUP BY [InspectionDate], [QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY],[InspectionType]
              )

          --finalsampling Total_inspection,Total_sampling

                  ,finalsampling as (
              select d1 as [Date],
                  sum(d3)  as Total_inspection,
                  sum(d4)  as Total_sampling
                  from DD
                  GROUP BY d1
              )
          --FF defect_QTY,DPPM
              ,FF as (
              SELECT  [InspectionDate] as date, sum([QTY]) as defect_QTY
            FROM [QAInspection].[dbo].[Reject_visual]
            full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
            full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                     where  [InspectionResult]='REJECT'
                     and [Vis_Round]='1'
              and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
            group by [InspectionDate],Total_sampling)
			   ,FX as (
              SELECT  [InspectionDate] as date, sum([QTY]) as defect_QTY,[Reject_visual].[Location]
            FROM [QAInspection].[dbo].[Reject_visual]
            full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
            full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                     where  [InspectionResult]='REJECT'
                     and [Vis_Round]='1'
              and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
            group by [InspectionDate],Total_sampling,[Reject_visual].[Location])

			

                ,FF1 as (SELECT  [InspectionDate] as date ,sum([QTY])*1000000/Total_sampling as DPPM
            FROM [QAInspection].[dbo].[Reject_visual]
            full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
            full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                     where  [InspectionResult]='REJECT'
                     and [Vis_Round]='1'
              and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
            group by [InspectionDate],Total_sampling
            )
            ,FF2 as (SELECT  [InspectionDate] as date ,sum([QTY])*1000000/Total_sampling as DPPM ,
              [Reject_visual].[Location]
            FROM [QAInspection].[dbo].[Reject_visual]
            full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
            full join finalsampling on finalsampling.date=[tbVisualInspection].[InspectionDate]
                     where  [InspectionResult]='REJECT'
                     and [Vis_Round]='1'
                  and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
            group by [InspectionDate],Total_sampling,[Reject_visual].[Location]
            )


            --Page 2จำนวน Reject Lot : by Location

            ,Plocation1 as (select [InspectionDate],[Location],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                     FROM [QAInspection].[dbo].[tbVisualInspection]
                     where  [InspectionResult]='REJECT'
                     and [Vis_Round]='1'
                and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
                      group by [InspectionDate],[InspectionResult],[Location]),

            Plocation2 as (
                SELECT [InspectionDate] as date,
                case when FDB is null then 0 else FDB end as FDB ,
                case when Washing is null then 0 else Washing end as Washing ,
                case when Whiteroom is null then 0 else Whiteroom end as Whiteroom ,
                case when Cleanroom is null then 0 else Cleanroom end as Cleanroom,
                case when Loose_part is null then 0 else Loose_part end as Loose_part ,
                case when FAC2 is null then 0 else FAC2 end as FAC2
                      FROM Plocation1
                      PIVOT (sum(REJECT)
                      FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                      AS pvt
                      group by [InspectionDate],Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

				,Plo as (
                SELECT date,
                case when FDB is null then 0 else FDB end as FDB_defect_QTY ,
                case when Washing is null then 0 else Washing end as Washing_defect_QTY ,
                case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_defect_QTY ,
                case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_defect_QTY,
                case when Loose_part is null then 0 else Loose_part end as Loose_part_defect_QTY ,
                case when FAC2 is null then 0 else FAC2 end as FAC2_defect_QTY
                      FROM FX
                      PIVOT (sum(defect_QTY)
                      FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                      AS pvt
                      group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)
            ,Plocation3 as (
                SELECT   date,
                case when FDB is null then 0 else FDB end as FDB_DPPM ,
                case when Washing is null then 0 else Washing end as Washing_DPPM ,
                case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_DPPM ,
                case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_DPPM,
                case when Loose_part is null then 0 else Loose_part end as Loose_part_DPPM ,
                case when FAC2 is null then 0 else FAC2 end as FAC2_DPPM
                      FROM FF2
                      PIVOT (sum(DPPM)
                      FOR FF2.[Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                      AS pvt
                      group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

                   , Pfinal   as
                     (select convert(nvarchar,Plocation2.Date) as Date,
                     CAST ((FDB*100/(REJECT_lot)) AS decimal(18,2)) AS FDB,
                     CAST ((Washing*100/(REJECT_lot)) AS decimal(18,2)) AS Washing,
                     CAST ((Whiteroom*100/(REJECT_lot)) AS decimal(18,2)) AS Whiteroom,
                CAST ((Cleanroom*100/(REJECT_lot)) AS decimal(18,2)) AS Cleanroom,
                CAST ((Loose_part*100/(REJECT_lot)) AS decimal(18,2)) AS Loose_part,
                CAST ((FAC2*100/(REJECT_lot)) AS decimal(18,2)) AS FAC2
                      from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

            --จำนวน Reject QTY : by Location
            , Pfinal1   as(
                select convert(nvarchar,Plocation2.Date) as Date,
                case when FDB is null then 0 else FDB end as FDB_QTY ,
                case when Washing is null then 0 else Washing end as Washing_QTY ,
                case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_QTY ,
                case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_QTY ,
                case when Loose_part is null then 0 else Loose_part end as Loose_part_QTY ,
                case when FAC2 is null then 0 else FAC2 end as FAC2_QTY
                      from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

          --จำนวน Reject QTY : by shift
            ,CC as (select [InspectionDate] as date,[InspectionShift],
              CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                  FROM [QAInspection].[dbo].[tbVisualInspection]
                  where  [InspectionResult]='REJECT'
                  and [Vis_Round]='1'
             and Month([InspectionDate])='${Month}'and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
                      group by [InspectionDate],[InspectionResult],[InspectionShift]
                )
            ,byshift as (
              SELECT convert(nvarchar,Date)as date ,
              case when A is null then 0 else A end as SHIFT_A,
              case when B is null then 0 else B end as SHIFT_B,
              case when C is null then 0 else C end as SHIFT_C,
              case when M is null then 0 else M end as SHIFT_M,
              case when N is null then 0 else N end as SHIFT_N
                  FROM CC
                  PIVOT (sum(REJECT)
                  FOR[InspectionShift] IN (A,B,C,M,N))
                  AS pvt)
           --DPPM by Location --Plocation3




           ,FinalTT as (
            Select substring(convert(nvarchar,finalAB.Date),9,2)+'/'+ substring(convert(nvarchar,finalAB.Date),6,2) as DATE,
          --Page 1
              case when INPUT is null then 0 else INPUT end as INPUT,
              case when OUTPUT is null then 0 else OUTPUT end as OUTPUT,
              case when REJECT_LOT is null then 0 else REJECT_LOT end as REJECT_LOT,
              case when REJECT_Percent is null then 0 else REJECT_Percent end as REJECT_Percent,
              case when LAR_Percent is null then 0 else LAR_Percent end as LAR_Percent,
              case when TOTAL_inspection is null then 0 else TOTAL_inspection end as TOTAL_inspection,
              case when TOTAL_sampling is null then 0 else TOTAL_sampling end as TOTAL_sampling,
              case when DPPM is null then 0 else DPPM end as DPPM,
              case when defect_QTY is null then 0 else defect_QTY end as defect_QTY,

            --Page2 จำนวน Reject Lot : by Location

              case when Pfinal.Cleanroom is null then 0 else Pfinal.Cleanroom end
              as Cleanroom_Percent,
              case when Pfinal.FDB is null then 0 else Pfinal.FDB end
              as FDB_Percent,
              case when Pfinal.Washing is null then 0 else Pfinal.Washing end
              as Washing_Percent,
              case when Pfinal.Whiteroom is null then 0 else Pfinal.Whiteroom end
              as Whiteroom_Percent,
              case when Pfinal.Loose_part is null then 0 else Pfinal.Loose_part end
              as Loose_part_Percent,
              case when Pfinal.FAC2 is null then 0 else Pfinal.FAC2 end
              as FAC2_Percent,
            --จำนวน Reject QTY : by Location
              case when Pfinal1.Cleanroom_QTY is null then 0 else Pfinal1.Cleanroom_QTY end
              as Cleanroom_QTY,
              case when Pfinal1.FDB_QTY is null then 0 else Pfinal1.FDB_QTY end
              as FDB_QTY,
              case when Pfinal1.Washing_QTY is null then 0 else Pfinal1.Washing_QTY end
              as Washing_QTY,
              case when Pfinal1.Whiteroom_QTY is null then 0 else Pfinal1.Whiteroom_QTY end
              as Whiteroom_QTY,
              case when Pfinal1.Loose_part_QTY is null then 0 else Pfinal1.Loose_part_QTY end
              as Loose_part_QTY,
              case when Pfinal1.FAC2_QTY is null then 0 else Pfinal1.FAC2_QTY end
              as FAC2_QTY,

            --จำนวน Reject QTY : by shift
              case when SHIFT_A is null then 0 else SHIFT_A end
              as REJECT_SHIFT_A,
              case when SHIFT_B is null then 0 else SHIFT_B end
              as REJECT_SHIFT_B,
              case when SHIFT_C is null then 0 else SHIFT_C end
              as REJECT_SHIFT_C,
              case when SHIFT_M is null then 0 else SHIFT_M end
              as REJECT_SHIFT_M,
              case when SHIFT_N is null then 0 else SHIFT_N end
              as REJECT_SHIFT_N,


				case when Cleanroom_defect_QTY is null then 0 else Cleanroom_defect_QTY end as Cleanroom_defect_QTY ,
				case when FDB_defect_QTY is null then 0 else FDB_defect_QTY end as FDB_defect_QTY ,
				case when Washing_defect_QTY is null then 0 else Washing_defect_QTY end as Washing_defect_QTY ,
				case when Whiteroom_defect_QTY is null then 0 else Whiteroom_defect_QTY end as Whiteroom_defect_QTY ,
				case when Loose_part_defect_QTY is null then 0 else Loose_part_defect_QTY end as Loose_part_defect_QTY ,
				case when FAC2_defect_QTY is null then 0 else FAC2_defect_QTY end as FAC2_defect_QTY ,
	
				case when Cleanroom_DPPM is null then 0 else Cleanroom_DPPM end as Cleanroom_DPPM,
				case when FDB_DPPM is null then 0 else FDB_DPPM end as FDB_DPPM ,
                case when Washing_DPPM is null then 0 else Washing_DPPM end as Washing_DPPM ,
                case when Whiteroom_DPPM is null then 0 else Whiteroom_DPPM end as Whiteroom_DPPM ,

                case when Loose_part_DPPM is null then 0 else Loose_part_DPPM end as Loose_part_DPPM ,
                case when FAC2_DPPM is null then 0 else FAC2_DPPM end as FAC2_DPPM


              from finalAB left join finalsampling on finalsampling.date=finalAB.date
              left join FF on  FF.date=finalAB.date
              left join FF1 on  FF1.date=finalAB.date
              left join Pfinal on Pfinal.date=finalAB.date
              left join Pfinal1 on Pfinal1.date=finalAB.date
              left join byshift on byshift.date=finalAB.date
              left join Plocation3 on Plocation3.date=finalAB.date
			  left join Plo on Plo.date=finalAB.Date
              )

              select * from FinalTT
                    union all
                    select
                  'TOTAL' as DATE  ,
               --Page 1

                    sum (Input),
                    sum(Output),
                sum(REJECT_lot),
                cast(sum(REJECT_lot)*100/sum(Input)as decimal(18,2)),
                cast(sum(Output)*100/sum (Input)as decimal(18,2)),
                sum(Total_inspection),
                    sum(Total_sampling),
                sum(defect_QTY)*1000000/sum(Total_sampling) as DPPM,
                sum(defect_QTY ) as Defect_QTY,

                --Page2 จำนวน Reject Lot : by Location

                cast((sum(Pfinal1.Cleanroom_QTY)*100)/sum(REJECT_lot) as decimal(18,2)) AS Cleanroom_Percent,
                 cast((sum(Pfinal1.FDB_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS FDB_Percent,
                  cast((sum(Pfinal1.Washing_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Washing_Percent,
                cast((sum(Pfinal1.Whiteroom_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Whiteroom_Percent,
                cast((sum(Pfinal1.Loose_part_QTY)*100)/sum(REJECT_lot)as decimal(18,2)) AS Loose_part_Percent,
                cast((sum(Pfinal1.FAC2_QTY)*100)/sum(REJECT_lot) as decimal(18,2)) AS FAC2_Percent,

                --จำนวน Reject QTY : by Location

                sum(Pfinal1.Cleanroom_QTY) AS Cleanroom_QTY,
                sum(Pfinal1.FDB_QTY) AS FDB_QTY,
                  sum(Pfinal1.Washing_QTY) AS Washing_QTY,
                sum(Pfinal1.Whiteroom_QTY) AS Whiteroom_QTY,
                sum(Pfinal1.Loose_part_QTY) AS Loose_part_QTY,
                sum(Pfinal1.FAC2_QTY) AS FAC2_QTY,

                --จำนวน Reject QTY : by shift
                sum(SHIFT_A),
                sum(SHIFT_B),
                 sum(SHIFT_C),
                 sum(SHIFT_M),
                 sum(SHIFT_N),

				sum(Cleanroom_defect_QTY),
				SUM(FDB_defect_QTY) ,
				SUM(Washing_defect_QTY) ,
                sum(Whiteroom_defect_QTY) ,
				sum(Loose_part_defect_QTY) ,
                sum(FAC2_defect_QTY),

				sum(Cleanroom_defect_QTY)*1000000/sum(Total_sampling),
				SUM(FDB_defect_QTY)*1000000/sum(Total_sampling) ,
				SUM(Washing_defect_QTY)*1000000/sum(Total_sampling) ,
                sum(Whiteroom_defect_QTY)*1000000/sum(Total_sampling) ,
				sum(Loose_part_defect_QTY)*1000000/sum(Total_sampling) ,
                sum(FAC2_defect_QTY)*1000000/sum(Total_sampling)


                from finalAB left join finalsampling on finalsampling.date=finalAB.date
              left join FF on  FF.date=finalAB.date
              left join Pfinal on Pfinal.date=finalAB.date
              left join Pfinal1 on Pfinal1.date=finalAB.date
              left join byshift on byshift.date=finalAB.date
              left join Plocation3 on Plocation3.date=finalAB.date
			  left join	Plo on Plo.date=finalAB.Date

  group by  'Month'+substring(convert(nvarchar,FinalAB.date),6,2)
  order by date
          `);
    }

    // แกน  y
    let Cleanroom_Percent = [];
    let FDB_Percent = [];
    let Loose_part_Percent = [];
    let Washing_Percent = [];
    let Whiteroom_Percent = [];
    let FAC2_Percent = [];
    let LAR_Percent = [];
    result[0].forEach((item) => {
      Cleanroom_Percent.push(item.Cleanroom_Percent);
      FDB_Percent.push(item.FDB_Percent);
      Loose_part_Percent.push(item.Loose_part_Percent);
      Washing_Percent.push(item.Washing_Percent);
      Whiteroom_Percent.push(item.Whiteroom_Percent);
      FAC2_Percent.push(item.FAC2_Percent);
      LAR_Percent.push(item.LAR_Percent);
    });

    console.log(Cleanroom_Percent);
    console.log(FDB_Percent);
    console.log(Loose_part_Percent);
    console.log(Washing_Percent);
    console.log(Whiteroom_Percent);
    console.log(LAR_Percent);

    var listRawData = [];
    listRawData.push(result[0]);

    res.json({
      result: result[0],
      listRawData,
      LAR_Percent,
      Cleanroom_Percent,
      FDB_Percent,
      Loose_part_Percent,
      Washing_Percent,
      FAC2_Percent,
      Whiteroom_Percent,
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
