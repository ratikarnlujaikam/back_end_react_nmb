const express = require("express");
const router = express.Router();
const user = require("../database/models/user");


router.get("/barcodemotor/:barcodemotor", async (req, res) => {
    try { 
    
        const { barcodemotor } = req.params;
      let result = await user.sequelize.query(`
      
      with set1 as(
        SELECT [Set_Lot].Barcode              
              ,[Set_Lot].[Lot_QA]
			  ,[Set_Lot].Barcode_base
          FROM [TransportData].[dbo].[Set_Lot]  
		where Barcode  =  '${barcodemotor}'
		  union 
		select  [Set_Lot_2].[Barcode]
		       ,[Lot_QA]
               ,[Set_Lot_2].[Barcode_base]
        FROM [TransportData].[dbo].[Set_Lot_2]	
		where Barcode  = '${barcodemotor}'
		 )

    ,set2 as  (select set1.Barcode
                 ,set1.Barcode_base
                 ,set1.Lot_QA
				 ,[Ramp_tray]
		 ,Divertor.Divertor
		 from set1
		  left join [TransportData].[dbo].[Set_Lot]  
		  on set1.Barcode = [Set_Lot].Barcode  
          LEFT join [TransportData].[dbo].[Divertor]
          on set1.Barcode = Divertor.Barcode
         where set1.Barcode  = '${barcodemotor}'
          )
        
        ,set3 as (SELECT s.Barcode 
              ,[ke_avg]
              ,[ke_min]
              ,[ke_ripple]      
              ,[run_current]
              ,[I_ripple]      
              ,[TIR_probe_A]
              ,[NRRO_probe_A]
              ,[TIR_probe_B]
              ,[NRRO_probe_B]
              ,[RVA]      
              ,[NRRO_ax_FFT_1]
              ,[NRRO_rad_FFT_1]     
              ,[brg_drag]
              ,[Bemf_balance] 
            ,[Time]
          FROM [TransportData].[dbo].[EWMS] as s
          where s.Time = (select max ([Time]) FROM [TransportData].[dbo].[EWMS]  where [Barcode] =s.Barcode )
          and Barcode =  '${barcodemotor}'
          )
        
        ,set4 as (
        SELECT S.[Barcode]     
              ,[Set_Dim]      
              ,[Ramp_to_Datum]     
              ,[Pivot_Height]
              ,[Parallelism]
              ,[FlyHeight]      
              ,[Axial_Play]              
              ,[Ramp_Pivot]
              ,[Projection1]      
          FROM [TransportData].[dbo].[Dynamic_Parallelism_Tester] AS S
          where S.Time = (select max ([Time]) FROM [TransportData].[dbo].[Dynamic_Parallelism_Tester]  where [Barcode] =S.Barcode )
          and [Barcode] =  '${barcodemotor}'
        
        )
        ,set5 as (SELECT K.[Barcode]
              ,[R1_UV]
              ,[R2_UW]
              ,[R3_VW]
              ,[R_max_min]
          FROM [TransportData].[dbo].[Hipot] as K
          where K.Time = (select max ([Time]) FROM [TransportData].[dbo].[Hipot]  where [Barcode] =K.Barcode )
           and [Barcode] = '${barcodemotor}'
        
          )
        ,set6 as (SELECT H.[Barcode]
              ,[Leak_rate1]     
          FROM [TransportData].[dbo].[He_Leak] as H
           where H.Time = (select max ([Time]) FROM [TransportData].[dbo].[He_Leak]  where [Barcode] =H.Barcode )
           and [Barcode] = '${barcodemotor}'
          )
        
        , set7 as (select  J.[Barcode]
               ,[Imbal_Static]
        FROM [Temp_TransportData].[dbo].[Imbalance_Static] as J
         where J.Time = (select max ([Time]) FROM  [Temp_TransportData].[dbo].[Imbalance_Static] where [Barcode] =J.Barcode )
        )
        
        
        ,set8 as (
        SELECT A.[Barcode]      
              ,[Oil_Up_Amount]      
              ,[Oil_Low_Amount]
            ,[Imbal_Static]
        FROM [SPD_Fac2].[dbo].[AxialPlay_Auto_Fac2] as A
        join set7
          on set7.Barcode = A.[Barcode] 
         where A.Time = (select max ([Time]) FROM  [SPD_Fac2].[dbo].[AxialPlay_Auto_Fac2]  where [Barcode] =A.Barcode )
        )
        
        ,set9 as (
        SELECT [Oil_Up_Amount]      
              ,[Oil_Low_Amount]
              ,[Barcode_Motor]
              ,[Barcode_rotor]
            ,set8.Imbal_Static 
          FROM [TransportData].[dbo].[Matching] as S
          join  set8 
          on set8.Barcode= Barcode_Motor
          where S.Match_timestamp = (select max ([Match_timestamp]) FROM  [TransportData].[dbo].[Matching]  where [Barcode] =S.Barcode_Motor )
          and [Barcode_Motor] =  '${barcodemotor}'
          )
        
        
          select set2.[Barcode]
          ,[Barcode_base]
          ,case when [Ramp_tray] is null then '' 
		   else [Ramp_tray] end as Ramp_tray
          ,case when [divertor] is null then ''
		   else [divertor] end as  divertor
          ,[Lot_QA] 
          ,[ke_avg] AS keavg
            ,[ke_ripple] as keripple      
              ,[TIR_probe_A] as TIRprobeA
              ,[NRRO_probe_A] as NRROprobeA
              ,[TIR_probe_B] as TIRprobeB
              ,[NRRO_probe_B] as NRROprobeB
          ,[RVA]     
              ,[NRRO_ax_FFT_1] as NRROaxFFT1
              ,[NRRO_rad_FFT_1] as NRROradFFT1
          ,[run_current] as Runcurrent
          ,[brg_drag] as brgdrag
          ,[R1_UV] as RUV
              ,[R2_UW] as RUW
              ,[R3_VW] as RVW
          ,[Set_Dim]  as SetDim
           ,[Pivot_Height]  as Pivotheigh
          ,[Parallelism] 
              ,[FlyHeight]
          ,[Ramp_Pivot]
          ,[Projection1] as Projection
          ,case when [Leak_rate1]    is null then '' else [Leak_rate1] end as Heliumleak
          ,[Axial_Play]  
          ,case when [Oil_Up_Amount]  is null then '' else [Oil_Up_Amount] end as Oiltop
              ,case when  [Oil_Low_Amount] is null then '' else [Oil_Low_Amount] end as Oilbottom
          ,case when set9.Imbal_Static is null then '' else set9.Imbal_Static  end as ImbalStatic
           ,[R_max_min] 
           ,[Bemf_balance]  as Bemfbalance
          from set2 
     left join set3
          on set2.Barcode = set3.Barcode
      LEFT     join set4
          on set2.Barcode = set4.Barcode
       left    join set5
          on set2.Barcode = set5.Barcode
        left  join set6
          on set2.Barcode = set6.Barcode
         left  join set9
          on set2.Barcode = set9.Barcode_Motor
          where set2.[Barcode]  =  '${barcodemotor}'`);

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
  // router.get("/lotQA/:lotQA", async (req, res) => {
  //   try { 
    
  //       const { lotQA } = req.params;
  //     let result = await user.sequelize.query(`
      
  //     with set1 as(
  //       SELECT [Set_Lot].Barcode
  //             ,[Set_Lot].Barcode_base
  //             ,[Set_Lot_2].[Lot_QA]
  //             ,Auto_Unit5.Ramp_Tray
  //             ,Divertor.Divertor
  //         FROM [TransportData].[dbo].[Set_Lot]
  //         LEFT join[TransportData].[dbo].[Set_Lot_2]
  //         on Set_Lot.Barcode = Set_Lot_2.Barcode
  //         LEFT join [TransportData].[dbo].[Divertor]
  //         on Set_Lot.Barcode = Divertor.Barcode
  //         LEFT join [TransportData].[dbo].[Auto_Unit5]
  //         on  Set_Lot.Barcode = Auto_Unit5.Barcode
  //       where [Set_Lot_2].[Lot_QA] like  '${lotQA}%'
  //         )
        
  //       ,set2 as (SELECT s.Barcode 
  //             ,[ke_avg]
  //             ,[ke_min]
  //             ,[ke_ripple]      
  //             ,[run_current]
  //             ,[I_ripple]      
  //             ,[TIR_probe_A]
  //             ,[NRRO_probe_A]
  //             ,[TIR_probe_B]
  //             ,[NRRO_probe_B]
  //             ,[RVA]      
  //             ,[NRRO_ax_FFT_1]
  //             ,[NRRO_rad_FFT_1]     
  //             ,[brg_drag]
  //             ,[Bemf_balance] 
  //           ,[Time]
  //         FROM [TransportData].[dbo].[EWMS] as s
  //         where s.Time = (select max ([Time]) FROM [TransportData].[dbo].[EWMS]  where [Barcode] =s.Barcode )
  //         --and Barcode like  'GFKK62028851005C23453K8AUPM3PP002P0PP00000%'
  //         )
        
  //       ,set3 as (
  //       SELECT S.[Barcode]     
  //             ,[Set_Dim]      
  //             ,[Ramp_to_Datum]     
  //             ,[Pivot_Height]
  //             ,[Parallelism]
  //             ,[FlyHeight]      
  //             ,[Axial_Play]              
  //             ,[Ramp_Pivot]
  //             ,[Projection1]      
  //         FROM [TransportData].[dbo].[Dynamic_Parallelism_Tester] AS S
  //         where S.Time = (select max ([Time]) FROM [TransportData].[dbo].[Dynamic_Parallelism_Tester]  where [Barcode] =S.Barcode )
  //         --where [Barcode]like  'GFKK62028851005C23453K8AUPM3PP002P0PP00000%'
        
  //       )
  //       ,set4 as (SELECT K.[Barcode]
  //             ,[R1_UV]
  //             ,[R2_UW]
  //             ,[R3_VW]
  //             ,[R_max_min]
  //         FROM [TransportData].[dbo].[Hipot] as K
  //         where K.Time = (select max ([Time]) FROM [TransportData].[dbo].[Hipot]  where [Barcode] =K.Barcode )
  //          --where [Barcode]like  'GFKK62028851005C23453K8AUPM3PP002P0PP00000%'
        
  //         )
  //       ,set5 as (SELECT H.[Barcode]
  //             ,[Leak_rate1]     
  //         FROM [TransportData].[dbo].[He_Leak] as H
  //          where H.Time = (select max ([Time]) FROM [TransportData].[dbo].[He_Leak]  where [Barcode] =H.Barcode )
  //          --where [Barcode]like  'GFKK62028851005C23453K8AUPM3PP002P0PP00000%'
  //         )
        
  //       , set6 as (select  J.[Barcode]
  //              ,[Imbal_Static]
  //       FROM [Temp_TransportData].[dbo].[Imbalance_Static] as J
  //        where J.Time = (select max ([Time]) FROM  [Temp_TransportData].[dbo].[Imbalance_Static] where [Barcode] =J.Barcode )
  //       )
        
        
  //       ,set7 as (
  //       SELECT A.[Barcode]      
  //             ,[Oil_Up_Amount]      
  //             ,[Oil_Low_Amount]
  //           ,[Imbal_Static]
  //       FROM [SPD_Fac2].[dbo].[AxialPlay_Auto_Fac2] as A
  //        left join set6
  //         on set6.Barcode = A.[Barcode] 
  //        where A.Time = (select max ([Time]) FROM  [SPD_Fac2].[dbo].[AxialPlay_Auto_Fac2]  where [Barcode] =A.Barcode )
  //       )
        
  //       ,set8 as (
  //       SELECT [Oil_Up_Amount]      
  //             ,[Oil_Low_Amount]
  //             ,[Barcode_Motor]
  //             ,[Barcode_rotor]
  //           ,set7.Imbal_Static 
  //         FROM [TransportData].[dbo].[Matching] as S
  //         left join  set7 
  //         on set7.Barcode= Barcode_Motor
  //         where S.Match_timestamp = (select max ([Match_timestamp]) FROM  [TransportData].[dbo].[Matching]  where [Barcode] =S.Barcode_Motor )
  //         --where [Barcode_Motor] like  'GFKK62028851005C23453K8AUPM3PP002P0PP00000%'
  //         )
        
        
  //         select set1.[Barcode]
  //         ,[Barcode_base]
  //         ,[Ramp_tray]
  //         ,[divertor]
  //         ,[Lot_QA]
  //         ,[ke_avg]
  //           ,[ke_ripple]      
  //             ,[TIR_probe_A]
  //             ,[NRRO_probe_A]
  //             ,[TIR_probe_B]
  //             ,[NRRO_probe_B]
  //         ,[RVA]      
  //             ,[NRRO_ax_FFT_1]
  //             ,[NRRO_rad_FFT_1]
  //         ,[run_current]
  //         ,[brg_drag]
  //         ,[R1_UV]
  //             ,[R2_UW]
  //             ,[R3_VW]
  //         ,[Set_Dim]
  //          ,[Pivot_Height]
  //         ,[Parallelism]
  //             ,[FlyHeight]
  //         ,[Ramp_Pivot]
  //         ,[Projection1]
  //         ,[Leak_rate1]     
  //         ,[Axial_Play]  
  //         ,[Oil_Up_Amount]      
  //             ,[Oil_Low_Amount]
  //         ,set8.Imbal_Static
  //          ,[R_max_min]
  //          ,[Bemf_balance] 
  //         from set1 
  //         left join set2
  //         on set1.Barcode = set2.Barcode
  //         left join set3
  //         on set1.Barcode = set3.Barcode
  //         left join set4
  //         on set1.Barcode = set4.Barcode
  //         left join set5
  //         on set1.Barcode = set5.Barcode
  //         left join set8
  //         on set1.Barcode = set8.Barcode_Motor
  //         where [Lot_QA]  like  '${lotQA}%'
  //       --  group by set1.[Barcode],[Barcode_base] ,[Ramp_tray],[divertor],[Lot_QA],[ke_avg],[ke_ripple]      ,[TIR_probe_A],[NRRO_probe_A] ,[TIR_probe_B],[NRRO_probe_B],[RVA],[NRRO_ax_FFT_1],[NRRO_rad_FFT_1],[run_current] ,[brg_drag]
  //       --,[R1_UV],[R2_UW],[R3_VW],[Set_Dim],[Parallelism] ,[FlyHeight] ,[Projection1] ,[Leak_rate1]      ,[Axial_Play]   ,[Oil_Up_Amount]       ,[Oil_Low_Amount] ,set8.Imbal_Static  ,[R_max_min]	,[Bemf_balance] 
  //        order by [Lot_QA]`);

  // var listRawData1 = [];
  // listRawData1.push(result[0]);

  // console.log(listRawData1);

  //     res.json({      
  //       result: result[0],
  //       listRawData1,
  //       api_result: "ok",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({
  //       error,
  //       api_result: "nok",
  //     });
  //   }
  // });
 
 
  router.get("/dobylotqa/:dobylotqa", async (req, res) => {
    try { 
    
        const { dobylotqa } = req.params;
      let result = await user.sequelize.query(`
      With set1 as (SELECT [Invoie_ID]
        ,[Item_no]
        ,SUM(convert(int,[QTY])) as QTY
        ,s.[Date]
        ,[Timpstamp]	  
    FROM [PCMC].[dbo].[Invoice] as s
    where s.[Timpstamp] = (select max ([Timpstamp]) FROM [PCMC].[dbo].[Invoice]  where [Invoice].Invoie_ID =s.Invoie_ID )
    Group by  [Invoie_ID]
        ,[Item_no]
        ,s.[Date]
        ,[Timpstamp]

      )
  
  ,set2 as (
    select set1.[Invoie_ID]
    ,set1.[Item_no]
  ,set1.QTY
  ,set1.[Date]
   ,set1.[Timpstamp]
   ,s.Lot_No
  from set1
  inner join [PCMC].[dbo].[Invoice] as s
  on set1.[Invoie_ID] = s.Invoie_ID
  where s.[Timpstamp] = (select max ([Timpstamp]) FROM [PCMC].[dbo].[Invoice]  where [Invoice].Invoie_ID =s.Invoie_ID )
  Group by  set1.[Invoie_ID]
    ,set1.[Item_no]
  ,set1.QTY
  ,set1.[Date]
   ,set1.[Timpstamp]
   ,s.Lot_No
      )
  
   select  [Lot_No] as LotQA
   ,[Invoie_ID] as DO_Num
   ,SUBSTRING([Item_no], 0,CHARINDEX(' REV', [Item_no])) as Part_Num
   , RIGHT([Item_no],5) as Part_Rev
   ,[DateCode] as Lot_num
   ,sum((convert(int,[MOQTY]))) as Lot_Qty
   ,QTY as  DO_Qty 
   ,set2.[Date] as Ship_date
   from set2
   left join [QAInspection].[dbo].[tbQANumber]
   on set2.Lot_No = [tbQANumber].QANumber
   where  [Lot_No] ='${dobylotqa}'
   group by [Lot_No]
   ,[Invoie_ID]
   ,[Item_no]
   ,[DateCode] 
   ,QTY
   ,set2.[Date]
  order by LotQA
      `);

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
  router.get("/dobyinvoid/:dobyinvoid", async (req, res) => {
    try { 
    
        const { dobyinvoid } = req.params;
      let result = await user.sequelize.query(`
      With set1 as (SELECT [Invoie_ID]
        ,[Item_no]
        ,SUM(convert(int,[QTY])) as QTY
        ,s.[Date]
        ,[Timpstamp]	  
    FROM [PCMC].[dbo].[Invoice] as s
    where s.[Timpstamp] = (select max ([Timpstamp]) FROM [PCMC].[dbo].[Invoice]  where [Invoice].Invoie_ID =s.Invoie_ID )
    Group by  [Invoie_ID]
        ,[Item_no]
        ,s.[Date]
        ,[Timpstamp]
      
      )
  
  ,set2 as (
    select set1.[Invoie_ID]
    ,set1.[Item_no]
  ,set1.QTY
  ,set1.[Date]
   ,set1.[Timpstamp]
   ,s.Lot_No
  from set1
  inner join [PCMC].[dbo].[Invoice] as s
  on set1.[Invoie_ID] = s.Invoie_ID
  where s.[Timpstamp] = (select max ([Timpstamp]) FROM [PCMC].[dbo].[Invoice]  where [Invoice].Invoie_ID =s.Invoie_ID )
  Group by  set1.[Invoie_ID]
    ,set1.[Item_no]
  ,set1.QTY
  ,set1.[Date]
   ,set1.[Timpstamp]
   ,s.Lot_No
      )
  
   select  [Lot_No] as LotQA
   ,[Invoie_ID] as DO_Num
   ,SUBSTRING([Item_no], 0,CHARINDEX(' REV', [Item_no])) as Part_Num
   , RIGHT([Item_no],5) as Part_Rev
   ,[DateCode] as Lot_num
   ,sum((convert(int,[MOQTY]))) as Lot_Qty
   ,QTY as  DO_Qty 
   ,set2.[Date] as Ship_date
   from set2
   left join [QAInspection].[dbo].[tbQANumber]
   on set2.Lot_No = [tbQANumber].QANumber
   where  [Invoie_ID] ='${dobyinvoid}'
   group by [Lot_No]
   ,[Invoie_ID]
   ,[Item_no]
   ,[DateCode] 
   ,QTY
   ,set2.[Date]
  order by LotQA
`);

  var listRawData2 = [];
  listRawData2.push(result[0]);

  console.log(listRawData2);

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
  router.get("/shipinfobylotqa/:shipinfobylotqa", async (req, res) => {
    try { 
    
        const { shipinfobylotqa } = req.params;
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
    FROM [PCMC].[dbo].[Invoice] as s
    where s.[Timpstamp] = (select max ([Timpstamp]) FROM [PCMC].[dbo].[Invoice]  where [Lot_No] =s.Lot_No )
  )
  SELECT [Invoie_ID] as DO_Num
        ,[Lot_No] as Track_Lot_Num
        ,sum(convert(float,[QTY])) as MOQTY 
        ,[Date] as Shipment_Date   
    FROM set1
    where [Lot_No] = '${shipinfobylotqa}'
    group by [Invoie_ID],[Lot_No],[Date] ,Invoid
    order by Date desc
      `);

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
  router.get("/shipinfobyinvoid/:shipinfobyinvoid", async (req, res) => {
    try { 
    
        const { shipinfobyinvoid } = req.params;
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
    FROM [PCMC].[dbo].[Invoice] as s
    where s.[Timpstamp] = (select max ([Timpstamp]) FROM [PCMC].[dbo].[Invoice]  where [Lot_No] =s.Lot_No )
  )
  SELECT [Invoie_ID] as DO_Num
        ,[Lot_No] as Track_Lot_Num
        ,sum(convert(float,[QTY])) as MOQTY 
        ,[Date] as Shipment_Date   
    FROM set1
    where [Invoie_ID]  = '${shipinfobyinvoid}'
    group by [Invoie_ID],[Lot_No],[Date] ,Invoid
    order by Date desc
`);

  var listRawData4 = [];
  listRawData4.push(result[0]);

  console.log(listRawData4);

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


  module.exports = router;