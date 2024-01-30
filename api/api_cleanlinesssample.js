const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const nodemailer = require("nodemailer");





router.get("/Datacleanliness", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )



     SELECT
    set1.[Docno],
    CASE
        WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
        WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
    END AS Status,
    MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
    MAX(set1.[ModelName]) as [ModelName],
    SUBSTRING(MAX(set1.[Datecode]), 2, 2) AS WW,
    MAX(set1.[Datecode]) as [Datecode],
    MAX(set1.[samplename]) as [samplename],
    MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
    MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
    MAX(no_special.[MSL_no]) as [MSL_no],
    MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
    MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
     MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
     MAX(no_special.[filename]) as [filename]
FROM set1
JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
WHERE set1.[Docno] IS NOT NULL
GROUP BY set1.[Docno]
ORDER BY set1.[Docno] 
;
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

router.get("/Datacleanlinessseagate", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )



     SELECT
    set1.[Docno],
    CASE
        WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
        WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
    END AS Status,
    MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
    MAX(set1.[ModelName]) as [ModelName],
    SUBSTRING(MAX(set1.[Datecode]), 2, 2) AS WW,
    MAX(set1.[Datecode]) as [Datecode],
    MAX(set1.[samplename]) as [samplename],
    MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
    MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
    MAX(no_special.[MSL_no]) as [MSL_no],
    MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
    MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
     MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
     MAX(no_special.[filename]) as [filename]
FROM set1
JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
WHERE set1.[Docno] IS NOT NULL and Customer = 'Seagate'
GROUP BY set1.[Docno]
ORDER BY set1.[Docno] 
;
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
router.get("/DatacleanlinessLuminar", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )



     SELECT
    set1.[Docno],
    CASE
        WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
        WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
    END AS Status,
    MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
    MAX(set1.[ModelName]) as [ModelName],
    SUBSTRING(MAX(set1.[Datecode]), 2, 2) AS WW,
    MAX(set1.[Datecode]) as [Datecode],
    MAX(set1.[samplename]) as [samplename],
    MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
    MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
    MAX(no_special.[MSL_no]) as [MSL_no],
    MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
    MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
     MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
     MAX(no_special.[filename]) as [filename]
FROM set1
JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
WHERE set1.[Docno] IS NOT NULL and Customer = 'Luminar'
GROUP BY set1.[Docno]
ORDER BY set1.[Docno] 
;
    `);
    var listRawData4 = [];
    listRawData4.push(result[0]);

    res.json({
      result: result[0],
      listRawData4,
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
router.get("/DatacleanlinessdatetoCL", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )



     SELECT
    set1.[Docno],
    CASE
        WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
        WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
    END AS Status,
    MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
    MAX(set1.[ModelName]) as [ModelName],
    SUBSTRING(MAX(set1.[Datecode]), 2, 2) AS WW,
    MAX(set1.[Datecode]) as [Datecode],
    MAX(set1.[samplename]) as [samplename],
    MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
    MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
    MAX(no_special.[MSL_no]) as [MSL_no],
    MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
    MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
     MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
     MAX(no_special.[filename]) as [filename]
FROM set1
JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
WHERE set1.[Docno] IS NOT NULL 
GROUP BY set1.[Docno]
ORDER BY [Samlplesenddate_Cleanliness] 
;
    `);
    var listRawData5 = [];
    listRawData5.push(result[0]);

    res.json({
      result: result[0],
      listRawData5,
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
router.get("/Datacleanlinessshipmentdate", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )



     SELECT
    set1.[Docno],
    CASE
        WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
        WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
        WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
    END AS Status,
    MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
    MAX(set1.[ModelName]) as [ModelName],
    SUBSTRING(MAX(set1.[Datecode]), 2, 2) AS WW,
    MAX(set1.[Datecode]) as [Datecode],
    MAX(set1.[samplename]) as [samplename],
    MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
    MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
    MAX(no_special.[MSL_no]) as [MSL_no],
    MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
    MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
     MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
     MAX(no_special.[filename]) as [filename]
FROM set1
JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
WHERE set1.[Docno] IS NOT NULL 
GROUP BY set1.[Docno]
ORDER BY [CommittedShipmentDate]
;
    `);
    var listRawData6 = [];
    listRawData6.push(result[0]);

    res.json({
      result: result[0],
      listRawData6,
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
router.get("/Datacleanlinessapproval", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
    SELECT
    [Docno],
    [Status],
    [sample_buildMBA_date],
    [ModelName],
    SUBSTRING([Datecode], 2, 2) AS WW,
    [Datecode],
    [samplename],
    [Samlplesenddate_Cleanliness],
    [CommittedShipmentDate],
    [MSL_no],
    [MSL_accept_date],
    [MSL_check_point_date],
    [Time_and_date_received_sample],
    [filename]
FROM (
    SELECT
        set1.[Docno],
        CASE
            WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
            WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
            WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
            WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
        END AS [Status],
        MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
        MAX(set1.[ModelName]) as [ModelName],
        MAX(set1.[Datecode]) as [Datecode],
        MAX(set1.[samplename]) as [samplename],
        MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
        MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
        MAX(no_special.[MSL_no]) as [MSL_no],
        MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
        MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
        MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
        MAX(no_special.[filename]) as [filename]
    FROM set1
    JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
    WHERE set1.[Docno] IS NOT NULL
    GROUP BY set1.[Docno]
) AS Subquery
WHERE [Status] = 'Approval'
ORDER BY [Docno];
;
    `);
    var listRawData7 = [];
    listRawData7.push(result[0]);

    res.json({
      result: result[0],
      listRawData7,
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
router.get("/DatacleanlinessReject", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
    SELECT
    [Docno],
    [Status],
    [sample_buildMBA_date],
    [ModelName],
    SUBSTRING([Datecode], 2, 2) AS WW,
    [Datecode],
    [samplename],
    [Samlplesenddate_Cleanliness],
    [CommittedShipmentDate],
    [MSL_no],
    [MSL_accept_date],
    [MSL_check_point_date],
    [Time_and_date_received_sample],
    [filename]
FROM (
    SELECT
        set1.[Docno],
        CASE
            WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
            WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
            WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
            WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
        END AS [Status],
        MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
        MAX(set1.[ModelName]) as [ModelName],
        MAX(set1.[Datecode]) as [Datecode],
        MAX(set1.[samplename]) as [samplename],
        MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
        MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
        MAX(no_special.[MSL_no]) as [MSL_no],
        MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
        MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
        MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
        MAX(no_special.[filename]) as [filename]
    FROM set1
    JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
    WHERE set1.[Docno] IS NOT NULL
    GROUP BY set1.[Docno]
) AS Subquery
WHERE [Status] = 'Reject'
ORDER BY [Docno];
;
    `);
    var listRawData8 = [];
    listRawData8.push(result[0]);

    res.json({
      result: result[0],
      listRawData8,
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
router.get("/DatacleanlinesswaitingMG", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
    SELECT
    [Docno],
    [Status],
    [sample_buildMBA_date],
    [ModelName],
    SUBSTRING([Datecode], 2, 2) AS WW,
    [Datecode],
    [samplename],
    [Samlplesenddate_Cleanliness],
    [CommittedShipmentDate],
    [MSL_no],
    [MSL_accept_date],
    [MSL_check_point_date],
    [Time_and_date_received_sample],
    [filename]
FROM (
    SELECT
        set1.[Docno],
        CASE
            WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
            WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
            WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
            WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
        END AS [Status],
        MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
        MAX(set1.[ModelName]) as [ModelName],
        MAX(set1.[Datecode]) as [Datecode],
        MAX(set1.[samplename]) as [samplename],
        MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
        MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
        MAX(no_special.[MSL_no]) as [MSL_no],
        MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
        MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
        MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
        MAX(no_special.[filename]) as [filename]
    FROM set1
    JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
    WHERE set1.[Docno] IS NOT NULL
    GROUP BY set1.[Docno]
) AS Subquery
WHERE [Status] = 'Wait Mg. requester approval'
ORDER BY [Docno];
;
    `);
    var listRawData9 = [];
    listRawData9.push(result[0]);

    res.json({
      result: result[0],
      listRawData9,
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
router.get("/DatacleanlinesswaitingCL", async (req, res) => {
  try {
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
    SELECT
    [Docno],
    [Status],
    [sample_buildMBA_date],
    [ModelName],
    SUBSTRING([Datecode], 2, 2) AS WW,
    [Datecode],
    [samplename],
    [Samlplesenddate_Cleanliness],
    [CommittedShipmentDate],
    [MSL_no],
    [MSL_accept_date],
    [MSL_check_point_date],
    [Time_and_date_received_sample],
    [filename]
FROM (
    SELECT
        set1.[Docno],
        CASE
            WHEN MAX(set1.[Mgrequester_result]) IS NULL THEN 'Wait Mg. requester approval'
            WHEN MAX(set1.[Mgrequester_result]) = 'accept' AND MAX(set1.[Cleanliness_result]) IS NULL THEN 'Wait CL team approval'
            WHEN MAX(set1.[Cleanliness_result]) = 'Accept' THEN 'Approval'
            WHEN MAX(set1.[Cleanliness_result]) = 'Reject' OR MAX(set1.[Mgrequester_result]) = 'Reject' THEN 'Reject'
        END AS [Status],
        MAX(set1.[sample_buildMBA_date]) as [sample_buildMBA_date],
        MAX(set1.[ModelName]) as [ModelName],
        MAX(set1.[Datecode]) as [Datecode],
        MAX(set1.[samplename]) as [samplename],
        MAX(set1.[Samlplesenddate_Cleanliness]) as [Samlplesenddate_Cleanliness],
        MAX(set1.[CommittedShipmentDate]) as [CommittedShipmentDate],
        MAX(no_special.[MSL_no]) as [MSL_no],
        MAX(no_special.[MSL_accept_date]) as [MSL_accept_date],
        MAX(no_special.[MSL_check_point_date]) as [MSL_check_point_date],
        MAX(no_special.[Time_and_date_received_sample]) as [Time_and_date_received_sample],
        MAX(no_special.[filename]) as [filename]
    FROM set1
    JOIN [Cleanliness_sample].[dbo].[No_special] no_special ON set1.[Docno] = no_special.[docNo]
    WHERE set1.[Docno] IS NOT NULL
    GROUP BY set1.[Docno]
) AS Subquery
WHERE [Status] = 'Wait CL team approval'
ORDER BY [Docno];
;
    `);
    var listRawData10 = [];
    listRawData10.push(result[0]);

    res.json({
      result: result[0],
      listRawData10,
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


router.get("/uploadfile/:filename/:docNo", async (req, res) => {
  try {
    const {
      docNo,
      filename,   
    } = req.params;
    let result = await user.sequelize.query(`UPDATE [Cleanliness_sample].[dbo].[No_special]
    SET [filename] = '${filename}'
    WHERE [docNo] = '${docNo}'
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

router.get("/Viewdatabase/:MSLno/:docNo", async (req, res) => {
  try {
    const {
      docNo,
      MSLno,   
    } = req.params;
    let result = await user.sequelize.query(`UPDATE [Cleanliness_sample].[dbo].[No_special]
    SET [MSL_no] = '${MSLno}',[Time_and_date_received_sample] = GETDATE()
    WHERE [docNo] = '${docNo}'
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
router.get("/Viewdatabaseaccept/:MSL_accept_date/:docNo", async (req, res) => {
  try {
    const {
      docNo,
      MSL_accept_date ,
 
   
    } = req.params;
    let result = await user.sequelize.query(`UPDATE [Cleanliness_sample].[dbo].[No_special]
    SET [MSL_accept_date] = '${MSL_accept_date }'
    WHERE [docNo] = '${docNo}'
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
router.get("/Viewdatabasecheckpoint/:MSL_check_point_date/:docNo", async (req, res) => {
  try {
    const {
      docNo,
      MSL_check_point_date ,
 
   
    } = req.params;
    let result = await user.sequelize.query(`UPDATE [Cleanliness_sample].[dbo].[No_special]
    SET [MSL_check_point_date] = '${MSL_check_point_date }'
    WHERE [docNo] = '${docNo}'
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


router.get("/DocNo", async (req, res) => {
  try {
    let result = await user.sequelize.query(`SELECT MAX([No]) + 1 AS [No]
    FROM [Cleanliness_sample].[dbo].[No_special];
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
router.get(
  "/document/:selectedOptionDropdown1/:no",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,       
        no,
     
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[No_special]
    ([No],[docNo]) 
    VALUES 
    ('${no}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}')
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
  }
)
router.get(
  "/Mgrequest/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest2/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest3/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest4/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest5/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest6/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest7/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest8/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest9/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest10/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest11/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest12/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest13/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Mgrequest14/:selectedOptionMgrequestdropdown/:selectedOptionRadioButtons3/:textValueMgrequesttb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionMgrequestdropdown,
        selectedOptionRadioButtons3,
        textValueMgrequesttb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
        SET [Mgrequester_name] = '${selectedOptionMgrequestdropdown}', [Mgrequester_result] = '${selectedOptionRadioButtons3}',[Mgrequester_reason] = '${textValueMgrequesttb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)

router.get(
  "/Cleanlinessapprove/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove2/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove3/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove4/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove5/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove6/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove7/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove8/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove9/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove10/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove11/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove12/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove13/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)
router.get(
  "/Cleanlinessapprove14/:selectedOptionCleanlinessdropdown/:selectedOptionRadiocleanliness/:textValueCleanlinesstb/:docNo",
  async (req, res) => {
    try {
      const {
        docNo,
        selectedOptionCleanlinessdropdown,
        selectedOptionRadiocleanliness,
        textValueCleanlinesstb,
      } = req.params;
      let result = await user.sequelize
        .query(`UPDATE [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
        SET [Cleanliness_name] = '${selectedOptionCleanlinessdropdown}', [Cleanliness_result] = '${selectedOptionRadiocleanliness}',[Cleanliness_reason] = '${textValueCleanlinesstb}'
        WHERE [Docno] = '${docNo}';
        
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
  }
)

router.get("/Mgapprove/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Mgrequester_result],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Mgrequester_result],       
          [Docno]`);
    // console.log(result);
    var listRawData = [];
    listRawData.push(result[0]);

    console.log(listRawData);

    res.json({
      result: result[0],
      listRawData1: listRawData, // เปลี่ยนชื่อเป็น listRawData1
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
router.get("/Mgapprovereason/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Mgrequester_reason],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Mgrequester_reason],       
          [Docno]`);
    // console.log(result);
    var listRawData = [];
    listRawData.push(result[0]);

    console.log(listRawData);

    res.json({
      result: result[0],
      listRawData1: listRawData, // เปลี่ยนชื่อเป็น listRawData1
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
router.get("/Section/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Section],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Section],       
          [Docno]`);
    // console.log(result);
    var listRawData = [];
    listRawData.push(result[0]);

    console.log(listRawData);

    res.json({
      result: result[0],
      listRawData1: listRawData, // เปลี่ยนชื่อเป็น listRawData1
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
router.get("/Register/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Register],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Register],       
          [Docno]`);
    // console.log(result);
    var listRawData = [];
    listRawData.push(result[0]);

    console.log(listRawData);

    res.json({
      result: result[0],
      listRawData1: listRawData, // เปลี่ยนชื่อเป็น listRawData1
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
router.get("/Modelname/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [ModelName],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [ModelName],       
          [Docno]`);
    // console.log(result);
    var listRawData = [];
    listRawData.push(result[0]);

    console.log(listRawData);

    res.json({
      result: result[0],
      listRawData1: listRawData, // เปลี่ยนชื่อเป็น listRawData1
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
router.get("/Datatestfor/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Data_test_for],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Data_test_for],       
          [Docno]`);
    // console.log(result);
    var listRawData = [];
    listRawData.push(result[0]);

    console.log(listRawData);

    res.json({
      result: result[0],
      listRawData1: listRawData, // เปลี่ยนชื่อเป็น listRawData1
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
router.get("/Datatestforreason/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Data_test_for_reason],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Data_test_for_reason],       
          [Docno]`);
    // console.log(result);
    var listRawData = [];
    listRawData.push(result[0]);

    console.log(listRawData);

    res.json({
      result: result[0],
      listRawData1: listRawData, // เปลี่ยนชื่อเป็น listRawData1
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
router.get("/Samplename/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
      
      SELECT [samplename],
             [Docno]     
           from set1      
        where [Docno] = '${docNo}'
        group by
             [samplename],       
           [Docno]`);
    // console.log(result);
    var listRawData1 = [];
    listRawData1.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData1);

    res.json({
      result: result[0],
      listRawData: listRawData1, // เปลี่ยนlistRawData1
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
router.get("/Material/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [material],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [material],       
          [Docno]`);
    // console.log(result);
    var listRawData2 = [];
    listRawData2.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData2);

    res.json({
      result: result[0],
      listRawData2: listRawData2, // เปลี่ยนlistRawData1
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
router.get("/Customer/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Customer],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Customer],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Mailrequest/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Mailrequest],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Mailrequest],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Qty/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Qty],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Qty],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Surfacebase/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [SurfaceArea_Base],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [SurfaceArea_Base],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/SurfaceMBA/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [SurfaceArea_MBA],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [SurfaceArea_MBA],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/SurfaceHub/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [SurfaceArea_Hub],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [SurfaceArea_Hub],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/SurfaceETC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [SurfaceArea_etc],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [SurfaceArea_etc],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoRev/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Rev],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Lotno_Rev],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoPartno/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Partno],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}'
       group by
            [Lotno_Partno],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsLPC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'LPC'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsSprayLPC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Spray LPC'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsAPA/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'APA'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsTalcbytape/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Talc by tape'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsFTIR/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'FTIR'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsIC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'IC'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsOutgasday0/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Outgas day 0'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsOutgasday14/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Outgas day 14'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsGhosttest/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Ghost test'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsDynamicdiskghost/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Dynamic disk ghost'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsExtractable/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Extractable'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsCorrosion/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Corrosion'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsParticlecount/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Particle count'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/InstrumentsNVR/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Instruments,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'NVR'
       group by
            TestTeam_Instruments,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityLPC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'LPC'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantitySprayLPC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Spray LPC'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityAPA/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'APA'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityTalcbytape/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Talc by tape'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityFTIR/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'FTIR'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityIC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'IC'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityNVR/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'NVR'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityOutgasday0/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Outgas day 0'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityOutgasday14/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Outgas day 14'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityGhosttest/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Ghost test'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityDynamicdiskghost/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Dynamic disk ghost'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityExtractable/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Extractable'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityCorrosion/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Corrosion'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/DataquantityParticlecount/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_DataQuantity,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Particle count'
       group by
            TestTeam_DataQuantity,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkLPC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'LPC'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkSprayLPC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Spray LPC'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkAPA/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'APA'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkCorrosion/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Corrosion'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkDynamicdiskghost/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Dynamic disk ghost'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkExtractable/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Extractable'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkFTIR/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'FTIR'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkGhosttest/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Ghost test'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkIC/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'IC'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkNVR/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'NVR'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkOutgasday0/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Outgas day 0'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkOutgasday14/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Outgas day 14'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkParticlecount/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Particle count'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/RemarkTalcbytape/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT TestTeam_Remark,
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' and  TestTeam_Testitem = 'Talc by tape'
       group by
            TestTeam_Remark,       
          [Docno]`);
    // console.log(result);
    var listRawData4 = [];
    listRawData4.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData4);

    res.json({
      result: result[0],
      listRawData4: listRawData4, // เปลี่ยนlistRawData1
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
router.get("/LotnoPlatform/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Platform],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
            [Lotno_Platform],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoLotQAno/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_LotQAno],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
            [Lotno_LotQAno],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoMotorOilType/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_MotorOilType],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
            [Lotno_MotorOilType],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoLotMOno/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_LotMOno],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
            [Lotno_LotMOno],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoSupplierhub/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Supplierhub],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
            [Lotno_Supplierhub],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoSupplierbase/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Supplierbase],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
            [Lotno_Supplierbase],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoSupplierPCB/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_SupplierPCB],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
            [Lotno_SupplierPCB],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoPCBlotno/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_PCBlotno],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
            [Lotno_PCBlotno],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoSupplierramp/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Supplierramp],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_Supplierramp],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoSupplierdiverter/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Supplierdiverter],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_Supplierdiverter],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoRamplotno/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Ramplotno],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_Ramplotno],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoDiverterlot/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Diverterlot],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_Diverterlot],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoSupplierIDCS/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_SupplierIDCS],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_SupplierIDCS],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoIDCSlot/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_IDCSlot],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_IDCSlot],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoSHAWashingno/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_SHAWashingno],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_SHAWashingno],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoOvenSHANo/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_OvenSHANo],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_OvenSHANo],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoOvenMBA/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_OvenMBA],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_OvenMBA],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoCO2mcno/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_CO2mcno],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_CO2mcno],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoLineno/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Lineno],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_Lineno],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/LotnoResultunit/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Lotno_Resultunit],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Lotno_Resultunit],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Purposeoftest/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Purposeoftest],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Purposeoftest],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/ProcessDescription/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [ProcessDescription],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [ProcessDescription],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Referencedata/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Referencedata],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Referencedata],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Comment/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Comment],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
           [Comment],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/NMBsample/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [sample_buildMBA_date],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [sample_buildMBA_date],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Samplesend/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Samlplesenddate_Cleanliness],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [Samlplesenddate_Cleanliness],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Samplesub/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [SamplesubmissiontoMSL_date],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [SamplesubmissiontoMSL_date],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Committed/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [CommittedShipmentDate],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [CommittedShipmentDate],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Cleanlinessname/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Cleanliness_name],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [Cleanliness_name],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Cleanlinessresult/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Cleanliness_result],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [Cleanliness_result],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Cleanlinessreason/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Cleanliness_reason],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [Cleanliness_reason],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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

router.get("/Mgrequesterresult/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Mgrequester_result],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [Mgrequester_result],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
router.get("/Mgrequesterreason/:docNo", async (req, res) => {
  try {
    const { docNo } = req.params;
    let result = await user.sequelize.query(`with set1 as (select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
     union
     select *
      FROM [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
     )
     
     SELECT [Mgrequester_reason],
            [Docno]     
           FROM set1      
       where [Docno] = '${docNo}' 
       group by
       [Mgrequester_reason],       
          [Docno]`);
    // console.log(result);
    var listRawData3 = [];
    listRawData3.push(result[0]);// เปลี่ยนlistRawData1

    console.log(listRawData3);

    res.json({
      result: result[0],
      listRawData3: listRawData3, // เปลี่ยนlistRawData1
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
  "/Special/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special]
    ([Section]
      ,[Register]
      ,[Data_test_for]
      ,[samplename]
      ,[material]
      ,[ModelName]
      ,[Datecode]
      ,[Customer]
      ,[Qty]
      ,[TestTeam_Testitem]
      ,[TestTeam_Instruments]
      ,[TestTeam_DataQuantity]
      ,[TestTeam_Remark]
      ,[SurfaceArea_Base]
      ,[SurfaceArea_MBA]
      ,[SurfaceArea_Hub]
      ,[SurfaceArea_etc]
      ,[Lotno_Partno]
      ,[Lotno_Rev]
      ,[Lotno_Platform]
      ,[Lotno_LotQAno]
      ,[Lotno_MotorOilType]
      ,[Lotno_LotMOno]
      ,[Lotno_Supplierhub]
      ,[Lotno_Supplierbase]
      ,[Lotno_SupplierPCB]
      ,[Lotno_PCBlotno]
      ,[Lotno_Supplierramp]
      ,[Lotno_Ramplotno]
      ,[Lotno_Supplierdiverter]
      ,[Lotno_Diverterlot]
      ,[Lotno_SupplierIDCS]
      ,[Lotno_IDCSlot]
      ,[Lotno_SHAWashingno]
      ,[Lotno_OvenSHANo]
      ,[Lotno_OvenMBA]
      ,[Lotno_CO2mcno]
      ,[Lotno_Lineno]
      ,[Lotno_Resultunit]
      ,[Purposeoftest]
      ,[ProcessDescription]
      ,[Referencedata]
      ,[Comment]
      ,[sample_buildMBA_date]
      ,[Samlplesenddate_Cleanliness]
      ,[SamplesubmissiontoMSL_date]
      ,[CommittedShipmentDate]
      ,[Docno]
      ,[Data_test_for_reason]
      ,[Mailrequest]) 
    VALUES 
    ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/SprayLPC/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_sprayLPC]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/APA/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_APA]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/Talcbytape/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_Talcbytape]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/FTIR/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_FTIR]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/IC/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_IC]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/NVR/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_NVR]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/Outgasday0/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday0]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/Outgasday14/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_Outgasday14]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/Ghosttest/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_Ghosttest]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/Dynamicdiskghost/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_Dynamicdiskghost]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/Extractable/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_Extractable]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/Corrosion/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_Corrosion]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
      ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);
router.get(
  "/Particlecount/:selectedOptionDropdown1/:textValueRegistertb/:selectedOptionRadioButtons2/:textValueTextBox1/:textValueSamplenametb/:textValueMaterialtb/:textValueModelNametb/:textValueDatecodetb/:selectedOptionDropdown2/:textValueQtytb/:tableData1/:tableData2/:tableData3/:tableData4/:textValueBasetb/:textValueMbatb/:textValueHubtb/:textValueEtctb/:textValuePartNotb/:textValueRevtb/:selectedOptionPlarformdropdown/:textValueLotnotb/:textValueMotoroiltypetb/:textValueLotMotb/:textValueSuppliehubtb/:textValueSuppliebasetb/:textValueSuppliepcbtb/:textValuePcblottb/:textValueSupplieramptb/:textValueRamplottb/:textValueSuppliedivertertb/:textValueDiverterlottb/:textValueSupplieIDCStb/:textValueIDCSlottb/:textValueSHAwashingnotb/:textValueOvenshanotb/:textValueOvenMBAtb/:textValueCo2mcnotb/:textValueLinenotb/:textValueResultunittb/:textValuePurposetb/:textValueProcessDescriptiontb/:textValueReftb/:textValueCommenttb/:textValueNMBsampletb/:textValueSamplesendtb/:textValueSamplesubtb/:textValueCommitshiptb/:no/:textValueTextBoxmail",
  async (req, res) => {
    try {
      const {
        selectedOptionDropdown1,
        textValueRegistertb,
        selectedOptionRadioButtons2,
        textValueTextBox1,
        textValueSamplenametb,
        textValueMaterialtb,
        textValueModelNametb,
        textValueDatecodetb,
        selectedOptionDropdown2,
        textValueQtytb,
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        textValueBasetb,
        textValueMbatb,
        textValueHubtb,
        textValueEtctb,
        textValuePartNotb,
        textValueRevtb,
        selectedOptionPlarformdropdown,
        textValueLotnotb,
        textValueMotoroiltypetb,
        textValueLotMotb,
        textValueSuppliehubtb,
        textValueSuppliebasetb,
        textValueSuppliepcbtb,
        textValuePcblottb,
        textValueSupplieramptb,
        textValueRamplottb,
        textValueSuppliedivertertb,
        textValueDiverterlottb,
        textValueSupplieIDCStb,
        textValueIDCSlottb,
        textValueSHAwashingnotb,
        textValueOvenshanotb,
        textValueOvenMBAtb,
        textValueCo2mcnotb,
        textValueLinenotb,
        textValueResultunittb,
        textValuePurposetb,
        textValueProcessDescriptiontb,
        textValueReftb,
        textValueCommenttb,
        textValueNMBsampletb,
        textValueSamplesendtb,
        textValueSamplesubtb,
        textValueCommitshiptb,
        no,
        textValueTextBoxmail,
      } = req.params;
      let result = await user.sequelize
        .query(`INSERT INTO [Cleanliness_sample].[dbo].[samplecleanliness_special_Particlecount]
        ([Section]
          ,[Register]
          ,[Data_test_for]
          ,[samplename]
          ,[material]
          ,[ModelName]
          ,[Datecode]
          ,[Customer]
          ,[Qty]
          ,[TestTeam_Testitem]
          ,[TestTeam_Instruments]
          ,[TestTeam_DataQuantity]
          ,[TestTeam_Remark]
          ,[SurfaceArea_Base]
          ,[SurfaceArea_MBA]
          ,[SurfaceArea_Hub]
          ,[SurfaceArea_etc]
          ,[Lotno_Partno]
          ,[Lotno_Rev]
          ,[Lotno_Platform]
          ,[Lotno_LotQAno]
          ,[Lotno_MotorOilType]
          ,[Lotno_LotMOno]
          ,[Lotno_Supplierhub]
          ,[Lotno_Supplierbase]
          ,[Lotno_SupplierPCB]
          ,[Lotno_PCBlotno]
          ,[Lotno_Supplierramp]
          ,[Lotno_Ramplotno]
          ,[Lotno_Supplierdiverter]
          ,[Lotno_Diverterlot]
          ,[Lotno_SupplierIDCS]
          ,[Lotno_IDCSlot]
          ,[Lotno_SHAWashingno]
          ,[Lotno_OvenSHANo]
          ,[Lotno_OvenMBA]
          ,[Lotno_CO2mcno]
          ,[Lotno_Lineno]
          ,[Lotno_Resultunit]
          ,[Purposeoftest]
          ,[ProcessDescription]
          ,[Referencedata]
          ,[Comment]
          ,[sample_buildMBA_date]
          ,[Samlplesenddate_Cleanliness]
          ,[SamplesubmissiontoMSL_date]
          ,[CommittedShipmentDate]
          ,[Docno]
          ,[Data_test_for_reason]
          ,[Mailrequest]) 
        VALUES 
        ('${selectedOptionDropdown1}','${textValueRegistertb}','${selectedOptionRadioButtons2}','${textValueSamplenametb}','${textValueMaterialtb}','${textValueModelNametb}','${textValueDatecodetb}','${selectedOptionDropdown2}','${textValueQtytb}','${tableData1}','${tableData2}','${tableData3}','${tableData4}','${textValueBasetb}','${textValueMbatb}','${textValueHubtb}','${textValueEtctb}','${textValuePartNotb}','${textValueRevtb}','${selectedOptionPlarformdropdown}','${textValueLotnotb}','${textValueMotoroiltypetb}','${textValueLotMotb}','${textValueSuppliehubtb}','${textValueSuppliebasetb}','${textValueSuppliepcbtb}','${textValuePcblottb}','${textValueSupplieramptb}','${textValueRamplottb}','${textValueSuppliedivertertb}','${textValueDiverterlottb}','${textValueSupplieIDCStb}','${textValueIDCSlottb}','${textValueSHAwashingnotb}','${textValueOvenshanotb}','${textValueOvenMBAtb}','${textValueCo2mcnotb}','${textValueLinenotb}','${textValueResultunittb}','${textValuePurposetb}','${textValueProcessDescriptiontb}','${textValueReftb}','${textValueCommenttb}','${textValueNMBsampletb}','${textValueSamplesendtb}','${textValueSamplesubtb}','${textValueCommitshiptb}','${selectedOptionDropdown1}'+ CONVERT(VARCHAR(4), GETDATE(), 12) +'${no}','${textValueTextBox1}','${textValueTextBoxmail}' )
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
  }
);


module.exports = router;
