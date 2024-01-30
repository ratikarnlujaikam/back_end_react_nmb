const express = require("express");
const router = express.Router();
const user = require("../database/models/user");



router.get("/LARPP", async (req, res) => {
  try {
    const result = await user.sequelize.query(`
    with set1 as (
      select substring([Line],0,5) as Line,[Line] as Line_NAME,
      (cast(sum([NG]) as DECIMAL(7,2))/cast(sum([Plan]+diff+NG+DT) as DECIMAL(7,2)))*100 as [NG]
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
    ),
    set2 as (
      SELECT distinct [Line] as Line
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      where [Line] != 'ALL' and [Line] != 'D-4'
    )
    select set2.Line 
    , SUBSTRING(set2.Line, 1, 1) AS order_Line
    ,CAST(SUBSTRING(set2.Line, 3, 2) AS INT) AS order_by
    , [NG],Line_NAME from set2
      left join set1 on set2.Line = set1.Line
    ORDER BY order_Line,order_by;
    `);

    const result_1 = await user.sequelize.query(`
      select substring([Line],0,5) as Line, Process, sum([Ouput]) as [Total NG]
      FROM [Oneday_ReadtimeData].[dbo].[Summary_Output]
      where Process != '.Output' and Process != 'Accum_Target' and Process != 'Target'
      group by Line, Process
      having sum([Ouput]) > 0
      order by sum([Ouput]) desc
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
