const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

//motor
//DataML
router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Model] != 'EVANS'
    order by [Model]`);
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

router.get("/line/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model], [Line]
    FROM [DataforAnalysis].[dbo].[DataML]
    where [DataforAnalysis].[dbo].[DataML].[Model] = '${myModel}'`);
    // console.log(result);

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

router.get("/parameter", async (req, res) => {
  try {
    let result = await user.sequelize.query(`SELECT distinct[Parameter]
    FROM [DataforAnalysis].[dbo].[parameters_all]`);
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
  "/dataML/:startDate/:finishDate/:myModel/:myLine/:KPOV/:KPIV1/:KPIV2/:KPIV3/:KPIV4/:KPIV5/:KPIV6/:KPIV7/:KPIV8/:KPIV9/:KPIV10/:KPIV11/:KPIV12/:KPIV13/:KPIV14/:KPIV15",
  async (req, res) => {
    try {
      const {
        startDate,
        finishDate,
        myModel,
        myLine,
        KPOV,
        KPIV1,
        KPIV2,
        KPIV3,
        KPIV4,
        KPIV5,        
        KPIV6,
        KPIV7,
        KPIV8,
        KPIV9,
        KPIV10,        
        KPIV11,
        KPIV12,
        KPIV13,
        KPIV14,
        KPIV15,
      } = req.params;

      //MBA
      var result = [[]];
      if (
        KPIV1 !== "blank" &&
        KPIV2 === "blank" &&
        KPIV3 === "blank" &&
        KPIV4 === "blank" &&
        KPIV5 === "blank" &&
        KPIV6 === "blank" &&
        KPIV7 === "blank" &&
        KPIV8 === "blank" &&
        KPIV9 === "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 === "blank" &&
        KPIV4 === "blank" &&
        KPIV5 === "blank" &&
        KPIV6 === "blank" &&
        KPIV7 === "blank" &&
        KPIV8 === "blank" &&
        KPIV9 === "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 === "blank" &&
        KPIV5 === "blank" &&
        KPIV6 === "blank" &&
        KPIV7 === "blank" &&
        KPIV8 === "blank" &&
        KPIV9 === "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 === "blank" &&
        KPIV6 === "blank" &&
        KPIV7 === "blank" &&
        KPIV8 === "blank" &&
        KPIV9 === "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 === "blank" &&
        KPIV7 === "blank" &&
        KPIV8 === "blank" &&
        KPIV9 === "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}]
          FROM [Diecast].[dbo].[Pivot]
          join [TransportData].[dbo].[Matching_Auto_Unit1]
          on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
          join [DataforAnalysis].[dbo].[DataML]
          on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null)
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 === "blank" &&
        KPIV8 === "blank" &&
        KPIV9 === "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}]
          FROM [Diecast].[dbo].[Pivot]
          join [TransportData].[dbo].[Matching_Auto_Unit1]
          on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
          join [DataforAnalysis].[dbo].[DataML]
          on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null)
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 !== "blank" &&
        KPIV8 === "blank" &&
        KPIV9 === "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 !== "blank" &&
        KPIV8 !== "blank" &&
        KPIV9 === "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}],[${KPIV8}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null and [${KPIV8}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 !== "blank" &&
        KPIV8 !== "blank" &&
        KPIV9 !== "blank" &&
        KPIV10 === "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}],[${KPIV8}],[${KPIV9}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null and [${KPIV8}] is not null and [${KPIV9}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 !== "blank" &&
        KPIV8 !== "blank" &&
        KPIV9 !== "blank" &&
        KPIV10 !== "blank" &&
        KPIV11 === "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}],[${KPIV8}],[${KPIV9}],[${KPIV10}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null and [${KPIV8}] is not null and [${KPIV9}] is not null and [${KPIV10}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 !== "blank" &&
        KPIV8 !== "blank" &&
        KPIV9 !== "blank" &&
        KPIV10 !== "blank" &&
        KPIV11 !== "blank" &&
        KPIV12 === "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}],[${KPIV8}],[${KPIV9}],[${KPIV10}],[${KPIV11}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null and [${KPIV8}] is not null and [${KPIV9}] is not null and [${KPIV10}] is not null
        and [${KPIV11}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 !== "blank" &&
        KPIV8 !== "blank" &&
        KPIV9 !== "blank" &&
        KPIV10 !== "blank" &&
        KPIV11 !== "blank" &&
        KPIV12 !== "blank" &&
        KPIV13 === "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}],[${KPIV8}],[${KPIV9}],[${KPIV10}],[${KPIV11}],[${KPIV12}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null and [${KPIV8}] is not null and [${KPIV9}] is not null and [${KPIV10}] is not null
        and [${KPIV11}] is not null and [${KPIV12}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 !== "blank" &&
        KPIV8 !== "blank" &&
        KPIV9 !== "blank" &&
        KPIV10 !== "blank" &&
        KPIV11 !== "blank" &&
        KPIV12 !== "blank" &&
        KPIV13 !== "blank" &&
        KPIV14 === "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}],[${KPIV8}],[${KPIV9}],[${KPIV10}],[${KPIV11}],[${KPIV12}],[${KPIV13}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null and [${KPIV8}] is not null and [${KPIV9}] is not null and [${KPIV10}] is not null
        and [${KPIV11}] is not null and [${KPIV12}] is not null and [${KPIV13}] is not null)
        order by [Date]
              `);
      } else if (
        KPIV1 !== "blank" &&
        KPIV2 !== "blank" &&
        KPIV3 !== "blank" &&
        KPIV4 !== "blank" &&
        KPIV5 !== "blank" &&
        KPIV6 !== "blank" &&
        KPIV7 !== "blank" &&
        KPIV8 !== "blank" &&
        KPIV9 !== "blank" &&
        KPIV10 !== "blank" &&
        KPIV11 !== "blank" &&
        KPIV12 !== "blank" &&
        KPIV13 !== "blank" &&
        KPIV14 !== "blank" &&
        KPIV15 === "blank"
      ) {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}],[${KPIV8}],[${KPIV9}],[${KPIV10}],[${KPIV11}],[${KPIV12}],[${KPIV13}],[${KPIV14}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null and [${KPIV8}] is not null and [${KPIV9}] is not null and [${KPIV10}] is not null
        and [${KPIV11}] is not null and [${KPIV12}] is not null and [${KPIV13}] is not null and [${KPIV14}] is not null)
        order by [Date]
              `);
      } else {
        var result = await user.sequelize
          .query(`SELECT [DataML].[Model],[DataML].[Line],[DataML].[Date],[DataML].[Barcode_motor],[${KPOV}],[${KPIV1}],[${KPIV2}],[${KPIV3}],[${KPIV4}],[${KPIV5}],[${KPIV6}],[${KPIV7}],[${KPIV8}],[${KPIV9}],[${KPIV10}],[${KPIV11}],[${KPIV12}],[${KPIV13}],[${KPIV14}],[${KPIV15}]
        FROM [Diecast].[dbo].[Pivot]
        join [TransportData].[dbo].[Matching_Auto_Unit1]
        on [Pivot].Diecast_S_N=[Matching_Auto_Unit1].Barcode_Base
        join [DataforAnalysis].[dbo].[DataML]
        on [DataML].Barcode_motor=[Matching_Auto_Unit1].Barcode_Motor
        WHERE [DataML].[Model] = '${myModel}' AND [DataML].[Line] = '${myLine}' AND [DataML].[Date] BETWEEN '${startDate}' and '${finishDate}'
        and ([${KPOV}] is not null and [${KPIV1}] is not null and [${KPIV2}] is not null and [${KPIV3}] is not null and [${KPIV4}] is not null and [${KPIV5}] is not null
        and [${KPIV6}] is not null and [${KPIV7}] is not null and [${KPIV8}] is not null and [${KPIV9}] is not null and [${KPIV10}] is not null
        and [${KPIV11}] is not null and [${KPIV12}] is not null and [${KPIV13}] is not null and [${KPIV14}] is not null and [${KPIV15}] is not null)
        order by [Date]
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
  }
);



module.exports = router;
