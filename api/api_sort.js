const express = require("express");
const router = express.Router();
const user = require("../database/models/user");




router.get(
  "/QaNumberAll/:QANumber1/:QANumber2/:QANumber3/:QANumber4/:QANumber5/:QANumber6/:QANumber7/:QANumber8/:QANumber9/:QANumber10",
  async (req, res) => {
    try {
      const {  QANumber1,QANumber2,QANumber3,QANumber4,QANumber5,QANumber6,QANumber7,QANumber8,QANumber9,QANumber10,} =
    
        req.params;
        const QANumberS1 = QANumber1.substring(18,29);
        const QANumberS2 = QANumber2.substring(18,29);
        const QANumberS3 = QANumber3.substring(18,29);
        const QANumberS4 = QANumber4.substring(18,29);
        const QANumberS5 = QANumber5.substring(18,29);
        const QANumberS6 = QANumber6.substring(18,29);
        const QANumberS7 = QANumber7.substring(18,29);
        const QANumberS8 = QANumber8.substring(18,29);
        const QANumberS9 = QANumber9.substring(18,29);
        const QANumberS10 = QANumber10.substring(18,29);
        
        let result = await user.sequelize.query(`with myTable as (select  
          [tbVisualInspection].[QANumber] as QA_Number,
              [InspectionDate] as Date ,
              [tbVisualInspection].[ModelNumber] as Item_Number,
              [tbVisualInspection].[Model_Name] as Model_Name,
			  [MONumber] as MONumber,
        SUM([MOQTY])as QA_QTY,
		  [tbQANumber].[DateCode] as DateCode,
              [Vis_Round] as Inspection_Round,
              [InspectionType] as Inspection_Type,
              [InspectionResult] as Inspection_Result
          FROM [QAInspection].[dbo].[tbVisualInspection]
          left JOIN [QAInspection].[dbo].[tbQANumber]
          ON [QAInspection].[dbo].[tbQANumber].[QANumber] = [QAInspection].[dbo].[tbVisualInspection].[QANumber]
           where [tbVisualInspection].[QANumber] = '${QANumberS1}' or [tbVisualInspection].[QANumber] = '${QANumberS2}'or [tbVisualInspection].[QANumber] = '${QANumberS3}'or [tbVisualInspection].[QANumber] = '${QANumberS4}'or [tbVisualInspection].[QANumber] = '${QANumberS5}'or [tbVisualInspection].[QANumber] = '${QANumberS6}'or [tbVisualInspection].[QANumber] = '${QANumberS7}'or [tbVisualInspection].[QANumber] = '${QANumberS8}'or [tbVisualInspection].[QANumber] = '${QANumberS9}'or [tbVisualInspection].[QANumber] = '${QANumberS10}'
           group by [InspectionDate],[tbVisualInspection].[QANumber],[tbVisualInspection].[ModelNumber],[tbVisualInspection].[Model_Name],[MONumber], [tbQANumber].[DateCode],
		   [Vis_Round],[InspectionType],[InspectionResult]),

        myTable2 as(
                   select * from  myTable
                   where QA_Number != ''
                   group by QA_Number,Date,Item_Number,Model_Name,MONumber,QA_QTY,DateCode,Inspection_Round,Inspection_Type,Inspection_Result
       union all select QA_Number='${QANumberS1}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS2}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS3}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS4}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS5}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS6}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS7}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS8}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS9}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'
       union all select QA_Number='${QANumberS10}',Date='',Item_Number='',Model_Name='',MONumber='',QA_QTY=0,DateCode='',Inspection_Round='',Inspection_Type='',Inspection_Result='Data not found'),

           myTable3 as (
           select * from myTable2
                   --inner join myTable on myTable.QA_Number = myTable2.QA_Number
       where myTable2.QA_Number != ''
                   ),
                myTable4 as (
                   select * from myTable3 where Item_Number != '' )

                   select * from myTable3 where QA_Number not in (select QA_Number from myTable4)
                   union all
                   select * from myTable4
       ORDER BY QA_Number,Inspection_Round,MONumber,DateCode
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