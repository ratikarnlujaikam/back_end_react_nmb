const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const user1 = require("../database/models/user_216");

router.get("/Table", async (req, res) => {
  try {
    let result = await user1.sequelize.query(`SELECT [Table]
      FROM [PE_maintenance].[dbo].[Table_MC_Error]`);
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
router.get("/Line/:Table", async (req, res) => {
  const { Table } = req.params;
  try {
    let result = await user1.sequelize.query(
      `SELECT distinct REPLACE(Line, '/', '_') as Line from [PE_maintenance].[dbo].[${Table}] order by Line `
    );
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

router.get(
  "/MC_ERROR/:Table/:Line/:startDate/:finishDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { Table, Line, startDate, finishDate } = req.params;
      const Lingching = Line.replace("_", "/");
      var resultGraph = await user1.sequelize.query(`
    DECLARE @pivot_columns NVARCHAR(MAX);
    DECLARE @query NVARCHAR(MAX);
  
    SET @pivot_columns = STUFF(
        (SELECT DISTINCT ',' + QUOTENAME(LTRIM(RTRIM([Error])))
        FROM  [PE_maintenance].[dbo].[${Table}]
        WHERE [Error] != ''and Line='${Lingching}' and Date between '${startDate}' and '${finishDate}'
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
  
    SET @query = '
    SELECT Date, ' + @pivot_columns + '
    FROM (
        SELECT [Error], count([Error]) as Error_Qty, cast([Date] as nvarchar) as Date FROM [PE_maintenance].[dbo].[${Table}]
        WHERE [Error] != '''' and Line=''${Lingching}'' and Date between ''${startDate}'' and ''${finishDate}''
        GROUP BY [Error], [Date]
    ) AS subquery
    PIVOT
    (
        SUM(Error_Qty)
        FOR Error IN (' + @pivot_columns + ')
    ) AS PivotTable;';
  
    EXECUTE sp_executesql @query;
  `);

      let PivotTable = [];
      let xAxis = resultGraph[0].map((item) => item.Date);
      let pivot_columns = Object.keys(resultGraph[0][0]).filter(
        (key) => key !== "Date"
      );

      for (let key in pivot_columns) {
        let seriesData = resultGraph[0].map((item) => {
          let value = item[pivot_columns[key]];
          return value !== null ? value : 0;
        });
        PivotTable.push({
          name: pivot_columns[key],
          type: "column",
          data: seriesData,
        });
      }

      for (let i = 0; i < PivotTable.length; i++) {
        let series = PivotTable[i];
        let name = series.name;
        let type = series.type;
        let data = series.data;

        console.log("Name:", name);
        console.log("Type:", type);
        console.log("Data:", data);
        console.log(xAxis);
        console.log(PivotTable);
      }

      var resultGraph_MC = await user1.sequelize.query(`
  DECLARE @pivot_columns NVARCHAR(MAX);
    DECLARE @query NVARCHAR(MAX);
  
    SET @pivot_columns = STUFF(
        (SELECT DISTINCT ',' + QUOTENAME(LTRIM(RTRIM([Error])))
        FROM  [PE_maintenance].[dbo].[${Table}]
        WHERE [Error] != ''and Line='${Lingching}' and Date between '${startDate}' and '${finishDate}'
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '');
  
    SET @query = '
    SELECT  Machine_no,' + @pivot_columns + '
    FROM (
        SELECT [Error], count([Error]) as Error_Qty
		,[List_IPAddress].Machine_no
		FROM [PE_maintenance].[dbo].[${Table}]
		LEFT JOIN [IP_Address].[dbo].[List_IPAddress]
		ON [${Table}].IP_address COLLATE SQL_Latin1_General_CP1_CI_AS = [List_IPAddress].[IP_Address] COLLATE SQL_Latin1_General_CP1_CI_AS
		WHERE [Error] != '''' and [${Table}].Line=''${Lingching}'' and Date between ''${startDate}'' and ''${finishDate}''
        GROUP BY [Error], [Date],[List_IPAddress].Machine_no
    ) AS subquery
    PIVOT
    (
        SUM(Error_Qty)
        FOR Error IN (' + @pivot_columns + ')
    ) AS PivotTable;';
  
    EXECUTE sp_executesql @query;
`);

      var listRawData_MC = [];
      listRawData_MC.push(resultGraph_MC[0]);
      console.log("listRawData_MC", listRawData_MC);

      let PivotTable_MC = [];
      let xAxis_MC = resultGraph_MC[0].map((item) => item.Machine_no);
      let pivot_columns_MC = Object.keys(resultGraph_MC[0][0]).filter(
        (key) => key !== "Machine_no"
      );

      for (let key in pivot_columns_MC) {
        let series = resultGraph_MC[0].map((item) => {
          let value = item[pivot_columns_MC[key]];
          return value !== null ? value : 0;
        });

        // Check if there is at least one non-zero value in the series
        if (series.some((value) => value !== 0)) {
          PivotTable_MC.push({
            name: pivot_columns_MC[key],
            type: "column",
            data: series,
          });
        }
      }

      for (let i = 0; i < PivotTable_MC.length; i++) {
        let series_MC = PivotTable_MC[i];
        let name = series_MC.name;
        let type = series_MC.type;
        let data = series_MC.data;

        console.log("Name:", name);
        console.log("Type:", type);
        console.log("Data:", data);
        console.log("xAxis", xAxis_MC);
        console.log("PivotTable_MC", PivotTable_MC);
      }

      // Sorting PivotTable
      PivotTable.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );

      // Sorting PivotTable_MC
      PivotTable_MC.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );

      // Now both arrays are sorted by the 'name' property

      var listRawData = [];
      listRawData.push(resultGraph[0]);
      res.json({
        result: result[0],
        resultGraph: resultGraph[0],
        listRawData,

        PivotTable: PivotTable.map((series) => ({
          name: series.name,
          type: series.type,
          data: series.data,
        })),
        xAxis,

        result: result[0],
        resultGraph_MC: resultGraph_MC[0],
        listRawData_MC,

        PivotTable_MC: PivotTable_MC.map((series) => ({
          name: series.name,
          type: series.type,
          data: series.data,
        })),
        xAxis_MC,
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
