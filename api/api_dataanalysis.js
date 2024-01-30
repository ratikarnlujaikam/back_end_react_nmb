const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

//motor
router.get(
  "/motordata/:selectDate/:myModel/:process/:myLine/:myMachine",
  async (req, res) => {
    try {
      const { selectDate, myModel, process, myLine, myMachine } = req.params;
      let result = await user.sequelize.query(`select *
  from [DataforAnalysis].[dbo].[${process}]
  where [Model] = '${myModel}'
  and [Line] = '${myLine}'
  and [Machine_no] = '${myMachine}'
  and [Date] = '${selectDate}'`);

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
  "/motordataday/:startDate/:finishDate/:myModel/:process/:myLine/:myMachine",
  async (req, res) => {
    try {
      const { startDate, finishDate, myModel, process, myLine, myMachine } =
        req.params;
      let result = await user.sequelize.query(`select *
  from [DataforAnalysis].[dbo].[${process}]
  where [Model] = '${myModel}'
  and [Line] = '${myLine}'
  and [Machine_no] = '${myMachine}'
  and [Date] between '${startDate}' and '${finishDate}'`);
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

router.get("/motormodel", async (req, res) => {
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

router.get("/motorprocess/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`select distinct [Process]
    FROM [TransportData].[dbo].[Master_productionlines]
    where [Part] != 'Rotor' and [Model] = '${myModel}'`);
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

router.get("/motorline/:process/:myModel", async (req, res) => {
  try {
    const { process, myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model], [Line]
    FROM [Temp_TransportData].[dbo].[${process}]
    where [Temp_TransportData].[dbo].[${process}].[Model] = '${myModel}'`);
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

router.get("/motormc/:process/:myLine/:myModel", async (req, res) => {
  try {
    const { process, myLine, myModel } = req.params;
    let result = await user.sequelize.query(`select distinct [Machine_no], [Line]
    FROM [Temp_TransportData].[dbo].[${process}]
    where [Temp_TransportData].[dbo].[${process}].[Line] = '${myLine}'
    and [Temp_TransportData].[dbo].[${process}].[Model] = '${myModel}'`);
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

//rotor
router.get(
  "/rotordata/:selectDate/:myModel/:process/:myLine/:myMachine",
  async (req, res) => {
    try {
      const { selectDate, myModel, process, myLine, myMachine } = req.params;
      if (process == 'AxialPlay_Auto_Fac2') {
        let result = await user.sequelize.query(`
          SELECT [Machine]
              ,[Barcode]
              ,[Date]
              ,Cast(Left([Time],8) as varchar(50)) as Time
              ,[Load_cone_tray_number]
              ,[Load_cone_tray_position]
              ,[Oil_Lub_Amount]
              ,[Oil_Lub_Visual_check]
              ,[Axial_Play_Press_Number]
              ,[Axial_Play]
              ,[IPA_Flush_Duration]
              ,[IPA_Flush_Visual_Check]
              ,[Galling_Dent_Visual_Check]
              ,[INT_number]
              ,[INT_Cone_Duration]
              ,[INT_Cone_Visual_Check]
              ,[Oil_Up_number]
              ,[Oil_Up_Amount]
              ,[Oil_Up_duration]
              ,[Oil_Up_Visual_Check]
              ,[Endcap_Up_tray_number]
              ,[Endcap_Up_tray_position]
              ,[Oil_Low_number]
              ,[Oil_Low_Amount]
              ,[Oil_Low_duration]
              ,[Oil_Low_Visual_Check]
              ,[Endcap_Low_tray_number]
              ,[Endcap_Low_tray_position]
              ,[Unload_CycleTime]
              ,[Failure_Code]
              ,[load_CycleTime]
              ,[Line]
              ,[Model]
          from [SPD_Fac2].[dbo].[${process}]
          where [Model] = '${myModel}'
          and [Line] = '${myLine}'
          and [Machine] = '${myMachine}'
          and [Date] = '${selectDate}'
          order by [Time]
        `)
        res.json({
          result: result[0],
          api_result: "ok",
        });
      }
      else if (process == 'AxialPlay_AutoGerman') {
        let result = await user.sequelize.query(`
        select [Machine]
          ,[Barcode]
          ,[Date]
          ,Cast(Left([Time],8) as varchar(50)) as Time
          ,[Mover]
          ,[Oil_Lub_Station_Number]
          ,[Oil_Lub_Axis_Process_Position]
          ,[Oil_Lub_Rotation_Speed]
          ,[Oil_Lub_Amount]
          ,[Oil_Lub_Offset]
          ,[Oil_Lub_After_Run]
          ,[Oil_Lub_Visual_Check]
          ,[Pre_Press_Station_Number]
          ,[Pre_Press_Force]
          ,[Pre_Press_Position]
          ,[Axial_Play_Press_Station_Number]
          ,[Axial_Play_Press_Number]
          ,[Axial_Play]
          ,[Mover_Before_Axial_Play]
          ,[IPA_Flush_Station_Number]
          ,[IPA_Flush_Axis_Process_Position]
          ,[IPA_Flush_Rotation_Speed]
          ,[IPA_Flush_Duration]
          ,[IPA_Flush_AfterRun]
          ,[IPA_Flush_Visual_Check]
          ,[Galling_Dent_Station_Number]
          ,[Galling_Dent_Axis_Process_Position]
          ,[Galling_Dent_Visual_Check]
          ,[INT_Cone_1_Station_Number]
          ,[INT_Cone_1_Axis_Process_Position]
          ,[INT_Cone_1_Rotation_Speed]
          ,[INT_Cone_1_Duration]
          ,[INT_Cone_1_Pressure]
          ,[INT_Cone_1_AfterRun]
          ,[INT_Cone_1_VisualCheck]
          ,[INT_Cone_2_StationNumber]
          ,[INT_Cone_2_AxisProcessPosition]
          ,[INT_Cone_2_RotationSpeed]
          ,[INT_Cone_2_Duration]
          ,[INT_Cone_2_Pressure]
          ,[INT_Cone_2_AfterRun]
          ,[INT_Cone_2_VisualCheck]
          ,[OilUp_1_StationNumber]
          ,[OilUp_1_Axis_ProcessPosition]
          ,[OilUp_1_Amount]
          ,[OilUp_1_Offset]
          ,[OilUp_1_VisualCheck]
          ,[OilUp_2_StationNumber]
          ,[OilUp_2_Axis_ProcessPosition]
          ,[OilUp_2_Amount]
          ,[OilUp_2_Offset]
          ,[OilUp_2_VisualCheck]
          ,[SealUp_1_StationNumber]
          ,[SealUp_1_Axis_ProcessPosition]
          ,[SealUp_1_RotationSpeed]
          ,[SealUp_1_Duration]
          ,[SealUp_1_Pressure]
          ,[SealUp_1_AfterRun]
          ,[Seal_Up_1_VisualCheck]
          ,[EndcapUp_StationNumber]
          ,[EndcapUp_TrayPosition]
          ,[EndcapUp_AxisPrePosition]
          ,[EndcapUp_Force]
          ,[EndcapUp_BlockDetection]
          ,[EndcapUp_PressFitEnd]
          ,[SealUp_2_StationNumber]
          ,[SealUp_2_AxisProcessPosition]
          ,[SealUp_2_RotationSpeed]
          ,[SealUp_2_Duration]
          ,[SealUp_2_Pressure]
          ,[SealUp_2_AfterRun]
          ,[SealUp_2_VisualCheck]
          ,[Turn_Clean_StationNumber]
          ,[Turn_Clean_PickupPosition]
          ,[Turn_Clean_PlacePosition]
          ,[Load_Cone_StationNumber]
          ,[Load_Cone_TrayPosition]
          ,[OilLow_1_StationNumber]
          ,[OilLow_1_Axis_ProcessPosition]
          ,[OilLow_1_Amount]
          ,[OilLow_1_Offset]
          ,[OilLow_1_VisualCheck]
          ,[OilLow_2_StationNumber]
          ,[OilLow_2_Axis_ProcessPosition]
          ,[OilLow_2_Amount]
          ,[OilLow_2_Offset]
          ,[OilLow_2_VisualCheck]
          ,[SealLow_1_StationNumber]
          ,[SealLow_1_Axis_ProcessPosition]
          ,[SealLow_1_RotationSpeed]
          ,[SealLow_1_Duration]
          ,[SealLow_1_Pressure]
          ,[SealLow_1_AfterRun]
          ,[SealLow_1_VisualCheck]
          ,[EndcapLow_StationNumber]
          ,[EndcapLow_TrayPosition]
          ,[EndcapLow_AxisPrePosition]
          ,[EndcapLow_Force]
          ,[EndcapLow_BlockDetection]
          ,[EndcapLowPress_FitEnd]
          ,[SealLow_2_StationNumber]
          ,[SealLow_2_AxisProcessPosition]
          ,[SealLow_2_RotationSpeed]
          ,[SealLow_2_Duration]
          ,[SealLow_2_Pressure]
          ,[SealLow_2_AfterRun]
          ,[SealLow_2_VisualCheck]
          ,[LoadUnload_StationNumber]
          ,[LoadUnload_NumberOfLoadingAttempts]
          ,[LoadUnload_LoadCycleTime]
          ,[LoadUnload_UnloadCycleTime]
          ,[FailureCode]
          ,[Model]
          ,[Line]
        from [SPD_Fac2].[dbo].[${process}]
        where [Model] = '${myModel}'
        and [Line] = '${myLine}'
        and [Machine] = '${myMachine}'
        and [Date] = '${selectDate}'
        order by [Time]
        `)
        res.json({
          result: result[0],
          api_result: "ok",
        });
      }
      else if (process == 'AxialPlay_Fac2') {
        let result = await user.sequelize.query(`
          SELECT [Machine]
            ,[Model]
            ,[Barcode]
            ,[Date]
            ,[Time]
            ,[Jude]
            ,[Axial_Play]
            ,[CycleTime]
            ,[Adjustment_Count]
            ,[AxialPlay_beforeAdjustment]
            ,[1.Adjustment_Steps]
            ,[2.Adjustment_Steps]
            ,[3.Adjustment_Steps]
            ,[4.Adjustment_Steps]
            ,[5.Adjustment_Steps]
            ,[6.Adjustment_Steps]
            ,[7.Adjustment_Steps]
            ,[8.Adjustment_Steps]
            ,[9.Adjustment_Steps]
            ,[10.Adjustment_Steps]
            ,[1.Diff_adjustment_Step]
            ,[2.Diff_adjustment_Step]
            ,[3.Diff_adjustment_Step]
            ,[4.Diff_adjustment_Step]
            ,[5.Diff_adjustment_Step]
            ,[6.Diff_adjustment_Step]
            ,[7.Diff_adjustment_Step]
            ,[8.Diff_adjustment_Step]
            ,[9.Diff_adjustment_Step]
            ,[10.Diff_adjustment_Step]
            ,[Pre_axial_play]
            ,[Max_pre_press_force]
            ,[Max_final_press_force]
            ,[K_Factor_force]
            ,[K_Factor]
            ,[Dead_distance_force]
            ,[Dead_distance]
            ,[Comment]
            ,[Master]
            ,[Line]
          from [SPD_Fac2].[dbo].[${process}]
          where [Model] = '${myModel}'
          and [Line] = '${myLine}'
          and [Machine] = '${myMachine}'
          and [Date] = '${selectDate}'
          order by [Time]
        `)
        res.json({
          result: result[0],
          api_result: "ok",
        });
      }
      else if (process == 'Oilfill_Fac2') {
        let result = await user.sequelize.query(`
          SELECT [Machine]
            ,[Barcode]
            ,[Date]
            ,[Time]
            ,[Judgement]
            ,[Filling_Station]
            ,[Oilfill]
            ,[Volume]
            ,[Filling_Dur]
            ,[Remark]
            ,[Line]
            ,[Model]
          from [SPD_Fac2].[dbo].[${process}]
          where [Model] = '${myModel}'
          and [Line] = '${myLine}'
          and [Machine] = '${myMachine}'
          and [Date] = '${selectDate}'
          order by [Time]
        `)
        res.json({
          result: result[0],
          api_result: "ok",
        });
      }
    }
      catch (error) {
        console.log(error);
        res.json({
          error,
          api_result: "nok",
        });
      }
  }
);

router.get(
  "/rotordataday/:startDate/:finishDate/:myModel/:process/:myLine/:myMachine",
  async (req, res) => {
    try {
      const { startDate, finishDate, myModel, process, myLine, myMachine } =
        req.params;
      let result = await user.sequelize.query(`select *
  from [SPD_Fac2].[dbo].[${process}]
  where [Model] = '${myModel}'
  and [Line] = '${myLine}'
  and [Machine] = '${myMachine}'
  and [Date] between '${startDate}' and '${finishDate}'`);
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

router.get("/rotormodel", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
    FROM [TransportData].[dbo].[Master_productionlines]
    where [Part] = 'Rotor'
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

router.get("/rotorprocess/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`select distinct [Process]
    FROM [TransportData].[dbo].[Master_productionlines]
    where [Part] = 'Rotor' and [Model] = '${myModel}'`);
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

router.get("/rotorline/:process/:myModel", async (req, res) => {
  try {
    const { process, myModel } = req.params;
    let result = await user.sequelize.query(`select distinct [Line],[Model]
    FROM [SPD_Fac2].[dbo].[${process}] where [Model] = '${myModel}'`);
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

router.get("/rotormc/:process/:myLine", async (req, res) => {
  try {
    const { process, myLine } = req.params;
    let result = await user.sequelize.query(`Select distinct [Machine], [Line]
    FROM [SPD_Fac2].[dbo].[${process}] where [Line] = '${myLine}'`);
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

module.exports = router;
