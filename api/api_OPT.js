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
    var resultGraph = await user.sequelize.query(`with set1 as (SELECT [Date]
                      ,[Line_No]
                      ,count([Emp_Code]) as [Emp_Code]
                      ,[shift]
                    ,[operator_Tracking].[Item_Name] as  MODEL
                    ,[ItemNo_Master].[item_Name]
                  FROM [WOS].[dbo].[operator_Tracking]
                  left join [WOS].[dbo].[ItemNo_Master]
                  on[operator_Tracking].ItemNo=[ItemNo_Master].[item_No]
                  where [Date]='${startDate}'
                  group by [Date],[Line_No],[shift],[operator_Tracking].[Item_Name],ItemNo,[ItemNo_Master].[item_Name],ItemNo)

                   select [Date],[Line_No],MODEL,[Item_Name],
                                                  case when A is null then 0 else A end as SHIFT_A,
                                                  case when B is null then 0 else B end as SHIFT_B,
                                                  case when C is null then 0 else C end as SHIFT_C,
                                                  case when M is null then 0 else M end as SHIFT_M,
                                                  case when N is null then 0 else N end as SHIFT_N,
                                                  case when D is null then 0 else D end as SHIFT_D
                                                      from Set1
                                                      PIVOT (sum([Emp_Code])
                                                      FOR[shift] IN (A,B,C,M,N,D))
                                                      AS pvt
                                    order by [Item_Name]`);

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
                                      order by [Item_Name]`);

    let Line_No = [];
    let SHIFT_A = [];
    let SHIFT_B = [];
    let SHIFT_C = [];
    let SHIFT_M = [];
    let SHIFT_N = [];
    let SHIFT_D = [];

    resultGraph[0].forEach((item) => {
      Line_No.push(item.Line_No);
      SHIFT_A.push(item.SHIFT_A);
      SHIFT_B.push(item.SHIFT_B);
      SHIFT_C.push(item.SHIFT_C);
      SHIFT_M.push(item.SHIFT_M);
      SHIFT_N.push(item.SHIFT_N);
      SHIFT_D.push(item.SHIFT_D);
    });

    var listRawData = [];
    listRawData.push(result[0]);

    var listData = [];
    listData.push(download[0]);
    // console.log(listData);
    

    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      download: download[0],
      listRawData,
      listData,
      Line_No,
      SHIFT_A,
      SHIFT_B,
      SHIFT_C,
      SHIFT_M,
      SHIFT_N,
      SHIFT_D,
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

router.get("/link_data_optor_tracking/:startDate/:line", async (req, res) => {
  try {
    // รับค่าจาก URL path
    const { startDate, line } = req.params;

    // สร้าง query ที่ปลอดภัยจาก SQL Injection
    let result = await user.sequelize.query(`
      SELECT [Date], [Time], [Line_No], [Emp_Code], [Emp_Name], [Process_Name], [shift]
      FROM [WOS].[dbo].[operator_Tracking]
      WHERE [Date] = :startDate AND Line_No = :line
      ORDER BY [shift]`, {
      replacements: { startDate, line }, // แทนที่ค่าพารามิเตอร์
      type: user.sequelize.QueryTypes.SELECT
    });

    var listRawData = [];
    listRawData.push(result);
    console.log(listRawData);
    
    // ส่งข้อมูลกลับไปยัง client
    res.json({
      result: result,
      api_result: "ok",
      listRawData,
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
