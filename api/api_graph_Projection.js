const express = require("express");
const router = express.Router();
const user = require("../database/models/user");


router.get("/Data/:year/:start", async (req, res) => {
    try {
      var result = [[]];
      const { year,start } = req.params;
      const Line = year.replace('_', '/');
  
      
      var resultGraph = await user.sequelize.query(`
       SELECT top(125) [Ai_press].[Machine_no], [Set_Dim_A], [Set_Dim_B], [Set_Dim_C] ,Projection1,Parallelism
        FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester] 
        RIGHT JOIN [Oneday_ReadtimeData].[dbo].[Ai_press] 
        ON [Ai_press].[Barcode] =  [Dynamic_Parallelism_Tester].[Barcode]
        LEFT JOIN [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
        ON [Ai_press].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
        WHERE Dynamic_Parallelism_Tester.Model = 'LONGSP' and   [Dynamic_Parallelism_Tester].Line_IP = '3-17' 
		--and [Dynamic_Parallelism_Tester].[Time] BETWEEN DATEADD(hour, -3, GETDATE()) AND GETDATE()
		and [Ai_press].[Machine_no] = 'A'
       
	   union all 
		SELECT top(125)  [Ai_press].[Machine_no], [Set_Dim_A], [Set_Dim_B], [Set_Dim_C] ,Projection1,Parallelism
        FROM [Oneday_ReadtimeData].[dbo].[Dynamic_Parallelism_Tester] 
        RIGHT JOIN [Oneday_ReadtimeData].[dbo].[Ai_press] 
        ON [Ai_press].[Barcode] =  [Dynamic_Parallelism_Tester].[Barcode]
        LEFT JOIN [LinkedServer1].[IP_Address].[dbo].[List_IPAddress]
        ON [Ai_press].IP COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
        WHERE Dynamic_Parallelism_Tester.Model = 'LONGSP' and   [Dynamic_Parallelism_Tester].Line_IP = '3-17' 
		--and [Dynamic_Parallelism_Tester].[Time] BETWEEN DATEADD(hour, -3, GETDATE()) AND GETDATE()
		and [Ai_press].[Machine_no] = 'B';    
      
      
      
    `);
    
    let PivotTable = [];
    let xAxis = resultGraph[0].map((item) => item.Hour);
    let pivot_columns = Object.keys(resultGraph[0][0]).filter((key) => key !== 'Hour');
    
  
    for (let key in pivot_columns) {
      let seriesData = resultGraph[0].map((item) => {
        let value = item[pivot_columns[key]];
        return value !== null ? value : 0;
      });
    
      let seriesType = 'column'; // Default type is 'column'
    
      // Check if the series name is 'Output' or 'Target', and set the type to 'line' accordingly
      if (pivot_columns[key] === 'Output' || pivot_columns[key] === 'Target') {
        seriesType = 'line';
      }
    
      PivotTable.push({
        name: pivot_columns[key],
        type: seriesType,
        data: seriesData,
      });
    }
    
    // Now PivotTable contains columns and lines based on the condition
    console.log(PivotTable);
    
  
    
    
      var listRawData = [];
      listRawData.push(resultGraph[0]);
      res.json({
        result: result[0],
        resultGraph: resultGraph[0],
        listRawData,
       
        PivotTable: PivotTable,
        xAxis,
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
