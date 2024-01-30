
const express = require("express");
const router = express.Router();
const user = require("../database/models/user");


router.get("/RejectTeam/:startDate",
  async (req, res) => {
    try {
      var result = [[]];
      const { startDate } = req.params;
        var result = await user.sequelize
          .query(` with	W1 as (SELECT
            [InspectionDate] as Date
            ,[InspectionShift] as Shift
            ,[tbVisualInspection].[Model_group] as Model_group
            ,[tbVisualInspection].[QANumber]as QA_No
            ,[InspectionResult] as Result
        ,[tbQANumber].[SupporterName] as Supporter
            ,[Defect_NG] as NG
            ,[Detail] as Detail
            ,[QTY] as QTY
            ,[tbVisualInspection].[Location] as Location
        ,[Line_No]
            FROM [QAInspection].[dbo].[tbVisualInspection]
            INNER JOIN [QAInspection].[dbo].[tbQANumber]
            ON [tbVisualInspection].[QANumber]=[tbQANumber].[QANumber]
            LEFT JOIN [QAInspection].[dbo].[Reject_visual]
            ON [tbVisualInspection].[InsNumber]=[Reject_visual].[Inspection]
              WHERE [tbVisualInspection].[InspectionResult]='REJECT'
          and [InspectionDate] = '${startDate}'
      )
      
      ,W2 as (	 
      select Date,Shift,Model_group,QA_No,[Line_No],Supporter,[ENEmpName],NG,QTY
         from W1
         left join [QAInspection].[dbo].[tbEmpNameList]
         on W1.Supporter=[tbEmpNameList].[EmpNo]
         group by Date,Shift,QA_No,[Line_No],Model_group,Supporter,[ENEmpName],NG,QTY)
    
      --,W3 as (
      select Date,Model_group,[Line_No],Supporter,[ENEmpName],NG,QTY
      from W2`);

          var resultGraph = await user.sequelize
          .query(`with	W1 as (SELECT
            [InspectionDate] as Date
            ,[InspectionShift] as Shift
            ,[tbVisualInspection].[Model_group] as Model_group
            ,[tbVisualInspection].[QANumber]as QA_No
            ,[InspectionResult] as Result
        ,[tbQANumber].[SupporterName] as Supporter
            ,[Defect_NG] as NG
            ,[Detail] as Detail
            ,[QTY] as QTY
            ,[tbVisualInspection].[Location] as Location
        ,[Line_No]
		,[MONumber]
            FROM [QAInspection].[dbo].[tbVisualInspection]
            INNER JOIN [QAInspection].[dbo].[tbQANumber]
            ON [tbVisualInspection].[QANumber]=[tbQANumber].[QANumber]
            LEFT JOIN [QAInspection].[dbo].[Reject_visual]
            ON [tbVisualInspection].[InsNumber]=[Reject_visual].[Inspection]
              WHERE [tbVisualInspection].[InspectionResult]='REJECT'
          and [InspectionDate] = '${startDate}'  
      )
      
      ,W2 as (	 
      select Date,Shift,Model_group,QA_No,[Line_No],Supporter,[ENEmpName],NG,QTY
         from W1
         left join [QAInspection].[dbo].[tbEmpNameList]
         on W1.Supporter=[tbEmpNameList].[EmpNo]
         group by Date,Shift,QA_No,[Line_No],Model_group,Supporter,[ENEmpName],NG,QTY)

		 select Date,Shift,Supporter,[ENEmpName],Model_group,QA_No,count(QA_No)as lot,[Line_No],NG,QTY
         from W2
		 group by Date,Shift,Model_group,[Line_No],Supporter,[ENEmpName],NG,QTY,QA_No
          `);
    // แกน  y
    let QTY = [];
    let NG = []; 
    resultGraph[0].forEach( (item) => {
      QTY.push(item.QTY);
      NG.push(item.NG);

   
    });
  
    // console.log(LAR);
    console.log(resultGraph[0]);
    console.log(QTY);
    console.log(NG);
  
    


    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      result: result[0],
      resultGraph: resultGraph[0],
      QTY,
      listRawData,
  NG,
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
