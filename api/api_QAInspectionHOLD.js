const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`  ---ModelGroup---
    select '*ALL*' as ModelGroup FROM [QAInspection].[dbo].[tbQANumber]
    union
    select [tbQANumber].ModelGroup 
    FROM [QAInspection].[dbo].[tbQANumber]
    left join  [QAInspection].[dbo].[Tag_HoldQA]
     on [tbQANumber].QANumber = [Tag_HoldQA].QA_No
     where [tbQANumber].ModelGroup is not null
     and [tbQANumber].ModelGroup !=''`);
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

router.get("/Line/:model", async (req, res) => {
  try {
    const { model } = req.params;
    if (model == "*ALL*") {
      var result = await user.sequelize.query(` 
      select '*ALL*' as [Line_No] FROM [QAInspection].[dbo].[tbQANumber]
      union
      SELECT distinct[Line]
     FROM [Temp_TransportData].[dbo].[Line_for_QRcode]

    `);
    } else {
      var result = await user.sequelize.query(` 
      select '*ALL*' as [Line_No] FROM [QAInspection].[dbo].[tbQANumber]
      union
      SELECT distinct [Line]
     FROM [Temp_TransportData].[dbo].[Line_for_QRcode]
     where [Model] = '${model}'  `);
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

router.get("/Status", async (req, res) => {
  try {
    let result = await user.sequelize.query(`  
    select 'Accept' as Status
	  union
	  select 'Hold'
          union
	  select '*ALL*'
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

router.get("/Access_by/:Status", async (req, res) => {
  try {
    const { Status } = req.params;
    if (Status == "Accept") {
      var result = await user.sequelize.query(`
          select '-' as Access_by 
          --select distinct Access_by from [QAInspection].[dbo].[Tag_HoldQA]
        `);
    } else {
      var result = await user.sequelize.query(`
      select distinct Access_by from [QAInspection].[dbo].[Tag_HoldQA]
      where Access_by is not null
      union 
      select '*ALL*'`);
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
router.get(
  "/report/:model/:Line/:Status/:Access_by/:startDate/:finishDate/:selectedDateOption",
  async (req, res) => {
    try {
      var result = [[]];
      const { model, Line, Status, Access_by, startDate, finishDate ,selectedDateOption } =
        req.params;
      if (
        model === "*ALL*" &&
        Line === "*ALL*" &&
        Status === "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 1: model, Line, Status, และ Access_by เป็น "*ALL*"
        var result = await user.sequelize.query(`
        WITH [Record_QAPrint] AS (
          SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
		sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
      where 
      ${selectedDateOption} between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            --and status_Hold='${Status}'
            --and Access_by='${Access_by}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            --- เงื่อนไขที่ 1: model, Line, Status, และ Access_by เป็น "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line === "*ALL*" &&
        Status === "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 2: model, Line, Status เป็น "*ALL*" และ Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                -- เงื่อนไขที่ 2: model, Line, Status เป็น "*ALL*" และ Access_by ไม่ใช่ "*ALL*"
              WITH [Record_QAPrint] AS (
                  SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
		sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            --and status_Hold='${Status}'
            and Access_by='${Access_by}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 2: model, Line, Status เป็น "*ALL*" และ Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line === "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 3: model, Line, Access_by เป็น "*ALL*" และ Status ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 3: model, Line, Access_by เป็น "*ALL*" และ Status ไม่ใช่ "*ALL*"
                WITH [Record_QAPrint] AS (
                  SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
		sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            and status_Hold='${Status}'
            --and Access_by='${Access_by}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            --เงื่อนไขที่ 3: model, Line, Access_by เป็น "*ALL*" และ Status ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line === "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 4: model, Line เป็น "*ALL*" และ Status, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                -- เงื่อนไขที่ 4: model, Line เป็น "*ALL*" และ Status, Access_by ไม่ใช่ "*ALL*"
               WITH [Record_QAPrint] AS (
               SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
		sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            and status_Hold='${Status}'
            and Access_by='${Access_by}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 4: model, Line เป็น "*ALL*" และ Status, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line !== "*ALL*" &&
        Status === "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 5: model, Status, Access_by เป็น "*ALL*" และ Line ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                -- เงื่อนไขที่ 5: model, Status, Access_by เป็น "*ALL*" และ Line ไม่ใช่ "*ALL*"
              WITH [Record_QAPrint] AS (
                  SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
	sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            --and status_Hold='${Status}'
            --and Access_by='${Access_by}'
            and Line_No='${Line}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 5: model, Status, Access_by เป็น "*ALL*" และ Line ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line !== "*ALL*" &&
        Status === "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 6: model, Status เป็น "*ALL*" และ Line, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 6: model, Status เป็น "*ALL*" และ Line, Access_by ไม่ใช่ "*ALL*"
               WITH [Record_QAPrint] AS (
                 SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
	sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
          
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            --and status_Hold='${Status}'
            and Access_by='${Access_by}'
            and Line_No='${Line}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 6: model, Status เป็น "*ALL*" และ Line, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line !== "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 7: model, Access_by เป็น "*ALL*" และ Line, Status ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 7: model, Access_by เป็น "*ALL*" และ Line, Status ไม่ใช่ "*ALL*"
                  WITH [Record_QAPrint] AS (
                  SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
	sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            and status_Hold='${Status}'
            --and Access_by='${Access_by}'
            and Line_No='${Line}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 7: model, Access_by เป็น "*ALL*" และ Line, Status ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model === "*ALL*" &&
        Line !== "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 8: model เป็น "*ALL*" และ Line, Status, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 8: model เป็น "*ALL*" และ Line, Status, Access_by ไม่ใช่ "*ALL*"
            WITH [Record_QAPrint] AS (
                  SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
	sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            --and [Model_group]='${model}'
            and status_Hold='${Status}'
            and Access_by='${Access_by}'
            and Line_No='${Line}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 8: model เป็น "*ALL*" และ Line, Status, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line === "*ALL*" &&
        Status === "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 9: Line, Status, Access_by เป็น "*ALL*" และ model ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --เงื่อนไขที่ 9: Line, Status, Access_by เป็น "*ALL*" และ model ไม่ใช่ "*ALL*"
                WITH [Record_QAPrint] AS (
                 SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
		sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            --and status_Hold='${Status}'
            --and Access_by='${Access_by}'
            --and Line_No='${Line}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 9: Line, Status, Access_by เป็น "*ALL*" และ model ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line === "*ALL*" &&
        Status === "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 10: Line, Status เป็น "*ALL*" และ model, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                -- เงื่อนไขที่ 10: Line, Status เป็น "*ALL*" และ model, Access_by ไม่ใช่ "*ALL*"
                WITH [Record_QAPrint] AS (
                 SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
	sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            --and status_Hold='${Status}'
            and Access_by='${Access_by}'
            --and Line_No='${Line}'
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            --  เงื่อนไขที่ 10: Line, Status เป็น "*ALL*" และ model, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line === "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 11: Line, Access_by เป็น "*ALL*" และ model, Status ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --  เงื่อนไขที่ 11: Line, Access_by เป็น "*ALL*" และ model, Status ไม่ใช่ "*ALL*"
                WITH [Record_QAPrint] AS (
                  SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
	sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            --and Line_No='${Line}'
            and status_Hold='${Status}'
            --and Access_by='${Access_by}'
           
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            --   เงื่อนไขที่ 11: Line, Access_by เป็น "*ALL*" และ model, Status ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line === "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 12: Line เป็น "*ALL*" และ model, Status, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --  เงื่อนไขที่ 12: Line เป็น "*ALL*" และ model, Status, Access_by ไม่ใช่ "*ALL*"
                 WITH [Record_QAPrint] AS (
                  SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
		sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            --and Line_No='${Line}'
            and status_Hold='${Status}'
            and Access_by='${Access_by}'
           
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 12: Line เป็น "*ALL*" และ model, Status, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line !== "*ALL*" &&
        Status === "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 13: Status, Access_by เป็น "*ALL*" และ model, Line ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --  เงื่อนไขที่ 13: Status, Access_by เป็น "*ALL*" และ model, Line ไม่ใช่ "*ALL*"
               WITH [Record_QAPrint] AS (
                 SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
        sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            and Line_No='${Line}'
            --and status_Hold='${Status}'
            --and Access_by='${Access_by}'
           
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            -- เงื่อนไขที่ 13: Status, Access_by เป็น "*ALL*" และ model, Line ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line !== "*ALL*" &&
        Status === "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 14: Status เป็น "*ALL*" และ model, Line, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --   เงื่อนไขที่ 14: Status เป็น "*ALL*" และ model, Line, Access_by ไม่ใช่ "*ALL*"
                WITH [Record_QAPrint] AS (
                 SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
		sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            and Line_No='${Line}'
            --and status_Hold='${Status}'
            and Access_by='${Access_by}'
           
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            --  เงื่อนไขที่ 14: Status เป็น "*ALL*" และ model, Line, Access_by ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line !== "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by === "*ALL*"
      ) {
        // เงื่อนไขที่ 15: Access_by เป็น "*ALL*" และ model, Line, Status ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --   เงื่อนไขที่ 15: Access_by เป็น "*ALL*" และ model, Line, Status ไม่ใช่ "*ALL*"
                 WITH [Record_QAPrint] AS (
                 SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            and Line_No='${Line}'
            and status_Hold='${Status}'
            --and Access_by='${Access_by}'
           
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            --  เงื่อนไขที่ 15: Access_by เป็น "*ALL*" และ model, Line, Status ไม่ใช่ "*ALL*"
                  `);
      } else if (
        model !== "*ALL*" &&
        Line !== "*ALL*" &&
        Status !== "*ALL*" &&
        Access_by !== "*ALL*"
      ) {
        // เงื่อนไขที่ 16: model, Line, Status, Access_by ไม่ใช่ "*ALL*"
        var result = await user.sequelize.query(`
                --   เงื่อนไขที่ 16: model, Line, Status, Access_by ไม่ใช่ "*ALL*"
                WITH [Record_QAPrint] AS (
                SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
              where 
              ${selectedDateOption} between '${startDate}'and '${finishDate}'
            and [Model_group]='${model}'
            and Line_No='${Line}'
            and status_Hold='${Status}'
            and Access_by='${Access_by}'
           
            order by Setlot_Date,Qa_insp_date,Hold_Date_Mfg,Hold_Date
            --  เงื่อนไขที่ 16: model, Line, Status, Access_by ไม่ใช่ "*ALL*"
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
  }
);

router.get("/report2/:QANumber", async (req, res) => {
  try {
    const { QANumber } = req.params;
    let result = await user.sequelize
      .query(` 
      /****** Script for SelectTopNRows command from SSMS  ******/
      ----------------------------------------------------------------report2---------------------------------------------------------------
       WITH [Record_QAPrint] AS (
          SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              [Qty] AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
               
    where 
        [Lot_QA]like'${QANumber}%'
        order by Hold_Date,Lot_QA
      `);

    var listRawData2 = [];
    listRawData2.push(result[0]);

    res.json({
      result: result[0],
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
router.get("/report3/:Holdnumber", async (req, res) => {
  try {
    const { Holdnumber } = req.params;
    let result = await user.sequelize.query(` 
    /****** Script for SelectTopNRows command from SSMS  ******/
   WITH [Record_QAPrint] AS (
                    SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
  where  Hold_index like'${Holdnumber}%'
         order by Lot_QA,Hold_Date

      `);

    var listRawData3 = [];
    listRawData3.push(result[0]);

    res.json({
      result: result[0],
      listRawData3,
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
router.get("/HoldALL", async (req, res) => {
        try {
          let result = await user.sequelize
            .query(`     WITH [Record_QAPrint] AS (
                   SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
          where  status_Hold='Hold'
                    order by Hold_Date,Lot_QA
                  `);
      
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
router.get("/HoldForpc", async (req, res) => {
        try {
          let result = await user.sequelize
            .query(`    
                ---------------------------------------------------------HoldForpc-------------------------------------------------------------
            WITH [Record_QAPrint] AS (
                  SELECT DISTINCT
              [Lot_QA],
              CONVERT(DATE, [Record_QAPrint].DateTime) AS Setlot_Date,
              DateTime AS Setlot_Datetime,
              [Record_QAPrint].Model,
              [Record_QAPrint].Model_No,
              Line,
              [W/W] AS Record_QAPrint_W_W,
              sum([Qty]) AS Record_QAPrint_Qty
          FROM [Setlot].[dbo].[Record_QAPrint]
		  group by [Lot_QA],[Record_QAPrint].DateTime,[Record_QAPrint].Model,[Record_QAPrint].Model_No,Line,[W/W]
      ),
      
      [tbQA] AS (
          SELECT
              [tbQANumber].[Date] AS Date,
              [tbQANumber].[Time] AS Qa_insp_Datetime,
              s.[Model_group],
              s.[ModelNumber],
              Line_No,
              s.[QANumber],
              [tbQANumber].[DateCode],
              SUM([tbQANumber].MOQTY) AS QTY,
              [Vis_Round],
              [InspectionResult],
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5]
          FROM [QAInspection].[dbo].[tbVisualInspection] AS s
          LEFT JOIN [QAInspection].[dbo].[tbQANumber] ON s.[QANumber] = [tbQANumber].[QANumber]
          WHERE [Vis_Round] = (SELECT MAX([Vis_Round]) FROM [QAInspection].[dbo].[tbVisualInspection] WHERE [QANumber] = s.[QANumber])
          GROUP BY
              [Date],
              [Model_group],
              s.[ModelNumber],
              s.[QANumber],
              [DateCode],
              [Vis_Round],
              [InspectionResult],
              Line_No,
              [Base],
              [Ramp],
              [Hub],
              [Magnet],
              [FPC],
              [Diverter],
              [Crash_Stop],
              [CO2],
              [Emp_CO2],
              [SpecialControl1],
              [SpecialControl2],
              [SpecialControl3],
              [SpecialControl4],
              [SpecialControl5],
              [Time],
              [tbQANumber].[Time]
       ),[Record_TO_QA] AS (
                SELECT *,
                       CASE
                           WHEN [QANumber] IS NOT NULL THEN [InspectionResult]
                           WHEN [QANumber] IS NULL THEN 'Wait for QA'
                       ELSE [Lot_QA] END AS QA_result
                FROM [Record_QAPrint]
                LEFT JOIN [tbQA] ON [Record_QAPrint].Lot_QA = [tbQA].QANumber
                and [Record_QAPrint].Record_QAPrint_Qty = [tbQA].QTY
            ),
      
      [Tag_HoldQA] AS (
        SELECT
            Hold_index,
            [Tag_HoldQA].DateTime AS Hold_DateTime,
            [Tag_HoldQA].QA_No,
            [Tag_HoldQA].[Status] AS [Status],
            [Tag_HoldQA].[Access_by] AS Access_by,
            [Tag_HoldQA].Hold_By AS Hold_by,
            [Non_Conformance] AS Hold_detail,
            [Disposition] AS [Disposition],
            [MfgDate] AS Hold_Date,
            [Tag_HoldQA].[Remark],
            [Tag_HoldQA].[Control_Ship],
            CASE
                WHEN [Status] = 'Hold' THEN (DATEDIFF(DAY, [MfgDate], CAST(GETDATE() AS DATE)))
            ELSE 0 END AS Hold_Period,
            [Release_Date],
            [Reason_to_Release]
        FROM [QAInspection].[dbo].[Tag_HoldQA]
    ),
    
    [Record_To_QA_To_Tag_HoldQA] AS (
        SELECT
            Setlot_Date,
            Setlot_Datetime,
            [Date],
            Qa_insp_Datetime,
            Hold_DateTime,
            [Lot_QA],
            [QANumber],
            Record_QAPrint_W_W AS [DateCode],
            Record_TO_QA.Line AS Line_No,
            Record_QAPrint_Qty AS QTY,
            [Vis_Round],
            [InspectionResult],
            Model AS [Model_group],
            Model_No AS [ModelNumber],
            QA_No,
            Hold_index,
          
            CASE
                WHEN QA_result = 'REJECT' THEN 'QA'
            ELSE Hold_by END AS Hold_by,
            Hold_detail,
            CASE
                WHEN QA_result = 'REJECT' THEN 'Wait sorting'
            ELSE [Disposition] END AS [Disposition],
            Hold_Date,
            [Tag_HoldQA].[Remark],
  
            Hold_Period,
            QA_result,
            CASE
                WHEN QA_result = 'REJECT' AND YEAR(Date) > '2022' THEN 'Hold'
                WHEN [Status] IS NOT NULL THEN [Status]
                WHEN QA_result = 'Wait for QA' THEN ''
            ELSE [Status] END AS status_Hold,

            [Base],
            [Ramp],
            [Hub],
            [Magnet],
            [FPC],
            [Diverter],
            [Crash_Stop],
            [CO2],
            [Emp_CO2],
            [SpecialControl1],
            [SpecialControl2],
            [SpecialControl3],
            [SpecialControl4],
            [SpecialControl5],
            [Release_Date],
            [Reason_to_Release],
            Access_by,
            [Control_Ship]
        FROM Record_TO_QA
        LEFT JOIN [Tag_HoldQA] ON [Tag_HoldQA].QA_No = Record_TO_QA.Lot_QA
    ),
    
    [PCMC] AS (
      SELECT
      CASE  
WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WHC'  THEN 'Shipped-NV'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'FDB'  THEN 'Shipped-oversea'+':'+[Invoie_ID]
                   WHEN SUBSTRING([Invoie_ID], 1, 3) = 'WPD'  THEN 'Shipped-Thai'+':'+[Invoie_ID]
          
          -- Add more conditions if needed
          ELSE 'Shipped'
      END AS Shipped,
      [Invoie_ID],
      [Model],
      [Item_no],
      [Ramp],
      [Base],
      [Diverter],
      [Special_control],
      [Lot_No],
      [Date]
  FROM [PCMC].[dbo].[Invoice] AS s
                WHERE [Date] = (SELECT MAX([Date]) FROM [PCMC].[dbo].[Invoice] WHERE [Lot_No] = s.[Lot_No]
                )
            ),
            
            [final] AS (
                SELECT
                    Hold_Date AS Hold_Date_Mfg,
                    Hold_DateTime,
                    CONVERT(DATE, Hold_DateTime) AS Hold_Date,
                    Setlot_Date,
                    Setlot_Datetime,
                    Record_To_QA_To_Tag_HoldQA.Date AS Inspection_Date,
                    Model_group,
                    ModelNumber,
                    Line_No AS Line_No,
                    Hold_index,
                    Lot_QA,
                    Record_To_QA_To_Tag_HoldQA.DateCode,
                    QTY,
                    Hold_detail,
                    [Remark],
                    QA_result,
                    Status_Hold,
                    Shipped as Status_Shipped,
                    [Control_Ship],
                    Hold_by,
                    Access_by,
                    [Disposition],
                    CASE
                        WHEN QA_result = 'REJECT' THEN (DATEDIFF(DAY, Record_To_QA_To_Tag_HoldQA.Date, CAST(GETDATE() AS DATE)))
                    ELSE Hold_Period END AS Hold_Period,
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl1],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl2],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl3],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl4],
                    Record_To_QA_To_Tag_HoldQA.[SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Qa_insp_Datetime
                FROM Record_To_QA_To_Tag_HoldQA
                LEFT JOIN [PCMC] ON Record_To_QA_To_Tag_HoldQA.[Lot_QA] = PCMC.[Lot_No]
                GROUP BY
                    [Lot_QA],
                    Record_To_QA_To_Tag_HoldQA.Date,
                    [QANumber],
                    [ModelNumber],
                    Record_To_QA_To_Tag_HoldQA.[DateCode],
                    QTY,
                    [Model_group],
                    QA_result,
                    QA_No,
                    Hold_index,
                    Hold_by,
                    Hold_detail,
                    [Disposition],
                    Hold_Date,
                    [Remark],
                    Hold_Period,
                    Status_Hold,
                    [Lot_No],
                    Line_No,
                    Record_To_QA_To_Tag_HoldQA.[Base],
                    Record_To_QA_To_Tag_HoldQA.[Ramp],
                    [Hub],
                    [Magnet],
                    [FPC],
                    Record_To_QA_To_Tag_HoldQA.[Diverter],
                    [Crash_Stop],
                    [SpecialControl1],
                    [SpecialControl2],
                    [SpecialControl3],
                    [SpecialControl4],
                    [SpecialControl5],
                    [Release_Date],
                    [Reason_to_Release],
                    Setlot_Date,
                    Setlot_Datetime,
                    Qa_insp_Datetime,
                    Hold_DateTime,
                    Access_by,
                    Shipped,[Control_Ship]
            )

	,uppack as ( SELECT
    CONVERT(date, Unpack.[TimeStamp_unpack]) AS DATE,
    Unpack.[QA_no],
    Unpack.[Emp],
    Unpack.[TimeStamp_unpack] as sorting_datetime,
    Unpack.[TimeStamp_return] as Sorting_return,
        Unpack.[Reason_Hold]
		, CASE
        WHEN Unpack.[TimeStamp_return] IS NULL THEN 'Pending'
        WHEN Unpack.[TimeStamp_return] IS NOT NULL THEN 'Completed'
    END AS Sorting_Status
	,
	 CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) < 7 
            THEN DATEADD(DAY, -1, CONVERT(date, Unpack.[TimeStamp_unpack]))
        ELSE CONVERT(date, Unpack.[TimeStamp_unpack])
    END AS AdjustedDate
	,
	  CASE 
        WHEN DATEPART(HOUR, Unpack.[TimeStamp_unpack]) >= 7 AND DATEPART(HOUR, Unpack.[TimeStamp_unpack]) <= 18 THEN 'M'
        ELSE 'N'
    END AS TimePeriod

    FROM [Tray_Packing].[dbo].[Unpacking_Record] as Unpack
)
    
    SELECT
        Setlot_Date,
        Setlot_Datetime,
        Inspection_Date AS Qa_insp_date,
        Qa_insp_Datetime,
        Hold_Date_Mfg,
        Hold_Date,
        Hold_DateTime,
        Model_group,
        ModelNumber,
        ' L ' + Line_No AS Line_No,
        Hold_index,
        Lot_QA,
        DateCode,
        QTY,
        Hold_detail,
        [Remark],
        [Disposition],
        Hold_by,
        Access_by,
        QA_result,
        Status_Hold,
        Status_Shipped,
        [Control_Ship],
        Hold_Period,
        [SpecialControl5],
        [Release_Date],
        [Reason_to_Release],
sorting_datetime as Unpack_datetime,
		Sorting_Status
    FROM [final]
	left join uppack
	on [final].Lot_QA COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.QA_no COLLATE SQL_Latin1_General_CP1_CI_AS
	and [final].Hold_detail COLLATE SQL_Latin1_General_CP1_CI_AS = uppack.[Reason_Hold] COLLATE SQL_Latin1_General_CP1_CI_AS
            where  status_Hold='Hold'
            and Status_Shipped is null
            order by Hold_Date,Lot_QA
                  `);
      
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
