const express = require("express");
const router = express.Router();
const user = require("../database/models/user");



router.get("/LARPP", async (req, res) => {
  try {
    const result = await user.sequelize.query(`
    WITH set1 AS (
      SELECT
          SUBSTRING([Line], 0, 5) AS Line,
          [Line] AS Line_NAME,
          SUM([Actual] + NG) AS Total,
          SUM([Actual]) AS Actual,
          CASE 
              WHEN SUM([Actual] + NG) = 0 THEN NULL -- Handle divide by zero by returning NULL
              ELSE (CAST(SUM([NG]) AS DECIMAL(7, 2)) / NULLIF(CAST(SUM([Actual] + NG) AS DECIMAL(7, 2)), 0)) * 100
          END AS [NG]
      FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr]
      WHERE (
          MfgDate =
          CASE
              WHEN DATEPART(hour, GETDATE()) >= 0 AND DATEPART(hour, GETDATE()) <= 7
                  THEN FORMAT(GETDATE() - 1, 'yyyy-MM-dd')
              ELSE FORMAT(GETDATE(), 'yyyy-MM-dd')
          END
      )
      GROUP BY MfgDate, Line
  ),
  set2 AS (
      SELECT DISTINCT [Line] AS Line
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      WHERE [Line] != 'ALL' AND [Line] != 'D-4'
  )
  SELECT
      set2.Line,
      SUBSTRING(set2.Line, 1, 1) AS order_Line,
      Actual,
      Total,
      CAST(SUBSTRING(set2.Line, 3, 2) AS INT) AS order_by,
      [NG],
      Line_NAME
  FROM set2
  LEFT JOIN set1 ON set2.Line = set1.Line
  ORDER BY order_Line, order_by;
  
  
    `);

    const result_1 = await user.sequelize.query(`
    with NG as (
      select substring([Summary_Output].[Line],0,5) as Line, Process, sum([Ouput]) as [Total NG]
            FROM [Oneday_ReadtimeData].[dbo].[Summary_Output] 
            where Process != '.Output' and Process != 'Accum_Target' and Process != 'Target'
            group by [Summary_Output].Line, Process
            having sum([Ouput]) > 0
            )
            ,Total as (
            select substring([Line],0,5) as thisLine,sum([Actual]+NG) as Total
            FROM [Oneday_ReadtimeData].[dbo].[Summary_Actual_perHr] 
              WHERE (
              MfgDate = 
              case 
                when DATEPART(hour, getdate()) >= 0 and DATEPART(hour, getdate()) <= 7 
                then format(getdate() - 1,'yyyy-MM-dd')
                else format(getdate(),'yyyy-MM-dd') 
              end
            ) 
            group by MfgDate, Line
            )
            select NG.Line,Process,[Total NG],Total
            ,cast((cast([Total NG] as DECIMAL(7,2))/cast(Total as DECIMAL(7,2)))*100 as decimal(10,2)) as[%NG]
            from NG join Total
            on [Line] = thisLine
    `);

    



    const listRawData = [];
    listRawData.push(result[0]);

    const listRawData_1 = [];
    listRawData_1.push(result_1[0]);

    res.json({
      result: result[0],
      listRawData,
      result_1: result_1[0],
      listRawData_1,
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
