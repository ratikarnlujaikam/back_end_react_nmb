const express = require("express");
const { copySync } = require("fs-extra");
const router = express.Router();
const user = require("../database/models/user");

router.get("/Process", async (req, res) => {
    try {
      let result = await user.sequelize.query(`
      SELECT distinct Part as Process
      FROM [Component_Master].[dbo].[List_SPC_Master]
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
  
  router.get("/Parameter/:Process", async (req, res) => {
    try {
      const { Process } = req.params;
      let result = await user.sequelize.query(`
      SELECT distinct Parameter
      FROM [Component_Master].[dbo].[List_SPC_Master]
    where Part = '${Process}'`)
    
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
router.get("/model/:Process/:startDate/:finishDate", async (req, res) => {
    try {
     const { Process,startDate,finishDate } = req.params;
      let result = await user.sequelize.query(`
         with set1 as(SELECT *
  FROM [MasterTest].[dbo].[${Process}]
  WHERE CONVERT(date, [Date]) = CONVERT(date, GETDATE())
  union SELECT *
  FROM [MasterTest_Data].[dbo].[${Process}]
  where CONVERT(date, [Date]) != CONVERT(date, GETDATE())
	      
	   )
	   SELECT distinct Model
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      inner join
       set1
       on set1.Line = [Line_for_QRcode].Line
       where Date between '${startDate}' and '${finishDate}'
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
  
  router.get("/Line/:model/:Process/:startDate/:finishDate", async (req, res) => {
    try {

      const { model,Process,startDate ,finishDate} = req.params;
      let result= await user.sequelize.query(`
     	     with set1 as(SELECT *
  FROM [MasterTest].[dbo].[${Process}]
  WHERE CONVERT(date, [Date]) = CONVERT(date, GETDATE())
  union SELECT *
  FROM [MasterTest_Data].[dbo].[${Process}]
  where CONVERT(date, [Date]) != CONVERT(date, GETDATE()))

	 SELECT distinct set1.Line
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      inner join
       set1
       on set1.Line = [Line_for_QRcode].Line
      where Model = '${model}' and Date between '${startDate}' and '${finishDate}'
      `)
    
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

  router.get("/machine/:Line/:Process/:startDate/:finishDate", async (req, res) => {
    try {
      const { Line ,Process,startDate,finishDate} = req.params;
      let result= await user.sequelize.query(`
     

	     with set1 as(SELECT *
  FROM [MasterTest].[dbo].[${Process}]
  WHERE CONVERT(date, [Date]) = CONVERT(date, GETDATE())
  union SELECT *
  FROM [MasterTest_Data].[dbo].[${Process}]
  where CONVERT(date, [Date]) != CONVERT(date, GETDATE())
  )

	 SELECT distinct set1.Line,Matchine
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      inner join
       set1
       on set1.Line = [Line_for_QRcode].Line
      where set1.Line = '${Line}' and Date between '${startDate}' and '${finishDate}'
      `)
    
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
router.get("/fixture/:Line/:Process/:machine/:startDate/:finishDate", async (req, res) => {
    try {
      const { Line ,Process,startDate,finishDate} = req.params;
      let result= await user.sequelize.query(`
     

	     with set1 as(SELECT *
  FROM [MasterTest].[dbo].[${Process}]
  WHERE CONVERT(date, [Date]) = CONVERT(date, GETDATE())
  union SELECT *
  FROM [MasterTest_Data].[dbo].[${Process}]
  where CONVERT(date, [Date]) != CONVERT(date, GETDATE())
  )

	 SELECT distinct set1.Line,Fix
      FROM [Component_Master].[dbo].[Line_for_QRcode]
      inner join
       set1
       on set1.Line = [Line_for_QRcode].Line
      where set1.Line = '${Line}' and Date between '${startDate}' and '${finishDate}'
      `)
    
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
  // router.get("/Serial/:machine/:Process/:Parameter/:Line", async (req, res) => {
  //   try {
  //     const { machine ,Process, Parameter,Line } = req.params;
  //     let result= await user.sequelize.query(`
  //     ------------------------------------serial--------------------------------
  //     select distinct Serialnumber
  //     from [MasterTest_Data].[dbo].[${Process}]
  //     where Matchine = '${machine}' `)
    
  //     res.json({
  //       result: result[0],
  //       api_result: "ok",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({
  //       error,
  //       api_result: "nok",
  //     });
  //   }
  // });

  router.get("/Serial/:machine/:Process/:Parameter/:Line/:startDate/:finishDate", async (req, res) => {
    try {
        const { machine, Process, Parameter, Line ,startDate,finishDate} = req.params;
        
        // Query to retrieve the Master values
        const masterValuesQuery = `
        SELECT [table_Mastervalues]
        FROM [Component_Master].[dbo].[List_SPC_Master]
        WHERE [Part] = '${Process}'
        `;
        
        // Execute the query to retrieve the Master values
        const masterValuesResult = await user.sequelize.query(masterValuesQuery);
        
        // Extract the Master values from the query result
        const masterValues = masterValuesResult[0][0].table_Mastervalues;
        
        // Query to retrieve the Serial numbers
        const query = `
        
	     with set1 as(SELECT *
  FROM [MasterTest].[dbo].[${Process}]
  WHERE CONVERT(date, [Date]) = CONVERT(date, GETDATE())
  union SELECT *
  FROM [MasterTest_Data].[dbo].[${Process}]
  where CONVERT(date, [Date]) != CONVERT(date, GETDATE())
  )

SELECT DISTINCT set1.Serialnumber
        FROM set1
        INNER JOIN [Component_Master].[dbo].[List_SPC_Master] ON set1.[Process] = [List_SPC_Master].[Process]
        INNER JOIN [Mastervalues].[dbo].[${masterValues}] ON [List_SPC_Master].[Mastervalues] = [${masterValues}].Parameter
        and  [${masterValues}].[Serial No. master] = set1.Serialnumber
        WHERE [List_SPC_Master].Parameter = '${Parameter}' AND set1.Line = '${Line}' AND set1.Matchine = '${machine}' and Date between '${startDate}' and '${finishDate}'
        `;
        
        // Execute the query to retrieve the Serial numbers
        const result = await user.sequelize.query(query);
        
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


//   router.get("/graph_spc_master/:Process/:Parameter/:Model/:Line/:machine/:Serialnumber/:startDate/:finishDate", async (req, res) => {
//     try {
//         const { Process,Parameter, Model, Line, machine,Serialnumber, startDate, finishDate } = req.params;
//         var resultGraph = [[]];

        
//         // Query SQL โดยใช้พารามิเตอร์ที่รับเข้ามาจาก URL
//         var resultGraph = await user.sequelize.query(`
//         WITH set1 AS (
//             SELECT
//                 [Matchine],
//                 [Serialnumber],
//                 [Mastername],
//                 ${Parameter},
//                 [Date],
//                 [Time],
//                 ${Process}.[Line],
//                 Model
//             FROM
//                 [MasterTest_Data].[dbo].[${Process}]
//             INNER JOIN
//                 [Component_Master].[dbo].[Line_for_QRcode]
//                 ON Line_for_QRcode.Line = ${Process}.Line

//             WHERE
//                 ${Process}.Line = '${Line}'
//                 AND [Serialnumber] = '${Serialnumber}'
//                 AND Model = '${Model}'
//                 AND [Date] BETWEEN '${startDate}' AND '${finishDate}'
//         )
//         ,set2 AS (
//             SELECT
//                 [Matchine],
//                 [Serialnumber],
//                 [Mastername],
//                 ${Parameter},
//                 [Date],
//                 [Time],
//                 set1.Model,
//                 LSL,
//                 CL,
//                 USL
//             FROM
//                 set1
//             INNER JOIN
//                 [Component_Master].[dbo].[Master_matchings]
//                 ON set1.Model = Master_matchings.Model
//                 INNER JOIN  [Component_Master].[dbo].[List_SPC_Master]
//                 ON [Master_matchings].Parameter = [List_SPC_Master].Remark
//             WHERE [List_SPC_Master].Parameter = '${Parameter}'
            
           
//         )
//         SELECT
//             Date,
//             AVG(CAST(${Parameter} AS float)) AS value_y,
//             LSL,
//             CL,
//             USL
//         FROM
//             set2
//         GROUP BY
//             Date,
//             Model,
//             LSL,
//             CL,
//             USL
//         `);

//         // ตัวอย่างการใช้ข้อมูลจาก resultGraph เพื่อการประมวลผลอื่น ๆ
//         let value_y = [];
//         let LSL = []; // เพิ่มการกำหนดค่าให้กับ LSL
//         let CL = []; // เพิ่มการกำหนดค่าให้กับ CL
//         let USL = []; // เพิ่มการกำหนดค่าให้กับ USL
//         resultGraph[0].forEach((item) => {
//             value_y.push(item.value_y);
//             LSL.push(item.LSL);
//             CL.push(item.CL);
//             USL.push(item.USL);
//         });

//         // ตัวอย่างการนำข้อมูลไปใช้งานต่อหรือทำการแสดงผล
//         var listRawData = [];
//         listRawData.push(resultGraph[0]);
//         console.log(listRawData);

//         // ส่งข้อมูลกลับให้กับ Client
//         res.json({
//             resultGraph: resultGraph[0],
//             listRawData,
//             value_y,
//             LSL,
//             CL,
//             USL,
//             api_result: "ok",
//         });
//     } catch (error) {
//         console.log(error);
//         res.json({
//             error,
//             api_result: "nok",
//         });
//     }
// });

router.get("/graph_trend_master/:Process/:Parameter/:Model/:Line/:machine/:fixture/:Serialnumber/:startDate/:finishDate", async (req, res) => {
  try {
      const { Process,Parameter, Model, Line, machine,fixture,Serialnumber, startDate, finishDate } = req.params;
      var resultGraph = [[]];

      const masterValuesQuery = `
      SELECT [table_Mastervalues]
      FROM [Component_Master].[dbo].[List_SPC_Master]
      WHERE [Part] = '${Process}'
      `;
      
      // Execute the query to retrieve the Master values
      const masterValuesResult = await user.sequelize.query(masterValuesQuery);
      
      // Extract the Master values from the query result
      const masterValues = masterValuesResult[0][0].table_Mastervalues;


    
      
      if (masterValues === 'Mastervalues_AirLeak') {
        resultGraph  = await user.sequelize.query(`with set1 as(SELECT *
          FROM [MasterTest].[dbo].[${Process}]
          WHERE CONVERT(date, [Date]) = CONVERT(date, GETDATE())
          union SELECT *
          FROM [MasterTest_Data].[dbo].[${Process}]
          where CONVERT(date, [Date]) != CONVERT(date, GETDATE())
         ),
         set2 AS (
                SELECT  set1.Serialnumber,
                set1.Mastername,
                set1.${Parameter},
                set1.[Date],
                set1.[Time],
                Model,
                set1.Line
                FROM
                    set1
                INNER JOIN
                    [Component_Master].[dbo].[Line_for_QRcode]
                    ON Line_for_QRcode.Line = set1.Line
        
                WHERE
                     set1.Line = '${Line}'
                  AND [Serialnumber] = '${Serialnumber}'
                  AND Model = '${Model}' AND Fix = '${fixture}'
                  AND [Date] BETWEEN '${startDate}' AND '${finishDate}'
            )
          ,set3 as( 
                 SELECT
                [Serial No. master],
                Parameter,
                [Machine NO.],
                Line,
                UCL,
                CL,
                LCL,
                [Prepare_Date]
            FROM 
                [Mastervalues].[dbo].[${masterValues}]
            where Line = '${Line}' and [Machine NO.] = '${machine}' and [Serial No. master] = '${Serialnumber}' AND Fix = '${fixture}' AND [Prepare_Date] = (
                SELECT MAX([Prepare_Date])
                FROM [Mastervalues].[dbo].[${masterValues}]
                WHERE 
                    Line = '${Line}'
                    AND [Machine NO.] = '${machine}'
                     AND Fix = '${fixture}'
                    AND [Serial No. master] = '${Serialnumber}'
            )
            GROUP BY 
                [Serial No. master],
            UCL,
            CL,
            LCL,
            Parameter,
            [Machine NO.],
            Line,
            [Prepare_Date]
          
          
          ),set4 AS ( select
               [Machine NO.] as Machine ,
            [Serialnumber],
            [Mastername],
           ${Parameter},
            [Date] + ' ' + [Time] as Date_time,
                [Date],
            [Time],
            set2.Model,
          
            set3.LCL,
            set3.CL,
            set3.UCL
        
             FROM     set2
        INNER JOIN set3
            ON set3.[Serial No. master] = set2.Serialnumber
        INNER JOIN
            
            [Component_Master].[dbo].[List_SPC_Master]
            ON [List_SPC_Master].Mastervalues = set3.Parameter
                WHERE [List_SPC_Master].Parameter = '${Parameter}' and [Machine NO.] = '${machine}' and [Serial No. master] = '${Serialnumber}' and set3.Line = '${Line}'
        
            )
            SELECT
                Date_time,
                CAST(${Parameter} AS float) AS value_y,
         
                LCL,
                CL,
                UCL
        
            FROM
                set4
            GROUP BY
                Date_time,
                Model,
                ${Parameter},
        
                CL,
           
                LCL,
                UCL
                order by Date_time
              `);
    } else {
        resultGraph =  await user.sequelize.query(`with set1 as(SELECT *
          FROM [MasterTest].[dbo].[${Process}]
          WHERE CONVERT(date, [Date]) = CONVERT(date, GETDATE())
          union SELECT *
          FROM [MasterTest_Data].[dbo].[${Process}]
          where CONVERT(date, [Date]) != CONVERT(date, GETDATE())
         ),
         set2 AS (
                SELECT  set1.Serialnumber,
                set1.Mastername,
                set1.${Parameter},
                set1.[Date],
                set1.[Time],
                Model,
                set1.Line
                FROM
                    set1
                INNER JOIN
                    [Component_Master].[dbo].[Line_for_QRcode]
                    ON Line_for_QRcode.Line = set1.Line
        
                WHERE
                     set1.Line = '${Line}'
                  AND [Serialnumber] = '${Serialnumber}'
                  AND Model = '${Model}' 
                  AND [Date] BETWEEN '${startDate}' AND '${finishDate}'
            )
          ,set3 as( 
                 SELECT
                [Serial No. master],
                Parameter,
                [Machine NO.],
                Line,
                UCL,
                CL,
                LCL,
                [Prepare_Date]
            FROM 
                [Mastervalues].[dbo].[${masterValues}]
            where Line = '${Line}' and [Machine NO.] = '${machine}' and [Serial No. master] = '${Serialnumber}' AND [Prepare_Date] = (
                SELECT MAX([Prepare_Date])
                FROM [Mastervalues].[dbo].[${masterValues}]
                WHERE 
                    Line = '${Line}'
                    AND [Machine NO.] = '${machine}'
                     
                    AND [Serial No. master] = '${Serialnumber}'
            )
            GROUP BY 
                [Serial No. master],
            UCL,
            CL,
            LCL,
            Parameter,
            [Machine NO.],
            Line,
            [Prepare_Date]
          
          
          ),set4 AS ( select
               [Machine NO.] as Machine ,
            [Serialnumber],
            [Mastername],
           ${Parameter},
            [Date] + ' ' + [Time] as Date_time,
                [Date],
            [Time],
            set2.Model,
          
            set3.LCL,
            set3.CL,
            set3.UCL
        
             FROM     set2
        INNER JOIN set3
            ON set3.[Serial No. master] = set2.Serialnumber
        INNER JOIN
            
            [Component_Master].[dbo].[List_SPC_Master]
            ON [List_SPC_Master].Mastervalues = set3.Parameter
                WHERE [List_SPC_Master].Parameter = '${Parameter}' and [Machine NO.] = '${machine}' and [Serial No. master] = '${Serialnumber}' and set3.Line = '${Line}'
        
            )
            SELECT
                Date_time,
                CAST(${Parameter} AS float) AS value_y,
         
                LCL,
                CL,
                UCL
        
            FROM
                set4
            GROUP BY
                Date_time,
                Model,
                ${Parameter},
        
                CL,
           
                LCL,
                UCL
                order by Date_time
              `);
    }
      // Query SQL โดยใช้พารามิเตอร์ที่รับเข้ามาจาก URL


      // ตัวอย่างการใช้ข้อมูลจาก resultGraph เพื่อการประมวลผลอื่น ๆ
      let value_y = [];
     
      let LCL = []; // เพิ่มการกำหนดค่าให้กับ LCL
      let CL = []; // เพิ่มการกำหนดค่าให้กับ CL
   
      let UCL = []; // เพิ่มการกำหนดค่าให้กับ UCL
      resultGraph[0].forEach((item) => {
          value_y.push(item.value_y);
       
          CL.push(item.CL);
       
          UCL.push(item.UCL);
          LCL.push(item.LCL);
      });

      // ตัวอย่างการนำข้อมูลไปใช้งานต่อหรือทำการแสดงผล
      var listRawData = [];
      listRawData.push(resultGraph[0]);
      console.log(listRawData);

      // ส่งข้อมูลกลับให้กับ Client
      res.json({
          resultGraph: resultGraph[0],
          listRawData,
          value_y,
      
          UCL,
          CL,

          LCL,
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