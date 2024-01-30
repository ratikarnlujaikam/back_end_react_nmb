const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Model_Name]
    FROM [QAInspection].[dbo].[tbVisualInspection]
    order by [Model_Name]`);
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

router.get("/invoidid/:invoidid", async (req, res) => {
    try { 
    
        const { invoidid } = req.params;
      let result = await user.sequelize.query(`
      with set1 as( SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,4) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID like 'FDB2%' or Invoie_ID like 'fdb2%' 
    UNION
    SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,4) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID like 'FDB6%'  or Invoie_ID like 'fdb6%' or Invoie_ID like 'FDB7%'  or Invoie_ID like 'fdb7%'or Invoie_ID like 'FDB8%'  or Invoie_ID like 'fdb8'
    UNION
    SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,3) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID like 'WPD%' and Invoie_ID like 'wpd%'
	UNION
    SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,3) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID like 'WHC%' and Invoie_ID like 'whc%'
    union
  
    SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,4) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID not like 'FDB2%'  and Invoie_ID not like 'fdb2%' and Invoie_ID not like 'FDB6%'  and Invoie_ID not like 'fdb6%'  and Invoie_ID not like 'WPD%' and Invoie_ID not like 'FDB7%'  and Invoie_ID not like 'fdb7%' and Invoie_ID not like 'FDB8%'  and Invoie_ID not like 'fdb8' and Invoie_ID not like 'WHC%' and Invoie_ID not like 'whc%'
    )
    
  SELECT 
  [Invoie_ID] as Invoice_ID
      ,[Lot_No]
      , CASE Invoid
        WHEN 'FDB2'  THEN 'Navanakorn'
		  WHEN 'WHC'  THEN 'Navanakorn'
        WHEN 'FDB6' THEN 'Wuxi'
		 WHEN 'FDB7' THEN 'Wuxi'
		  WHEN 'FDB8' THEN 'Wuxi'
      WHEN 'WPD' THEN 'korat'
      else 'Invoid not show status'
        end as status
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]      
        ,sum([QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
        FROM set1 as S
  where S.Timpstamp = (select max (Timpstamp) FROM set1  where  [Invoie_ID] =S.[Invoie_ID])
  and [Invoie_ID] like '${invoidid}%'
  group by [Invoie_ID],[Model] ,[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date],[Timpstamp],Invoid 
   order by [Date],[Invoie_ID],[Lot_No]`);

  var listRawData1 = [];
  listRawData1.push(result[0]);

  console.log(listRawData1);

      res.json({      
        result: result[0],
        listRawData1,
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
router.get("/lotqanumber/:lotqanumber", async (req, res) => {
    try { 
    
        const { lotqanumber } = req.params;
      let result = await user.sequelize.query(`
      with set1 as( SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,4) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID like 'FDB2%' or Invoie_ID like 'fdb2%' 
    UNION
    SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,4) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID like 'FDB6%'  or Invoie_ID like 'fdb6%' or Invoie_ID like 'FDB7%'  or Invoie_ID like 'fdb7%'or Invoie_ID like 'FDB8%'  or Invoie_ID like 'fdb8'
    UNION
    SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,3) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID like 'WPD%' and Invoie_ID like 'wpd%'
	UNION
    SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,3) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID like 'WHC%' and Invoie_ID like 'whc%'
    union
  
    SELECT  [ID]
        ,[Invoie_ID]
      ,SUBSTRING([Invoie_ID],1,4) as Invoid
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]
        ,[Lot_No]
        ,convert (int, [QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
    FROM [PCMC].[dbo].[Invoice]
    where  Invoie_ID not like 'FDB2%'  and Invoie_ID not like 'fdb2%' and Invoie_ID not like 'FDB6%'  and Invoie_ID not like 'fdb6%'  and Invoie_ID not like 'WPD%' and Invoie_ID not like 'FDB7%'  and Invoie_ID not like 'fdb7%' and Invoie_ID not like 'FDB8%'  and Invoie_ID not like 'fdb8' and Invoie_ID not like 'WHC%' and Invoie_ID not like 'whc%'
    )
    
  SELECT 
  [Invoie_ID] as Invoice_ID
      ,[Lot_No]
      , CASE Invoid
        WHEN 'FDB2'  THEN 'Navanakorn'
		  WHEN 'WHC'  THEN 'Navanakorn'
        WHEN 'FDB6' THEN 'Wuxi'
		 WHEN 'FDB7' THEN 'Wuxi'
		  WHEN 'FDB8' THEN 'Wuxi'
      WHEN 'WPD' THEN 'korat'
      else 'Invoid not show status'
        end as status
        ,[Model]
        ,[Item_no]
        ,[Ramp]
        ,[Base]
        ,[Diverter]
        ,[Special_control]      
        ,sum([QTY]) as QTY
        ,[Date]
        ,[Timpstamp]
        FROM set1 as S
where S.Timpstamp = (select max (Timpstamp) FROM set1  where  [Lot_No] =S.[Lot_No])
and  [Lot_No] like '${lotqanumber}%'
  group by [Invoie_ID],[Model] ,[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date],[Timpstamp],Invoid 
   order by [Date],[Invoie_ID],[Lot_No]
  `
  );

  var listRawData3 = [];
  listRawData3.push(result[0]);

  console.log(listRawData3);

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

router.get(
    "/Shipmentdata/:Model/:startDate/:finishDate",
    async (req, res) => {
      try {
        var result = [[]];
        const { Model , startDate, finishDate } = req.params;
        if (Model == "All" ) {
          var result = await user.sequelize
            .query(`
            with set1 as( SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,4) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID like 'FDB2%' or Invoie_ID like 'fdb2%' 
          UNION
          SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,4) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID like 'FDB6%'  or Invoie_ID like 'fdb6%' or Invoie_ID like 'FDB7%'  or Invoie_ID like 'fdb7%'or Invoie_ID like 'FDB8%'  or Invoie_ID like 'fdb8'
          UNION
          SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,3) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID like 'WPD%' and Invoie_ID like 'wpd%'
        UNION
          SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,3) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID like 'WHC%' and Invoie_ID like 'whc%'
          union
        
          SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,4) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID not like 'FDB2%'  and Invoie_ID not like 'fdb2%' and Invoie_ID not like 'FDB6%'  and Invoie_ID not like 'fdb6%'  and Invoie_ID not like 'WPD%' and Invoie_ID not like 'FDB7%'  and Invoie_ID not like 'fdb7%' and Invoie_ID not like 'FDB8%'  and Invoie_ID not like 'fdb8' and Invoie_ID not like 'WHC%' and Invoie_ID not like 'whc%'
          )
          
        SELECT 
        [Invoie_ID] as Invoice_ID
            ,[Lot_No]
            , CASE Invoid
              WHEN 'FDB2'  THEN 'Navanakorn'
            WHEN 'WHC'  THEN 'Navanakorn'
              WHEN 'FDB6' THEN 'Wuxi'
           WHEN 'FDB7' THEN 'Wuxi'
            WHEN 'FDB8' THEN 'Wuxi'
            WHEN 'WPD' THEN 'korat'
            else 'Invoid not show status'
              end as status
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]      
              ,sum([QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
              FROM set1 
              where
       --[Model] ='${Model}' 
       [Date] between '${startDate}' and '${finishDate}'
        group by [Invoie_ID],[Model] ,[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date],[Timpstamp],Invoid 
        order by [Date],[Invoie_ID],[Lot_No]
        `
           );
           
        } 
        
        else {
          var result = await user.sequelize
            .query(`
            with set1 as( SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,4) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID like 'FDB2%' or Invoie_ID like 'fdb2%' 
          UNION
          SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,4) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID like 'FDB6%'  or Invoie_ID like 'fdb6%' or Invoie_ID like 'FDB7%'  or Invoie_ID like 'fdb7%'or Invoie_ID like 'FDB8%'  or Invoie_ID like 'fdb8'
          UNION
          SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,3) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID like 'WPD%' and Invoie_ID like 'wpd%'
        UNION
          SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,3) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID like 'WHC%' and Invoie_ID like 'whc%'
          union
        
          SELECT  [ID]
              ,[Invoie_ID]
            ,SUBSTRING([Invoie_ID],1,4) as Invoid
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]
              ,[Lot_No]
              ,convert (int, [QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
          FROM [PCMC].[dbo].[Invoice]
          where  Invoie_ID not like 'FDB2%'  and Invoie_ID not like 'fdb2%' and Invoie_ID not like 'FDB6%'  and Invoie_ID not like 'fdb6%'  and Invoie_ID not like 'WPD%' and Invoie_ID not like 'FDB7%'  and Invoie_ID not like 'fdb7%' and Invoie_ID not like 'FDB8%'  and Invoie_ID not like 'fdb8' and Invoie_ID not like 'WHC%' and Invoie_ID not like 'whc%'
          )
          
        SELECT 
        [Invoie_ID] as Invoice_ID
            ,[Lot_No]
            , CASE Invoid
              WHEN 'FDB2'  THEN 'Navanakorn'
            WHEN 'WHC'  THEN 'Navanakorn'
              WHEN 'FDB6' THEN 'Wuxi'
           WHEN 'FDB7' THEN 'Wuxi'
            WHEN 'FDB8' THEN 'Wuxi'
            WHEN 'WPD' THEN 'korat'
            else 'Invoid not show status'
              end as status
              ,[Model]
              ,[Item_no]
              ,[Ramp]
              ,[Base]
              ,[Diverter]
              ,[Special_control]      
              ,sum([QTY]) as QTY
              ,[Date]
              ,[Timpstamp]
              FROM set1 
        where 
        [Model] ='${Model}' 
        and [Date] between '${startDate}' and '${finishDate}'
        group by [Invoie_ID],[Model] ,[Item_no],[Ramp],[Base],[Diverter],[Special_control],[Lot_No],[Date],[Timpstamp],Invoid 
        order by [Date],[Invoie_ID],[Lot_No] `);
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
  module.exports = router;