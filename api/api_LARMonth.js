const express = require("express");
const router = express.Router();
const user = require("../database/models/user");



router.get("/Model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Model_Name]
    FROM [QAInspection].[dbo].[tbVisualInspection]
		where [QAInspection].[dbo].[tbVisualInspection].[Model_Name]!='All'
	union All
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

router.get("/year", async (req, res) => {
  try {
    let result = await user.sequelize.query(`  select distinct year([InspectionDate]) as year
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

router.get("/LARMonth/:Model/:insType/:year",
  async (req, res) => {
    try {
      var result = [[]];
      const { year,Model, insType} = req.params;
      if  (Model == "**ALL**"&& insType == "**ALL**") {
        var result = await user.sequelize
          .query(`with  AA as (select month([InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY

          FROM [QAInspection].[dbo].[tbVisualInspection]
          where  [Vis_Round]='1'
           and year([InspectionDate])='${year}'
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
 select  date,
     ACCEPT+REJECT as Input,
     ACCEPT as Output,
     REJECT as REJECT_lot,
         CAST ((REJECT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS Reject_Percent,
         CAST ((ACCEPT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS LAR_Percent
         from BB)

     ,DD (d1,d2,d3,d4) as (
     SELECT month([InspectionDate]),[QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY]
       FROM [QAInspection].[dbo].[tbVisualInspection]
       full join [QAInspection].[dbo].[tbQANumber]on [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
       where [Vis_Round]='1'
     
                  and year([InspectionDate])='${year}'

       GROUP BY [InspectionDate], [QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY],[InspectionType]
     )

 --finalsampling Total_inspection,Total_sampling

         ,finalsampling as (
     select d1 as date,
         sum(d3)  as Total_inspection,
         sum(d4)  as Total_sampling
         from DD
         GROUP BY d1
     )

                           --FF defect_QTY
     ,FF as (
     SELECT  month([InspectionDate]) as date, sum([QTY]) as defect_QTY
   FROM [QAInspection].[dbo].[Reject_visual]
   full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
            where  [InspectionResult]='REJECT'
            and [Vis_Round]='1'
                                 and year([InspectionDate])='${year}'
   group by [InspectionDate],[QTY])

              ,finaldefect_QTY1 as (
       SELECT date,
       case when defect_QTY is null then 0 else defect_QTY end as defect_QTY
                       from FF)

               ,finaldefect_QTY as (
   select date,sum(defect_QTY) as defect_QTY
               from finaldefect_QTY1
               group by date)

                ,FF1 as (
                       SELECT  finalsampling.date ,defect_QTY*1000000/Total_sampling as DPPM
   FROM finaldefect_QTY full join finalsampling
               on finaldefect_QTY.date=finalsampling.date
   )
 ,FF4 as (
       SELECT date,
       case when DPPM is null then 0 else DPPM end as DPPM
                       from FF1)


                  ,FX as (
     SELECT  month([InspectionDate]) as date, sum([QTY]) as defect_QTY,[Reject_visual].[Location]
   FROM [QAInspection].[dbo].[Reject_visual]
   full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
   full join finalsampling on finalsampling.date=[Reject_visual].Inspection
            where  [InspectionResult]='REJECT'
            and [Vis_Round]='1'
                                 and year([InspectionDate])='${year}'
   group by [InspectionDate],Total_sampling,[Reject_visual].[Location])

--DefectNG Qty by Location
                       ,Plo as (
       SELECT date,
                        case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_defect_QTY,
       case when FDB is null then 0 else FDB end as FDB_defect_QTY ,
       case when Washing is null then 0 else Washing end as Washing_defect_QTY ,
       case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_defect_QTY ,
       case when Loose_part is null then 0 else Loose_part end as Loose_part_defect_QTY ,
       case when FAC2 is null then 0 else FAC2 end as FAC2_defect_QTY

             FROM FX
             PIVOT (sum(defect_QTY)
             FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
             AS pvt
             group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

--Reject by Location (QTY)
                       ,Plocation1 as (
                         select month([InspectionDate])as date ,[Reject_visual].[Location],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                       FROM [QAInspection].[dbo].[tbVisualInspection]
             left join [QAInspection].[dbo].[Reject_visual]
             on [tbVisualInspection].InsNumber=[Reject_visual].Inspection
                       where  [InspectionResult]='REJECT'
                       and [Vis_Round]='1'
                       and year([InspectionDate])='${year}'
                        group by [InspectionDate],[InspectionResult],[Reject_visual].[Location]
                        )

   ,Plocation2 as (
       SELECT date,
                       case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_QTY,
       case when FDB is null then 0 else FDB end as FDB_QTY ,
       case when Washing is null then 0 else Washing end as Washing_QTY ,
       case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_QTY ,
       case when Loose_part is null then 0 else Loose_part end as Loose_part_QTY ,
       case when FAC2 is null then 0 else FAC2 end as FAC2_QTY
             FROM Plocation1
             PIVOT (sum(REJECT)
             FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
             AS pvt
             group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

--Reject QTY by Location(%)

                        , Pfinal   as
            (select convert(nvarchar,Plocation2.Date) as Date,
            CAST ((FDB_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS FDB_Percent,
            CAST ((Washing_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Washing_Percent,
            CAST ((Whiteroom_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Whiteroom_Percent,
       CAST ((Cleanroom_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Cleanroom_Percent,
       CAST ((Loose_part_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Loose_part_Percent,
       CAST ((FAC2_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS FAC2_Percent
             from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

--จำนวน Reject QTY : by shift
   ,CC as (select month([InspectionDate]) as date,[InspectionShift],
     CAST(count([InspectionResult]) AS FLOAT) AS REJECT
         FROM [QAInspection].[dbo].[tbVisualInspection]
         where  [InspectionResult]='REJECT'
         and [Vis_Round]='1'
                          and year([InspectionDate])='${year}'
             group by [InspectionDate],[InspectionResult],[InspectionShift]
       )
   ,byshift as (
     SELECT convert(nvarchar,Date)as date ,
     case when A is null then 0 else A end as REJECT_SHIFT_A,
     case when B is null then 0 else B end as REJECT_SHIFT_B,
     case when C is null then 0 else C end as REJECT_SHIFT_C,
     case when M is null then 0 else M end as REJECT_SHIFT_M,
     case when N is null then 0 else N end as REJECT_SHIFT_N
         FROM CC
         PIVOT (sum(REJECT)
         FOR[InspectionShift] IN (A,B,C,M,N))
         AS pvt)

                        ,Total_sampling as (
                        select d1,sum(d4) as sampling from DD
                       group by d1)

,Dppm as (select date,
                       Cleanroom_defect_QTY*1000000/sampling as Cleanroom_DPPM,
       FDB_defect_QTY*1000000/sampling as FDB_DPPM,
       Washing_defect_QTY*1000000/sampling as Washing_DPPM,
       Whiteroom_defect_QTY*1000000/sampling as Whiteroom_DPPM,
       Loose_part_defect_QTY*1000000/sampling as Loose_part_DPPM,
       FAC2_defect_QTY*1000000/sampling as FAC2_DPPM
          from Plo full join Total_sampling on plo.date=Total_sampling.d1)

                 select 
     case when  finalAB.date is null then 0 else  finalAB.date end   as Month,
     case when Input is null then 0 else Input end   as INPUT,
     case when Output is null then 0 else Output end  as OUTPUT,
     case when REJECT_lot is null then 0 else  REJECT_lot end   as REJECT_LOT,
     case when Reject_Percent is null then 0 else Reject_Percent end  as REJECT_Percent,
     case when LAR_Percent is null then 0 else LAR_Percent end as LAR_Percent,
                 case when Total_inspection is null then 0 else Total_inspection end as TOTAL_inspection,
     case when Total_sampling is null then 0 else Total_sampling end as TOTAL_sampling,
     case when defect_QTY is null then 0 else defect_QTY end as defect_QTY,
     case when FF4.DPPM  is null then 0 else FF4.DPPM  end  as DPPM

                       --Reject QTY by Location(%)
       ,case when Cleanroom_Percent  is null then 0 else Cleanroom_Percent  end  as Cleanroom_Percent
       ,case when FDB_Percent  is null then 0 else FDB_Percent end  as FDB_Percent
       ,case when Washing_Percent  is null then 0 else Washing_Percent  end  as Washing_Percent
       ,case when Whiteroom_Percent  is null then 0 else Whiteroom_Percent  end  as Whiteroom_Percent
       ,case when Loose_part_Percent  is null then 0 else Loose_part_Percent  end  as Loose_part_Percent
       ,case when FAC2_Percent  is null then 0 else FAC2_Percent  end  as FAC2_Percent
       

                       --Reject by Location (QTY)
       ,case when Cleanroom_QTY  is null then 0 else Cleanroom_QTY  end  as Cleanroom_QTY
       ,case when FDB_QTY  is null then 0 else FDB_QTY  end  as FDB_QTY
       ,case when Washing_QTY  is null then 0 else Washing_QTY  end  as Washing_QTY
       ,case when Whiteroom_QTY  is null then 0 else Whiteroom_QTY  end  as Whiteroom_QTY
       ,case when Loose_part_QTY  is null then 0 else Loose_part_QTY  end  as Loose_part_QTY
       ,case when FAC2_QTY  is null then 0 else FAC2_QTY  end  as FAC2_QTY

                       --DefectNG Qty by Location
       ,case when Cleanroom_defect_QTY  is null then 0 else Cleanroom_defect_QTY  end  as Cleanroom_defect_QTY
       ,case when FDB_defect_QTY  is null then 0 else FDB_defect_QTY  end  as FDB_defect_QTY
       ,case when Washing_defect_QTY  is null then 0 else Washing_defect_QTY  end  as Washing_defect_QTY
       ,case when Whiteroom_defect_QTY  is null then 0 else Whiteroom_defect_QTY  end  as Whiteroom_defect_QTY
       ,case when Loose_part_defect_QTY  is null then 0 else Loose_part_defect_QTY  end  as Loose_part_defect_QTY
       ,case when FAC2_defect_QTY  is null then 0 else FAC2_defect_QTY  end  as FAC2_defect_QTY

                       --DPPM by Location
       ,case when Cleanroom_DPPM  is null then 0 else Cleanroom_DPPM  end  as Cleanroom_DPPM
       ,case when FDB_DPPM  is null then 0 else FDB_DPPM  end  as FDB_DPPM
       ,case when Washing_DPPM  is null then 0 else Washing_DPPM  end  as Washing_DPPM
       ,case when Whiteroom_DPPM  is null then 0 else Whiteroom_DPPM  end  as Whiteroom_DPPM
       ,case when Loose_part_DPPM  is null then 0 else Loose_part_DPPM  end  as Loose_part_DPPM
       ,case when FAC2_DPPM  is null then 0 else FAC2_DPPM  end  as FAC2_DPPM

                --Reject QTY : by shift
    ,case when REJECT_SHIFT_A  is null then 0 else REJECT_SHIFT_A  end  as REJECT_SHIFT_A
       ,case when REJECT_SHIFT_B  is null then 0 else REJECT_SHIFT_B  end  as REJECT_SHIFT_B
       ,case when REJECT_SHIFT_C  is null then 0 else REJECT_SHIFT_C  end  as REJECT_SHIFT_C
       ,case when REJECT_SHIFT_M  is null then 0 else REJECT_SHIFT_M  end  as REJECT_SHIFT_M
       ,case when REJECT_SHIFT_N  is null then 0 else REJECT_SHIFT_N  end  as REJECT_SHIFT_N



                 from finalAB
                 full join finalsampling on finalAB.date=finalsampling.Date
                 full join finaldefect_QTY on finaldefect_QTY.date=finalAB.Date
                 full join FF1 on FF1.date=finalAB.Date
     Full join FF4 on FF4.date=finalAB.Date
                 full join Plo on Plo.date=finalAB.date
                 full join Plocation2 on Plocation2.date=finalAB.Date
                 full join Pfinal on Pfinal.Date=finalAB.date
                 full join byshift on byshift.date=finalAB.Date
                 full join DPPM on DPPM.date=finalAB.Date
     where finalAB.date !='0'
                 order by Month

			  
          `);
        } else if  (Model == "**ALL**"&& insType != "**ALL**") {
            var result = await user.sequelize
              .query(`
              with  AA as (select month([InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY

              FROM [QAInspection].[dbo].[tbVisualInspection]
              where  [Vis_Round]='1'
               and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
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
     select  date,
         ACCEPT+REJECT as Input,
         ACCEPT as Output,
         REJECT as REJECT_lot,
             CAST ((REJECT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS Reject_Percent,
             CAST ((ACCEPT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS LAR_Percent
             from BB)

         ,DD (d1,d2,d3,d4) as (
         SELECT month([InspectionDate]),[QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY]
           FROM [QAInspection].[dbo].[tbVisualInspection]
           full join [QAInspection].[dbo].[tbQANumber]on [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
           where [Vis_Round]='1'
         
                      and year([InspectionDate])='${year}'and [InspectionType]='${insType}'

           GROUP BY [InspectionDate], [QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY],[InspectionType]
         )

     --finalsampling Total_inspection,Total_sampling

             ,finalsampling as (
         select d1 as date,
             sum(d3)  as Total_inspection,
             sum(d4)  as Total_sampling
             from DD
             GROUP BY d1
         )

                               --FF defect_QTY
         ,FF as (
         SELECT  month([InspectionDate]) as date, sum([QTY]) as defect_QTY
       FROM [QAInspection].[dbo].[Reject_visual]
       full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
                where  [InspectionResult]='REJECT'
                and [Vis_Round]='1'
                                     and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
       group by [InspectionDate],[QTY])

                  ,finaldefect_QTY1 as (
           SELECT date,
           case when defect_QTY is null then 0 else defect_QTY end as defect_QTY
                           from FF)

                   ,finaldefect_QTY as (
       select date,sum(defect_QTY) as defect_QTY
                   from finaldefect_QTY1
                   group by date)

                    ,FF1 as (
                           SELECT  finalsampling.date ,defect_QTY*1000000/Total_sampling as DPPM
       FROM finaldefect_QTY full join finalsampling
                   on finaldefect_QTY.date=finalsampling.date
       )
     ,FF4 as (
           SELECT date,
           case when DPPM is null then 0 else DPPM end as DPPM
                           from FF1)


                      ,FX as (
         SELECT  month([InspectionDate]) as date, sum([QTY]) as defect_QTY,[Reject_visual].[Location]
       FROM [QAInspection].[dbo].[Reject_visual]
       full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
       full join finalsampling on finalsampling.date=[Reject_visual].Inspection
                where  [InspectionResult]='REJECT'
                and [Vis_Round]='1'
                                     and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
       group by [InspectionDate],Total_sampling,[Reject_visual].[Location])

--DefectNG Qty by Location
                           ,Plo as (
           SELECT date,
                            case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_defect_QTY,
           case when FDB is null then 0 else FDB end as FDB_defect_QTY ,
           case when Washing is null then 0 else Washing end as Washing_defect_QTY ,
           case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_defect_QTY ,
           case when Loose_part is null then 0 else Loose_part end as Loose_part_defect_QTY ,
           case when FAC2 is null then 0 else FAC2 end as FAC2_defect_QTY

                 FROM FX
                 PIVOT (sum(defect_QTY)
                 FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                 AS pvt
                 group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

   --Reject by Location (QTY)
                           ,Plocation1 as (
                             select month([InspectionDate])as date ,[Reject_visual].[Location],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                           FROM [QAInspection].[dbo].[tbVisualInspection]
                 left join [QAInspection].[dbo].[Reject_visual]
                 on [tbVisualInspection].InsNumber=[Reject_visual].Inspection
                           where  [InspectionResult]='REJECT'
                           and [Vis_Round]='1'
                           and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
                            group by [InspectionDate],[InspectionResult],[Reject_visual].[Location]
                            )

       ,Plocation2 as (
           SELECT date,
                           case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_QTY,
           case when FDB is null then 0 else FDB end as FDB_QTY ,
           case when Washing is null then 0 else Washing end as Washing_QTY ,
           case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_QTY ,
           case when Loose_part is null then 0 else Loose_part end as Loose_part_QTY ,
           case when FAC2 is null then 0 else FAC2 end as FAC2_QTY
                 FROM Plocation1
                 PIVOT (sum(REJECT)
                 FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                 AS pvt
                 group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

--Reject QTY by Location(%)

                            , Pfinal   as
                (select convert(nvarchar,Plocation2.Date) as Date,
                CAST ((FDB_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS FDB_Percent,
                CAST ((Washing_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Washing_Percent,
                CAST ((Whiteroom_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Whiteroom_Percent,
           CAST ((Cleanroom_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Cleanroom_Percent,
           CAST ((Loose_part_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Loose_part_Percent,
           CAST ((FAC2_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS FAC2_Percent
                 from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

--จำนวน Reject QTY : by shift
       ,CC as (select month([InspectionDate]) as date,[InspectionShift],
         CAST(count([InspectionResult]) AS FLOAT) AS REJECT
             FROM [QAInspection].[dbo].[tbVisualInspection]
             where  [InspectionResult]='REJECT'
             and [Vis_Round]='1'
                              and year([InspectionDate])='${year}'and [InspectionType]='${insType}'
                 group by [InspectionDate],[InspectionResult],[InspectionShift]
           )
       ,byshift as (
         SELECT convert(nvarchar,Date)as date ,
         case when A is null then 0 else A end as REJECT_SHIFT_A,
         case when B is null then 0 else B end as REJECT_SHIFT_B,
         case when C is null then 0 else C end as REJECT_SHIFT_C,
         case when M is null then 0 else M end as REJECT_SHIFT_M,
         case when N is null then 0 else N end as REJECT_SHIFT_N
             FROM CC
             PIVOT (sum(REJECT)
             FOR[InspectionShift] IN (A,B,C,M,N))
             AS pvt)

                            ,Total_sampling as (
                            select d1,sum(d4) as sampling from DD
                           group by d1)

   ,Dppm as (select date,
                           Cleanroom_defect_QTY*1000000/sampling as Cleanroom_DPPM,
           FDB_defect_QTY*1000000/sampling as FDB_DPPM,
           Washing_defect_QTY*1000000/sampling as Washing_DPPM,
           Whiteroom_defect_QTY*1000000/sampling as Whiteroom_DPPM,
           Loose_part_defect_QTY*1000000/sampling as Loose_part_DPPM,
           FAC2_defect_QTY*1000000/sampling as FAC2_DPPM
              from Plo full join Total_sampling on plo.date=Total_sampling.d1)

                     select 
         case when  finalAB.date is null then 0 else  finalAB.date end   as Month,
         case when Input is null then 0 else Input end   as INPUT,
         case when Output is null then 0 else Output end  as OUTPUT,
         case when REJECT_lot is null then 0 else  REJECT_lot end   as REJECT_LOT,
         case when Reject_Percent is null then 0 else Reject_Percent end  as REJECT_Percent,
         case when LAR_Percent is null then 0 else LAR_Percent end as LAR_Percent,
                     case when Total_inspection is null then 0 else Total_inspection end as TOTAL_inspection,
         case when Total_sampling is null then 0 else Total_sampling end as TOTAL_sampling,
         case when defect_QTY is null then 0 else defect_QTY end as defect_QTY,
         case when FF4.DPPM  is null then 0 else FF4.DPPM  end  as DPPM

                           --Reject QTY by Location(%)
           ,case when Cleanroom_Percent  is null then 0 else Cleanroom_Percent  end  as Cleanroom_Percent
           ,case when FDB_Percent  is null then 0 else FDB_Percent end  as FDB_Percent
           ,case when Washing_Percent  is null then 0 else Washing_Percent  end  as Washing_Percent
           ,case when Whiteroom_Percent  is null then 0 else Whiteroom_Percent  end  as Whiteroom_Percent
           ,case when Loose_part_Percent  is null then 0 else Loose_part_Percent  end  as Loose_part_Percent
           ,case when FAC2_Percent  is null then 0 else FAC2_Percent  end  as FAC2_Percent
           

                           --Reject by Location (QTY)
           ,case when Cleanroom_QTY  is null then 0 else Cleanroom_QTY  end  as Cleanroom_QTY
           ,case when FDB_QTY  is null then 0 else FDB_QTY  end  as FDB_QTY
           ,case when Washing_QTY  is null then 0 else Washing_QTY  end  as Washing_QTY
           ,case when Whiteroom_QTY  is null then 0 else Whiteroom_QTY  end  as Whiteroom_QTY
           ,case when Loose_part_QTY  is null then 0 else Loose_part_QTY  end  as Loose_part_QTY
           ,case when FAC2_QTY  is null then 0 else FAC2_QTY  end  as FAC2_QTY

                           --DefectNG Qty by Location
           ,case when Cleanroom_defect_QTY  is null then 0 else Cleanroom_defect_QTY  end  as Cleanroom_defect_QTY
           ,case when FDB_defect_QTY  is null then 0 else FDB_defect_QTY  end  as FDB_defect_QTY
           ,case when Washing_defect_QTY  is null then 0 else Washing_defect_QTY  end  as Washing_defect_QTY
           ,case when Whiteroom_defect_QTY  is null then 0 else Whiteroom_defect_QTY  end  as Whiteroom_defect_QTY
           ,case when Loose_part_defect_QTY  is null then 0 else Loose_part_defect_QTY  end  as Loose_part_defect_QTY
           ,case when FAC2_defect_QTY  is null then 0 else FAC2_defect_QTY  end  as FAC2_defect_QTY

                           --DPPM by Location
           ,case when Cleanroom_DPPM  is null then 0 else Cleanroom_DPPM  end  as Cleanroom_DPPM
           ,case when FDB_DPPM  is null then 0 else FDB_DPPM  end  as FDB_DPPM
           ,case when Washing_DPPM  is null then 0 else Washing_DPPM  end  as Washing_DPPM
           ,case when Whiteroom_DPPM  is null then 0 else Whiteroom_DPPM  end  as Whiteroom_DPPM
           ,case when Loose_part_DPPM  is null then 0 else Loose_part_DPPM  end  as Loose_part_DPPM
           ,case when FAC2_DPPM  is null then 0 else FAC2_DPPM  end  as FAC2_DPPM

                    --Reject QTY : by shift
        ,case when REJECT_SHIFT_A  is null then 0 else REJECT_SHIFT_A  end  as REJECT_SHIFT_A
           ,case when REJECT_SHIFT_B  is null then 0 else REJECT_SHIFT_B  end  as REJECT_SHIFT_B
           ,case when REJECT_SHIFT_C  is null then 0 else REJECT_SHIFT_C  end  as REJECT_SHIFT_C
           ,case when REJECT_SHIFT_M  is null then 0 else REJECT_SHIFT_M  end  as REJECT_SHIFT_M
           ,case when REJECT_SHIFT_N  is null then 0 else REJECT_SHIFT_N  end  as REJECT_SHIFT_N
   


                     from finalAB
                     full join finalsampling on finalAB.date=finalsampling.Date
                     full join finaldefect_QTY on finaldefect_QTY.date=finalAB.Date
                     full join FF1 on FF1.date=finalAB.Date
         Full join FF4 on FF4.date=finalAB.Date
                     full join Plo on Plo.date=finalAB.date
                     full join Plocation2 on Plocation2.date=finalAB.Date
                     full join Pfinal on Pfinal.Date=finalAB.date
                     full join byshift on byshift.date=finalAB.Date
                     full join DPPM on DPPM.date=finalAB.Date
         where finalAB.date !='0'
                     order by Month
    
            
              `);
            } else if  (Model != "**ALL**"&& insType == "**ALL**") {
              var result = await user.sequelize
                .query(`
                with  AA as (select month([InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY

                FROM [QAInspection].[dbo].[tbVisualInspection]
                where  [Vis_Round]='1'
                 and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
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
       select  date,
           ACCEPT+REJECT as Input,
           ACCEPT as Output,
           REJECT as REJECT_lot,
               CAST ((REJECT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS Reject_Percent,
               CAST ((ACCEPT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS LAR_Percent
               from BB)

           ,DD (d1,d2,d3,d4) as (
           SELECT month([InspectionDate]),[QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY]
             FROM [QAInspection].[dbo].[tbVisualInspection]
             full join [QAInspection].[dbo].[tbQANumber]on [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
             where [Vis_Round]='1'
           
                        and year([InspectionDate])='${year}'and  [Model_Name]='${Model}'

             GROUP BY [InspectionDate], [QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY],[InspectionType]
           )

       --finalsampling Total_inspection,Total_sampling

               ,finalsampling as (
           select d1 as date,
               sum(d3)  as Total_inspection,
               sum(d4)  as Total_sampling
               from DD
               GROUP BY d1
           )

                                 --FF defect_QTY
           ,FF as (
           SELECT  month([InspectionDate]) as date, sum([QTY]) as defect_QTY
         FROM [QAInspection].[dbo].[Reject_visual]
         full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
                  where  [InspectionResult]='REJECT'
                  and [Vis_Round]='1'
                                       and year([InspectionDate])='${year}'and  [Model_Name]='${Model}'
         group by [InspectionDate],[QTY])

                    ,finaldefect_QTY1 as (
             SELECT date,
             case when defect_QTY is null then 0 else defect_QTY end as defect_QTY
                             from FF)

                     ,finaldefect_QTY as (
         select date,sum(defect_QTY) as defect_QTY
                     from finaldefect_QTY1
                     group by date)

                      ,FF1 as (
                             SELECT  finalsampling.date ,defect_QTY*1000000/Total_sampling as DPPM
         FROM finaldefect_QTY full join finalsampling
                     on finaldefect_QTY.date=finalsampling.date
         )
       ,FF4 as (
             SELECT date,
             case when DPPM is null then 0 else DPPM end as DPPM
                             from FF1)


                        ,FX as (
           SELECT  month([InspectionDate]) as date, sum([QTY]) as defect_QTY,[Reject_visual].[Location]
         FROM [QAInspection].[dbo].[Reject_visual]
         full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
         full join finalsampling on finalsampling.date=[Reject_visual].Inspection
                  where  [InspectionResult]='REJECT'
                  and [Vis_Round]='1'
                                       and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
         group by [InspectionDate],Total_sampling,[Reject_visual].[Location])

--DefectNG Qty by Location
                             ,Plo as (
             SELECT date,
                              case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_defect_QTY,
             case when FDB is null then 0 else FDB end as FDB_defect_QTY ,
             case when Washing is null then 0 else Washing end as Washing_defect_QTY ,
             case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_defect_QTY ,
             case when Loose_part is null then 0 else Loose_part end as Loose_part_defect_QTY ,
             case when FAC2 is null then 0 else FAC2 end as FAC2_defect_QTY

                   FROM FX
                   PIVOT (sum(defect_QTY)
                   FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                   AS pvt
                   group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

     --Reject by Location (QTY)
                             ,Plocation1 as (
                               select month([InspectionDate])as date ,[Reject_visual].[Location],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                             FROM [QAInspection].[dbo].[tbVisualInspection]
                   left join [QAInspection].[dbo].[Reject_visual]
                   on [tbVisualInspection].InsNumber=[Reject_visual].Inspection
                             where  [InspectionResult]='REJECT'
                             and [Vis_Round]='1'
                             and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
                              group by [InspectionDate],[InspectionResult],[Reject_visual].[Location]
                              )

         ,Plocation2 as (
             SELECT date,
                             case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_QTY,
             case when FDB is null then 0 else FDB end as FDB_QTY ,
             case when Washing is null then 0 else Washing end as Washing_QTY ,
             case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_QTY ,
             case when Loose_part is null then 0 else Loose_part end as Loose_part_QTY ,
             case when FAC2 is null then 0 else FAC2 end as FAC2_QTY
                   FROM Plocation1
                   PIVOT (sum(REJECT)
                   FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                   AS pvt
                   group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

--Reject QTY by Location(%)

                              , Pfinal   as
                  (select convert(nvarchar,Plocation2.Date) as Date,
                  CAST ((FDB_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS FDB_Percent,
                  CAST ((Washing_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Washing_Percent,
                  CAST ((Whiteroom_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Whiteroom_Percent,
             CAST ((Cleanroom_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Cleanroom_Percent,
             CAST ((Loose_part_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Loose_part_Percent,
             CAST ((FAC2_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS FAC2_Percent
                   from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

--จำนวน Reject QTY : by shift
         ,CC as (select month([InspectionDate]) as date,[InspectionShift],
           CAST(count([InspectionResult]) AS FLOAT) AS REJECT
               FROM [QAInspection].[dbo].[tbVisualInspection]
               where  [InspectionResult]='REJECT'
               and [Vis_Round]='1'
                                and year([InspectionDate])='${year}'and [Model_Name]='${Model}'
                   group by [InspectionDate],[InspectionResult],[InspectionShift]
             )
         ,byshift as (
           SELECT convert(nvarchar,Date)as date ,
           case when A is null then 0 else A end as REJECT_SHIFT_A,
           case when B is null then 0 else B end as REJECT_SHIFT_B,
           case when C is null then 0 else C end as REJECT_SHIFT_C,
           case when M is null then 0 else M end as REJECT_SHIFT_M,
           case when N is null then 0 else N end as REJECT_SHIFT_N
               FROM CC
               PIVOT (sum(REJECT)
               FOR[InspectionShift] IN (A,B,C,M,N))
               AS pvt)

                              ,Total_sampling as (
                              select d1,sum(d4) as sampling from DD
                             group by d1)

     ,Dppm as (select date,
                             Cleanroom_defect_QTY*1000000/sampling as Cleanroom_DPPM,
             FDB_defect_QTY*1000000/sampling as FDB_DPPM,
             Washing_defect_QTY*1000000/sampling as Washing_DPPM,
             Whiteroom_defect_QTY*1000000/sampling as Whiteroom_DPPM,
             Loose_part_defect_QTY*1000000/sampling as Loose_part_DPPM,
             FAC2_defect_QTY*1000000/sampling as FAC2_DPPM
                from Plo full join Total_sampling on plo.date=Total_sampling.d1)

                       select 
           case when  finalAB.date is null then 0 else  finalAB.date end   as Month,
           case when Input is null then 0 else Input end   as INPUT,
           case when Output is null then 0 else Output end  as OUTPUT,
           case when REJECT_lot is null then 0 else  REJECT_lot end   as REJECT_LOT,
           case when Reject_Percent is null then 0 else Reject_Percent end  as REJECT_Percent,
           case when LAR_Percent is null then 0 else LAR_Percent end as LAR_Percent,
                       case when Total_inspection is null then 0 else Total_inspection end as TOTAL_inspection,
           case when Total_sampling is null then 0 else Total_sampling end as TOTAL_sampling,
           case when defect_QTY is null then 0 else defect_QTY end as defect_QTY,
           case when FF4.DPPM  is null then 0 else FF4.DPPM  end  as DPPM

                             --Reject QTY by Location(%)
             ,case when Cleanroom_Percent  is null then 0 else Cleanroom_Percent  end  as Cleanroom_Percent
             ,case when FDB_Percent  is null then 0 else FDB_Percent end  as FDB_Percent
             ,case when Washing_Percent  is null then 0 else Washing_Percent  end  as Washing_Percent
             ,case when Whiteroom_Percent  is null then 0 else Whiteroom_Percent  end  as Whiteroom_Percent
             ,case when Loose_part_Percent  is null then 0 else Loose_part_Percent  end  as Loose_part_Percent
             ,case when FAC2_Percent  is null then 0 else FAC2_Percent  end  as FAC2_Percent
             

                             --Reject by Location (QTY)
             ,case when Cleanroom_QTY  is null then 0 else Cleanroom_QTY  end  as Cleanroom_QTY
             ,case when FDB_QTY  is null then 0 else FDB_QTY  end  as FDB_QTY
             ,case when Washing_QTY  is null then 0 else Washing_QTY  end  as Washing_QTY
             ,case when Whiteroom_QTY  is null then 0 else Whiteroom_QTY  end  as Whiteroom_QTY
             ,case when Loose_part_QTY  is null then 0 else Loose_part_QTY  end  as Loose_part_QTY
             ,case when FAC2_QTY  is null then 0 else FAC2_QTY  end  as FAC2_QTY

                             --DefectNG Qty by Location
             ,case when Cleanroom_defect_QTY  is null then 0 else Cleanroom_defect_QTY  end  as Cleanroom_defect_QTY
             ,case when FDB_defect_QTY  is null then 0 else FDB_defect_QTY  end  as FDB_defect_QTY
             ,case when Washing_defect_QTY  is null then 0 else Washing_defect_QTY  end  as Washing_defect_QTY
             ,case when Whiteroom_defect_QTY  is null then 0 else Whiteroom_defect_QTY  end  as Whiteroom_defect_QTY
             ,case when Loose_part_defect_QTY  is null then 0 else Loose_part_defect_QTY  end  as Loose_part_defect_QTY
             ,case when FAC2_defect_QTY  is null then 0 else FAC2_defect_QTY  end  as FAC2_defect_QTY

                             --DPPM by Location
             ,case when Cleanroom_DPPM  is null then 0 else Cleanroom_DPPM  end  as Cleanroom_DPPM
             ,case when FDB_DPPM  is null then 0 else FDB_DPPM  end  as FDB_DPPM
             ,case when Washing_DPPM  is null then 0 else Washing_DPPM  end  as Washing_DPPM
             ,case when Whiteroom_DPPM  is null then 0 else Whiteroom_DPPM  end  as Whiteroom_DPPM
             ,case when Loose_part_DPPM  is null then 0 else Loose_part_DPPM  end  as Loose_part_DPPM
             ,case when FAC2_DPPM  is null then 0 else FAC2_DPPM  end  as FAC2_DPPM

                      --Reject QTY : by shift
          ,case when REJECT_SHIFT_A  is null then 0 else REJECT_SHIFT_A  end  as REJECT_SHIFT_A
             ,case when REJECT_SHIFT_B  is null then 0 else REJECT_SHIFT_B  end  as REJECT_SHIFT_B
             ,case when REJECT_SHIFT_C  is null then 0 else REJECT_SHIFT_C  end  as REJECT_SHIFT_C
             ,case when REJECT_SHIFT_M  is null then 0 else REJECT_SHIFT_M  end  as REJECT_SHIFT_M
             ,case when REJECT_SHIFT_N  is null then 0 else REJECT_SHIFT_N  end  as REJECT_SHIFT_N
     


                       from finalAB
                       full join finalsampling on finalAB.date=finalsampling.Date
                       full join finaldefect_QTY on finaldefect_QTY.date=finalAB.Date
                       full join FF1 on FF1.date=finalAB.Date
           Full join FF4 on FF4.date=finalAB.Date
                       full join Plo on Plo.date=finalAB.date
                       full join Plocation2 on Plocation2.date=finalAB.Date
                       full join Pfinal on Pfinal.Date=finalAB.date
                       full join byshift on byshift.date=finalAB.Date
                       full join DPPM on DPPM.date=finalAB.Date
           where finalAB.date !='0'
                       order by Month
      
              
                `);
         
        } else {
        var result = await user.sequelize
          .query(`
          with  AA as (select month([InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY

                   FROM [QAInspection].[dbo].[tbVisualInspection]
                   where  [Vis_Round]='1'
                    and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
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
          select  date,
              ACCEPT+REJECT as Input,
              ACCEPT as Output,
              REJECT as REJECT_lot,
                  CAST ((REJECT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS Reject_Percent,
                  CAST ((ACCEPT*100/(ACCEPT+REJECT)) AS decimal(11,2)) AS LAR_Percent
                  from BB)

              ,DD (d1,d2,d3,d4) as (
              SELECT month([InspectionDate]),[QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY]
                FROM [QAInspection].[dbo].[tbVisualInspection]
                full join [QAInspection].[dbo].[tbQANumber]on [QAInspection].[dbo].[tbVisualInspection].[QANumber]=[QAInspection].[dbo].[tbQANumber].[QANumber]
                where [Vis_Round]='1'
              
                           and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'

                GROUP BY [InspectionDate], [QAInspection].[dbo].[tbQANumber].[QANumber],[Lotsize],[SamplingQTY],[InspectionType]
              )

          --finalsampling Total_inspection,Total_sampling

                  ,finalsampling as (
              select d1 as date,
                  sum(d3)  as Total_inspection,
                  sum(d4)  as Total_sampling
                  from DD
                  GROUP BY d1
              )

                                    --FF defect_QTY
              ,FF as (
              SELECT  month([InspectionDate]) as date, sum([QTY]) as defect_QTY
            FROM [QAInspection].[dbo].[Reject_visual]
            full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
                     where  [InspectionResult]='REJECT'
                     and [Vis_Round]='1'
                                          and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
            group by [InspectionDate],[QTY])

                       ,finaldefect_QTY1 as (
                SELECT date,
                case when defect_QTY is null then 0 else defect_QTY end as defect_QTY
                                from FF)

                        ,finaldefect_QTY as (
						select date,sum(defect_QTY) as defect_QTY
                        from finaldefect_QTY1
                        group by date)

                         ,FF1 as (
                                SELECT  finalsampling.date ,defect_QTY*1000000/Total_sampling as DPPM
            FROM finaldefect_QTY full join finalsampling
                        on finaldefect_QTY.date=finalsampling.date
            )
			    ,FF4 as (
                SELECT date,
                case when DPPM is null then 0 else DPPM end as DPPM
                                from FF1)


                           ,FX as (
              SELECT  month([InspectionDate]) as date, sum([QTY]) as defect_QTY,[Reject_visual].[Location]
            FROM [QAInspection].[dbo].[Reject_visual]
            full join [QAInspection].[dbo].[tbVisualInspection] on [Reject_visual].[Inspection]=[tbVisualInspection].[InsNumber]
            full join finalsampling on finalsampling.date=[Reject_visual].Inspection
                     where  [InspectionResult]='REJECT'
                     and [Vis_Round]='1'
                                          and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
            group by [InspectionDate],Total_sampling,[Reject_visual].[Location])

--DefectNG Qty by Location
                                ,Plo as (
                SELECT date,
                                 case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_defect_QTY,
                case when FDB is null then 0 else FDB end as FDB_defect_QTY ,
                case when Washing is null then 0 else Washing end as Washing_defect_QTY ,
                case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_defect_QTY ,
                case when Loose_part is null then 0 else Loose_part end as Loose_part_defect_QTY ,
                case when FAC2 is null then 0 else FAC2 end as FAC2_defect_QTY

                      FROM FX
                      PIVOT (sum(defect_QTY)
                      FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                      AS pvt
                      group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

        --Reject by Location (QTY)
                                ,Plocation1 as (
                                  select month([InspectionDate])as date ,[Reject_visual].[Location],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                                FROM [QAInspection].[dbo].[tbVisualInspection]
                      left join [QAInspection].[dbo].[Reject_visual]
                      on [tbVisualInspection].InsNumber=[Reject_visual].Inspection
                                where  [InspectionResult]='REJECT'
                                and [Vis_Round]='1'
                                and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
                                 group by [InspectionDate],[InspectionResult],[Reject_visual].[Location]
                                 )

            ,Plocation2 as (
                SELECT date,
                                case when Cleanroom is null then 0 else Cleanroom end as Cleanroom_QTY,
                case when FDB is null then 0 else FDB end as FDB_QTY ,
                case when Washing is null then 0 else Washing end as Washing_QTY ,
                case when Whiteroom is null then 0 else Whiteroom end as Whiteroom_QTY ,
                case when Loose_part is null then 0 else Loose_part end as Loose_part_QTY ,
                case when FAC2 is null then 0 else FAC2 end as FAC2_QTY
                      FROM Plocation1
                      PIVOT (sum(REJECT)
                      FOR [Location] IN (Cleanroom,FDB,Loose_part,Washing,Whiteroom,FAC2,total))
                      AS pvt
                      group by date,Cleanroom,FDB,Washing,Whiteroom,total,Loose_part,FAC2)

 --Reject QTY by Location(%)

                                 , Pfinal   as
                     (select convert(nvarchar,Plocation2.Date) as Date,
                     CAST ((FDB_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS FDB_Percent,
                     CAST ((Washing_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Washing_Percent,
                     CAST ((Whiteroom_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Whiteroom_Percent,
                CAST ((Cleanroom_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Cleanroom_Percent,
                CAST ((Loose_part_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS Loose_part_Percent,
                CAST ((FAC2_QTY*100/(REJECT_lot)) AS decimal(18,2)) AS FAC2_Percent
                      from Plocation2 left join finalAB on Plocation2.date=finalAB.date)

 --จำนวน Reject QTY : by shift
            ,CC as (select month([InspectionDate]) as date,[InspectionShift],
              CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                  FROM [QAInspection].[dbo].[tbVisualInspection]
                  where  [InspectionResult]='REJECT'
                  and [Vis_Round]='1'
                                   and year([InspectionDate])='${year}'and [InspectionType]='${insType}'and [Model_Name]='${Model}'
                      group by [InspectionDate],[InspectionResult],[InspectionShift]
                )
            ,byshift as (
              SELECT convert(nvarchar,Date)as date ,
              case when A is null then 0 else A end as REJECT_SHIFT_A,
              case when B is null then 0 else B end as REJECT_SHIFT_B,
              case when C is null then 0 else C end as REJECT_SHIFT_C,
              case when M is null then 0 else M end as REJECT_SHIFT_M,
              case when N is null then 0 else N end as REJECT_SHIFT_N
                  FROM CC
                  PIVOT (sum(REJECT)
                  FOR[InspectionShift] IN (A,B,C,M,N))
                  AS pvt)

                                 ,Total_sampling as (
                                 select d1,sum(d4) as sampling from DD
                                group by d1)

        ,Dppm as (select date,
                                Cleanroom_defect_QTY*1000000/sampling as Cleanroom_DPPM,
                FDB_defect_QTY*1000000/sampling as FDB_DPPM,
                Washing_defect_QTY*1000000/sampling as Washing_DPPM,
                Whiteroom_defect_QTY*1000000/sampling as Whiteroom_DPPM,
                Loose_part_defect_QTY*1000000/sampling as Loose_part_DPPM,
                FAC2_defect_QTY*1000000/sampling as FAC2_DPPM
                   from Plo full join Total_sampling on plo.date=Total_sampling.d1)

                          select 
						  case when  finalAB.date is null then 0 else  finalAB.date end   as Month,
						  case when Input is null then 0 else Input end   as INPUT,
						  case when Output is null then 0 else Output end  as OUTPUT,
						  case when REJECT_lot is null then 0 else  REJECT_lot end   as REJECT_LOT,
						  case when Reject_Percent is null then 0 else Reject_Percent end  as REJECT_Percent,
						  case when LAR_Percent is null then 0 else LAR_Percent end as LAR_Percent,
                          case when Total_inspection is null then 0 else Total_inspection end as TOTAL_inspection,
						  case when Total_sampling is null then 0 else Total_sampling end as TOTAL_sampling,
						  case when defect_QTY is null then 0 else defect_QTY end as defect_QTY,
						  case when FF4.DPPM  is null then 0 else FF4.DPPM  end  as DPPM

                                --Reject QTY by Location(%)
								,case when Cleanroom_Percent  is null then 0 else Cleanroom_Percent  end  as Cleanroom_Percent
								,case when FDB_Percent  is null then 0 else FDB_Percent end  as FDB_Percent
								,case when Washing_Percent  is null then 0 else Washing_Percent  end  as Washing_Percent
								,case when Whiteroom_Percent  is null then 0 else Whiteroom_Percent  end  as Whiteroom_Percent
								,case when Loose_part_Percent  is null then 0 else Loose_part_Percent  end  as Loose_part_Percent
								,case when FAC2_Percent  is null then 0 else FAC2_Percent  end  as FAC2_Percent
								

                                --Reject by Location (QTY)
								,case when Cleanroom_QTY  is null then 0 else Cleanroom_QTY  end  as Cleanroom_QTY
								,case when FDB_QTY  is null then 0 else FDB_QTY  end  as FDB_QTY
								,case when Washing_QTY  is null then 0 else Washing_QTY  end  as Washing_QTY
								,case when Whiteroom_QTY  is null then 0 else Whiteroom_QTY  end  as Whiteroom_QTY
								,case when Loose_part_QTY  is null then 0 else Loose_part_QTY  end  as Loose_part_QTY
								,case when FAC2_QTY  is null then 0 else FAC2_QTY  end  as FAC2_QTY

                                --DefectNG Qty by Location
								,case when Cleanroom_defect_QTY  is null then 0 else Cleanroom_defect_QTY  end  as Cleanroom_defect_QTY
								,case when FDB_defect_QTY  is null then 0 else FDB_defect_QTY  end  as FDB_defect_QTY
								,case when Washing_defect_QTY  is null then 0 else Washing_defect_QTY  end  as Washing_defect_QTY
								,case when Whiteroom_defect_QTY  is null then 0 else Whiteroom_defect_QTY  end  as Whiteroom_defect_QTY
								,case when Loose_part_defect_QTY  is null then 0 else Loose_part_defect_QTY  end  as Loose_part_defect_QTY
								,case when FAC2_defect_QTY  is null then 0 else FAC2_defect_QTY  end  as FAC2_defect_QTY

                                --DPPM by Location
								,case when Cleanroom_DPPM  is null then 0 else Cleanroom_DPPM  end  as Cleanroom_DPPM
								,case when FDB_DPPM  is null then 0 else FDB_DPPM  end  as FDB_DPPM
								,case when Washing_DPPM  is null then 0 else Washing_DPPM  end  as Washing_DPPM
								,case when Whiteroom_DPPM  is null then 0 else Whiteroom_DPPM  end  as Whiteroom_DPPM
								,case when Loose_part_DPPM  is null then 0 else Loose_part_DPPM  end  as Loose_part_DPPM
								,case when FAC2_DPPM  is null then 0 else FAC2_DPPM  end  as FAC2_DPPM

                         --Reject QTY : by shift
						 ,case when REJECT_SHIFT_A  is null then 0 else REJECT_SHIFT_A  end  as REJECT_SHIFT_A
								,case when REJECT_SHIFT_B  is null then 0 else REJECT_SHIFT_B  end  as REJECT_SHIFT_B
								,case when REJECT_SHIFT_C  is null then 0 else REJECT_SHIFT_C  end  as REJECT_SHIFT_C
								,case when REJECT_SHIFT_M  is null then 0 else REJECT_SHIFT_M  end  as REJECT_SHIFT_M
								,case when REJECT_SHIFT_N  is null then 0 else REJECT_SHIFT_N  end  as REJECT_SHIFT_N
				


                          from finalAB
                          full join finalsampling on finalAB.date=finalsampling.Date
                          full join finaldefect_QTY on finaldefect_QTY.date=finalAB.Date
                          full join FF1 on FF1.date=finalAB.Date
						  Full join FF4 on FF4.date=finalAB.Date
                          full join Plo on Plo.date=finalAB.date
                          full join Plocation2 on Plocation2.date=finalAB.Date
                          full join Pfinal on Pfinal.Date=finalAB.date
                          full join byshift on byshift.date=finalAB.Date
                          full join DPPM on DPPM.date=finalAB.Date
						  where finalAB.date !='0'
                          order by Month

					
			  
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
    result[0].forEach( (item) => {
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
      Cleanroom_Percent ,
      FDB_Percent ,
      Loose_part_Percent,
      Washing_Percent ,
      FAC2_Percent,
      Whiteroom_Percent ,
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
