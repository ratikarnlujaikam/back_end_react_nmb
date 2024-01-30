
const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/ModelGroup", async (req, res) => {
  
  try {
    let result = await user.sequelize.query(`SELECT distinct [Model] as ModelGroup FROM [Control_part].[dbo].[Issue_parth_store]
    union select '**ALL**'`);
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

router.get("/ItemNo/:ModelGroup", async (req, res) => {
  
  try {
    const { ModelGroup } = req.params;
    var result = [[]];
    if (ModelGroup == "**ALL**") {
      var result = await user.sequelize.query(`SELECT distinct [Item_no] as [ItemNo]
      FROM [Control_part].[dbo].[Issue_parth_store]
      union select '**ALL**'
      order by [ItemNo] `);
    } else {
      var result = await user.sequelize.query(`SELECT distinct  [Item_no] as [ItemNo]
      FROM [Control_part].[dbo].[Issue_parth_store]
         where [Model]='${ModelGroup}'
         union select '**ALL**'
         order by [ItemNo] `);
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


router.get("/Master/:ModelGroup/:ItemNo/:startDate/:finishDate",
async (req, res) => {
  try {
    var result = [[]];
    const { ItemNo,ModelGroup,startDate,finishDate} = req.params;
  if (ModelGroup == "**ALL**"  && ItemNo == "**ALL**" ) {
    var result = await user.sequelize
      .query(` DECLARE @SupplierList NVARCHAR(MAX);
      DECLARE @query NVARCHAR(MAX);
      DECLARE @Supplier_SUM NVARCHAR(MAX);
      
      -- เรียงลำดับ Supplier ในรายการ
      SET @SupplierList = STUFF(
          (SELECT ',' + QUOTENAME(LTRIM(RTRIM([Supplier])))
          FROM [Control_part].[dbo].[Issue_parth_store]
          GROUP BY [Supplier]
          ORDER BY [Supplier] -- เรียงลำดับตาม Supplier
          FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
      
      -- เรียงลำดับ Supplier ในรายการที่มี SUM
      SET @Supplier_SUM = STUFF(
          (SELECT ', SUM(' + QUOTENAME(LTRIM(RTRIM([Supplier]))) + ') AS ' + QUOTENAME(LTRIM(RTRIM([Supplier])))
          FROM [Control_part].[dbo].[Issue_parth_store]
          GROUP BY [Supplier]
          ORDER BY [Supplier] -- เรียงลำดับตาม Supplier
          FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '');
      
      -- Replace spaces with underscores in column names for proper quoting
      
      SET @query = '
      WITH set1 AS (
          SELECT *
          FROM (
              SELECT [ID], [Model], [Part_name], [Item_no], [Supplier], [MO_number], [IQC_lot], [QTY], [Emp], [MfgDate], [DateTime_store], [Over_issue_L], [Mold]
              FROM [Control_part].[dbo].[Issue_parth_store]
            where MfgDate between ''${startDate}'' and '' ${finishDate}'' 
          ) AS SourceTable
          PIVOT (
              SUM([QTY]) FOR [Supplier] IN (' + @SupplierList + ')
          ) AS PivotTable
      )
      
      
      SELECT 
			[MfgDate], 
            [DateTime_store], 
            [Model] as Model_Name, 
            [Part_name] as Part_Name, 
            [Item_no] as Item_No,  
            [MO_number] as MO_Number,  
            [IQC_lot],
            [Emp], 
           
            [Mold],
        
          ' + @SupplierList + '
        FROM set1
        
        union ALL
        SELECT 
		     NULL AS [MfgDate], 
            NULL AS [DateTime_store],
            ''TOTAL'' AS [Model], 
            NULL AS [Part_name], 
            NULL AS [Item_no], 
            NULL AS [MO_number], 
            NULL AS [IQC_lot],
            NULL AS [Emp], 
        
            NULL AS [Mold],
        
          ' + @Supplier_SUM + '
        FROM set1
      
      ';
      EXEC sp_executesql @query;`
  );
} else if (ModelGroup == "**ALL**" && ItemNo != "**ALL**" ) {
  var result = await user.sequelize
    .query(`   DECLARE @SupplierList NVARCHAR(MAX);
    DECLARE @query NVARCHAR(MAX);
    DECLARE @Supplier_SUM NVARCHAR(MAX);
    
    -- เรียงลำดับ Supplier ในรายการ
    SET @SupplierList = STUFF(
        (SELECT ',' + QUOTENAME(LTRIM(RTRIM([Supplier])))
        FROM [Control_part].[dbo].[Issue_parth_store]
        GROUP BY [Supplier]
        ORDER BY [Supplier] -- เรียงลำดับตาม Supplier
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
    
    -- เรียงลำดับ Supplier ในรายการที่มี SUM
    SET @Supplier_SUM = STUFF(
        (SELECT ', SUM(' + QUOTENAME(LTRIM(RTRIM([Supplier]))) + ') AS ' + QUOTENAME(LTRIM(RTRIM([Supplier])))
        FROM [Control_part].[dbo].[Issue_parth_store]
        GROUP BY [Supplier]
        ORDER BY [Supplier] -- เรียงลำดับตาม Supplier
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '');
    
    -- Replace spaces with underscores in column names for proper quoting
    
    SET @query = '
    WITH set1 AS (
        SELECT *
        FROM (
            SELECT [ID], [Model], [Part_name], [Item_no], [Supplier], [MO_number], [IQC_lot], [QTY], [Emp], [MfgDate], [DateTime_store], [Over_issue_L], [Mold]
            FROM [Control_part].[dbo].[Issue_parth_store]
            where MfgDate between ''${startDate}'' and '' ${finishDate}''  and [Item_no]=''${ItemNo}'' 
        ) AS SourceTable
        PIVOT (
            SUM([QTY]) FOR [Supplier] IN (' + @SupplierList + ')
        ) AS PivotTable
    )
    
    
    SELECT 
    [MfgDate], 
          [DateTime_store], 
          [Model] as Model_Name, 
          [Part_name] as Part_Name, 
          [Item_no] as Item_No,  
          [MO_number] as MO_Number,  
          [IQC_lot],
          [Emp], 
         
          [Mold],
      
        ' + @SupplierList + '
      FROM set1
      
      union ALL
      SELECT 
       NULL AS [MfgDate], 
          NULL AS [DateTime_store],
          ''TOTAL'' AS [Model], 
          NULL AS [Part_name], 
          NULL AS [Item_no], 
          NULL AS [MO_number], 
          NULL AS [IQC_lot],
          NULL AS [Emp], 
      
          NULL AS [Mold],
      
        ' + @Supplier_SUM + '
      FROM set1
    
    ';
    EXEC sp_executesql @query; `);
} else if(ModelGroup != "**ALL**" &&  ItemNo == "**ALL**" ) {
  var result = await user.sequelize
    .query(`   DECLARE @SupplierList NVARCHAR(MAX);
    DECLARE @query NVARCHAR(MAX);
    DECLARE @Supplier_SUM NVARCHAR(MAX);
    
    -- เรียงลำดับ Supplier ในรายการ
    SET @SupplierList = STUFF(
        (SELECT ',' + QUOTENAME(LTRIM(RTRIM([Supplier])))
        FROM [Control_part].[dbo].[Issue_parth_store]
        GROUP BY [Supplier]
        ORDER BY [Supplier] -- เรียงลำดับตาม Supplier
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
    
    -- เรียงลำดับ Supplier ในรายการที่มี SUM
    SET @Supplier_SUM = STUFF(
        (SELECT ', SUM(' + QUOTENAME(LTRIM(RTRIM([Supplier]))) + ') AS ' + QUOTENAME(LTRIM(RTRIM([Supplier])))
        FROM [Control_part].[dbo].[Issue_parth_store]
        GROUP BY [Supplier]
        ORDER BY [Supplier] -- เรียงลำดับตาม Supplier
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '');
    
    -- Replace spaces with underscores in column names for proper quoting
    
    SET @query = '
    WITH set1 AS (
        SELECT *
        FROM (
            SELECT [ID], [Model], [Part_name], [Item_no], [Supplier], [MO_number], [IQC_lot], [QTY], [Emp], [MfgDate], [DateTime_store], [Over_issue_L], [Mold]
            FROM [Control_part].[dbo].[Issue_parth_store]
            where MfgDate between ''${startDate}'' and ''${finishDate}'' and [Model]=''${ModelGroup}'' 
        ) AS SourceTable
        PIVOT (
            SUM([QTY]) FOR [Supplier] IN (' + @SupplierList + ')
        ) AS PivotTable
    )
    
    
    SELECT 
			[MfgDate], 
            [DateTime_store], 
            [Model] as Model_Name, 
            [Part_name] as Part_Name, 
            [Item_no] as Item_No,  
            [MO_number] as MO_Number,  
            [IQC_lot],
            [Emp], 
           
            [Mold],
        
          ' + @SupplierList + '
        FROM set1
        
        union ALL
        SELECT 
		     NULL AS [MfgDate], 
            NULL AS [DateTime_store],
            ''TOTAL'' AS [Model], 
            NULL AS [Part_name], 
            NULL AS [Item_no], 
            NULL AS [MO_number], 
            NULL AS [IQC_lot],
            NULL AS [Emp], 
        
            NULL AS [Mold],
        
          ' + @Supplier_SUM + '
        FROM set1
    
    ';
    EXEC sp_executesql @query;`);
    } else {
      var result = await user.sequelize
        .query(` 
        DECLARE @SupplierList NVARCHAR(MAX);
        DECLARE @query NVARCHAR(MAX);
        DECLARE @Supplier_SUM NVARCHAR(MAX);
        
        -- เรียงลำดับ Supplier ในรายการ
        SET @SupplierList = STUFF(
            (SELECT ',' + QUOTENAME(LTRIM(RTRIM([Supplier])))
            FROM [Control_part].[dbo].[Issue_parth_store]
            GROUP BY [Supplier]
            ORDER BY [Supplier] -- เรียงลำดับตาม Supplier
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
        
        -- เรียงลำดับ Supplier ในรายการที่มี SUM
        SET @Supplier_SUM = STUFF(
            (SELECT ', SUM(' + QUOTENAME(LTRIM(RTRIM([Supplier]))) + ') AS ' + QUOTENAME(LTRIM(RTRIM([Supplier])))
            FROM [Control_part].[dbo].[Issue_parth_store]
            GROUP BY [Supplier]
            ORDER BY [Supplier] -- เรียงลำดับตาม Supplier
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '');
        
        -- Replace spaces with underscores in column names for proper quoting
        
        SET @query = '
        WITH set1 AS (
            SELECT *
            FROM (
                SELECT [ID], [Model], [Part_name], [Item_no], [Supplier], [MO_number], [IQC_lot], [QTY], [Emp], [MfgDate], [DateTime_store], [Over_issue_L], [Mold]
                FROM [Control_part].[dbo].[Issue_parth_store]
                where MfgDate between ''${startDate}'' and '' ${finishDate}''  and [Model]=''${ModelGroup}'' and [Item_no]=''${ItemNo}'' 
            ) AS SourceTable
            PIVOT (
                SUM([QTY]) FOR [Supplier] IN (' + @SupplierList + ')
            ) AS PivotTable
        )
        
        
        SELECT 
        [MfgDate], 
              [DateTime_store], 
              [Model] as Model_Name, 
              [Part_name] as Part_Name, 
              [Item_no] as Item_No,  
              [MO_number] as MO_Number,  
              [IQC_lot],
              [Emp], 
             
              [Mold],
          
            ' + @SupplierList + '
          FROM set1
          
          union ALL
          SELECT 
           NULL AS [MfgDate], 
              NULL AS [DateTime_store],
              ''TOTAL'' AS [Model], 
              NULL AS [Part_name], 
              NULL AS [Item_no], 
              NULL AS [MO_number], 
              NULL AS [IQC_lot],
              NULL AS [Emp], 
          
              NULL AS [Mold],
          
            ' + @Supplier_SUM + '
          FROM set1
        
        ';
        EXEC sp_executesql @query;
        
   `);
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
});



module.exports = router;
