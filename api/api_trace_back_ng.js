const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const user1 = require("../database/models/user_216");


router.get("/Line", async (req, res) => {
  const { Table } = req.params;
  try {
    let result = await user.sequelize
      .query(`SELECT distinct Line_no as Line  from [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
      LEFT JOIN [T1749].[dbo].[IP_Connect]
      ON [Dynamic_Parallelism_Tester].IP = [IP_Connect].[IP_Address]
      where Line_no is not null`);
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

router.get("/MC_ERROR/:Line/:startDate", async (req, res) => {
  try {
    var result = [[]];
    const { Table, Line,startDate} = req.params;
    var result = await user.sequelize.query(`
    DECLARE @InputDate DATE;
    DECLARE @Line NVARCHAR(10);
  
    SET @InputDate = '${startDate}';
    SET @Line = '${Line}';
   
    
    DECLARE @SqlQuery NVARCHAR(MAX);

    SET @SqlQuery = N'
    SELECT [Dynamic_Parallelism_Tester].[Machine_no]
          ,[Dynamic_Parallelism_Tester].[Date]
          ,[Dynamic_Parallelism_Tester].[Time]
          ,[Dynamic_Parallelism_Tester].[Operator]
          ,[Dynamic_Parallelism_Tester].[Barcode]
          ,[Dynamic_Parallelism_Tester].[Master_Judgment]
          ,[Dynamic_Parallelism_Tester].[Set_Dim]
          ,[Dynamic_Parallelism_Tester].[Set_Dim_A]
          ,[Dynamic_Parallelism_Tester].[Set_Dim_B]
          ,[Dynamic_Parallelism_Tester].[Set_Dim_C]
          ,[Dynamic_Parallelism_Tester].[Ramp_to_Datum]
          ,[Dynamic_Parallelism_Tester].[Contact_Probe_2]
          ,[Dynamic_Parallelism_Tester].[Pivot_Height]
          ,[Dynamic_Parallelism_Tester].[Parallelism]
          ,[Dynamic_Parallelism_Tester].[TIR]
          ,[Dynamic_Parallelism_Tester].[TIR_A]
          ,[Dynamic_Parallelism_Tester].[TIR_B]
          ,[Dynamic_Parallelism_Tester].[TIR_C]
          ,[Dynamic_Parallelism_Tester].[FlyHeight]
          ,[Dynamic_Parallelism_Tester].[Fly_Height_Max_Limit]
          ,[Dynamic_Parallelism_Tester].[Fly_Height_Min_Limit]
          ,[Dynamic_Parallelism_Tester].[Axial_Play]
          ,[Dynamic_Parallelism_Tester].[Static_Dim]
          ,[Dynamic_Parallelism_Tester].[Static_Dim_A]
          ,[Dynamic_Parallelism_Tester].[Static_Dim_B]
          ,[Dynamic_Parallelism_Tester].[Static_Dim_C]
          ,[RVA]
          ,[Speed]
          ,[Ramp_Pivot]
          ,[Projection1]
          ,[Flange-Ramp_pad]
          ,[Dimension_Max]
          ,[Dimension_Max_Angle]
          ,[Dimension_Min]
          ,[Dimension_Min_Angle]
          ,[Static_Parallelism]
          ,[Static_Dimension_Max]
          ,[Static_Dimension_Max_Angle]
          ,[Static_Dimension_Min]
          ,[Static_Dimension_Min_Angle]
          ,[NRRO]
          ,[RRO]
          ,[Spin_direction_Value]
          ,[Spin_direction_Bin_Number]
          ,[Spin_direction_Result]
          ,[Remarks]
          ,''L''+[IP_Connect].[Line_no] as Line_no
          ,[Model]
          ,[2ndYield]
          ,[NG criteria]
    FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
    LEFT JOIN [T1749].[dbo].[IP_Connect]
    ON [Dynamic_Parallelism_Tester].IP = [IP_Connect].[IP_Address]
    WHERE [Remarks] != '''' AND [Line_no] = @Line
    AND [Time] BETWEEN DATEADD(DAY, DATEDIFF(DAY, 0, @InputDate), 0) + ''07:00:00'' AND DATEADD(DAY, DATEDIFF(DAY, 0, @InputDate) + 1, 0) + ''06:59:59''
    ORDER BY [Time], [Date]
    ';

    -- Execute the dynamic SQL query
    EXEC sp_executesql @SqlQuery, N'@Line NVARCHAR(10), @InputDate DATE', @Line, @InputDate;

    
    
  `);
  
  var listRawData = [];
  listRawData.push(result[0]);
  console.log(listRawData);

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
