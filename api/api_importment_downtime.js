//Update 2024/08/06
const express = require("express");
const router = express.Router();
const user1 = require("../database/models/user_216"); //9


router.get("/Frequency_line_importment/:startDate/:finishDate/:process_pe/:Motortype", async (req, res) => {
  try {
    
    let { startDate, finishDate,process_pe,Motortype} = req.params;
    if (Motortype === 'undefined') {
      Motortype = '';
    }
    let resultGraph = await user1.sequelize.query(
      `SELECT Line,count([Request]) as [Frequency] FROM [PE_maintenance].[dbo].[MaintPlan_Downtime]	WHERE [Mfgdate] between '${startDate}' AND '${finishDate}' AND Cost_cente = '${process_pe}' AND Line like '%-%' AND Line != 'CO2-CO2' AND  ('${Motortype}' IS NULL  OR '${Motortype}' = '' OR  [MotorType]= '${Motortype}' ) GROUP BY Line order by [Frequency] DESC`);
    console.log("resultGraph",resultGraph)  
    const result = resultGraph;

      // แกน  y
    let Frequency = [];
    let Line = []; 
 

    resultGraph[0].forEach( (item) => {
      Frequency.push(item.Frequency);
      Line.push(item.Line);
 
    });
      // console.log(LAR);
      // console.log(resultGraph[0]);
      // console.log(Frequency);
      // console.log(Line);
      

    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      
      resultGraph: resultGraph[0],
      result:result[0],
      listRawData,
      Frequency,
      Line,
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

router.get("/Downtime_line_importment/:startDate/:finishDate/:process_pe/:Motortype", async (req, res) => {
  try {
    let { startDate, finishDate,process_pe,Motortype} = req.params;
    console.log(Motortype);
    if (Motortype === 'undefined') {
      Motortype = '';
    }
    let resultGraph = await user1.sequelize.query(
      `exec [PE_maintenance].[dbo].[Importment_downtime_line] '${startDate}','${finishDate}','${process_pe}','${Motortype}';
      `);
    console.log("resultGraph",resultGraph)  
    const result = resultGraph;

      // แกน  y
    let Total_Downtime = [];
    let Delay_Time = [];
    let Downtime=[];
    let Line = []; 
 

    resultGraph[0].forEach( (item) => {
      Total_Downtime.push(item.Total_Downtime);
      Line.push(item.Line);
 
    });
      // console.log(LAR);
      // console.log(resultGraph[0]);
      // console.log(Total_Downtime);
      // console.log(Line);

    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      
      resultGraph: resultGraph[0],
      result:result[0],
      listRawData,
      Total_Downtime,
      Line,
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


router.get("/Frequency_machine_importment/:startDate/:finishDate/:process_pe/:Line", async (req, res) => {
  try {
    const { startDate, finishDate,process_pe,Line} = req.params;
    const resultGraph = await user1.sequelize.query(
      `SELECT  replace(replace([Equipment],'/','-'),'#','_') as [Equipment],count([Request]) as [Frequency]  FROM [PE_maintenance].[dbo].[MaintPlan_Downtime] WHERE [Mfgdate] between '${startDate}' AND '${finishDate}' AND Cost_cente = '${process_pe}'  AND Line = '${Line}' AND Line != 'CO2-CO2' GROUP BY [Equipment] order by [Frequency] DESC`);
    console.log("resultGraph",resultGraph)  
    const result = resultGraph;

      // แกน  y
    let Frequency = [];
    let machine = []; 
 

    resultGraph[0].forEach( (item) => {
      Frequency.push(item.Frequency);
      machine.push(item.machine);
 
    });
  
    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      
      resultGraph: resultGraph[0],
      result:result[0],
      listRawData,
      Frequency,
      machine,
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

router.get("/Downtime_machine_importment/:startDate/:finishDate/:process_pe/:line", async (req, res) => {
  try {
    const { startDate, finishDate,process_pe,line} = req.params;
    const resultGraph = await user1.sequelize.query(
      `exec [PE_maintenance].[dbo].[Importment_downtime_machine] '${startDate}','${finishDate}','${process_pe}','${line}';
      `);
    // console.log("resultGraph",resultGraph)  
    const result = resultGraph;

      // แกน  y
    let Total_Downtime = [];
    let Equipment = []; 
 

    resultGraph[0].forEach( (item) => {
      Total_Downtime.push(item.Total_Downtime);
      Equipment.push(item.Equipment);
 
    });
      // console.log(LAR);
      console.log(resultGraph[0]);
      console.log(Total_Downtime);
      console.log(Equipment);
      

    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      
      resultGraph: resultGraph[0],
      result:result[0],
      listRawData,
      Total_Downtime,
      Equipment,
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


router.get("/Downtime_casedetail_importment/:startDate/:finishDate/:process_pe/:line/:machine", async (req, res) => {
  try {
    const { startDate, finishDate,process_pe,line,machine} = req.params;
    const resultGraph = await user1.sequelize.query(
      `exec  [PE_maintenance].[dbo].[Importment_downtime_case_detail] '${startDate}','${finishDate}','${process_pe}','${line}','${machine}';
      `);

    const result = resultGraph;

      // แกน  y
    let Total_Downtime = [];
    let Cause_details = []; 
 

    resultGraph[0].forEach( (item) => {
      Total_Downtime.push(item.Total_Downtime);
      Cause_details.push(item.Cause_details);
 
    });
      // console.log(LAR);
      console.log(resultGraph[0]);
      console.log(Total_Downtime);
      console.log(Cause_details);
      

    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      
      resultGraph: resultGraph[0],
      result:result[0],
      listRawData,
      Total_Downtime,
      Cause_details,
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

router.get("/Frequency_case_detail_importment/:startDate/:finishDate/:process_pe/:Line/:machine", async (req, res) => {
  try {
    const { startDate, finishDate,process_pe,Line,machine} = req.params;

    const machine_data = machine.replace(/_/g, '#').replace(/-/g, '/');
    console.log("machine_data",machine_data);
    
    const resultGraph = await user1.sequelize.query(
      `SELECT TRIM(REPLACE([Service_request_description], '"', '')) as [Cause_details] ,count([Service_request_description]) as [Frequency]  FROM [PE_maintenance].[dbo].[MaintPlan_Downtime] WHERE [Mfgdate] between '${startDate}' AND '${finishDate}' AND Cost_cente = '${process_pe}' AND Line = '${Line}' AND Line != 'CO2-CO2' and [Equipment] like '%${machine_data}%' GROUP BY TRIM(REPLACE([Service_request_description], '"', '')) order by [Frequency] DESC`);
    console.log("resultGraph",resultGraph)  
    const result = resultGraph;

      // แกน  y
    let Frequency = [];
    let Cause_detail = []; 
 

    resultGraph[0].forEach( (item) => {
      Frequency.push(item.Frequency);
      Cause_detail.push(item.Cause_detail);
 
    });
  
    var listRawData = [];
    listRawData.push(result[0]);
    res.json({
      
      resultGraph: resultGraph[0],
      result:result[0],
      listRawData,
      Frequency,
      Cause_detail,
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





















//Select MotorType
router.get("/MotorType", async (req, res) => {
  try {
    const { line }  = req.params;
    let result = await user1.sequelize.query(
      ` SElect distinct [MotorType] FROM  [PE_maintenance].[dbo].[MaintPlan_Downtime] where  [MotorType] != ''`);

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

// //Select line
router.get("/line", async (req, res) => {
  try {
    // const { process }  = req.params;
    let result = await user1.sequelize.query(
      ` Select distinct Line FROM [PE_maintenance].[dbo].[Missing_components]`);

    var listRawData2 = [];
    listRawData2.push(result[0]);

    res.json({
      result: result[0],
      listRawData2,
      api_result: "ok",
    });
  } catch (error) {
    // console.log(error);
    res.json({
      error,
      api_result: "nok",
    });
  }
});


module.exports = router;
