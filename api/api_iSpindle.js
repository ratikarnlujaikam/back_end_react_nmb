const express = require("express");
const router = express.Router();
const user = require("../database/models/user");
const Master_matching = require("../database/models/Master_matching");
const ControlLimit = require("../database/models/ControlLimit");
const Email_Alarm = require("../database/models/Email_Alarm");
const Master_productionline = require("../database/models/Master_productionline");
const Master_prod_rotor = require("../database/models/Master_prod_rotor");
const Master_Diecast = require("../database/models/Master_Diecast");
const Spec_Diecast = require("../database/models/Spec_Diecast");
const ControlSpec = require("../database/models/ControlSpec");
const ControlLimit_Diecast = require("../database/models/ControlLimit_Diecast");
const ControlSpecCMR = require("../database/models/ControlSpecCMR");
const parameter = require("../database/models/parameter");
const Im = require("../database/models/Im");

//Specification Control Page

router.get("/specModel", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Fullname]
        FROM [TransportData].[dbo].[Master_matchings]
        order by [Fullname]`);
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

router.get("/specModelName/:fullname", async (req, res) => {
  try {
    const { fullname } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model]
        FROM [TransportData].[dbo].[Master_matchings]
        where [Fullname] = '${fullname}'`);

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

router.get("/specPart/:fullname", async (req, res) => {
  try {
    const { fullname } = req.params;
    let result = await user.sequelize.query(`Select distinct [Part]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Fullname] = '${fullname}'`);
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

router.get("/specPara/:part", async (req, res) => {
  try {
    const { part } = req.params;
    let result = await user.sequelize.query(`Select distinct [Parameter]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Part] = '${part}'`);
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

router.get("/specMC/:para", async (req, res) => {
  try {
    const { para } = req.params;
    let result = await user.sequelize.query(`Select distinct [Machine]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Parameter] = '${para}'`);
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

router.post("/specControl", async (req, res) => {
  try {
    let result = await Master_matching.create(req.body);
    console.log(result);
    
    res.json({
      result: result,
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

//Controllimit Page

router.get("/Modelforcontrollimit", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
    FROM [TransportData].[dbo].[Master_matchings]
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

router.get("/Partforcontrollimit/:model", async (req, res) => {
  try {
    const { model } = req.params;
    let result = await user.sequelize.query(`Select distinct [Part]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Model] = '${model}'`);
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

router.get("/Paraforcontrollimit/:part", async (req, res) => {
  try {
    const { part } = req.params;
    let result = await user.sequelize.query(`Select distinct [Parameter]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Part] = '${part}'`);
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

router.get("/Lineforcontrollimit/:model/:part", async (req, res) => {
  try {
    const { model, part } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model], [Line]
    FROM [TransportData].[dbo].[Master_productionline]
    where [TransportData].[dbo].[Master_productionline].[Model] = '${model}'
    and [TransportData].[dbo].[Master_productionline].[part] = '${part}'`);

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

router.post("/ControlLimit", async (req, res) => {
  try {
    let result = await ControlLimit.create(req.body);
    console.log(result);

    res.json({
      result: result,
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

// Email Alarm
router.get("/ModelEmail", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
    FROM [TransportData].[dbo].[Master_matchings]
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

router.get("/PartEmail/:model", async (req, res) => {
  try {
    const { model } = req.params;
    let result = await user.sequelize.query(`Select distinct [Part]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Model] = '${model}'`);
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

router.get("/ParaEmail/:part", async (req, res) => {
  try {
    const { part } = req.params;
    let result = await user.sequelize.query(`Select distinct [Parameter]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Part] = '${part}'`);
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

router.get("/LineEmail/:model/:part", async (req, res) => {
  try {
    const { model, part } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model], [Line]
    FROM [TransportData].[dbo].[Master_productionline]
    where [TransportData].[dbo].[Master_productionline].[Model] = '${model}'
    and [TransportData].[dbo].[Master_productionline].[part] = '${part}'`);

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

router.post("/emailAlarm", async (req, res) => {
  try {
    let result = await Email_Alarm.create(req.body);
    console.log(result);
    
    res.json({
      result: result,
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

router.post("/autoAlert", async (req, res) => {
  try {
    let result = await autoAlert.create(req.body);
    console.log(result);
    
    res.json({
      result: result,
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
