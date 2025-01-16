const express = require("express");
const { copySync } = require("fs-extra");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Model", async (req, res) => {
    try {
      let result = await user.sequelize.query(`
       select distinct [MODEL]
  from [Record_Data].[dbo].[DefectRecords]
  order by [MODEL]
       `);
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

router.get("/Year", async (req, res) => {
    try {
      let result = await user.sequelize.query(`
       select distinct(YEAR(DDATE)) as Year
  from [Record_Data].[dbo].[DefectRecords]
       `);
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
 

router.get("/Top10NG/:Model/:Year/:parameter", async (req, res) => {
    try {
        const { Model, parameter,Year } = req.params;

        let query;

        // ตรวจสอบเงื่อนไข Model และสร้าง query
        
            query = `
  WITH set1 AS (
    SELECT 
        [MODEL],
        Process,
        [DEFECT_CODE],
        [DDATE],
        YEAR([DDATE]) AS Year,
        MONTH([DDATE]) AS Month,
        SUM([INQTY]) AS Total_INQTY,
        SUM([NG_QTY]) AS Total_NG_QTY,
        CASE 
            WHEN SUM([INQTY]) = 0 THEN 0
            ELSE ROUND(SUM([NG_QTY]) * 1.0 / SUM([INQTY])* 100 , 3) 
        END AS NGratio
    FROM 
        [Record_Data].[dbo].[DefectRecords]
    GROUP BY 
        [MODEL], 
		 Process,
        [DEFECT_CODE], 
		  [DDATE],
        YEAR([DDATE]), 
        MONTH([DDATE])
)
 
SELECT
    set1.PROCESS + '_'+set1.DEFECT_CODE + '_'+ [NG Name] as DEFECT_CODE ,
    AVG(set1.NGratio) AS NG_QTY
FROM 
    set1
INNER JOIN 
    [Record_Data].[dbo].[Master_NGratiotop10] 
    ON set1.PROCESS = [Master_NGratiotop10].PROCESS
    AND set1.DEFECT_CODE = [Master_NGratiotop10].[CODE] 
    AND set1.[MODEL] = [Master_NGratiotop10].Model
join [Component_Master].[dbo].[NG_Master] 
on set1.DEFECT_CODE = [NG_Master].[NG Code]
WHERE 
    MONTH(set1.DDATE) = '${parameter}'
    AND YEAR(set1.DDATE) = '${Year}' 
    AND set1.[MODEL] = '${Model}'
GROUP BY 
   set1.DEFECT_CODE,set1.PROCESS,[NG_Master].[NG Name]
ORDER BY 
    NG_QTY DESC;
            `;
       

        // Execute the query to retrieve the data
        const result = await user.sequelize.query(query);

        res.json({
            result: result[0],
            api_result: "ok",
        });
    } catch (error) {
        console.error("Error occurred:", error);
        res.json({
            error: error.message,
            api_result: "nok",
        });
    }
});


router.get("/Top10NGtable/:Model/:Year/:parameter", async (req, res) => {
    try {
        const { Model, parameter, Year } = req.params;

        let query;

        // สร้างคำสั่ง SQL แบบ Dynamic
        query = `
DECLARE @cols NVARCHAR(MAX), @query NVARCHAR(MAX);
DECLARE @Model NVARCHAR(50) = '${Model}'; -- ตั้งค่า Model
DECLARE @Year INT = ${Year}; -- ตั้งค่า ปี
DECLARE @Month INT = ${parameter}; -- ตั้งค่า เดือน


-- Generate the dynamic column list for DDATE using FOR XML PATH
SELECT @cols = STUFF((
    SELECT ',' + QUOTENAME(CONVERT(VARCHAR, DDATE, 120))  -- Create a comma-separated list
    FROM [Record_Data].[dbo].[DefectRecords]
    WHERE MONTH(DDATE) = @Month AND YEAR(DDATE) = @Year AND [MODEL] = @Model  -- Use parameters
    GROUP BY DDATE
    ORDER BY DDATE
    FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');  -- Remove the leading comma


-- Build the dynamic SQL query
SET @query = '
WITH set1 AS (
    SELECT
        [MODEL],
        Process,
        [DEFECT_CODE],
        [DDATE],
        YEAR([DDATE]) AS Year,
        MONTH([DDATE]) AS Month,
        SUM([INQTY]) AS Total_INQTY,
        SUM([NG_QTY]) AS Total_NG_QTY,
        CASE
            WHEN SUM([INQTY]) = 0 THEN 0
            ELSE ROUND(SUM([NG_QTY]) * 1.0 / SUM([INQTY]) * 100, 3)
        END AS NGratio
    FROM
        [Record_Data].[dbo].[DefectRecords]
    GROUP BY
        [MODEL],
        Process,
        [DEFECT_CODE],
        [DDATE],
        YEAR([DDATE]),
        MONTH([DDATE])
),
set2 AS (
    SELECT
        set1.[MODEL],
        set1.PROCESS,
        set1.DEFECT_CODE AS DEFECT_CODE,
         ROUND( AVG(set1.NGratio), 3) AS AVG_Ratio
    FROM
        set1
    INNER JOIN
        [Record_Data].[dbo].[Master_NGratiotop10]
        ON set1.PROCESS = [Master_NGratiotop10].PROCESS
        AND set1.DEFECT_CODE = [Master_NGratiotop10].[CODE]
        AND set1.[MODEL] = [Master_NGratiotop10].Model
    WHERE
        MONTH(set1.DDATE) = @Month
        AND YEAR(set1.DDATE) = @Year
        AND set1.[MODEL] = @Model
    GROUP BY
        set1.DEFECT_CODE, set1.PROCESS, set1.[MODEL]
),
set3 AS (
    SELECT
        [DefectRecords].[MODEL] AS Model,
        [DefectRecords].[PROCESS] AS PROCESS_CODE,
        DEFECT_CODE,
        CASE
            WHEN [INQTY] = 0 THEN 0
            ELSE ROUND([DefectRecords].[NG_QTY] * 1.0 / [INQTY] * 100, 3)
        END AS NGratio,
        DDATE
    FROM [Record_Data].[dbo].[DefectRecords]
    INNER JOIN
        [Record_Data].[dbo].[Master_NGratiotop10]
        ON [DefectRecords].PROCESS = [Master_NGratiotop10].PROCESS
        AND [DefectRecords].DEFECT_CODE = [Master_NGratiotop10].[CODE]
        AND [DefectRecords].[MODEL] = [Master_NGratiotop10].Model
),
set4 AS (
    SELECT
        Model,
        PROCESS_CODE,
        DEFECT_CODE, ' + @cols + '
    FROM set3
    PIVOT (
        MAX(NGratio)
        FOR DDATE IN (' + @cols + ')
    ) AS PivotTable
)
SELECT
    set2.[MODEL] as Model,
     set2.Process + ''_'' + NG_Master.[NG Name] AS PROCESS_CODE,
    set2.[DEFECT_CODE],
    set2.AVG_Ratio as Total_NGratio, ' + @cols + '
FROM set2
JOIN set4
    ON set2.[MODEL] = set4.Model
    AND set2.Process = set4.PROCESS_CODE
    AND set2.DEFECT_CODE = set4.DEFECT_CODE
join [Component_Master].[dbo].[NG_Master]
    on 	set2.DEFECT_CODE = NG_Master.[NG Code];';


-- Execute the dynamic SQL query
EXEC sp_executesql @query, N'@Month INT, @Year INT, @Model NVARCHAR(50)', @Month, @Year, @Model;

`;

const result = await user.sequelize.query(query, {
    replacements: {
        Model,
        Year,
        parameter
    },
    type: user.sequelize.QueryTypes.SELECT
});


       
        

        let listRawData2 = [];
        listRawData2.push(result[0]);

       
        res.json({
            result: result,
            
            listRawData2,
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

    
router.get("/Top10NGmonthly/:model/:year/:month/:defectcode", async (req, res) => {
    try {
        const { model, month,year ,defectcode} = req.params;

        const trimmedDefectCode = defectcode.split('_').slice(0, -1).join('_');
        let query;

        // ตรวจสอบเงื่อนไข Model และสร้าง query
        
            query = `
   with set1 as(
   SELECT 
            DR.[MODEL] as Model, -- โมเดลที่ใช้
          MONTH(DR.DDATE) as Monthly,
		  YEAR(DR.DDATE) as YEARly,
            DR.[PROCESS] + '_' + DR.DEFECT_CODE as DEFECT_CODE , -- โค้ดความเสียหาย
            CONVERT(VARCHAR, DR.DDATE, 103) AS DDATE, -- วันที่ในรูปแบบ DD/MM/YYYY
            DR.NG_QTY ,
			CASE 
            WHEN [INQTY] = 0 THEN 0
            ELSE ROUND([NG_QTY] * 1.0 / [INQTY]* 100 , 3) 
        END AS NGratio -- จำนวนของ NG
        FROM 
            [Record_Data].[dbo].[DefectRecords] DR
        INNER JOIN 
            [Record_Data].[dbo].[Master_NGratiotop10] MNG
            ON DR.[PROCESS] = MNG.[PROCESS]
            AND DR.[DEFECT_CODE] = MNG.[CODE]
            AND DR.[MODEL] = MNG.[MODEL]
 
 ) 
 select NGratio,DDATE
 from set1
  WHERE 
            Monthly = ${month} -- เดือนธันวาคม
            AND YEARly = ${year} -- ปี 2024
            AND Model = '${model}' 
			AND DEFECT_CODE = '${trimmedDefectCode}' 
		order by DDATE
            `;
       

        // Execute the query to retrieve the data
        const result = await user.sequelize.query(query);

        res.json({
            result: result[0],
            api_result: "ok",
        });
    } catch (error) {
        console.error("Error occurred:", error);
        res.json({
            error: error.message,
            api_result: "nok",
        });
    }
});







  module.exports = router;