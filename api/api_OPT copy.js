const express = require("express");
const router = express.Router();
const user = require("../database/models/user_216");
const user1 = require("../database/models/user");

router.get("/shift", async (req, res) => {
  try {
    let result = await user.sequelize.query(`   select 
    distinct CASE
    WHEN [shift] is NULL THEN '***ALL***'
    ELSE [shift]
END as shift
  FROM [WOS].[dbo].[operator_Tracking]`);
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


router.get("/report/:startDate", async (req, res) => {
  try {
    const { startDate } = req.params;
    let result = await user.sequelize.query(`
    with
    FinalTT as (
  Select [Date]
 ,[Line_No]
 ,count([Emp_Code]) as [Emp_Code]
 ,[shift]
,[operator_Tracking].[Item_Name] as  MODEL
,[operator_Tracking].ItemNo
,[ItemNo_Master].[item_Name]
FROM [WOS].[dbo].[operator_Tracking]
left join [WOS].[dbo].[ItemNo_Master]
on[operator_Tracking].ItemNo=[ItemNo_Master].[item_No]
where [Date]='${startDate}'

group by [Date],[Line_No],[shift],[operator_Tracking].[Item_Name],ItemNo,[ItemNo_Master].[item_Name],ItemNo)

,SET2 AS (select [Date],[Line_No],MODEL,[Item_Name],ItemNo,
                             case when A is null then 0 else A end as SHIFT_A,
                             case when B is null then 0 else B end as SHIFT_B,
                             case when C is null then 0 else C end as SHIFT_C,
                             case when M is null then 0 else M end as SHIFT_M,
                             case when N is null then 0 else N end as SHIFT_N,
                             case when D is null then 0 else D end as SHIFT_D
                                 from FinalTT
                                 PIVOT (sum([Emp_Code])
                                 FOR[shift] IN (A,B,C,M,N,D))
                                 AS pvt
              )

     SELECT convert(nvarchar,[Date]) AS [Date] ,[Line_No],MODEL,[Item_Name],ItemNo,SHIFT_A,SHIFT_B,SHIFT_C,SHIFT_M,SHIFT_N,SHIFT_D,(SHIFT_A+SHIFT_B+SHIFT_C+SHIFT_M+SHIFT_N+SHIFT_D) as  Total FROM SET2
         union all
   SELECT convert(nvarchar,'TOTAL') AS [Date],' 'AS [Line_No],' ' as MODEL,' ' as [Item_Name],' ' as ItemNo,SUM(SHIFT_A) AS SHIFT_A,SUM(SHIFT_B) AS SHIFT_B ,SUM(SHIFT_C) AS SHIFT_C ,SUM(SHIFT_M) AS SHIFT_M ,SUM(SHIFT_N) AS SHIFT_N ,SUM(SHIFT_D) AS SHIFT_D,SUM(SHIFT_A)+SUM(SHIFT_B)+SUM(SHIFT_C)+SUM(SHIFT_M)+SUM(SHIFT_N)+sum(SHIFT_D) as  TOTAL FROM SET2
   order by [Item_Name] ,[Date]`);
                    var resultGraph = await user.sequelize
                    .query(`DECLARE @pivot_columns NVARCHAR(MAX);
    DECLARE @query NVARCHAR(MAX);
  
    SET @pivot_columns = STUFF(
      (SELECT DISTINCT ',' + QUOTENAME(UPPER(LTRIM(RTRIM([Process_Name]))))
        FROM  [WOS].[dbo].[operator_Tracking]
        where [Date]='2024-06-21' and [shift]= 'M' and Line_No like 'B%'
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
	print @pivot_columns
    SET @query = '
    SELECT Line_No, ' + @pivot_columns + '
    FROM (
      SELECT [Line_No],count([Process_Name]) as [Count_process]
,[Process_Name]
   FROM [WOS].[dbo].[operator_Tracking]
   where [Date]=''2024-06-21'' and [shift]= ''M'' and Line_No like ''B%'' 
   group by [Line_No],[Process_Name]
    ) AS subquery
    PIVOT
    (
        SUM(Count_process)
        FOR Process_Name IN (' + @pivot_columns + ')
    ) AS PivotTable;';
  
    EXECUTE sp_executesql @query;`);

                                    var download = await user.sequelize
                                    .query(`/****** Script for SelectTopNRows command from SSMS  ******/
                                    SELECT  [Date]
                                          ,[Time]
                                          ,[ItemNo]
                                          ,'Line'+[Line_No] as Line_No
                                          ,[Group]
                                          ,[Emp_Code]
                                          ,[Emp_Name]
                                          ,[Process_Code]
                                          ,[Process_Name]
                                          ,[shift]
                                          ,[TimeStamp]
                                          ,[operator_Tracking].[Item_Name] as Model
                                        ,[ItemNo_Master].[Item_Name]
                                      FROM [WOS].[dbo].[operator_Tracking]
                                      left join [WOS].[dbo].[ItemNo_Master]
                                      on[operator_Tracking].ItemNo=[ItemNo_Master].[item_No]
                                      where [Date]='${startDate}'
                                      order by [Item_Name]`
                                      );

                                      let PivotTable = [];
                                      let xAxis = resultGraph[0].map((item) => item.Date);
                                      let pivot_columns = Object.keys(resultGraph[0][0]).filter(
                                        (key) => key !== "Line_No"
                                      );
                                
                                      for (let key in pivot_columns) {
                                        let seriesData = resultGraph[0].map((item) => {
                                          let value = item[pivot_columns[key]];
                                          return value !== null ? value : 0;
                                        });
                                        PivotTable.push({
                                          name: pivot_columns[key],
                                          type: "column",
                                          data: seriesData,
                                        });
                                      }
                                
                                      for (let i = 0; i < PivotTable.length; i++) {
                                        let series = PivotTable[i];
                                        let name = series.name;
                                        let type = series.type;
                                        let data = series.data;
                                
                                        console.log("Name:", name);
                                        console.log("Type:", type);
                                        console.log("Data:", data);
                                        console.log(xAxis);
                                        console.log(PivotTable);
                                      }

    var listRawData = [];
    listRawData.push(result[0]);

    var listData =[];
    listData.push(download[0]);

    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      download: download[0],
      listRawData,
      listData,
      
      PivotTable: PivotTable.map((series) => ({
        name: series.name,
        type: series.type,
        data: series.data,
      })),

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
