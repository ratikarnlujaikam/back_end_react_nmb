
const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

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
router.get("/Month", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct Month([InspectionDate]) as Month
      FROM [QAInspection].[dbo].[tbVisualInspection]
      order by Month([InspectionDate])`);
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


router.get("/LARPP/:year/:Month",
  async (req, res) => {
    try {
      var result = [[]];
      const { year, Month } = req.params;
        var result = await user.sequelize
          .query(` with Lable1 as (select convert(nvarchar,[InspectionDate]) as Date,[QANumber], 
          [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS ACCEPT
                   FROM [QAInspection].[dbo].[tbVisualInspection] 
            where  [Vis_Round]='1'and  [InspectionType]='MP' and  
            month([InspectionDate])='${Month}' and year([InspectionDate])='${year}'
            and [InspectionResult]='ACCEPT'
                    group by [InspectionDate],[QANumber],[InspectionResult])
    
      ,Lable2 as (select convert(nvarchar,[InspectionDate]) as Date,[QANumber], 
          [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS REJECT
                   FROM [QAInspection].[dbo].[tbVisualInspection] 
            where  [Vis_Round]='1'and  [InspectionType]='MP' and  
            month([InspectionDate])='${Month}' and year([InspectionDate])='${year}'
            and [InspectionResult]='REJECT'
                    group by [InspectionDate],[QANumber],[InspectionResult])
    
      ,Lable3 as (
      select convert(nvarchar,[InspectionDate]) as Date,Visuual.[QANumber] as QANumber,[InspectionResult]
                   FROM [QAInspection].[dbo].[tbVisualInspection] as Visuual
            where  [Vis_Round]='1'and  [InspectionType]='MP' and  
            month([InspectionDate])='${Month}' and year([InspectionDate])='${year}')
    
      ,Lable4 as (
      select Lable3.Date,Lable3.[QANumber]
        ,case when Lable1.ACCEPT is null then 0 else Lable1.ACCEPT end as ACCEPT
      ,case when Lable2.REJECT is null then 0 else Lable2.REJECT end as REJECT,[ModelName]
            from Lable3 left join Lable1 on Lable3.QANumber=Lable1.[QANumber]
            left join Lable2 on Lable2.[QANumber]=Lable3.[QANumber]
            left join [QAInspection].[dbo].[tbQANumber] on [QAInspection].[dbo].[tbQANumber].[QANumber]
            = Lable3.[QANumber]
            where [ModelName]!='NULL'
            group by Lable3.Date,Lable3.[QANumber],Lable1.ACCEPT,Lable2.REJECT,[ModelName])

		,total AS (
		select 
		[ModelName],
		CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS TOTAL
		FROM Lable4 
		GROUP BY [ModelName])

		,DAY1 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY1
		FROM Lable4 WHERE DAY (DATE)='01'GROUP BY [ModelName])

		,DAY2 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY2
		FROM Lable4 WHERE DAY (DATE)='02'GROUP BY [ModelName])

		,DAY3 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY3
		FROM Lable4 WHERE DAY (DATE)='03'GROUP BY [ModelName])
		
		,DAY4 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY4
		FROM Lable4 WHERE DAY (DATE)='04'GROUP BY [ModelName])
		
		,DAY5 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY5
		FROM Lable4 WHERE DAY (DATE)='05'GROUP BY [ModelName])

		,DAY6 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY6
		FROM Lable4 WHERE DAY (DATE)='06'GROUP BY [ModelName])

		,DAY7 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY7
		FROM Lable4 WHERE DAY (DATE)='07'GROUP BY [ModelName])

		,DAY8 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY8
		FROM Lable4 WHERE DAY (DATE)='08'GROUP BY [ModelName])

		,DAY9 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY9
		FROM Lable4 WHERE DAY (DATE)='09'GROUP BY [ModelName])

		,DAY10 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY10
		FROM Lable4 WHERE DAY (DATE)='10'GROUP BY [ModelName])

		,DAY11 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY11
		FROM Lable4 WHERE DAY (DATE)='11'GROUP BY [ModelName])

		,DAY12 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY12
		FROM Lable4 WHERE DAY (DATE)='12'GROUP BY [ModelName])

		,DAY13 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY13
		FROM Lable4 WHERE DAY (DATE)='13'GROUP BY [ModelName])
		
		,DAY14 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY14
		FROM Lable4 WHERE DAY (DATE)='14'GROUP BY [ModelName])
		
		,DAY15 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY15
		FROM Lable4 WHERE DAY (DATE)='15'GROUP BY [ModelName])

		,DAY16 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY16
		FROM Lable4 WHERE DAY (DATE)='16'GROUP BY [ModelName])

		,DAY17 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY17
		FROM Lable4 WHERE DAY (DATE)='17'GROUP BY [ModelName])

		,DAY18 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY18
		FROM Lable4 WHERE DAY (DATE)='18'GROUP BY [ModelName])

		,DAY19 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY19
		FROM Lable4 WHERE DAY (DATE)='19'GROUP BY [ModelName])

		,DAY20 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY20
		FROM Lable4 WHERE DAY (DATE)='20'GROUP BY [ModelName])

		,DAY21 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY21
		FROM Lable4 WHERE DAY (DATE)='21'GROUP BY [ModelName])

		,DAY22 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY22
		FROM Lable4 WHERE DAY (DATE)='22'GROUP BY [ModelName])

		,DAY23 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY23
		FROM Lable4 WHERE DAY (DATE)='23'GROUP BY [ModelName])
		
		,DAY24 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY24
		FROM Lable4 WHERE DAY (DATE)='24'GROUP BY [ModelName])
		
		,DAY25 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY25
		FROM Lable4 WHERE DAY (DATE)='25'GROUP BY [ModelName])

		,DAY26 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY26
		FROM Lable4 WHERE DAY (DATE)='26'GROUP BY [ModelName])

		,DAY27 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY27
		FROM Lable4 WHERE DAY (DATE)='27'GROUP BY [ModelName])

		,DAY28 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY28
		FROM Lable4 WHERE DAY (DATE)='28'GROUP BY [ModelName])

		,DAY29 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY29
		FROM Lable4 WHERE DAY (DATE)='29'GROUP BY [ModelName])

		,DAY30 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY30
		FROM Lable4 WHERE DAY (DATE)='30'GROUP BY [ModelName])

		,DAY31 AS (select [ModelName],CAST ((sum(ACCEPT)*100/(sum(ACCEPT)+sum(REJECT))) AS decimal(11,2)) AS DAY31
		FROM Lable4 WHERE DAY (DATE)='31'GROUP BY [ModelName])


		SELECT total.[ModelName] ,TOTAL
		,case when DAY1 is null then 0 else DAY1 end as DAY1
		,case when DAY2 is null then 0 else DAY2 end as DAY2
		,case when DAY3 is null then 0 else DAY3 end as DAY3
		,case when DAY4 is null then 0 else DAY4 end as DAY4
		,case when DAY5 is null then 0 else DAY5 end as DAY5
		,case when DAY6 is null then 0 else DAY6 end as DAY6
		,case when DAY7 is null then 0 else DAY7 end as DAY7
		,case when DAY8 is null then 0 else DAY8 end as DAY8
		,case when DAY9 is null then 0 else DAY9 end as DAY9
		,case when DAY10 is null then 0 else DAY10 end as DAY10
		,case when DAY11 is null then 0 else DAY11 end as DAY11
		,case when DAY12 is null then 0 else DAY12 end as DAY12
		,case when DAY13 is null then 0 else DAY13 end as DAY13
		,case when DAY14 is null then 0 else DAY14 end as DAY14
		,case when DAY15 is null then 0 else DAY15 end as DAY15
		,case when DAY16 is null then 0 else DAY16 end as DAY16
		,case when DAY17 is null then 0 else DAY17 end as DAY17
		,case when DAY18 is null then 0 else DAY18 end as DAY18
		,case when DAY19 is null then 0 else DAY19 end as DAY19
		,case when DAY20 is null then 0 else DAY20 end as DAY20
		,case when DAY21 is null then 0 else DAY21 end as DAY21
		,case when DAY22 is null then 0 else DAY22 end as DAY22
		,case when DAY23 is null then 0 else DAY23 end as DAY23
		,case when DAY24 is null then 0 else DAY24 end as DAY24
		,case when DAY25 is null then 0 else DAY25 end as DAY25
		,case when DAY26 is null then 0 else DAY26 end as DAY26
		,case when DAY27 is null then 0 else DAY27 end as DAY27
		,case when DAY28 is null then 0 else DAY28 end as DAY28
		,case when DAY29 is null then 0 else DAY29 end as DAY29
		,case when DAY30 is null then 0 else DAY30 end as DAY30
		,case when DAY31 is null then 0 else DAY29 end as DAY31


		FROM total FULL JOIN DAY1 ON total.[ModelName]=DAY1.ModelName
		FULL JOIN DAY2 ON DAY2.ModelName=total.[ModelName]
		FULL JOIN DAY3 ON DAY3.ModelName=total.[ModelName]
		FULL JOIN DAY4 ON DAY4.ModelName=total.[ModelName]
		FULL JOIN DAY5 ON DAY5.ModelName=total.[ModelName]
		FULL JOIN DAY6 ON DAY6.ModelName=total.[ModelName]
		FULL JOIN DAY7 ON DAY7.ModelName=total.[ModelName]
		FULL JOIN DAY8 ON DAY8.ModelName=total.[ModelName]
		FULL JOIN DAY9 ON DAY9.ModelName=total.[ModelName]
		FULL JOIN DAY10 ON DAY10.ModelName=total.[ModelName]
		FULL JOIN DAY11 ON DAY11.ModelName=total.[ModelName]
		FULL JOIN DAY12 ON DAY12.ModelName=total.[ModelName]
		FULL JOIN DAY13 ON DAY13.ModelName=total.[ModelName]
		FULL JOIN DAY14 ON DAY14.ModelName=total.[ModelName]
		FULL JOIN DAY15 ON DAY15.ModelName=total.[ModelName]
		FULL JOIN DAY16 ON DAY16.ModelName=total.[ModelName]
		FULL JOIN DAY17 ON DAY17.ModelName=total.[ModelName]
		FULL JOIN DAY18 ON DAY18.ModelName=total.[ModelName]
		FULL JOIN DAY19 ON DAY19.ModelName=total.[ModelName]
		FULL JOIN DAY20 ON DAY20.ModelName=total.[ModelName]
		FULL JOIN DAY21 ON DAY21.ModelName=total.[ModelName]
		FULL JOIN DAY22 ON DAY22.ModelName=total.[ModelName]
		FULL JOIN DAY23 ON DAY23.ModelName=total.[ModelName]
		FULL JOIN DAY24 ON DAY24.ModelName=total.[ModelName]
		FULL JOIN DAY25 ON DAY25.ModelName=total.[ModelName]
		FULL JOIN DAY26 ON DAY26.ModelName=total.[ModelName]
		FULL JOIN DAY27 ON DAY27.ModelName=total.[ModelName]
		FULL JOIN DAY28 ON DAY28.ModelName=total.[ModelName]
		FULL JOIN DAY29 ON DAY29.ModelName=total.[ModelName]
		FULL JOIN DAY30 ON DAY30.ModelName=total.[ModelName]
		FULL JOIN DAY31 ON DAY31.ModelName=total.[ModelName]
		

	



	`);
          var resultGraph = await user.sequelize
          .query(`with A01 as (
               select convert(nvarchar,[InspectionDate]) as Date, [InspectionResult],CAST(count([InspectionResult]) AS FLOAT) AS RESULT_QTY
                  ,[Model_Name]
                                  FROM [QAInspection].[dbo].[tbVisualInspection]
                                  where  [Vis_Round]='1'
                             and  [InspectionType]='MP' and Month([InspectionDate])='${Month}' and year([InspectionDate])='${year}'
                                  group by [InspectionDate],[InspectionResult],[InspectionDate],[Model_Name])
   
                          ,B01 as (
                            SELECT
                     case when ACCEPT is null then 0 else ACCEPT end as ACCEPT
                           ,case when REJECT is null then 0 else REJECT end as REJECT,Date,[Model_Name]
                                     FROM A01
                                     PIVOT (sum(RESULT_QTY)
                                     FOR [InspectionResult] IN (ACCEPT,REJECT))
                                     AS pvt
                                     group by ACCEPT,REJECT,date,[Model_Name]
                           )
   
                      select
                      [Model_Name],
                          sum(B01.ACCEPT)+sum(B01.REJECT) AS Input,
                          sum(B01.ACCEPT) AS Output,
                          sum(B01.REJECT) AS Reject,
                      CAST ((sum(B01.ACCEPT)*100/(sum(B01.ACCEPT)+sum(B01.REJECT))) AS decimal(11,2)) AS LAR,
                          CAST ((sum(B01.REJECT)*100/(sum(B01.ACCEPT)+sum(B01.REJECT))) AS decimal(11,2)) AS Reject_Percent
                       
                         from B01
                         group by [Model_Name]
                             order by LAR desc`);


    // แกน  y
   
    let LAR = [];
    let Input = [];
    let Reject=[];
    let Reject_Percent=[];
    resultGraph[0].forEach( (item) => {
      LAR.push(item.LAR);
      Input.push(item.Input);
      Reject.push(item.Reject);
      Reject_Percent.push(item.Reject_Percent);
    });
  
    // console.log(LAR);
    console.log(resultGraph[0]);
    console.log(LAR);
    console.log(Input);
    console.log(Reject);
    console.log(Reject_Percent);
    


    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      listRawData,
      LAR,
      Reject,
      Input,
      Reject_Percent,
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
