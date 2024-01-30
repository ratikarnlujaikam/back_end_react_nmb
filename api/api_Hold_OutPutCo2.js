const express = require("express");
const router = express.Router();
const user = require("../database/models/user");



router.get(
  "/HoldoutputCo2",
  async (req, res) => {
    try {
      var result = [[]];
        var result = await user.sequelize.query(`
        --Detail Co2Hold
        with set1 as (SELECT *
        from [QAInspection].[dbo].[tbVisualInspection] [InspectionResult] 
        where InspectionResult = 'ACCEPT' or InspectionResult='EMPTY'
        --and InspectionDate.CURDATE() between '2023-04-19'and '2023-04-19'
        )
        ,Set2 as (select *
        from[QAInspection].[dbo].[Record_Output_CO2]
        where [Deleter] is null 
          )
        ,set3 as (
        select [MfgDate],[Line],[Item_No],[Model],[QA_No],Shift,Qty
        from Set1
        full join set2
        on set2.QA_No=set1.QANumber
        where QANumber is null)
        
        /****** Script for SelectTopNRows command from SSMS  ******/
  ,set4  as (    
  SELECT set3.[MfgDate]
        ,set3.[Line] as Line
        ,set3.Shift
        ,set3.[Model],set3.[Item_No]
        ,set3.[QA_No]
        ,[Mo_number]
        ,[W/W]
        ,[Record_QAPrint].[Qty]
        ,[Special_control]
        ,[Supporter_name]
        ,[Baseplate]
        ,[Ramp]
        ,[Crashstop]
        ,[Hub]
        ,[Magnet]
        ,[Diverter]
        ,[FPC]
        ,[DateTime]
        ,[Machine_no]
        ,[CO2_EMP]
        ,[CO2_DATE]
        ,[CO2_SP1]
        ,[CO2_SP2]
        ,[SP1]
        ,[SP2]
        ,[SP3]
        ,[SP4]
        ,[SP5]
        ,[Revision]
        FROM [Setlot].[dbo].[Record_QAPrint]
        inner join  set3 on set3.QA_No=Record_QAPrint.Lot_QA
        where [MfgDate]!= (SELECT CAST(GETDATE() AS DATE) 'Current Date')
       )
	
,set5 as (select [MfgDate],[Line],[Item_No],[Model],[QA_No],
case when A is null then 0 else A end as SHIFT_A,
case when B is null then 0 else B end as SHIFT_B,
case when C is null then 0 else C end as SHIFT_C,
case when M is null then 0 else M end as SHIFT_M,
case when N is null then 0 else N end as SHIFT_N
from set4
PIVOT (sum([Qty])
FOR[Shift] IN (A,B,C,M,N))
AS pvt )

select [MfgDate],+'L'+[Line] as Line,[Item_No],[Model]
,sum(SHIFT_A)as SHIFT_A
,sum(SHIFT_B)as SHIFT_B
,sum(SHIFT_C)as SHIFT_C
,sum(SHIFT_M)as SHIFT_M
,sum(SHIFT_N)as SHIFT_N
,sum(SHIFT_A)+sum(SHIFT_B)+sum(SHIFT_C)+sum(SHIFT_M)+sum(SHIFT_N) as TOTAL
from set5
where [MfgDate]!= (SELECT CAST(GETDATE() AS DATE) 'Current Date')
group by [MfgDate],[Line],[Item_No],[Model]
order by [MfgDate],[Item_No],[Model]
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
  }
);
router.get(
  "/DetailHoldCo2",
  async (req, res) => {
    try {
      var result = [[]];
        var result = await user.sequelize.query(`
        --Detail Co2Hold
        with set1 as (SELECT *
        from [QAInspection].[dbo].[tbVisualInspection] [InspectionResult] 
        where InspectionResult = 'ACCEPT' or InspectionResult='EMPTY'
        --and InspectionDate.CURDATE() between '2023-04-19'and '2023-04-19'
        )
        ,Set2 as (select *
        from[QAInspection].[dbo].[Record_Output_CO2]
        where [Deleter] is null 
          )
        ,set3 as (
        select [MfgDate],[Line],[Item_No],[Model],[QA_No],Shift,Qty
        from Set1
        full join set2
        on set2.QA_No=set1.QANumber
        where QANumber is null)
        
        /****** Script for SelectTopNRows command from SSMS  ******/
        SELECT set3.[MfgDate]
        ,+'L'+set3.[Line] as Line
        ,set3.Shift
        ,set3.[Model],set3.[Item_No]
        ,set3.[QA_No]
        ,[Mo_number]
        ,[W/W]
        ,[Record_QAPrint].[Qty]
        ,[Special_control]
        ,[Supporter_name]
        ,[Baseplate]
        ,[Ramp]
        ,[Crashstop]
        ,[Hub]
        ,[Magnet]
        ,[Diverter]
        ,[FPC]
        ,[DateTime]
        ,[Machine_no]
        ,[CO2_EMP]
        ,[CO2_DATE]
        ,[CO2_SP1]
        ,[CO2_SP2]
        ,[SP1]
        ,[SP2]
        ,[SP3]
        ,[SP4]
        ,[SP5]
        ,[Revision]
        FROM [Setlot].[dbo].[Record_QAPrint]
        inner join  set3 on set3.QA_No=Record_QAPrint.Lot_QA
        where [MfgDate]!= (SELECT CAST(GETDATE() AS DATE) 'Current Date')
        order by set3.[MfgDate],set3.QA_No

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
  }
);


module.exports = router;
