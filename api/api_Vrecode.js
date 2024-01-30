const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/ItemNos", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Model_No]
    FROM [Setlot].[dbo].[Record_QAPrint]
    order by [Model_No]`);
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

router.get("/Datecode/:ItemNos", async (req, res) => {
  try {
    const { ItemNos } = req.params;
    var result = [[]];
    if (ItemNos == "All") {
      var result = await user.sequelize.query(`select distinct [W/W] as Datecode
      FROM [Setlot].[dbo].[Record_QAPrint]
      order by [W/W] `);
    } else {
      var result = await user.sequelize.query(`select distinct[W/W]as Datecode
          FROM [Setlot].[dbo].[Record_QAPrint]
          where[Model_No] = '${ItemNos}'
          order by[W/W] `);
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
  "/DatecodeAll/:ItemNos/:Datecode1/:Datecode2/:Datecode3/:Datecode4/:Datecode5",
  async (req, res) => {
    try {
      const {ItemNos, Datecode1,Datecode2, Datecode3,Datecode4,Datecode5,} =
        req.params;
      //MBA
      var result = [[]];
        //Date1
      if ( Datecode1!== 'blank'&& Datecode2 === 'blank'&& Datecode3 === 'blank'&& Datecode4 === 'blank'&& Datecode5 === 'blank') {
        var result = await user.sequelize.query(`
              SELECT [Model_No],
	  	[Model]as Model_Name,
	  	[W/W] as Datecode,
	  	[Lot_QA],
      [Mo_number],
	    [Qty] as MO_QTY,
	     'L'+[Line] as line,
	    CAST([DateTime] as Date) as Date,
      [Baseplate],
      [Ramp],
	    [Crashstop],
      [Hub],
      [Diverter],
      [FPC],
      [Magnet],
      [Supporter_name] as[Supporter],
      [Special_control],
      [SP1],
      [SP2],
      [SP3],
      [SP4],
      [SP5],
      [Revision],
      [Machine_no],
      [CO2_EMP],
      [CO2_DATE],
      [CO2_SP1],
      [CO2_SP2]
  FROM [Setlot].[dbo].[Record_QAPrint]
    where [Model_No]='${ItemNos}' and [W/W]='${Datecode1}'
    order by [W/W],[Lot_QA]`)
          
      }//Date2 
      else if (Datecode1!== 'blank'&& Datecode2 !== 'blank'&& Datecode3 === 'blank'&& Datecode4 === 'blank'&& Datecode5 === 'blank') {
        var result = await user.sequelize.query(`
              SELECT [Model_No],
	  	[Model]as Model_Name,
	  	[W/W] as Datecode,
	  	[Lot_QA],
      [Mo_number],
	    [Qty] as MO_QTY,
	     'L'+[Line] as line,
       CAST([DateTime] as Date)as Date,
      [Baseplate],
      [Ramp],
	    [Crashstop],
      [Hub],
      [Diverter],
      [FPC],
      [Magnet],
      [Supporter_name] as[Supporter],
      [Special_control],
      [SP1],
      [SP2],
      [SP3],
      [SP4],
      [SP5],
      [Revision],
      [Machine_no],
      [CO2_EMP],
      [CO2_DATE],
      [CO2_SP1],
      [CO2_SP2]
  FROM [Setlot].[dbo].[Record_QAPrint]
    where [Model_No]='${ItemNos}' and ([W/W]='${Datecode1}' or [W/W]='${Datecode2}')
    order by [W/W],[Lot_QA]`)
      }//Date3
      else if (Datecode1!== 'blank'&& Datecode2 !== 'blank'&& Datecode3 !== 'blank'&& Datecode4 === 'blank'&& Datecode5 === 'blank') {
      var result = await user.sequelize.query(`
            SELECT [Model_No],
    [Model]as Model_Name,
    [W/W] as Datecode,
    [Lot_QA],
    [Mo_number],
    [Qty] as MO_QTY,
     'L'+[Line] as line,
     CAST([DateTime] as Date)as Date,
    [Baseplate],
    [Ramp],
    [Crashstop],
    [Hub],
    [Diverter],
    [FPC],
    [Magnet],
    [Supporter_name] as[Supporter],
    [Special_control],
    [SP1],
    [SP2],
    [SP3],
    [SP4],
    [SP5],
    [Revision],
    [Machine_no],
    [CO2_EMP],
    [CO2_DATE],
    [CO2_SP1],
    [CO2_SP2]
FROM [Setlot].[dbo].[Record_QAPrint]
  where [Model_No]='${ItemNos}' and ([W/W]='${Datecode1}' or [W/W]='${Datecode2}'or [W/W]='${Datecode3}')
  order by [W/W],[Lot_QA]`)

    }//Date4
    else if (Datecode1!== 'blank'&& Datecode2 !== 'blank'&& Datecode3 !== 'blank'&& Datecode4 !== 'blank'&& Datecode5 === 'blank') {
      var result = await user.sequelize.query(`
            SELECT [Model_No],
    [Model]as Model_Name,
    [W/W] as Datecode,
    [Lot_QA],
    [Mo_number],
    [Qty] as MO_QTY,
     'L'+[Line] as line,
     CAST([DateTime] as Date)as Date,
    [Baseplate],
    [Ramp],
    [Crashstop],
    [Hub],
    [Diverter],
    [FPC],
    [Magnet],
    [Supporter_name] as[Supporter],
    [Special_control],
    [SP1],
    [SP2],
    [SP3],
    [SP4],
    [SP5],
    [Revision],
    [Machine_no],
    [CO2_EMP],
    [CO2_DATE],
    [CO2_SP1],
    [CO2_SP2]
FROM [Setlot].[dbo].[Record_QAPrint]
  where [Model_No]='${ItemNos}' and ([W/W]='${Datecode1}' or [W/W]='${Datecode2}'or [W/W]='${Datecode3}'or [W/W]='${Datecode4})'
  order by [W/W],[Lot_QA]`)
    }//Date5
    else if (Datecode1!== 'blank'&& Datecode2 !== 'blank'&& Datecode3 !== 'blank'&& Datecode4 !== 'blank'&& Datecode5 !== 'blank') {
      var result = await user.sequelize.query(`
            SELECT [Model_No],
    [Model]as Model_Name,
    [W/W] as Datecode,
    [Lot_QA],
    [Mo_number],
    [Qty] as MO_QTY,
     'L'+[Line] as line,
     CAST([DateTime] as Date)as Date,
    [Baseplate],
    [Ramp],
    [Crashstop],
    [Hub],
    [Diverter],
    [FPC],
    [Magnet],
    [Supporter_name] as[Supporter],
    [Special_control],
    [SP1],
    [SP2],
    [SP3],
    [SP4],
    [SP5],
    [Revision],
    [Machine_no],
    [CO2_EMP],
    [CO2_DATE],
    [CO2_SP1],
    [CO2_SP2]
FROM [Setlot].[dbo].[Record_QAPrint]
  where [Model_No]='${ItemNos}' and ([W/W]='${Datecode1}' or [W/W]='${Datecode2}'or [W/W]='${Datecode3}'or [W/W]='${Datecode4}'or [W/W]='${Datecode5}')
  order by [W/W],[Lot_QA]`)
    };
      
      
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



module.exports = router;