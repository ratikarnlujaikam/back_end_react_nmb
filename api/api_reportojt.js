const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Model", async (req, res) => {
    try {
      let result = await user.sequelize.query(`with set1 as (
        SELECT 
        [Traning_record].[EmpNo],
        [Name],
        [Model],
        [Line],
        [Document_No],
        [Process],
        [EmpTrainner],
        [QCName],
        CONVERT(VARCHAR(10), CONVERT(DATE, [START_DATE], 112), 23) AS [Date_QCpassed],
        CASE WHEN DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 80 AND DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) <= 90 THEN 'Warning' 
             WHEN DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 90 THEN 'Over' 
             ELSE '-' END AS [Status]
    FROM
        [Training_Record].[dbo].[Traning_record]
    INNER JOIN
        [Training_Record].[dbo].[DATA_Training]
    ON
        [Traning_record].[Document_No] = [DATA_Training].[COURSE_NO_CODE]
        AND [Traning_record].[EmpNo] = [DATA_Training].[EMPLOYEE_CODE]
    WHERE
       [ResultQC] = 'Approve' 
    AND DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 60
    )
    
    select distinct [Model]
    from set1
    union 
    select '**ALL**'`);
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

router.get("/Line/:Model", async (req, res) => {
    try {
      var result = [[]];
      const { Model } = req.params;
      if (Model == "**ALL**") {
        var result = await user.sequelize.query(`with set1 as (
            SELECT 
            [Traning_record].[EmpNo],
            [Name],
            [Model],
            [Line],
            [Document_No],
            [Process],
            [EmpTrainner],
            [QCName],
            CONVERT(VARCHAR(10), CONVERT(DATE, [START_DATE], 112), 23) AS [Date_QCpassed],
            CASE WHEN DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 80 AND DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) <= 90 THEN 'Warning' 
                 WHEN DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 90 THEN 'Over' 
                 ELSE '-' END AS [Status]
        FROM
            [Training_Record].[dbo].[Traning_record]
        INNER JOIN
            [Training_Record].[dbo].[DATA_Training]
        ON
            [Traning_record].[Document_No] = [DATA_Training].[COURSE_NO_CODE]
            AND [Traning_record].[EmpNo] = [DATA_Training].[EMPLOYEE_CODE]
        WHERE
           [ResultQC] = 'Approve' 
        AND DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 60
        )
        
        select distinct [Line]
        from set1
        union 
        select '**ALL**'`);
      } else {
        var result = await user.sequelize.query(`with set1 as (
            SELECT 
            [Traning_record].[EmpNo],
            [Name],
            [Model],
            [Line],
            [Document_No],
            [Process],
            [EmpTrainner],
            [QCName],
            CONVERT(VARCHAR(10), CONVERT(DATE, [START_DATE], 112), 23) AS [Date_QCpassed],
            CASE WHEN DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 80 AND DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) <= 90 THEN 'Warning' 
                 WHEN DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 90 THEN 'Over' 
                 ELSE '-' END AS [Status]
        FROM
            [Training_Record].[dbo].[Traning_record]
        INNER JOIN
            [Training_Record].[dbo].[DATA_Training]
        ON
            [Traning_record].[Document_No] = [DATA_Training].[COURSE_NO_CODE]
            AND [Traning_record].[EmpNo] = [DATA_Training].[EMPLOYEE_CODE]
        WHERE
           [ResultQC] = 'Approve' 
        AND DATEDIFF(day, CONVERT(DATE, [START_DATE], 112), GETDATE()) > 60
        )
        
        select distinct [Line]
        from set1
        where Model='${Model}'
        union 
        select '**ALL**'
        `);
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
router.get("/Reportojt/:model/:Line/:startdate/:finishdate",
    async (req, res) => {
      try {
        var result = [[]];
        const { model, Line,startdate,finishdate } = req.params;
                
        if (model == "**ALL**" && Line == "**ALL**") {
          var result = await user.sequelize
            .query(`  SELECT 
            [Traning_record].[EmpNo],
            [Name],
            [Model],
            'L' + [Line] as Line,
            [Document_No],
            [Process],
			 [Detail_WI]
      ,[Detail_5S]
      ,[Detail_WIP]
      ,[Detail_Handling]
      ,[Detail_Confirmmaster]
      ,[Detail_Spec]
      ,[Detail_Criticalparameter]
      ,[Detail_effectNG],
            [EmpTrainner],
            [QCName],
            CONVERT(VARCHAR(10), CONVERT(DATE, [START_DATE], 112), 23) AS [Date_QCpassed]
        FROM
            [Training_Record].[dbo].[Traning_record]
        INNER JOIN
            [Training_Record].[dbo].[DATA_Training]
        ON
            [Traning_record].[Document_No] = [DATA_Training].[COURSE_NO_CODE]
            AND [Traning_record].[EmpNo] = [DATA_Training].[EMPLOYEE_CODE]
        WHERE
           [ResultQC] = 'Approve' 
           and  CONVERT(VARCHAR(10), CONVERT(DATE, [DATA_Training].[START_DATE], 112), 23) between '${startdate}' and '${finishdate}'
        order by Date_QCpassed`
           )
        } else if (model != "**ALL**" && Line == "**ALL**") {
          var result = await user.sequelize
            .query(`  SELECT 
            [Traning_record].[EmpNo],
            [Name],
            [Model],
            'L' + [Line] as Line,
            [Document_No],
            [Process],
			 [Detail_WI]
      ,[Detail_5S]
      ,[Detail_WIP]
      ,[Detail_Handling]
      ,[Detail_Confirmmaster]
      ,[Detail_Spec]
      ,[Detail_Criticalparameter]
      ,[Detail_effectNG],
            [EmpTrainner],
            [QCName],
            CONVERT(VARCHAR(10), CONVERT(DATE, [START_DATE], 112), 23) AS [Date_QCpassed]
        FROM
            [Training_Record].[dbo].[Traning_record]
        INNER JOIN
            [Training_Record].[dbo].[DATA_Training]
        ON
            [Traning_record].[Document_No] = [DATA_Training].[COURSE_NO_CODE]
            AND [Traning_record].[EmpNo] = [DATA_Training].[EMPLOYEE_CODE]
        WHERE
           [ResultQC] = 'Approve' 
           and  CONVERT(VARCHAR(10), CONVERT(DATE, [DATA_Training].[START_DATE], 112), 23) between '${startdate}' and '${finishdate}'
           and [Model] ='${model}'

        order by Date_QCpassed`)
        } else if (model == "**ALL**" && Line != "**ALL**") {
          var result = await user.sequelize
            .query(` SELECT 
            [Traning_record].[EmpNo],
            [Name],
            [Model],
            'L' + [Line] as Line,
            [Document_No],
            [Process],
			 [Detail_WI]
      ,[Detail_5S]
      ,[Detail_WIP]
      ,[Detail_Handling]
      ,[Detail_Confirmmaster]
      ,[Detail_Spec]
      ,[Detail_Criticalparameter]
      ,[Detail_effectNG],
            [EmpTrainner],
            [QCName],
            CONVERT(VARCHAR(10), CONVERT(DATE, [START_DATE], 112), 23) AS [Date_QCpassed]
        FROM
            [Training_Record].[dbo].[Traning_record]
        INNER JOIN
            [Training_Record].[dbo].[DATA_Training]
        ON
            [Traning_record].[Document_No] = [DATA_Training].[COURSE_NO_CODE]
            AND [Traning_record].[EmpNo] = [DATA_Training].[EMPLOYEE_CODE]
        WHERE
           [ResultQC] = 'Approve' 
           and  CONVERT(VARCHAR(10), CONVERT(DATE, [DATA_Training].[START_DATE], 112), 23) between '${startdate}' and '${finishdate}'
           --and [Model] ='${model}'
           and [Line] ='${Line}'

        order by Date_QCpassed`)
        } else {
          var result = await user.sequelize
            .query(` SELECT 
            [Traning_record].[EmpNo],
            [Name],
            [Model],
            'L' + [Line] as Line,
            [Document_No],
            [Process],
			 [Detail_WI]
      ,[Detail_5S]
      ,[Detail_WIP]
      ,[Detail_Handling]
      ,[Detail_Confirmmaster]
      ,[Detail_Spec]
      ,[Detail_Criticalparameter]
      ,[Detail_effectNG],
            [EmpTrainner],
            [QCName],
            CONVERT(VARCHAR(10), CONVERT(DATE, [START_DATE], 112), 23) AS [Date_QCpassed]
        FROM
            [Training_Record].[dbo].[Traning_record]
        INNER JOIN
            [Training_Record].[dbo].[DATA_Training]
        ON
            [Traning_record].[Document_No] = [DATA_Training].[COURSE_NO_CODE]
            AND [Traning_record].[EmpNo] = [DATA_Training].[EMPLOYEE_CODE]
        WHERE
           [ResultQC] = 'Approve' 
           and  CONVERT(VARCHAR(10), CONVERT(DATE, [DATA_Training].[START_DATE], 112), 23) between '${startdate}' and '${finishdate}'
           and [Model] ='${model}'
           and [Line] ='${Line}'

        order by Date_QCpassed
        `)
        }
  
        var listRawData = [];
        listRawData.push(result[0]);
  
        res.json({
          result: result[0],
          listRawData,
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

  module.exports = router;