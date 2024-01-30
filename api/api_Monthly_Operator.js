
const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const user_216 = require("../database/models/user_216");

router.get("/year", async (req, res) => {
  try {
    let result = await user_216.sequelize.query(` select distinct year(Date) as year
    FROM  [WOS].[dbo].[operator_Tracking]
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
router.get("/Month", async (req, res) => {
  try {
    let result = await user_216.sequelize.query(`select distinct Month([Date]) as Month
      FROM [WOS].[dbo].[operator_Tracking]
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
router.get("/GroupName", async (req, res) => {
	try {
	  let result = await user_216.sequelize.query(`select 'White_Room' as GroupName
	  union 
	  select 'Fac.2'
	  union 
	  select 'ROTOR_ASSY'
	  union 
	  select 'Final_Assy'
	  union 
	  select 'Winding'
	  union 
	  select 'Other'
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

  router.get("/line", async (req, res) => {
	try {
	  let result = await user_216.sequelize.query(`
	  SELECT distinct REPLACE(operator_Tracking.Line_No, '/', '-') AS Line_No
FROM
    [WOS].[dbo].[operator_Tracking]
LEFT JOIN
    [WOS].[dbo].[ItemNo_Master] ON [operator_Tracking].ItemNo = [ItemNo_Master].[item_No]
	union 
select'**ALL**'
	order by Line_No
	
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


router.get("/LARPP/:year/:Month/:GroupName/:line",
  async (req, res) => {
    try {
      var result = [[]];
      const { year, Month ,GroupName,line} = req.params;
	  if (
        line === "**ALL**"
      )
        {var result = await user_216.sequelize
          .query(` -- Input parameters for the year and month
		  DECLARE @Year INT = ${year};
		  DECLARE @Month INT = ${Month};
		  DECLARE @Groupname NVARCHAR(255)= '${GroupName}';
		  -- Calculate the start and end dates based on the input year and month
		  DECLARE @StartDate DATE = DATEFROMPARTS(@Year, @Month, 1);
		  DECLARE @EndDate DATE = DATEADD(DAY, -1, DATEADD(MONTH, 1, @StartDate));  
		  
		  -- Drop the temporary table if it already exists
		  IF OBJECT_ID('tempdb..#TempTable') IS NOT NULL
			  DROP TABLE #TempTable;
		  
		  -- Create the temporary table
		  CREATE TABLE #TempTable (
			  CurrentDate DATE
		  );
		  
		  -- Loop to insert dates into the temporary table
		  WHILE @StartDate <= @EndDate
		  BEGIN
			  INSERT INTO #TempTable (CurrentDate) VALUES (@StartDate);
			  SET @StartDate = DATEADD(DAY, 1, @StartDate);
		  END;
		  
		  -- Generate the list of dynamic date columns for the PIVOT
		  DECLARE @DateColumns NVARCHAR(MAX);
		  SELECT @DateColumns = COALESCE(@DateColumns + ', ', '') + QUOTENAME(CONVERT(NVARCHAR, CurrentDate, 23))
		  FROM #TempTable
		  
		  
		  
		  
		  -- Execute the dynamic PIVOT query
		  DECLARE @PivotQuery NVARCHAR(MAX);
		  SET @PivotQuery = '
		  WITH Set1 AS (
			  SELECT 
				  [Date],
				  REPLACE(Line_No, ''/'', ''-'') AS Line_No,
				  COUNT([Emp_Code]) AS [Emp_Code],
				  [shift],
				  [dW] AS MODEL,
				  [ItemNo_Master].[item_Name],
				  ItemNo
			  FROM 
				  [WOS].[dbo].[operator_Tracking]
				  LEFT JOIN [WOS].[dbo].[ItemNo_Master] ON [operator_Tracking].ItemNo = [ItemNo_Master].[item_No]
			  WHERE 
				  YEAR([Date]) = ' + CAST(@Year AS NVARCHAR(4)) + ' AND MONTH([Date]) = ' + CAST(@Month AS NVARCHAR(2)) + '
				  and Date <= GETDATE()
			  GROUP BY 
				  [Date], [Line_No], [shift], [operator_Tracking].[Item_Name], ItemNo, [ItemNo_Master].[item_Name], ItemNo,[dW]
		  ),
		  Set2 AS (
			  SELECT 
		  
			  CASE
			  WHEN [item_Name] IN (''MOTOR FINAL ASSY'', ''STATOR HOUSING ASSY'') THEN ''White_Room''
			  WHEN [item_Name] IN (''ROTOR ASSY (SEALED)'') THEN ''Fac.2''
			  WHEN [item_Name] IN (''ROTOR FINAL'', ''ROTOR ASSY'', ''ROTOR ASSY (FINAL)'', ''ROTOR ASSY/YOKE'', ''ROTOR HUB ASSY'') THEN ''ROTOR_ASSY''
			  WHEN [item_Name] LIKE ''%SPINDLE MOTOR%'' THEN ''Final_Assy''
			  WHEN [item_Name] IN (''STATOR ASSY'', ''STATOR WINDING'') THEN ''Winding''
			  ELSE ''Other'' -- You can adjust this based on your specific requirements
	  END AS Area,
	  ItemNo,
	  [item_Name],
	  MODEL,
	  [Line_No],
				  shift,
				  SUM(' + STUFF((SELECT ' + CASE WHEN COALESCE(' + QUOTENAME(CONVERT(NVARCHAR, CurrentDate, 23)) + ', 0) = 0 THEN 1 ELSE 0 END '
				  FROM #TempTable
				  WHERE CurrentDate <= GETDATE()
				  FOR XML PATH('')), 1, 2, '') + ') AS [Missing Opt Record(Days)],
				  ' + STUFF((SELECT ', COALESCE(' + QUOTENAME(CONVERT(NVARCHAR, CurrentDate, 23)) + ', 0) AS ' + QUOTENAME(CONVERT(NVARCHAR, CurrentDate, 23))
							 FROM #TempTable
							 WHERE CurrentDate <= GETDATE()
							 FOR XML PATH('')), 1, 2, '') + '
		  
				  
		  
		  
				  
			  FROM 
				  Set1
			  PIVOT (
				  SUM([Emp_Code])
				  FOR [Date] IN (' + @DateColumns + ')
			  ) AS pvt
			   GROUP BY 
				  [item_Name],[Line_No], MODEL, ItemNo, shift,'+@DateColumns+'
		  )
		  SELECT 
			  Set2.*
		  
		  FROM 
			  Set2
		  WHERE  
			  Area= ''' + @Groupname + '''
			  
		  ORDER BY 
			  Set2.Line_No, Set2.shift;
		  ';
		  print @PivotQuery
		  -- Execute the dynamic PIVOT query
		  EXEC sp_executesql @PivotQuery;
		  
		  -- Drop the temporary table when done (if needed)
		  DROP TABLE #TempTable;`);}
		  else if (
			line !== "*ALL*" 
			
		  )        {var result = await user_216.sequelize
			.query(` -- Input parameters for the year and month
			DECLARE @Year INT = ${year};
			DECLARE @Month INT = ${Month};
			DECLARE @Groupname NVARCHAR(255)= '${GroupName}';
			-- Calculate the start and end dates based on the input year and month
			DECLARE @StartDate DATE = DATEFROMPARTS(@Year, @Month, 1);
			DECLARE @EndDate DATE = DATEADD(DAY, -1, DATEADD(MONTH, 1, @StartDate));  
			
			-- Drop the temporary table if it already exists
			IF OBJECT_ID('tempdb..#TempTable') IS NOT NULL
				DROP TABLE #TempTable;
			
			-- Create the temporary table
			CREATE TABLE #TempTable (
				CurrentDate DATE
			);
			
			-- Loop to insert dates into the temporary table
			WHILE @StartDate <= @EndDate
			BEGIN
				INSERT INTO #TempTable (CurrentDate) VALUES (@StartDate);
				SET @StartDate = DATEADD(DAY, 1, @StartDate);
			END;
			
			-- Generate the list of dynamic date columns for the PIVOT
			DECLARE @DateColumns NVARCHAR(MAX);
			SELECT @DateColumns = COALESCE(@DateColumns + ', ', '') + QUOTENAME(CONVERT(NVARCHAR, CurrentDate, 23))
			FROM #TempTable
			
			
			
			
			-- Execute the dynamic PIVOT query
			DECLARE @PivotQuery NVARCHAR(MAX);
			SET @PivotQuery = '
			WITH Set1 AS (
				SELECT 
					[Date],
					REPLACE(Line_No, ''/'', ''-'') AS Line_No,
					COUNT([Emp_Code]) AS [Emp_Code],
					[shift],
					[dW] AS MODEL,
					[ItemNo_Master].[item_Name],
					ItemNo
				FROM 
					[WOS].[dbo].[operator_Tracking]
					LEFT JOIN [WOS].[dbo].[ItemNo_Master] ON [operator_Tracking].ItemNo = [ItemNo_Master].[item_No]
				WHERE 
					YEAR([Date]) = ' + CAST(@Year AS NVARCHAR(4)) + ' AND MONTH([Date]) = ' + CAST(@Month AS NVARCHAR(2)) + '
					and Date <= GETDATE()
				GROUP BY 
					[Date], [Line_No], [shift], [operator_Tracking].[Item_Name], ItemNo, [ItemNo_Master].[item_Name], ItemNo,[dW]
			),
			Set2 AS (
				SELECT 
			
				CASE
                                          WHEN [item_Name] IN (''MOTOR FINAL ASSY'', ''STATOR HOUSING ASSY'') THEN ''White_Room''
                                          WHEN [item_Name] IN (''ROTOR ASSY (SEALED)'', ''ROTOR ASSY/YOKE'', ''ROTOR HUB ASSY'') THEN ''Fac.2''
                                          WHEN [item_Name] IN (''ROTOR FINAL'', ''ROTOR ASSY'', ''ROTOR ASSY (FINAL)'') THEN ''ROTOR_ASSY''
                                          WHEN [item_Name] LIKE ''%SPINDLE MOTOR%'' THEN ''Final_Assy''
                                          WHEN [item_Name] IN (''STATOR ASSY'', ''STATOR WINDING'') THEN ''Winding''
                                          ELSE ''Other'' -- You can adjust this based on your specific requirements
                                  END AS Area,
								  ItemNo,
								  [item_Name],
								  MODEL,
                                  [Line_No],
					shift,
					SUM(' + STUFF((SELECT ' + CASE WHEN COALESCE(' + QUOTENAME(CONVERT(NVARCHAR, CurrentDate, 23)) + ', 0) = 0 THEN 1 ELSE 0 END '
					FROM #TempTable
					WHERE CurrentDate <= GETDATE()
					FOR XML PATH('')), 1, 2, '') + ') AS [Missing Opt Record(Days)],
					' + STUFF((SELECT ', COALESCE(' + QUOTENAME(CONVERT(NVARCHAR, CurrentDate, 23)) + ', 0) AS ' + QUOTENAME(CONVERT(NVARCHAR, CurrentDate, 23))
							   FROM #TempTable
							   WHERE CurrentDate <= GETDATE()
							   FOR XML PATH('')), 1, 2, '') + '
			
					
			
			
					
				FROM 
					Set1
				PIVOT (
					SUM([Emp_Code])
					FOR day([Date]) IN (' + @DateColumns + ')
				) AS pvt
				 GROUP BY 
					[item_Name],[Line_No], MODEL, ItemNo, shift,'+@DateColumns+'
			)
			SELECT 
				Set2.*
			
			FROM 
				Set2
			WHERE  
				Area= ''' + @Groupname + '''and Line_No=''${line}''
				
			ORDER BY 
				Set2.Line_No, Set2.shift;
			';
			print @PivotQuery
			-- Execute the dynamic PIVOT query
			EXEC sp_executesql @PivotQuery;
			
			-- Drop the temporary table when done (if needed)
			DROP TABLE #TempTable;
			----line is not **ALL**`);}




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
});



module.exports = router;
