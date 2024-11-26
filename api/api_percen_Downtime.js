const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

const user1 = require("../database/models/user_216");




router.get("/LARPP/:startDate", async (req, res) => {
  try {
    const {startDate} = req.params;
// result เป็น Data Dashboard 
// เงื่อนไข Dashboard ต้อง ใช้ line เป็น หลัก  โดยเอา Detail ของแต่ล่ะ line มา left join 
    var result = await user.sequelize.query(`

    WITH sum_Problem AS  
    (
 SELECT 
        [Line],
        DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS NG,
        ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
    FROM 
        [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
    WHERE 
        [Started] = [Closed]
        AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'

    )
	   ,set_line as (
      SELECT distinct [Line] as Line
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      where [Line] != 'ALL' and [Line] != 'D-4'and [Line] != ''
    )
  
    SELECT set_line.[Line] ,
    NG ,
    set_line.Line,
      SUBSTRING(set_line.Line, 1, 1) AS order_Line ,CAST(SUBSTRING(set_line.Line, 3, 2) AS INT) AS order_by
    FROM set_line
      left join  sum_Problem
      on set_line.Line = sum_Problem.Line
    and RowNum = 1
    union all
	SELECT '0-TOTAL',
    sum(NG) ,
    '0-TOTAL',
    '5'AS order_Line 
   ,'5'AS order_by
    FROM set_line
    left join  sum_Problem
    on set_line.Line = sum_Problem.Line
    and RowNum = 1
    ORDER BY order_Line,order_by;
  
    `);

  // result_1 เป็น Detail Dashboard
  // ไม่ต้อง join line เพราะ  ไปทำเงื่อนไข ไว้ ที่ หน้า Web ว่า ถ้า line = line ให้โชว์ RowNum,TimeDifferenceInMinutes,Equipment_No.,Request,Equipment
  // where วันที่ ปัจจุบัน เป็น MFG Date
    const result_1 = await user.sequelize.query(`


    SELECT 
    [Line],
    [Create],
    DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS TimeDifferenceInMinutes,
    ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum,
    [Equipment_No.],
    [Request],
    [Equipment]
FROM 
    [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
WHERE 
    [Started] = [Closed]
    AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
order by DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) desc

    `);

    const continue_DT = await user.sequelize.query(`
 WITH continue_DT AS 
 
(
 SELECT [Line],DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS Losstime,
 ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
  FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
  WHERE  [Started] = [Closed] AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' 
  AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59' union all
  select Line as xLine,sum([Downtime(min)]) as [Losstime],1 AS RowNum FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
WHERE [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00'
AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
and Closed != '1900-01-01 00:00:00.000' 

group by Line)
 ,set_line as (
  SELECT distinct [Line] as Line
  FROM [Component_Master].[dbo].[Line_for_QRcode]
  where [Line] != 'ALL' and [Line] != 'D-4'and [Line] != ''
    )
select sum(Losstime)/60 as [Total_DT],
cast((sum(Losstime) * 60)/( select sum(Accum_Actual) 
FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
 where MfgDate = case when DATEPART(hour, getdate()) >= 7 then CONVERT(date, GETDATE())
 else CONVERT(date, GETDATE()-1) end) as decimal(10,2)) as [Second_perPcs]
from set_line 
left join continue_DT
on set_line.Line  = continue_DT.[Line]
where RowNum = 1


`)


    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    const listRawData_2 = [];
    listRawData_2.push(continue_DT[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
      continue_DT: continue_DT[0],
      listRawData_2,
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

router.get("/LARPP_WR/:startDate/:Process", async (req, res) => {
  try {
    const {startDate,Process} = req.params;
// result เป็น Data Dashboard 
// เงื่อนไข Dashboard ต้อง ใช้ line เป็น หลัก  โดยเอา Detail ของแต่ล่ะ line มา left join 
    var result = await user1.sequelize.query(`

    WITH sum_Problem AS  
    (
        SELECT
            [Line],
            DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS NG,
            ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
        FROM
            [PE_maintenance].[dbo].[MaintPlan_Downtime]
        WHERE Line != 'Zone' 
            AND [Started] = [Closed]
            AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' 
                             AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
    ),
    set_line AS (
        SELECT DISTINCT 
            REPLACE(REPLACE([Line], '(Fac2)', ''),'(Fac2','') AS Line -- Remove '(Fac2)' from Line values
        FROM  
            [PE_maintenance].[dbo].[MaintPlan_Downtime]
        WHERE 
            [Line] NOT IN ('ALL', 'D-4', 'Zone', 'Lift', 'Washing') -- Exclude unwanted lines
            AND [Line] != '' 
            AND [Cost_cente] LIKE '%${Process}%' 
    )
    SELECT 
        set_line.[Line],
        NG,
        set_line.Line,
        SUBSTRING(set_line.Line, 1, 1) AS order_Line,
        CAST(
          CASE 
              WHEN CHARINDEX('-', set_line.Line) > 0 
              THEN LEFT(SUBSTRING(set_line.Line, CHARINDEX('-', set_line.Line) + 1, LEN(set_line.Line)), 
                        CHARINDEX('-', SUBSTRING(set_line.Line, CHARINDEX('-', set_line.Line) + 1, LEN(set_line.Line)) + '-') - 1)
              ELSE NULL
          END AS INT
      ) AS order_by

    FROM 
        set_line
    LEFT JOIN 
        sum_Problem
    ON 
        set_line.Line = sum_Problem.Line
        AND RowNum = 1
    UNION ALL
    SELECT 
        '0-TOTAL',
        SUM(NG),
        '0-TOTAL',
        '5' AS order_Line,
        '5' AS order_by
    FROM 
        set_line
    LEFT JOIN 
        sum_Problem
    ON 
        set_line.Line = sum_Problem.Line
        AND RowNum = 1
    ORDER BY 
        order_Line, order_by;
    
  
    `);

  // result_1 เป็น Detail Dashboard
  // ไม่ต้อง join line เพราะ  ไปทำเงื่อนไข ไว้ ที่ หน้า Web ว่า ถ้า line = line ให้โชว์ RowNum,TimeDifferenceInMinutes,Equipment_No.,Request,Equipment
  // where วันที่ ปัจจุบัน เป็น MFG Date
    const result_1 = await user.sequelize.query(`


    SELECT 
    [Line],
    [Create],
    DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS TimeDifferenceInMinutes,
    ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum,
    [Equipment_No.],
    [Request],
    [Equipment]
FROM 
    [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
WHERE 
    [Started] = [Closed]
    AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
order by DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) desc

    `);

    const continue_DT = await user.sequelize.query(`
 WITH continue_DT AS 
 
(
 SELECT [Line],DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS Losstime,
 ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
  FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
  WHERE  [Started] = [Closed] AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' 
  AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59' union all
  select Line as xLine,sum([Downtime(min)]) as [Losstime],1 AS RowNum FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
WHERE [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00'
AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
and Closed != '1900-01-01 00:00:00.000' 

group by Line)
 ,set_line as (
  SELECT distinct [Line] as Line
  FROM [Component_Master].[dbo].[Line_for_QRcode]
  where [Line] != 'ALL' and [Line] != 'D-4'and [Line] != ''
    )
select sum(Losstime)/60 as [Total_DT],
cast((sum(Losstime) * 60)/( select sum(Accum_Actual) 
FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
 where MfgDate = case when DATEPART(hour, getdate()) >= 7 then CONVERT(date, GETDATE())
 else CONVERT(date, GETDATE()-1) end) as decimal(10,2)) as [Second_perPcs]
from set_line 
left join continue_DT
on set_line.Line  = continue_DT.[Line]
where RowNum = 1


`)


    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    const listRawData_2 = [];
    listRawData_2.push(continue_DT[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
      continue_DT: continue_DT[0],
      listRawData_2,
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
router.get("/LARPP_Fec2/:startDate/:Process", async (req, res) => {
  try {
    const {startDate,Process} = req.params;
// result เป็น Data Dashboard 
// เงื่อนไข Dashboard ต้อง ใช้ line เป็น หลัก  โดยเอา Detail ของแต่ล่ะ line มา left join 
    var result = await user1.sequelize.query(`

    WITH sum_Problem AS  
    (
        SELECT
            [Line],
            DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS NG,
            ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
        FROM
            [PE_maintenance].[dbo].[MaintPlan_Downtime]
        WHERE Line != 'Zone' 
            AND [Started] = [Closed]
            AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' 
                             AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
    ),
    set_line AS (
        SELECT DISTINCT 
            REPLACE(REPLACE([Line], '(Fac2)', ''),'(Fac2','') AS Line -- Remove '(Fac2)' from Line values
        FROM  
            [PE_maintenance].[dbo].[MaintPlan_Downtime]
        WHERE 
            [Line] NOT IN ('ALL', 'D-4', 'Zone', 'Lift', 'Washing') -- Exclude unwanted lines
            AND [Line] != '' 
            AND [Cost_cente] LIKE '%${Process}%' 
    )
    SELECT 
        set_line.[Line],
        NG,
        set_line.Line,

      
          CASE 
              WHEN CHARINDEX('-', set_line.Line) > 0 
              THEN LEFT(SUBSTRING(set_line.Line, CHARINDEX('-', set_line.Line) + 1, LEN(set_line.Line)), 
                        CHARINDEX('-', SUBSTRING(set_line.Line, CHARINDEX('-', set_line.Line) + 1, LEN(set_line.Line)) + '-') - 1)
              ELSE NULL
          END   AS order_Line,
        
      SUBSTRING(set_line.Line, 1, 1) AS order_by
    FROM  set_line
    LEFT JOIN 
        sum_Problem
    ON 
        set_line.Line = sum_Problem.Line
        AND RowNum = 1
    UNION ALL
    SELECT 
        '0-TOTAL',
        SUM(NG),
        '0-TOTAL',
        '5' AS order_Line,
        '5' AS order_by
    FROM 
        set_line
    LEFT JOIN 
        sum_Problem
    ON 
        set_line.Line = sum_Problem.Line
        AND RowNum = 1
    ORDER BY 
        order_Line, order_by;
    
  
    `);

  // result_1 เป็น Detail Dashboard
  // ไม่ต้อง join line เพราะ  ไปทำเงื่อนไข ไว้ ที่ หน้า Web ว่า ถ้า line = line ให้โชว์ RowNum,TimeDifferenceInMinutes,Equipment_No.,Request,Equipment
  // where วันที่ ปัจจุบัน เป็น MFG Date
    const result_1 = await user.sequelize.query(`


    SELECT 
    [Line],
    [Create],
    DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS TimeDifferenceInMinutes,
    ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum,
    [Equipment_No.],
    [Request],
    [Equipment]
FROM 
    [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
WHERE 
    [Started] = [Closed]
    AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
order by DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) desc

    `);

    const continue_DT = await user1.sequelize.query(`
    SELECT 
    
    REPLACE(FORMAT(CAST(CAST(SUM(cast([Downtime(min)] as INT))/60  AS VARCHAR(8))   + '.' + CAST(FORMAT((SUM(cast([Downtime(min)]as INT) )% 60), 'D2')   AS VARCHAR(8))  AS float(8)), 'N2'), '.', '.')  as [Total_DT] 
    ,'0' as [Second_perPcs],REPLACE(FORMAT(CAST(CAST(SUM(cast([Reaction_time(min)]as INT))/60  AS VARCHAR(8))   + '.' + CAST(FORMAT((SUM(cast([Reaction_time(min)]as INT) )% 60), 'D2')   AS VARCHAR(8))  AS float(8)), 'N2'), '.', '.') as [Total_DL] 
    FROM [PE_maintenance].[dbo].[MaintPlan_Downtime] where Mfgdate = '${startDate}' and Cost_cente like'%Fac2%' and Line like '%-%'
    

`)
//     const continue_DT = await user.sequelize.query(`
//  WITH continue_DT AS 
 
// (
//  SELECT [Line],DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS Losstime,
//  ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
//   FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
//   WHERE  [Started] = [Closed] AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' 
//   AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59' union all
//   select Line as xLine,sum([Downtime(min)]) as [Losstime],1 AS RowNum FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
// WHERE [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00'
// AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
// and Closed != '1900-01-01 00:00:00.000' 

// group by Line)
//  ,set_line as (
//   SELECT distinct [Line] as Line
//   FROM [Component_Master].[dbo].[Line_for_QRcode]
//   where [Line] != 'ALL' and [Line] != 'D-4'and [Line] != ''
//     )
// select sum(Losstime)/60 as [Total_DT],
// cast((sum(Losstime) * 60)/( select sum(Accum_Actual) 
// FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
//  where MfgDate = case when DATEPART(hour, getdate()) >= 7 then CONVERT(date, GETDATE())
//  else CONVERT(date, GETDATE()-1) end) as decimal(10,2)) as [Second_perPcs]
// from set_line 
// left join continue_DT
// on set_line.Line  = continue_DT.[Line]
// where RowNum = 1


// `)


    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    const listRawData_2 = [];
    listRawData_2.push(continue_DT[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
      continue_DT: continue_DT[0],
      listRawData_2,
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
router.get("/LARPP_Washing/:startDate/:Process", async (req, res) => {
  try {
    const {startDate,Process} = req.params;
// result เป็น Data Dashboard 
// เงื่อนไข Dashboard ต้อง ใช้ line เป็น หลัก  โดยเอา Detail ของแต่ล่ะ line มา left join 
    var result = await user1.sequelize.query(`

    WITH sum_Problem AS  
    (
        SELECT
            [Line],
            DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS NG,
            ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
        FROM
            [PE_maintenance].[dbo].[MaintPlan_Downtime]
        WHERE Line != 'Zone'
            AND [Started] = [Closed]
            AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00'
                             AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
    ),
    set_line AS (
        SELECT DISTINCT
            REPLACE(REPLACE(Equipment, '(Fac2)', ''),'(Fac2','') AS Line -- Remove '(Fac2)' from Line values
        FROM
            [PE_maintenance].[dbo].[MaintPlan_Downtime]
        WHERE
            Equipment NOT IN ('ALL', 'D-4', 'Zone', 'Lift', 'Washing') -- Exclude unwanted lines
            AND Equipment != ''
            AND [Cost_cente] LIKE '%Washing%'
    )
    SELECT
        set_line.[Line],
        NG,
        set_line.Line,
		  CASE
        WHEN  set_line.Line LIKE 'Washing DAN%' THEN 'DAN'
        WHEN  set_line.Line LIKE 'Washing Sonic%' THEN 'Sonic'
        WHEN  set_line.Line LIKE 'Washing Shinsiri%' THEN 'Shinsiri'
        ELSE  set_line.Line  -- Optional: In case there are other values you want to handle differently
    END AS order_Line,
      CAST(
        TRIM(SUBSTRING(set_line.Line, CHARINDEX('#', set_line.Line) + 1, LEN(set_line.Line))) AS INT
    ) AS order_by

    FROM
        set_line
    LEFT JOIN
        sum_Problem
    ON
        set_line.Line = sum_Problem.Line
        AND RowNum = 1
    UNION ALL
    SELECT
        '0-TOTAL',
        SUM(NG),
        '0-TOTAL',
        '5' AS order_Line,
        '5' AS order_by
    FROM
        set_line
    LEFT JOIN
        sum_Problem
    ON
        set_line.Line = sum_Problem.Line
        AND RowNum = 1
    ORDER BY
        order_Line, order_by;

    
  
    `);

  // result_1 เป็น Detail Dashboard
  // ไม่ต้อง join line เพราะ  ไปทำเงื่อนไข ไว้ ที่ หน้า Web ว่า ถ้า line = line ให้โชว์ RowNum,TimeDifferenceInMinutes,Equipment_No.,Request,Equipment
  // where วันที่ ปัจจุบัน เป็น MFG Date
    const result_1 = await user.sequelize.query(`


    SELECT 
    [Equipment] as Line,
     [Create],
     DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS TimeDifferenceInMinutes,
     ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum,
     [Equipment_No.],
     [Request],
     [Equipment]
 FROM
     [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
 WHERE
     [Started] = [Closed]
     AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
 order by DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) desc

    `);

    const continue_DT = await user.sequelize.query(`
 WITH continue_DT AS 
 
(
 SELECT [Line],DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS Losstime,
 ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
  FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
  WHERE  [Started] = [Closed] AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' 
  AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59' union all
  select Line as xLine,sum([Downtime(min)]) as [Losstime],1 AS RowNum FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
WHERE [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00'
AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
and Closed != '1900-01-01 00:00:00.000' 

group by Line)
 ,set_line as (
  SELECT distinct [Line] as Line
  FROM [Component_Master].[dbo].[Line_for_QRcode]
  where [Line] != 'ALL' and [Line] != 'D-4'and [Line] != ''
    )
select sum(Losstime)/60 as [Total_DT],
cast((sum(Losstime) * 60)/( select sum(Accum_Actual) 
FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
 where MfgDate = case when DATEPART(hour, getdate()) >= 7 then CONVERT(date, GETDATE())
 else CONVERT(date, GETDATE()-1) end) as decimal(10,2)) as [Second_perPcs]
from set_line 
left join continue_DT
on set_line.Line  = continue_DT.[Line]
where RowNum = 1


`)


    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    const listRawData_2 = [];
    listRawData_2.push(continue_DT[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
      continue_DT: continue_DT[0],
      listRawData_2,
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

router.get("/LARPP_Zone/:startDate/:Process", async (req, res) => {
  try {
    const {startDate,Process} = req.params;
// result เป็น Data Dashboard 
// เงื่อนไข Dashboard ต้อง ใช้ line เป็น หลัก  โดยเอา Detail ของแต่ล่ะ line มา left join 
    var result = await user1.sequelize.query(`

    WITH sum_Problem AS  
    (
 SELECT
        [Equipment_No.] as Line,
        DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS NG,
        ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
    FROM
        [PE_maintenance].[dbo].[MaintPlan_Downtime]
    WHERE
        [Started] = [Closed]
        AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
    ),
    set_line AS (
        SELECT DISTINCT
           [Equipment_No.] AS Line 
        FROM
           [PE_maintenance].[dbo].[MaintPlan_Downtime]
        WHERE
           [Line] != ''
            AND [Line] = 'Zone' and  [Model] LIKE '%${Process}%'
    )
    SELECT
        set_line.[Line],
        NG,
        set_line.Line,
        SUBSTRING(set_line.Line, 0, 2) AS order_Line
		,
        CAST(
          CASE
              WHEN CHARINDEX('-', set_line.Line) > 0
              THEN CAST(SUBSTRING(set_line.Line, CHARINDEX('-', set_line.Line, CHARINDEX('-', set_line.Line) + 1) + 1, LEN(set_line.Line)) AS INT)
              ELSE NULL
          END AS INT
      ) AS order_by

    FROM
        set_line
    LEFT JOIN
        sum_Problem
    ON
        set_line.Line = sum_Problem.Line
        
    UNION ALL
    SELECT
        '0-TOTAL',
        SUM(NG),
        '0-TOTAL',
        '5' AS order_Line,
        '5' AS order_by
    FROM
        set_line
    LEFT JOIN
        sum_Problem
    ON
        set_line.Line = sum_Problem.Line
       
    ORDER BY
        order_Line, order_by;


    
  
    `);

  // result_1 เป็น Detail Dashboard
  // ไม่ต้อง join line เพราะ  ไปทำเงื่อนไข ไว้ ที่ หน้า Web ว่า ถ้า line = line ให้โชว์ RowNum,TimeDifferenceInMinutes,Equipment_No.,Request,Equipment
  // where วันที่ ปัจจุบัน เป็น MFG Date
    const result_1 = await user.sequelize.query(`


    SELECT 
    [Equipment_No.] as Line,
     [Create],
     DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS TimeDifferenceInMinutes,
     ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum,
     [Equipment_No.],
     [Request],
     [Equipment]
 FROM
     [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
 WHERE
     [Started] = [Closed]
     AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
 order by DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) desc

    `);

    const continue_DT = await user.sequelize.query(`
 WITH continue_DT AS 
 
(
 SELECT [Line],DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) AS Losstime,
 ROW_NUMBER() OVER (PARTITION BY [Line] ORDER BY DATEDIFF(MINUTE, CONVERT(time, [Create]), CONVERT(time, GETDATE())) DESC) AS RowNum
  FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
  WHERE  [Started] = [Closed] AND [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00' 
  AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59' union all
  select Line as xLine,sum([Downtime(min)]) as [Losstime],1 AS RowNum FROM [LinkedServer1].[PE_maintenance].[dbo].[MaintPlan_Downtime]
WHERE [Create] BETWEEN CAST(CONVERT(date, GETDATE()) AS datetime) + '07:00:00'
AND CAST(DATEADD(DAY, 1, CONVERT(date, GETDATE())) AS datetime) + '06:59:59'
and Closed != '1900-01-01 00:00:00.000'  

group by Line)
 ,set_line as (
  SELECT distinct [Line] as Line
  FROM [Component_Master].[dbo].[Line_for_QRcode]
  where [Line] != 'ALL' and [Line] != 'D-4'and [Line] != ''
    )
select sum(Losstime)/60 as [Total_DT],
cast((sum(Losstime) * 60)/( select sum(Accum_Actual) 
FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
 where MfgDate = case when DATEPART(hour, getdate()) >= 7 then CONVERT(date, GETDATE())
 else CONVERT(date, GETDATE()-1) end) as decimal(10,2)) as [Second_perPcs]
from set_line 
left join continue_DT
on set_line.Line  = continue_DT.[Line]
where RowNum = 1


`)


    const listRawData = [];
    listRawData.push(result[0]);
    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    const listRawData_2 = [];
    listRawData_2.push(continue_DT[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
      continue_DT: continue_DT[0],
      listRawData_2,
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
