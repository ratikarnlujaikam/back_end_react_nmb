const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
var moment = require("moment");
const DataShow = require("./../database/models/model_data_show");
const json2xls = require("json2xls");
const fs = require("fs");
const AutoAlarms = require("../database/models/autoAlert");

// Sent email NMB member
async function main() {
  let transporter = nodemailer.createTransport({
    host: "10.120.10.42", //10.121.1.22 ลพบุรี //10.120.10.42 บางปะอิน
    port: 25,
  });

  let cron = require("node-cron");

  cron.schedule("*/60 * * * *", () => {
    console.log("running a task every 60 minute");
  });
    // ControlSpec Static dimension 23/11/22
    cron.schedule(" * * *", async () => {
      let startDate = await moment().add("days", -91).format("yyyy-MM-DD");
      let finishDate = await moment().add("days", -1).format("yyyy-MM-DD");
      let models = ["EVANBP", "HARRIE","LONGSP","OSPREY", "ROSE1L", "ROSE2D","V15C4D"];
      let param = [
        "Set_Dimension_Stack",
        "Set_Dimension_Attractive",
        "Parallelism_Stack",
        "Parallelism_Attractive",
        "P1_Stack_1",
        "P2_Stack_2",
        "P3_Stack_3",
        "P4_Ramp_Height",
        "P5_Pivot",
        "P4_Attractive_1",
        "P5_Attractive_2",
        "P6_Attractive_3",
      ];
      for (let i = 0; i < models.length; i++) {
        if (models[i] === "EVANBP") {
          var lines = [
            "B14",
            "B15",
            "B16",
            "C14",
          ];
        } else if (models[i] === "HARRIE") {
          var lines = ["B16","B19"];
        } else if (models[i] === "LONGSP") {
          var lines = [
            "B15",
            "B17",
            "B18",
            "B19",
            "B20",
            "B21",
          ];
        } else if (models[i] === "OSPREY") {
          var lines = ["B16"];
        } else if (models[i] === "ROSE1L") {
          var lines = ["C1", "C2", "C3"];
        } else if (models[i] === "ROSE2D") {
          var lines = ["C2", "C3"];
        } else if (models[i] === "V15C4D") {
          var lines = ["B14", "B19", "B21"];
        } else {
          var lines = [];
        }
        for (let j = 0; j < lines.length; j++) {
          for (let k = 0; k < param.length; k++) {
            // console.log(models[i] + lines[j] + param[k])
            model = models[i];
            productionline = lines[j];
            parameter = param[k];
  
            var input = await DataShow.sequelize.query(
              `with Xbar (x1,x2,x3,x4) as
            (select [DataforAnalysis].[dbo].[Dimension_WR].[${parameter}] as [X]
            ,[DataforAnalysis].[dbo].[Dimension_WR].[Model]
            ,[DataforAnalysis].[dbo].[Dimension_WR].[Line]
            ,[TransportData].[dbo].[Master_matchings].[Parameter]
            FROM [DataforAnalysis].[dbo].[Dimension_WR]
            inner join [TransportData].[dbo].[Master_matchings]
            on [TransportData].[dbo].[Master_matchings].[Model] = [DataforAnalysis].[dbo].[Dimension_WR].[Model]
            where [DataforAnalysis].[dbo].[Dimension_WR].[Date] between '${startDate}' and '${finishDate}'
            and [DataforAnalysis].[dbo].[Dimension_WR].[Model] = '${model}'
            and [DataforAnalysis].[dbo].[Dimension_WR].[Line] = '${productionline}'
            and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
            ),
            
            Sbar (s1,s2) as
            (select cast(stdev([DataforAnalysis].[dbo].[Dimension_WR].[${parameter}]) as decimal(10,5))
            ,[DataforAnalysis].[dbo].[Dimension_WR].[Model]
            FROM [DataforAnalysis].[dbo].[Dimension_WR]
            where [DataforAnalysis].[dbo].[Dimension_WR].[Date] between '${startDate}' and '${finishDate}'
            and [DataforAnalysis].[dbo].[Dimension_WR].[Model] = '${model}'
            and [DataforAnalysis].[dbo].[Dimension_WR].[Line] = '${productionline}'
            group by [DataforAnalysis].[dbo].[Dimension_WR].[Model]
            ,[DataforAnalysis].[dbo].[Dimension_WR].[Date]
            )
            
            select
            x2 as [Model]
            ,x3 as [Line]
            ,x4 as [Parameter]
            ,cast(AVG(x1) as decimal(10,3))-(3*cast(stdev(x1) as decimal(10,3))) as [LCL]
            ,cast(AVG(x1) as decimal(10,3))+(3*cast(stdev(x1) as decimal(10,3))) as [UCL]
            ,cast(AVG(x1) as decimal(10,3)) as [CL]
            ,cast(AVG(s1) as decimal(10,3))-(3*cast(stdev(s1) as decimal(10,3))) as [LCL_STD]
            ,cast(AVG(s1) as decimal(10,3))+(3*cast(stdev(s1) as decimal(10,3))) as [UCL_STD]
            ,cast(AVG(s1) as decimal(10,3)) as [CL_STD]
            from Xbar inner join Sbar on Xbar.x2 = Sbar.s2
            group by x2,x3,x4`
            );
            console.log(input);
            console.log(input[0].length);
  
            //insert into SQL
            for (let i = 0; i < input[0].length; i++) {
              model = input[0][i].model;
              Parameter = input[0][i].Parameter;
              Line = input[0][i].Line;
              CL = input[0][i].CL;
              LCL = input[0][i].LCL;
              UCL = input[0][i].UCL;
              CL_STD = input[0][i].CL_STD;
              LCL_STD = input[0][i].LCL_STD;
              UCL_STD = input[0][i].UCL_STD;
              createdAt = moment().format();
              updatedAt = moment().format();
              try {
                let result = await AutoAlarms.sequelize
                  .query(`INSERT INTO [TransportData].[dbo].[ControlSpecs]
                  VALUES('${model}','${Line}','${Parameter}',${CL},${LCL},${UCL},${CL_STD},${LCL_STD},${UCL_STD},'${createdAt}','${updatedAt}');`);
                console.log(result);
              } catch (error) {
                console.log(error);
                res.json({
                  error,
                  api_result: "nok",
                });
              }
            }
          }
        }
      }
    });



  //Mail Master Update AEW
  cron.schedule(" 16 * * *", async () => {
    var input1 = [];
    var ct = [];
    var counts = 0;
    let datee = moment().format("yyyy-MM-DD");
    let datetime = moment().subtract(1, "hours").format("YYYY-MM-DD HH:00:00");
    let datetime2 = moment().subtract(1, "hours").format("YYYY-MM-DD HH:59:59");

    //For email UI
    let datetime3 = moment().subtract(1, "hours").format("DD-MM-YY HH:00");
    let datetime4 = moment().subtract(1, "hours").format("HH:59");

    // let models = ["CIMAR5", "CIMBP5"];
    // let lines = ["2-4", "2-5"];

    // for (let i = 0; i < models.length; i++) {
    //   var model = models[i];
    //   for (let j = 0; j < lines.length; j++) {
    //     var line = lines[j];

      let input = await DataShow.sequelize.query(
          `SELECT 
          [CustomerCode]
          ,[ItemNo]
          ,[ItemName]
          ,[ModelShortName]
          ,[WC_Code]
          ,[ModelGroup]
          ,[LotSizeFinal]
          ,[LotSizeQA]
          ,[QACode]
          ,[Tray_PerQA]
          ,[Updater]
          ,[Timestamp]
          ,[BagColor]
          ,[EndOfLive]
          ,[MotorType]
      FROM [QAInspection].[dbo].[tbMasterItemNo]
      where convert(date,[Timestamp])= '${datee}'`
        );

        console.log(input);
        console.log(input[0].length);

        await input1.push(input);

        ct[counts] = input1[counts][0].reduce(function (a, b) {
          {
            return (
              a +
              // `<tr style="color:#FF0000"><td>` +
              "<tr><td>" +
              b.CustomerCode +
              "</a></td><td>" +
              b.ItemNo +
              "</a></td><td>" +
              b.ItemName +
              "</a></td><td>" +
              b.ModelShortName +
              "</a></td><td>" +
              b.ModelGroup +
              "</a></td><td>" +
              b.Updater +
              "</a></td><td>" +
              b.Timestamp +
              "</a></td><td>" +
              b.BagColor +
              "</a></td><td>" +
              b.EndOfLive +
              "</a></td><td>" +
              b.MotorType +
              "</td><td>"
            );
          }
        }, "");
        counts = counts + 1;
        console.log(counts);
      // }
    // }

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      to: "piyachat.c@minebea.co.th",
      subject:
        "TEST",// Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='salmon' >" +
        "<br/><b><h2> Workflow Adjustment</b></h2>" +
        "<font face='Segoe UI' color='#FF2E2E' >" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>CustomerCode</th><th width='100px'>ItemNo</th> <th width='100px'>ItemName</th> <th width='100px'>ModelShortName</th> <th width='100px'>ModelGroup</th> <th width='100px'>Updater</th> <th width='100px'>Timestamp</th> <th width='100px'>BagColor</th><th width='100px'>EndOfLive</th> <th width='100px'>MotorType</th>" +
        "<tbody align='center'><tr><td>" +
        ct[0] +
        "</td></tr></tbody>" +
        "</table> </font>",
    };

    for (let i = 0; i < 4; i++) {
      if (input1[i][1] !== 0) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        break;
      }
    }
  });

  
  // Dyn for CMR //ุทุกๆ 4 ชั่วโมง 0 */4 * * *
  cron.schedule(" * * * *", async () => {
    var input1 = [];
    var ct = [];

    let datetime = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:00:00");
    let datetime2 = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:59:59");

    //For email UX
    let datetime3 = await moment()
      .subtract(1, "hours")
      .format("DD-MM-YY HH:00");
    let datetime4 = await moment().subtract(1, "hours").format("HH:59");

    let param = ["Set_Dim", "Parallelism", "Projection1"];

    for (let i = 0; i < param.length; i++) {
      parameter = param[i];
      console.log(parameter);
      var input = await DataShow.sequelize.query(
        `with Proj (a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) as
      (select CONVERT(DATE,[Dynamic_Parallelism_Tester].[Time]) as [Date]
      ,[Dynamic_Parallelism_Tester].[Model] as [Model]
      ,[Dynamic_Parallelism_Tester].[Line] as [Line]
      ,cast(DATEPART(hour,[Dynamic_Parallelism_Tester].[Time]) as varchar) + ':00' as [Time]
      ,[Dynamic_Parallelism_Tester].[${parameter}] as [AVG]
      ,[TransportData].[dbo].[ControlSpecCMRs].[LSL] as [LSL]
      ,[TransportData].[dbo].[ControlSpecCMRs].[USL] as [USL]
      ,[Dynamic_Parallelism_Tester].[Machine_no] as [Machine]
      ,[TransportData].[dbo].[Master_matchings].[Parameter] as [Parameter]
      ,CASE WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'D' THEN 'NMB'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'M' THEN 'MMI'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'T' THEN 'MMI'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'R' THEN 'JCY'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'A' THEN 'Notion'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'B' THEN 'Banwa'
      END AS Base_Supplier
      from [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
      inner join [TransportData].[dbo].[ControlSpecCMRs]
      on [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[ControlSpecCMRs].[Model]
      and [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line] = [TransportData].[dbo].[ControlSpecCMRs].[Line]
      INNER JOIN [TransportData].[dbo].[Master_matchings]
      ON [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[Master_matchings].[Model]
      and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlSpecCMRs].[Parameter]
      where [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time] between '${datetime}' and '${datetime2}'
      and [TransportData].[dbo].[ControlSpecCMRs].[Parameter] = '${parameter}'
      group by CONVERT(DATE,[Dynamic_Parallelism_Tester].[Time]),
      [Dynamic_Parallelism_Tester].[Model],
      [Dynamic_Parallelism_Tester].[Line],
      cast(DATEPART(hour,[Dynamic_Parallelism_Tester].[Time]) as varchar) + ':00'
      ,[Dynamic_Parallelism_Tester].[${parameter}]
      ,[TransportData].[dbo].[ControlSpecCMRs].[LSL]
      ,[TransportData].[dbo].[ControlSpecCMRs].[USL]
      ,[Dynamic_Parallelism_Tester].[Machine_no]
      ,[TransportData].[dbo].[Master_matchings].[Parameter]
      ,CASE WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'D' THEN 'NMB'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'M' THEN 'MMI'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'T' THEN 'MMI'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'R' THEN 'JCY'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'A' THEN 'Notion'
      WHEN substring([Dynamic_Parallelism_Tester].[Barcode], 17,1) = 'B' THEN 'Banwa'
      END
      having count([${parameter}]) > 20
      )
      
      select a1 as [Date]
      ,a2 as [Model]
      ,a3 as [Line]
      ,cast(avg(a5) as decimal(10,4)) as [Average]
      ,a6 as [LSL]
      ,a7 as [USL]
      ,a8 as [Machine]
      ,a9 as [Parameter]
      ,a10 as [Base_Supplier]
      from Proj
      inner join [TransportData].[dbo].[Master_matchings]
      on [TransportData].[dbo].[Master_matchings].[Model] = Proj.a2
      group by a1,a2,a3,a6,a7,a8,a9,a10
      having (cast(AVG(case when (a5 > [Master_matchings].LSL) and (a5 < [Master_matchings].USL) 
      then a5 end) as decimal(10,4))) < a6 or cast(AVG(a5) as decimal(10,4)) > a7`
      );

      console.log(input);
      console.log(input[0].length);

      // console.log(input);
      await input1.push(input);

      ct[i] = input1[i][0].reduce(function (a, b) {
        if (b.Average > b.UCL + (b.UCL - b.CL) / 3) {
          return (
            a +
            // `<tr style="color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LSL +
            "</a></td><td>" +
            b.USL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</a></td><td>" +
            b.Base_Supplier +
            "</td><td>"
          );
        }
        if (b.Average < b.LCL - (b.CL - b.LCL) / 3) {
          return (
            a +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LSL +
            "</a></td><td>" +
            b.USL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</a></td><td>" +
            b.Base_Supplier +
            "</td><td>"
          );
        } else {
          return (
            a +
            // `<tr style="background-color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            `</a></td><td>` +
            b.Average +
            `</a></td><td>` +
            b.LSL +
            "</a></td><td>" +
            b.USL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</a></td><td>" +
            b.Base_Supplier +
            "</td><td>"
          );
        }
      }, "");
    }

    // console.log(input1);
    // var excelFileMaster = `D:\Project\EWMS parameter out of control.xlsx`;

    // let xlsMaster = await json2xls(input[0]);
    // await fs.writeFileSync(excelFileMaster, xlsMaster, "binary");

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      // to: "BPT3542@minebea,", //BPT0896 พี่แป้ง //BPT5826 พี่นัท
      to: "BPT3542@minebea, patthanan.c@minebea.co.th, BPT0896@minebea, BPT5826@minebea, ",
      subject:
        "Cimarron 5D/ Cimarron BP 5D Dynamic dimention on " +
        datetime3 +
        " - " +
        datetime4 +
        " Out of Control", // Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='salmon' >" +
        "<br/><b><h2> Customer KPOV Out of Control Limit on Dynamic dimension every 2 hours</b></h2>" +
        "<font face='Segoe UI' color='#FF2E2E' >" +
        "<b><h4> Red highlights indicate 4 sigma out of control limit.</b></h4>" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Date</th> <th width='100px'>Model</th> <th width='100px'>Line</th> <th width='100px'>Average</th> <th width='100px'>LSL</th> <th width='100px'>USL</th> <th width='100px'>Machine</th> <th width='100px'>Parameter</th> <th width='100px'>Base Supplier</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        ct[0] +
        ct[1] +
        ct[2] +
        "</td></tr></tbody>" +
        "</table> </font>",
      // attachments: [
      //   {
      //     filename: "EWMS parameter out of control" + ".xlsx",
      //     content: fs.createReadStream(excelFileMaster),
      //   },
      // ],
    };

    for (let i = 0; i < param.length; i++) {
      if (input1[i][1] !== 0) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        break;
      }
    }
  });

  // Rotor fac2
  cron.schedule("*/60 * * * *", async () => {
    var input1 = [];
    var ct = [];

    let datetime = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:00:00");
    let datetime2 = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:59:59");

    //For email UX
    let datetime3 = await moment()
      .subtract(1, "hours")
      .format("DD-MM-YY HH:00");
    let datetime4 = await moment().subtract(1, "hours").format("HH:59");

    let param = ["Set_Dim", [Axial_Play], [Oil_Top], [Oil_Bottom]];
    for (let i = 0; i < param.length; i++) {
      parameter = param[i];
      console.log(parameter);
      var input = await DataShow.sequelize.query(
        `select CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as [Date]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] as [Model]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line] as [Line]
                    ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) + ':00' as [Time]
                    ,cast(AVG([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}]) as decimal(10,3)) as [Average]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL] as [LCL]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL] as [UCL]
                    ,[TransportData].[dbo].[Master_matchings].[USL] as [USL]
                    ,[TransportData].[dbo].[Master_matchings].[CL] as [CL]
                    ,[TransportData].[dbo].[Master_matchings].[LSL] as [LSL]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Machine_no] as [Machine]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter] as [Parameter]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL_STD] as [LCL_STD]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL_STD] as [UCL_STD]
                    FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
                    INNER JOIN [TransportData].[dbo].[Master_matchings]
                    ON [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].Model = [TransportData].[dbo].[Master_matchings].Model
                    INNER JOIN [TransportData].[dbo].[ControlSpecs]
                    ON [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[ControlSpecs].[Model]
                    and [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line] = [TransportData].[dbo].[ControlSpecs].[Line]
                    and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlSpecs].[Parameter]
                    where [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time] between '${datetime}' and '${datetime2}'
                    and [TransportData].[dbo].[ControlSpecs].[Parameter] = '${parameter}'
                          
                    group by cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar)
                    ,CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time])
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Machine_no]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL] 
                    ,[TransportData].[dbo].[Master_matchings].[USL]
                    ,[TransportData].[dbo].[Master_matchings].[CL]
                    ,[TransportData].[dbo].[Master_matchings].[LSL]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL_STD]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL_STD]
                    having (cast(AVG(case when ([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
                    and ([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
                    then [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] end) as decimal(10,3))) < [TransportData].[dbo].[ControlSpecs].[LCL]
                    or cast(AVG([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}]) as decimal(10,3)) > [TransportData].[dbo].[ControlSpecs].[UCL]
                    count([${parameter}]) > 20
                    order by
                    [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter]
                    ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) + 0 desc`
      );

      console.log(input);
      console.log(input[0].length);

      //insert into SQL
      for (let i = 0; i < input[0].length; i++) {
        //Datetime = input[0][i].Date;
        Model = input[0][i].Model;
        Line = input[0][i].Line;
        //Time = input[0][i].Time;
        Average = input[0][i].Average;
        LCL = input[0][i].LCL;
        UCL = input[0][i].UCL;
        Machine = input[0][i].Machine;
        Parameter = input[0][i].Parameter;
        createdAt = moment().format();
        updatedAt = moment().format();
        try {
          let result = await AutoAlarms.sequelize
            .query(`INSERT INTO [TransportData].[dbo].[AutoAlarms]
                            VALUES('${Model}','${Line}','${Average}','${LCL}','${UCL}','${Machine}','${Parameter}','${createdAt}','${updatedAt}');`);
          console.log(result);
        } catch (error) {
          console.log(error);
          res.json({
            error,
            api_result: "nok",
          });
        }
      }

      // console.log(input);
      await input1.push(input);

      ct[i] = input1[i][0].reduce(function (a, b) {
        if (b.Average > b.UCL + (b.UCL - b.CL) / 3) {
          return (
            a +
            // `<tr style="color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
        if (b.Average < b.LCL - (b.CL - b.LCL) / 3) {
          return (
            a +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        } else {
          return (
            a +
            // `<tr style="background-color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td>` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
      }, "");
    }

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      // to: "BPT3542@minebea, ", //BPT1080 พี่ฝนQC //BPT4804 น้องแมท //BPT3258 แอน //BPB2085 พี่รุ่งQC //BPT1481 พี่หลิน //BPT0645 พี่กล้วย //BPT1377 พี่เน
      to: "BPT1481@minebea, BPT1377@minebea, apichart.s@minebea.co.th, apisit.s@minebea.co.th, chusak.c@minebea.co.th, nmorimot@minebea.co.th, sayan.m@minebea.co.th,", // list of receivers
      cc: "plertbun@minebea.co.th, mmueller@minebea.co.th, svicharn@minebea.co.th, ktakenouchi@minebeamitsumi.com, haruethai.k@minebea.co.th, pakin.k@minebea.co.th, BPT3258@minebea, wilaiwan.u@minebea.co.th, jakrapong.r@minebea.co.th, rbanayo@minebea.co.th, rmahendran@minebea.co.th",
      subject:
        "Dynamic dimension on " +
        datetime3 +
        " - " +
        datetime4 +
        " Out of Control", // Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='salmon' >" +
        "<br/><b><h2> Out of Control Limit on Dynamic dimension</b></h2>" +
        "<font face='Segoe UI' color='#FF2E2E' >" +
        "<b><h4> Red highlights indicate 4 sigma out of control limit.</b></h4>" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Date</th> <th width='100px'>Model</th> <th width='100px'>Line</th> <th width='100px'>Time</th> <th width='100px'>Average</th> <th width='100px'>LCL</th> <th width='100px'>UCL</th> <th width='100px'>Machine</th> <th width='100px'>Parameter</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        ct[0] +
        ct[1] +
        ct[2] +
        "</td></tr></tbody>" +
        "</table> </font>",
    };

    for (let i = 0; i < param.length; i++) {
      if (input1[i][1] !== 0) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        break;
      }
    }
  });

  // Dyn
  cron.schedule("*/60 * * * *", async () => {
    var input1 = [];
    var ct = [];

    let datetime = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:00:00");
    let datetime2 = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:59:59");

    //For email UX
    let datetime3 = await moment()
      .subtract(1, "hours")
      .format("DD-MM-YY HH:00");
    let datetime4 = await moment().subtract(1, "hours").format("HH:59");

    let param = [
      "Set_Dim",
      "Ramp_to_Datum",
      "Parallelism",
      "Pivot_Height",
      "FlyHeight",
      "Projection1",
      "Ramp_Pivot",
    ];
    for (let i = 0; i < param.length; i++) {
      parameter = param[i];
      console.log(parameter);
      var input = await DataShow.sequelize.query(
        `select CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as [Date]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] as [Model]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line] as [Line]
                    ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) + ':00' as [Time]
                    ,cast(AVG([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}]) as decimal(10,3)) as [Average]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL] as [LCL]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL] as [UCL]
                    ,[TransportData].[dbo].[Master_matchings].[USL] as [USL]
                    ,[TransportData].[dbo].[Master_matchings].[CL] as [CL]
                    ,[TransportData].[dbo].[Master_matchings].[LSL] as [LSL]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Machine_no] as [Machine]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter] as [Parameter]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL_STD] as [LCL_STD]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL_STD] as [UCL_STD]
                    FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
                    INNER JOIN [TransportData].[dbo].[Master_matchings]
                    ON [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].Model = [TransportData].[dbo].[Master_matchings].Model
                    INNER JOIN [TransportData].[dbo].[ControlSpecs]
                    ON [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[ControlSpecs].[Model]
                    and [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line] = [TransportData].[dbo].[ControlSpecs].[Line]
                    and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlSpecs].[Parameter]
                    where [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time] between '${datetime}' and '${datetime2}'
                    and [TransportData].[dbo].[ControlSpecs].[Parameter] = '${parameter}'
                          
                    group by cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar)
                    ,CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time])
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Machine_no]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL] 
                    ,[TransportData].[dbo].[Master_matchings].[USL]
                    ,[TransportData].[dbo].[Master_matchings].[CL]
                    ,[TransportData].[dbo].[Master_matchings].[LSL]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL_STD]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL_STD]
                    having (cast(AVG(case when ([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
                    and ([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
                    then [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] end) as decimal(10,3))) < [TransportData].[dbo].[ControlSpecs].[LCL]
                    or cast(AVG([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}]) as decimal(10,3)) > [TransportData].[dbo].[ControlSpecs].[UCL]
                    count([${parameter}]) > 20
                    order by
                    [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model]
                    ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter]
                    ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) + 0 desc`
      );

      console.log(input);
      console.log(input[0].length);

      //insert into SQL
      for (let i = 0; i < input[0].length; i++) {
        //Datetime = input[0][i].Date;
        Model = input[0][i].Model;
        Line = input[0][i].Line;
        //Time = input[0][i].Time;
        Average = input[0][i].Average;
        LCL = input[0][i].LCL;
        UCL = input[0][i].UCL;
        Machine = input[0][i].Machine;
        Parameter = input[0][i].Parameter;
        createdAt = moment().format();
        updatedAt = moment().format();
        try {
          let result = await AutoAlarms.sequelize
            .query(`INSERT INTO [TransportData].[dbo].[AutoAlarms]
                            VALUES('${Model}','${Line}','${Average}','${LCL}','${UCL}','${Machine}','${Parameter}','${createdAt}','${updatedAt}');`);
          console.log(result);
        } catch (error) {
          console.log(error);
          res.json({
            error,
            api_result: "nok",
          });
        }
      }

      // console.log(input);
      await input1.push(input);

      ct[i] = input1[i][0].reduce(function (a, b) {
        if (b.Average > b.UCL + (b.UCL - b.CL) / 3) {
          return (
            a +
            // `<tr style="color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
        if (b.Average < b.LCL - (b.CL - b.LCL) / 3) {
          return (
            a +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        } else {
          return (
            a +
            // `<tr style="background-color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td>` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
      }, "");
    }

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      // to: "BPT3542@minebea, ", //BPT1080 พี่ฝนQC //BPT4804 น้องแมท //BPT3258 แอน //BPB2085 พี่รุ่งQC //BPT1481 พี่หลิน //BPT0645 พี่กล้วย //BPT1377 พี่เน
      to: "BPT1481@minebea, BPT1377@minebea, apichart.s@minebea.co.th, apisit.s@minebea.co.th, chusak.c@minebea.co.th, nmorimot@minebea.co.th, sayan.m@minebea.co.th,", // list of receivers
      cc: "plertbun@minebea.co.th, mmueller@minebea.co.th, svicharn@minebea.co.th, ktakenouchi@minebeamitsumi.com, haruethai.k@minebea.co.th, pakin.k@minebea.co.th, BPT3258@minebea, wilaiwan.u@minebea.co.th, jakrapong.r@minebea.co.th, rbanayo@minebea.co.th, rmahendran@minebea.co.th",
      subject:
        "Dynamic dimension on " +
        datetime3 +
        " - " +
        datetime4 +
        " Out of Control", // Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='salmon' >" +
        "<br/><b><h2> Out of Control Limit on Dynamic dimension</b></h2>" +
        "<font face='Segoe UI' color='#FF2E2E' >" +
        "<b><h4> Red highlights indicate 4 sigma out of control limit.</b></h4>" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Date</th> <th width='100px'>Model</th> <th width='100px'>Line</th> <th width='100px'>Time</th> <th width='100px'>Average</th> <th width='100px'>LCL</th> <th width='100px'>UCL</th> <th width='100px'>Machine</th> <th width='100px'>Parameter</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        ct[0] +
        ct[1] +
        ct[2] +
        ct[3] +
        ct[4] +
        ct[5] +
        ct[6] +
        "</td></tr></tbody>" +
        "</table> </font>",
    };

    for (let i = 0; i < param.length; i++) {
      if (input1[i][1] !== 0) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        break;
      }
    }
  });

  // Dyn PFH
  cron.schedule("*/60 * * * *", async () => {
    var input1 = [];
    var ct = [];

    let datetime = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:00:00");
    let datetime2 = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:59:59");

    //For email UX
    let datetime3 = await moment()
      .subtract(1, "hours")
      .format("DD-MM-YY HH:00");
    let datetime4 = await moment().subtract(1, "hours").format("HH:59");

    let param = ["Projection1"];

    for (let i = 0; i < param.length; i++) {
      parameter = param[i];
      console.log(parameter);
      var input = await DataShow.sequelize.query(
        `select CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as [Date]
        ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] as [Model]
        ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line] as [Line]
        ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) + ':00' as [Time]
        ,cast(AVG([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}]) as decimal(10,3)) as [Average]
        ,[TransportData].[dbo].[ControlSpecs].[LCL] as [LCL]
        ,[TransportData].[dbo].[ControlSpecs].[UCL] as [UCL]
        ,[TransportData].[dbo].[Master_matchings].[USL] as [USL]
        ,[TransportData].[dbo].[Master_matchings].[CL] as [CL]
        ,[TransportData].[dbo].[Master_matchings].[LSL] as [LSL]
        ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Machine_no] as [Machine]
        ,[TransportData].[dbo].[Master_matchings].[Parameter] as [Parameter]
        ,[TransportData].[dbo].[ControlSpecs].[LCL_STD] as [LCL_STD]
        ,[TransportData].[dbo].[ControlSpecs].[UCL_STD] as [UCL_STD]
        FROM [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester]
        INNER JOIN [TransportData].[dbo].[Master_matchings]
        ON [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].Model = [TransportData].[dbo].[Master_matchings].Model
        INNER JOIN [TransportData].[dbo].[ControlSpecs]
        ON [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model] = [TransportData].[dbo].[ControlSpecs].[Model]
        and [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line] = [TransportData].[dbo].[ControlSpecs].[Line]
        and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlSpecs].[Parameter]
        where [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time] between '${datetime}' and '${datetime2}'
        and [TransportData].[dbo].[ControlSpecs].[Parameter] = '${parameter}'
              
        group by cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar)
        ,CONVERT(DATE,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time])
        ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model]
        ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line]
        ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Machine_no]
        ,[TransportData].[dbo].[Master_matchings].[Parameter]
        ,[TransportData].[dbo].[ControlSpecs].[LCL]
        ,[TransportData].[dbo].[ControlSpecs].[UCL] 
        ,[TransportData].[dbo].[Master_matchings].[USL]
        ,[TransportData].[dbo].[Master_matchings].[CL]
        ,[TransportData].[dbo].[Master_matchings].[LSL]
        ,[TransportData].[dbo].[ControlSpecs].[LCL_STD]
        ,[TransportData].[dbo].[ControlSpecs].[UCL_STD]
        having (cast(AVG(case when ([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
        and ([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
        then [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] end) as decimal(10,3))) < [TransportData].[dbo].[ControlSpecs].[LCL]
        or cast(AVG([Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[${parameter}]) as decimal(10,3)) > [TransportData].[dbo].[ControlSpecs].[UCL]
        count([${parameter}]) > 20
        order by
        [Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Model]
        ,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Line]
        ,[TransportData].[dbo].[Master_matchings].[Parameter]
        ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dynamic_Parallelism_Tester].[Time]) as varchar) + 0 desc`
      );

      console.log(input);
      console.log(input[0].length);

      //insert into SQL
      for (let i = 0; i < input[0].length; i++) {
        //Datetime = input[0][i].Date;
        Model = input[0][i].Model;
        Line = input[0][i].Line;
        //Time = input[0][i].Time;
        Average = input[0][i].Average;
        LCL = input[0][i].LCL;
        UCL = input[0][i].UCL;
        Machine = input[0][i].Machine;
        Parameter = input[0][i].Parameter;
        createdAt = moment().format();
        updatedAt = moment().format();
        try {
          let result = await AutoAlarms.sequelize
            .query(`INSERT INTO [TransportData].[dbo].[AutoAlarms]
                          VALUES('${Model}','${Line}','${Average}','${LCL}','${UCL}','${Machine}','${Parameter}','${createdAt}','${updatedAt}');`);
          console.log(result);
        } catch (error) {
          console.log(error);
          res.json({
            error,
            api_result: "nok",
          });
        }
      }

      // console.log(input);
      await input1.push(input);

      ct[i] = input1[i][0].reduce(function (a, b) {
        if (b.Average > b.UCL + (b.UCL - b.CL) / 3) {
          return (
            a +
            // `<tr style="color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
        if (b.Average < b.LCL - (b.CL - b.LCL) / 3) {
          return (
            a +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        } else {
          return (
            a +
            // `<tr style="background-color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td>` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
      }, "");
    }

    // console.log(input1);
    // var excelFileMaster = `D:\Project\EWMS parameter out of control.xlsx`;

    // let xlsMaster = await json2xls(input[0]);
    // await fs.writeFileSync(excelFileMaster, xlsMaster, "binary");

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      // to: "BPT3542@minebea ", //BPT1080 พี่ฝนQC //BPT4804 น้องแมท //BPT3258 แอน //BPB2085 พี่รุ่งQC //BPT1481 พี่หลิน //BPT0645 พี่กล้วย //BPT1377 พี่เน
      to: "mmueller@minebea.co.th, svicharn@minebea.co.th, haruethai.k@minebea.co.th, pakin.k@minebea.co.th, ktakenouchi@minebeamitsumi.com, apisit.s@minebea.co.th, chusak.c@minebea.co.th, nmorimot@minebea.co.th,",
      // to: "BPT1481@minebea, BPT1377@minebea, apichart.s@minebea.co.th, apisit.s@minebea.co.th, chusak.c@minebea.co.th, nmorimot@minebea.co.th, sayan.m@minebea.co.th,", // list of receivers
      // cc: "plertbun@minebea.co.th, mmueller@minebea.co.th, svicharn@minebea.co.th, ktakenouchi@minebeamitsumi.com, haruethai.k@minebea.co.th, pakin.k@minebea.co.th, BPT3258@minebea, wilaiwan.u@minebea.co.th, jakrapong.r@minebea.co.th, rbanayo@minebea.co.th, rmahendran@minebea.co.th",
      subject:
        "FCC Design Projection Flange Height on " +
        datetime3 +
        " - " +
        datetime4 +
        " Out of Control", // Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='salmon' >" +
        "<br/><b><h2> Customer KPOV Out of Control Limit on FCC Design Projection Flange Height</b></h2>" +
        "<font face='Segoe UI' color='#FF2E2E' >" +
        "<b><h4> Red highlights indicate 4 sigma out of control limit.</b></h4>" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Date</th> <th width='100px'>Model</th> <th width='100px'>Line</th> <th width='100px'>Time</th> <th width='100px'>Average</th> <th width='100px'>LCL</th> <th width='100px'>UCL</th> <th width='100px'>Machine</th> <th width='100px'>Parameter</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        ct[0] +
        "</td></tr></tbody>" +
        "</table> </font>",
      // attachments: [
      //   {
      //     filename: "EWMS parameter out of control" + ".xlsx",
      //     content: fs.createReadStream(excelFileMaster),
      //   },
      // ],
    };

    for (let i = 0; i < param.length; i++) {
      if (input1[i][1] !== 0) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        break;
      }
    }
  });

  // Static dimension
  cron.schedule("*/60 * * * *", async () => {
    var input1 = [];
    var ct = [];
    //let realtime = await moment().format("yyyy-MM-DD");
    let datetime = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:00:00");
    let datetime2 = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:59:59");

    //For email UX
    let datetime3 = await moment()
      .subtract(1, "hours")
      .format("DD-MM-YY HH:00");
    let datetime4 = await moment().subtract(1, "hours").format("HH:59");

    let param = [
      "Set_Dimension_Stack",
      "Set_Dimension_Attractive",
      "Parallelism_Stack",
      "Parallelism_Attractive",
    ];
    for (let i = 0; i < param.length; i++) {
      parameter = param[i];
      console.log(parameter);
      if (
        parameter == "Set_Dimension_Stack" ||
        parameter == "Set_Dimension_Attractive"
      ) {
        var input = await DataShow.sequelize.query(
          `select CONVERT(DATE,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as [Date]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Model] as [Model]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Line] as [Line]
                ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as varchar) + ':00' as [Time]
                ,cast(AVG([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}]) as decimal(10,3)) as [Average]
                ,[TransportData].[dbo].[ControlSpecs].[LCL] as [LCL]
                ,[TransportData].[dbo].[ControlSpecs].[UCL] as [UCL]
                ,[TransportData].[dbo].[Master_matchings].[USL] as [USL]
                ,[TransportData].[dbo].[Master_matchings].[CL] as [CL]
                ,[TransportData].[dbo].[Master_matchings].[LSL] as [LSL]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Machine_no] as [Machine]
                ,[TransportData].[dbo].[Master_matchings].[Parameter] as [Parameter]
                ,[TransportData].[dbo].[ControlSpecs].[LCL_STD] as [LCL_STD]
                ,[TransportData].[dbo].[ControlSpecs].[UCL_STD] as [UCL_STD]
                FROM [Temp_TransportData].[dbo].[Dimension_WR]
                INNER JOIN [TransportData].[dbo].[Master_matchings]
                ON [Temp_TransportData].[dbo].[Dimension_WR].Model = [TransportData].[dbo].[Master_matchings].Model
                INNER JOIN [TransportData].[dbo].[ControlSpecs]
                ON [Temp_TransportData].[dbo].[Dimension_WR].[Model] = [TransportData].[dbo].[ControlSpecs].[Model]
                and [Temp_TransportData].[dbo].[Dimension_WR].[Line] = [TransportData].[dbo].[ControlSpecs].[Line]
                and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlSpecs].[Parameter]
                where [Temp_TransportData].[dbo].[Dimension_WR].[Time] between '${datetime}' and '${datetime2}'
                and [TransportData].[dbo].[ControlSpecs].[Parameter] = '${parameter}'
                      
                group by cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as varchar)
                ,CONVERT(DATE,[Temp_TransportData].[dbo].[Dimension_WR].[Time])
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Model]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Line]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Machine_no]
                ,[TransportData].[dbo].[Master_matchings].[Parameter]
                ,[TransportData].[dbo].[ControlSpecs].[LCL]
                ,[TransportData].[dbo].[ControlSpecs].[UCL] 
                ,[TransportData].[dbo].[Master_matchings].[USL]
                ,[TransportData].[dbo].[Master_matchings].[CL]
                ,[TransportData].[dbo].[Master_matchings].[LSL]
                ,[TransportData].[dbo].[ControlSpecs].[LCL_STD]
                ,[TransportData].[dbo].[ControlSpecs].[UCL_STD]
                having (cast(AVG(case when ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
                and ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
                then [Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] end) as decimal(10,3))) < [TransportData].[dbo].[ControlSpecs].[LCL]
                or cast(AVG([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}]) as decimal(10,3)) > [TransportData].[dbo].[ControlSpecs].[UCL]
                count([${parameter}]) > 20
                order by
                [Temp_TransportData].[dbo].[Dimension_WR].[Model]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Line]
                ,[TransportData].[dbo].[Master_matchings].[Parameter]
                ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as varchar) + 0 desc`
        );

        console.log(input);
        console.log(input[0].length);

        //insert into SQL
        for (let i = 0; i < input[0].length; i++) {
          //Datetime = input[0][i].Date;
          Model = input[0][i].Model;
          Line = input[0][i].Line;
          //Time = input[0][i].Time;
          Average = input[0][i].Average;
          LCL = input[0][i].LCL;
          UCL = input[0][i].UCL;
          Machine = input[0][i].Machine;
          Parameter = input[0][i].Parameter;
          createdAt = moment().format();
          updatedAt = moment().format();
          try {
            let result = await AutoAlarms.sequelize
              .query(`INSERT INTO [TransportData].[dbo].[AutoAlarms]
                        VALUES('${Model}','${Line}','${Average}','${LCL}','${UCL}','${Machine}','${Parameter}','${createdAt}','${updatedAt}');`);
            console.log(result);
          } catch (error) {
            console.log(error);
            res.json({
              error,
              api_result: "nok",
            });
          }
        }
      }
      if (
        parameter == "Parallelism_Stack" ||
        parameter == "Parallelism_Attractive"
      ) {
        var input = await DataShow.sequelize.query(
          `select CONVERT(DATE,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as [Date]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Model] as [Model]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Line] as [Line]
                ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as varchar) + ':00' as [Time]
                ,cast(AVG([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}]) as decimal(10,3)) as [Average]
                ,'-' as [LCL]
                ,[TransportData].[dbo].[ControlSpecs].[UCL] as [UCL]
                ,[TransportData].[dbo].[Master_matchings].[USL] as [USL]
                ,'-' as [CL]
                ,'-' as [LSL]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Machine_no] as [Machine]
                ,[TransportData].[dbo].[Master_matchings].[Parameter] as [Parameter]
                ,'-' as [LCL_STD]
                ,[TransportData].[dbo].[ControlSpecs].[UCL_STD] as [UCL_STD]
                FROM [Temp_TransportData].[dbo].[Dimension_WR]
                INNER JOIN [TransportData].[dbo].[Master_matchings]
                ON [Temp_TransportData].[dbo].[Dimension_WR].Model = [TransportData].[dbo].[Master_matchings].Model
                INNER JOIN [TransportData].[dbo].[ControlSpecs]
                ON [Temp_TransportData].[dbo].[Dimension_WR].[Model] = [TransportData].[dbo].[ControlSpecs].[Model]
                and [Temp_TransportData].[dbo].[Dimension_WR].[Line] = [TransportData].[dbo].[ControlSpecs].[Line]
                and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlSpecs].[Parameter]
                where [Temp_TransportData].[dbo].[Dimension_WR].[Time] between '${datetime}' and '${datetime2}'
                and [TransportData].[dbo].[ControlSpecs].[Parameter] = '${parameter}'
                      
                group by cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as varchar)
                ,CONVERT(DATE,[Temp_TransportData].[dbo].[Dimension_WR].[Time])
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Model]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Line]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Machine_no]
                ,[TransportData].[dbo].[Master_matchings].[Parameter]
                ,[TransportData].[dbo].[ControlSpecs].[LCL]
                ,[TransportData].[dbo].[ControlSpecs].[UCL] 
                ,[TransportData].[dbo].[Master_matchings].[USL]
                ,[TransportData].[dbo].[Master_matchings].[CL]
                ,[TransportData].[dbo].[Master_matchings].[LSL]
                ,[TransportData].[dbo].[ControlSpecs].[LCL_STD]
                ,[TransportData].[dbo].[ControlSpecs].[UCL_STD]
                having (cast(AVG(case when ([Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL)
                then [Temp_TransportData].[dbo].[Dimension_WR].[${parameter}] end) as decimal(10,3))) > [TransportData].[dbo].[ControlSpecs].[UCL]
                order by
                [Temp_TransportData].[dbo].[Dimension_WR].[Model]
                ,[Temp_TransportData].[dbo].[Dimension_WR].[Line]
                ,[TransportData].[dbo].[Master_matchings].[Parameter]
                ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Dimension_WR].[Time]) as varchar) + 0 desc`
        );

        //insert into SQL
        for (let i = 0; i < input[0].length; i++) {
          //Datetime = input[0][i].Date;
          Model = input[0][i].Model;
          Line = input[0][i].Line;
          //Time = input[0][i].Time;
          Average = input[0][i].Average;
          LCL = 0;
          UCL = input[0][i].UCL;
          Machine = input[0][i].Machine;
          Parameter = input[0][i].Parameter;
          createdAt = moment().format();
          updatedAt = moment().format();
          try {
            let result = await AutoAlarms.sequelize
              .query(`INSERT INTO [TransportData].[dbo].[AutoAlarms]
                        VALUES('${Model}','${Line}','${Average}','${LCL}','${UCL}','${Machine}','${Parameter}','${createdAt}','${updatedAt}');`);
            console.log(result);
          } catch (error) {
            console.log(error);
            res.json({
              error,
              api_result: "nok",
            });
          }
        }
      }
      // console.log(input);
      await input1.push(input);

      ct[i] = input1[i][0].reduce(function (a, b) {
        if (b.Average > b.UCL + (b.UCL - b.CL) / 3) {
          return (
            a +
            // `<tr style="color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }

        if (b.Average < b.LCL - (b.CL - b.LCL) / 3) {
          return (
            a +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        } else {
          return (
            a +
            // `<tr style="background-color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td>` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
      }, "");
    }

    // console.log(input1);
    // var excelFileMaster = `D:\Project\Static dimension parameter out of control.xlsx`;

    // let xlsMaster = await json2xls(input[0]);
    // await fs.writeFileSync(excelFileMaster, xlsMaster, "binary");

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      // to: "BPT3542@minebea, ", //BPT1080 พี่ฝนQC //BPT4804 น้องแมท //BPT3258 แอน //BPB2085 พี่รุ่งQC //BPT1481 พี่หลิน //BPT0645 พี่กล้วย //BPT1377 พี่เน
      to: "BPT1080@minebea, BPT4804@minebea, BPT1481@minebea, apichart.s@minebea.co.th, apisit.s@minebea.co.th, chusak.c@minebea.co.th, nmorimot@minebea.co.th, sayan.m@minebea.co.th,", // list of receivers
      cc: "plertbun@minebea.co.th, mmueller@minebea.co.th, svicharn@minebea.co.th, ktakenouchi@minebeamitsumi.com, haruethai.k@minebea.co.th, pakin.k@minebea.co.th, BPT3258@minebea, wilaiwan.u@minebea.co.th, jakrapong.r@minebea.co.th, rbanayo@minebea.co.th, rmahendran@minebea.co.th",
      subject:
        "Static Dimension on " +
        datetime3 +
        " - " +
        datetime4 +
        " Out of Control", // Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='salmon' >" +
        "<br/><b><h2> Out of Control Limit on Static Dimension</b></h2>" +
        "<font face='Segoe UI' color='#FF2E2E' >" +
        "<b><h4> Red highlights indicate 4 sigma out of control limit.</b></h4>" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Date</th> <th width='100px'>Model</th> <th width='100px'>Line</th> <th width='100px'>Time</th> <th width='100px'>Average</th> <th width='100px'>LCL</th> <th width='100px'>UCL</th> <th width='100px'>Machine</th> <th width='100px'>Parameter</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        ct[0] +
        ct[1] +
        ct[2] +
        ct[3] +
        "</td></tr></tbody>" +
        "</table> </font>",
      // attachments: [
      //   {
      //     filename: "Static dimension parameter out of control" + ".xlsx",
      //     content: fs.createReadStream(excelFileMaster),
      //   },
      // ],
    };

    for (let i = 0; i < param.length; i++) {
      if (input1[i][1] !== 0) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        break;
      }
    }
  });

  // Hipot
  cron.schedule("*/60 * * * *", async () => {
    var input1 = [];
    var ct = [];

    let datetime = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:00:00");
    let datetime2 = await moment()
      .subtract(1, "hours")
      .format("YYYY-MM-DD HH:59:59");

    //For email UX
    let datetime3 = await moment()
      .subtract(1, "hours")
      .format("DD-MM-YY HH:00");
    let datetime4 = await moment().subtract(1, "hours").format("HH:59");

    let param = ["R1_UV", "R2_UW", "R3_VW", "R_max_min"];
    for (let i = 0; i < param.length; i++) {
      parameter = param[i];
      console.log(parameter);
      var input = await DataShow.sequelize.query(
        `select CONVERT(DATE,[Temp_TransportData].[dbo].[Hipot].[Time]) as [Date]
                    ,[Temp_TransportData].[dbo].[Hipot].[Model] as [Model]
                    ,[Temp_TransportData].[dbo].[Hipot].[Line] as [Line]
                    ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Hipot].[Time]) as varchar) + ':00' as [Time]
                    ,cast(AVG(case when [Temp_TransportData].[dbo].[Hipot].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL]
                    and [Temp_TransportData].[dbo].[Hipot].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL]
                    then [Temp_TransportData].[dbo].[Hipot].[${parameter}] end) as decimal(10,3)) as [Average]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL] as [LCL]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL] as [UCL]
                    ,[TransportData].[dbo].[Master_matchings].[USL] as [USL]
                    ,[TransportData].[dbo].[Master_matchings].[CL] as [CL]
                    ,[TransportData].[dbo].[Master_matchings].[LSL] as [LSL]
                    ,[Temp_TransportData].[dbo].[Hipot].[Machine_no] as [Machine]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter] as [Parameter]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL_STD] as [LCL_STD]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL_STD] as [UCL_STD]
                    FROM [Temp_TransportData].[dbo].[Hipot]
                    INNER JOIN [TransportData].[dbo].[Master_matchings]
                    ON [Temp_TransportData].[dbo].[Hipot].Model = [TransportData].[dbo].[Master_matchings].Model
                    INNER JOIN [TransportData].[dbo].[ControlSpecs]
                    ON [Temp_TransportData].[dbo].[Hipot].[Model] = [TransportData].[dbo].[ControlSpecs].[Model]
                    and [Temp_TransportData].[dbo].[Hipot].[Line] = [TransportData].[dbo].[ControlSpecs].[Line]
                    and [TransportData].[dbo].[Master_matchings].[Parameter] = [TransportData].[dbo].[ControlSpecs].[Parameter]
                    where [Temp_TransportData].[dbo].[Hipot].[Time] between '${datetime}' and '${datetime2}'
                    and [TransportData].[dbo].[ControlSpecs].[Parameter] = '${parameter}'
                          
                    group by cast(DATEPART(hour,[Temp_TransportData].[dbo].[Hipot].[Time]) as varchar)
                    ,CONVERT(DATE,[Temp_TransportData].[dbo].[Hipot].[Time])
                    ,[Temp_TransportData].[dbo].[Hipot].[Model]
                    ,[Temp_TransportData].[dbo].[Hipot].[Line]
                    ,[Temp_TransportData].[dbo].[Hipot].[Machine_no]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL] 
                    ,[TransportData].[dbo].[Master_matchings].[USL]
                    ,[TransportData].[dbo].[Master_matchings].[CL]
                    ,[TransportData].[dbo].[Master_matchings].[LSL]
                    ,[TransportData].[dbo].[ControlSpecs].[LCL_STD]
                    ,[TransportData].[dbo].[ControlSpecs].[UCL_STD]
                    having (cast(AVG(case when ([Temp_TransportData].[dbo].[Hipot].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
                    and ([Temp_TransportData].[dbo].[Hipot].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
                    then [Temp_TransportData].[dbo].[Hipot].[${parameter}] end) as decimal(10,3))) < [TransportData].[dbo].[ControlSpecs].[LCL]
                    or (cast(AVG(case when ([Temp_TransportData].[dbo].[Hipot].[${parameter}] > [TransportData].[dbo].[Master_matchings].LSL)
                    and ([Temp_TransportData].[dbo].[Hipot].[${parameter}] < [TransportData].[dbo].[Master_matchings].USL) 
                    then [Temp_TransportData].[dbo].[Hipot].[${parameter}] end) as decimal(10,3))) > [TransportData].[dbo].[ControlSpecs].[UCL]
                    count([${parameter}]) > 20
                    order by
                    [Temp_TransportData].[dbo].[Hipot].[Model]
                    ,[Temp_TransportData].[dbo].[Hipot].[Line]
                    ,[TransportData].[dbo].[Master_matchings].[Parameter]
                    ,cast(DATEPART(hour,[Temp_TransportData].[dbo].[Hipot].[Time]) as varchar) + 0 desc`
      );

      console.log(input);
      console.log(input[0].length);

      //insert into SQL
      for (let i = 0; i < input[0].length; i++) {
        //Datetime = input[0][i].Date;
        Model = input[0][i].Model;
        Line = input[0][i].Line;
        //Time = input[0][i].Time;
        Average = input[0][i].Average;
        LCL = input[0][i].LCL;
        UCL = input[0][i].UCL;
        Machine = input[0][i].Machine;
        Parameter = input[0][i].Parameter;
        createdAt = moment().format();
        updatedAt = moment().format();
        try {
          let result = await AutoAlarms.sequelize
            .query(`INSERT INTO [TransportData].[dbo].[AutoAlarms]
                            VALUES('${Model}','${Line}','${Average}','${LCL}','${UCL}','${Machine}','${Parameter}','${createdAt}','${updatedAt}');`);
          console.log(result);
        } catch (error) {
          console.log(error);
          res.json({
            error,
            api_result: "nok",
          });
        }
      }

      // console.log(input);
      await input1.push(input);

      ct[i] = input1[i][0].reduce(function (a, b) {
        if (b.Average > b.UCL + (b.UCL - b.CL) / 3) {
          return (
            a +
            // `<tr style="color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
        if (b.Average < b.LCL - (b.CL - b.LCL) / 3) {
          return (
            a +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td style="background-color:#FF2E2E">` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        } else {
          return (
            a +
            // `<tr style="background-color:#FF0000"><td>` +
            "<tr><td>" +
            b.Date +
            "</a></td><td>" +
            b.Model +
            "</a></td><td>" +
            b.Line +
            "</a></td><td>" +
            b.Time +
            `</a></td><td>` +
            b.Average +
            `</a></td><td>` +
            b.LCL +
            "</a></td><td>" +
            b.UCL +
            "</a></td><td>" +
            b.Machine +
            "</a></td><td>" +
            b.Parameter +
            "</td><td>"
          );
        }
      }, "");
    }

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      // to: "BPT3542@minebea, ", //BPT1080 พี่ฝนQC //BPT4804 น้องแมท //BPT3258 แอน //BPB2085 พี่รุ่งQC //BPT1481 พี่หลิน //BPT0645 พี่กล้วย //BPT1377 พี่เน
      to: "BPT1481@minebea, BPT1377@minebea, apichart.s@minebea.co.th, apisit.s@minebea.co.th, chusak.c@minebea.co.th, nmorimot@minebea.co.th, sayan.m@minebea.co.th,", // list of receivers
      cc: "plertbun@minebea.co.th, mmueller@minebea.co.th, svicharn@minebea.co.th, ktakenouchi@minebeamitsumi.com, haruethai.k@minebea.co.th, pakin.k@minebea.co.th, BPT3258@minebea, wilaiwan.u@minebea.co.th, jakrapong.r@minebea.co.th, rbanayo@minebea.co.th, rmahendran@minebea.co.th",
      subject: "Hipot on " + datetime3 + " - " + datetime4 + " Out of Control", // Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='salmon' >" +
        "<br/><b><h2> Out of Control Limit on Hipot</b></h2>" +
        "<font face='Segoe UI' color='#FF2E2E' >" +
        "<b><h4> Red highlights indicate 4 sigma out of control limit.</b></h4>" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Date</th> <th width='100px'>Model</th> <th width='100px'>Line</th> <th width='100px'>Time</th> <th width='100px'>Average</th> <th width='100px'>LCL</th> <th width='100px'>UCL</th> <th width='100px'>Machine</th> <th width='100px'>Parameter</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        ct[0] +
        ct[1] +
        ct[2] +
        ct[3] +
        "</td></tr></tbody>" +
        "</table> </font>",
    };

    for (let i = 0; i < param.length; i++) {
      if (input1[i][1] !== 0) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        break;
      }
    }
  });

  // Workflow ai-press for CMR
  cron.schedule("*/60 * * * *", async () => {
    var input1 = [];
    var ct = [];
    var counts = 0;

    let datetime = moment().subtract(1, "hours").format("YYYY-MM-DD HH:00:00");
    let datetime2 = moment().subtract(1, "hours").format("YYYY-MM-DD HH:59:59");

    //For email UI
    let datetime3 = moment().subtract(1, "hours").format("DD-MM-YY HH:00");
    let datetime4 = moment().subtract(1, "hours").format("HH:59");

    let models = ["CIMAR5", "CIMBP5"];
    let lines = ["2-4", "2-5"];

    for (let i = 0; i < models.length; i++) {
      var model = models[i];
      for (let j = 0; j < lines.length; j++) {
        var line = lines[j];

        var input = await DataShow.sequelize.query(
          `select [Fixture]
        ,[Date]
        ,convert(char(10),[Time],108) as [Time]
        ,[Position4]
        ,[Model]
        ,[Line]
    FROM [Temp_TransportData].[dbo].[Ai_press_Workflow]
    where [Line] = '${line}' and [Model] = '${model}' 
    and [Time] between '${datetime}' and '${datetime2}'`
        );

        console.log(input);
        console.log(input[0].length);

        await input1.push(input);

        ct[counts] = input1[counts][0].reduce(function (a, b) {
          {
            return (
              a +
              // `<tr style="color:#FF0000"><td>` +
              "<tr><td>" +
              b.Fixture +
              "</a></td><td>" +
              b.Date +
              "</a></td><td>" +
              b.Time +
              "</a></td><td>" +
              b.Position4 +
              "</a></td><td>" +
              b.Model +
              "</a></td><td>" +
              b.Line +
              "</td><td>"
            );
          }
        }, "");
        counts = counts + 1;
        console.log(counts);
      }
    }

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      // to: "BPT3542@minebea,", //BPT0896 พี่แป้ง //BPT5826 พี่นัท
      to: "BPT3542@minebea, patthanan.c@minebea.co.th, BPT0896@minebea, BPT5826@minebea,",
      subject:
        "Cimarron 5D / Cimarron BP 5D Adjust workflow on " +
        datetime3 +
        " - " +
        datetime4 +
        " Out of Control", // Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='salmon' >" +
        "<br/><b><h2> Workflow Adjustment</b></h2>" +
        "<font face='Segoe UI' color='#FF2E2E' >" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Fixture</th> <th width='100px'>Date</th> <th width='100px'>Time</th> <th width='100px'>Solartron Probe</th> <th width='100px'>Model</th> <th width='100px'>Line</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        ct[0] +
        ct[1] +
        ct[2] +
        ct[3] +
        "</td></tr></tbody>" +
        "</table> </font>",
    };

    for (let i = 0; i < 4; i++) {
      if (input1[i][1] !== 0) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        break;
      }
    }
  });

  // ControlSpec Dynamic dimension 25/11/22
  cron.schedule("04 14 * * *", async () => {
    let startDate = await moment().add("days", -91).format("yyyy-MM-DD");
    let finishDate = await moment().add("days", -1).format("yyyy-MM-DD");
    let models = [
      
      "BACALL",
      "CIMAR3",
      "CIMAR5",
      "CIMBP3",
      "CIMBP4",
      "CIMBP5",
      "EVANBP",
      "HARRIE",
      "HEPSIS",
      "KEST12",
      "KEST3D",
      "LIGB1D",
      "LONGSP",
      "M11P5D",
      "PHASIS",
      "ROSE1L",
      "ROSE2D",
      "SKB1ST",
      "SKB2ST",
      "SKYBO3",
      "SKYBO4",
      "V11 1D",
      "V11 2D",
      "V11 4D",
      "V15C1D",
      "V15C2D",
      "V15C4D",
      "V9 3D",
      "V9S3D",
    ];
    let param = [
      "Set_Dim",
      "Set_Dim_A",
      "Set_Dim_B",
      "Set_Dim_C",
      "Ramp_to_Datum",
      "Parallelism",
      "Pivot_Height",
      "FlyHeight",
      "Projection1",
      "Ramp_Pivot",
    ];
    for (let i = 0; i < models.length; i++) {
      if (models[i] === "BACALL") { 
        var lines = ["2-13"]; 
      } else if (models[i] === "CIMAR3") {
        var lines = ["1-11", "2-12","2-11","1-11"];
      } else if (models[i] === "CIMAR5") {
        var lines = ["2-4", "2-5"];
      } else if (models[i] === "CIMBP3") {
        var lines = ["1-11","2-12","3-28"];
      } else if (models[i] === "CIMBP4") {
        var lines = ["1-7","3-24","2-9"];
      } else if (models[i] === "CIMBP5") {
        var lines = ["2-4","2-5"];
      } else if (models[i] === "HARRIE") {
        var lines = ["2-8"];
      } else if (models[i] === "HEPSIS") {
        var lines = ["4-10", "4-12"];
      } else if (models[i] === "KEST12") {
        var lines = ["4-9"];
      } else if (models[i] === "KEST3D") {
        var lines = ["4-9"];
      } else if (models[i] === "LIGB1D") {
        var lines = ["4-11","3-29","1-6"];
      } else if (models[i] === "LONGSP") {
        var lines = [
          "1-4",
          "2-6",
          "3-10",
          "3-14",
          "3-6",
        ];
      } else if (models[i] === "M11P5D") {
        var lines = ["2-14"];
      } else if (models[i] === "PHASIS") {
        var lines = ["4-10", "4-12"];
      } else if (models[i] === "ROSE1L") {
        var lines = ["2-12", "1-9", "2-11"];
      } else if (models[i] === "ROSE2D") {
        var lines = ["1-8", "2-11","1-9"];
      } else if (models[i] === "SKB1ST") {
        var lines = ["3-30"];
      } else if (models[i] === "SKB2ST") {
        var lines = ["3-30"];
      } else if (models[i] === "SKYBO3") {
        var lines = ["4-8", "3-26"];
      } else if (models[i] === "SKYBO4") {
        var lines = [ "3-26"];
      } else if (models[i] === "V11 1D") {
        var lines = ["1-10", "2-9",];
      } else if (models[i] === "V11 2D") {
        var lines = ["1-6", "3-29","2-12","3-22"];
      } else if (models[i] === "V11 4D") {
        var lines = ["3-22"];
      } else if (models[i] === "V15C1D") {
        var lines = ["1-10","2-9"];
      } else if (models[i] === "V15C2D") {
        var lines = ["1-6","3-29",];
      } else if (models[i] === "V15C4D") {
        var lines = ["3-22"];
      } else if (models[i] === "V9 3D") {
        var lines = ["2-13"];
      } else if (models[i] === "V9S3D") {
        var lines = ["2-13"];
      } else {
        var lines = [];
      }
      for (let j = 0; j < lines.length; j++) {
        for (let k = 0; k < param.length; k++) {
          // console.log(models[i] + lines[j] + param[k])
          model = models[i];
          productionline = lines[j];
          parameter = param[k];

          var input = await DataShow.sequelize.query(
            `with Xbar (x1,x2,x3,x4) as
          (select case when [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL] 
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL]
          then [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}] end as [X]
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model]
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Line]
          ,[TransportData].[dbo].[Master_matchings].[Parameter]
          FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
          inner join [TransportData].[dbo].[Master_matchings]
          on [TransportData].[dbo].[Master_matchings].[Model] = [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model]
          where [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Date] between '${startDate}' and '${finishDate}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] not in (select [Barcode_Motor] from [TransportData].[dbo].[Register])
          ),
          
          Sbar (s1,s2) as
          (select cast(stdev([DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[${parameter}]) as decimal(10,5))
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model]
          FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
          where [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Date] between '${startDate}' and '${finishDate}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${model}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Line] = '${productionline}'
          and [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Barcode] not in (select [Barcode_Motor] from [TransportData].[dbo].[Register])
          group by [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model]
          ,[DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Date]
          )
          
          select
          x2 as [Model]
          ,x4 as [Parameter]
          ,x3 as [Line]
          ,cast(AVG(x1) as decimal(10,3))-(3*cast(stdev(x1) as decimal(10,3))) as [LCL]
          ,cast(AVG(x1) as decimal(10,3))+(3*cast(stdev(x1) as decimal(10,3))) as [UCL]
          ,cast(AVG(x1) as decimal(10,3)) as [CL]
          ,cast(AVG(s1) as decimal(10,3))-(3*cast(stdev(s1) as decimal(10,3))) as [LCL_STD]
          ,cast(AVG(s1) as decimal(10,3))+(3*cast(stdev(s1) as decimal(10,3))) as [UCL_STD]
          ,cast(AVG(s1) as decimal(10,3)) as [CL_STD]
          from Xbar inner join Sbar on Xbar.x2 = Sbar.s2
          group by x2,x3,x4`
          );
          console.log(input);
          console.log(input[0].length);

          //insert into SQL
          for (let i = 0; i < input[0].length; i++) {
            Model = input[0][i].Model;
            Parameter = input[0][i].Parameter;
            Line = input[0][i].Line;
            CL = input[0][i].CL;
            LCL = input[0][i].LCL;
            UCL = input[0][i].UCL;
            CL_STD = input[0][i].CL_STD;
            LCL_STD = input[0][i].LCL_STD;
            UCL_STD = input[0][i].UCL_STD;
            createdAt = moment().format();
            updatedAt = moment().format();
            try {
              let result = await AutoAlarms.sequelize
                .query(`INSERT INTO [TransportData].[dbo].[ControlSpecs]
              VALUES('${Model}','${Line}','${Parameter}',${CL},${LCL},${UCL},${CL_STD},${LCL_STD},${UCL_STD},'${createdAt}','${updatedAt}');`);
              console.log(result);
            } catch (error) {
              console.log(error);
              res.json({
                error,
                api_result: "nok",
              });
            }
          }
        }
      }
    }
  });



  // ControlSpec EWMS 25/11/22
  cron.schedule("0 1 1 1-12 *", async () => {
  let startDate = await moment().add("days", -91).format("yyyy-MM-DD");
  let finishDate = await moment().add("days", -1).format("yyyy-MM-DD");
  let models = [
    // "BACALL",
    // "CIMAR3",
    // "CIMAR5",
    // "CIMBP3",
    // "CIMBP4",
    // "CIMBP5",
    // "EAGRBP",
    // "EVANBP",
    // "HARRIE",
    "HEPSIS",
    "LIGB1D",
    "LONGSP",
    "M11P5D",
    "OSPREY",
    "PHASIS",
    "ROSE1L",
    "ROSE2D",
    "SKB1ST",
    "SKB2ST",
    "SKYBO4",
    "V11 1D",
    "V11 2D",
    "V11 4D",
    "V15C1D",
    "V15C2D",
    "V15C4D",
    "V9 3D",
  ];
  let param = [
    "ke_avg",
    "ke_ripple",
    "bemf_balance",
    "run_current",
    "RVA",
    "TIR_probe_A",
    "NRRO_probe_A",
    "NRRO_ax_FFT_1",
    "TIR_probe_B",
    "NRRO_probe_B",
    "NRRO_rad_FFT_1",
    "brg_drag",
  ];
  for (let i = 0; i < models.length; i++) {
    if (models[i] === "BACALL") {
      var lines = ["2-13"];
    } else if (models[i] === "CIMAR3") {
      var lines = ["2-10", "2-12"];
    } else if (models[i] === "CIMAR5") {
      var lines = ["2-4", "2-5"];
    } else if (models[i] === "CIMBP3") {
      var lines = ["2-10", "2-12"];
    } else if (models[i] === "CIMBP4") {
      var lines = ["3-24"];
    } else if (models[i] === "CIMBP5") {
      var lines = ["2-4", "2-5"];
    } else if (models[i] === "EAGRBP") {
      var lines = ["1-5"];
    } else if (models[i] === "EVANBP") {
      var lines = [
        "3-17",
        "2-8",
        "2-10",
        "1-5",
        "1-4",
      ];
    } else if (models[i] === "HARRIE") {
      var lines = ["2-8"];
    } else if (models[i] === "HEPSIS") {
      var lines = ["4-10", "4-12"];
    } else if (models[i] === "LIGB1D") {
      var lines = ["3-29"];
    } else if (models[i] === "LONGSP") {
      var lines = [
        "1-4",
        "2-6",
        "3-10",
        "3-6",
        "3-17",
        "3-14",
 
     
      ];
    } else if (models[i] === "M11P5D") {
      var lines = ["2-14","2-13"];
    } else if (models[i] === "OSPREY") {
      var lines = ["2-8"];
    } else if (models[i] === "PHASIS") {
      var lines = ["4-10", "4-12"];
    } else if (models[i] === "ROSE1L") {
      var lines = ["1-9", "2-12", "1-9"];
    } else if (models[i] === "ROSE2D") {
      var lines = ["1-9", "1-8"];
    } else if (models[i] === "SKB1ST") {
      var lines = ["3-30"];
    } else if (models[i] === "SKB2ST") {
      var lines = ["3-30"];
    } else if (models[i] === "SKYBO4") {
      var lines = ["3-26"];
    } else if (models[i] === "V11 1D") {
      var lines = ["1-10", "2-9"];
    } else if (models[i] === "V11 2D") {
      var lines = ["1-6", "3-29"];
    } else if (models[i] === "V11 4D") {
      var lines = ["3-22"];
    } else if (models[i] === "V15C1D") {
      var lines = ["2-9","1-10"];
    } else if (models[i] === "V15C2D") {
      var lines = ["1-6","3-29"];
    } else if (models[i] === "V15C4D") {
      var lines = ["3-22"];
    } else if (models[i] === "V9 3D") {
      var lines = ["2-13"];
    } else {
      var lines = [];
    }
    for (let j = 0; j < lines.length; j++) {
      for (let k = 0; k < param.length; k++) {
        // console.log(models[i] + lines[j] + param[k])
        model = models[i];
        productionline = lines[j];
        parameter = param[k];

        var input = await DataShow.sequelize.query(
          `with Xbar (x1,x2,x3,x4) as
          (select case when [DataforAnalysis].[dbo].[EWMS].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL] 
          and [DataforAnalysis].[dbo].[EWMS].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL]
          then [DataforAnalysis].[dbo].[EWMS].[${parameter}] end as [X]
          ,[DataforAnalysis].[dbo].[EWMS].[Model]
          ,[DataforAnalysis].[dbo].[EWMS].[Line]
          ,[TransportData].[dbo].[Master_matchings].[Parameter]
          FROM [DataforAnalysis].[dbo].[EWMS]
          inner join [TransportData].[dbo].[Master_matchings]
          on [TransportData].[dbo].[Master_matchings].[Model] = [DataforAnalysis].[dbo].[EWMS].[Model]
          where [DataforAnalysis].[dbo].[EWMS].[Date] between '${startDate}' and '${finishDate}'
          and [DataforAnalysis].[dbo].[EWMS].[Model] = '${model}'
          and [DataforAnalysis].[dbo].[EWMS].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          and [DataforAnalysis].[dbo].[EWMS].[Barcode] not in (select [Barcode_Motor] from [TransportData].[dbo].[Register])
          ),
          
          Sbar (s1,s2) as
          (select cast(stdev([DataforAnalysis].[dbo].[EWMS].[${parameter}]) as decimal(10,5))
          ,[DataforAnalysis].[dbo].[EWMS].[Model]
          FROM [DataforAnalysis].[dbo].[EWMS]
          where [DataforAnalysis].[dbo].[EWMS].[Date] between '${startDate}' and '${finishDate}'
          and [DataforAnalysis].[dbo].[EWMS].[Model] = '${model}'
          and [DataforAnalysis].[dbo].[EWMS].[Line] = '${productionline}'
          and [DataforAnalysis].[dbo].[EWMS].[Barcode] not in (select [Barcode_Motor] from [TransportData].[dbo].[Register])
          group by [DataforAnalysis].[dbo].[EWMS].[Model]
          ,[DataforAnalysis].[dbo].[EWMS].[Date]
          )
          
          select
          x2 as [Model]
          ,x3 as [Line]
          ,x4 as [Parameter]
          ,cast(AVG(x1) as decimal(10,3))-(3*cast(stdev(x1) as decimal(10,3))) as [LCL]
          ,cast(AVG(x1) as decimal(10,3))+(3*cast(stdev(x1) as decimal(10,3))) as [UCL]
          ,cast(AVG(x1) as decimal(10,3)) as [CL]
          ,cast(AVG(s1) as decimal(10,3))-(3*cast(stdev(s1) as decimal(10,3))) as [LCL_STD]
          ,cast(AVG(s1) as decimal(10,3))+(3*cast(stdev(s1) as decimal(10,3))) as [UCL_STD]
          ,cast(AVG(s1) as decimal(10,3)) as [CL_STD]
          from Xbar inner join Sbar on Xbar.x2 = Sbar.s2
          group by x2,x3,x4`
        );
        console.log(input);
        console.log(input[0].length);

        //insert into SQL
        for (let i = 0; i < input[0].length; i++) {
          Model = input[0][i].Model;
          Parameter = input[0][i].Parameter;
          Line = input[0][i].Line;
          CL = input[0][i].CL;
          LCL = input[0][i].LCL;
          UCL = input[0][i].UCL;
          CL_STD = input[0][i].CL_STD;
          LCL_STD = input[0][i].LCL_STD;
          UCL_STD = input[0][i].UCL_STD;
          createdAt = moment().format();
          updatedAt = moment().format();
          try {
            let result = await AutoAlarms.sequelize
              .query(`INSERT INTO [TransportData].[dbo].[ControlSpecs]
                VALUES('${Model}','${Line}','${Parameter}',${CL},${LCL},${UCL},${CL_STD},${LCL_STD},${UCL_STD},'${createdAt}','${updatedAt}');`);
            console.log(result);
          } catch (error) {
            console.log(error);
            res.json({
              error,
              api_result: "nok",
            });
          }
        }
      }
    }
  }
  });

  // ControlSpec Hipot //25/11/22
  // 0 8 1 1-12 *
  cron.schedule("0 1 1 1-12 *", async () => {
    let startDate = await moment().add("days", -91).format("yyyy-MM-DD");
    let finishDate = await moment().add("days", -1).format("yyyy-MM-DD");
    let models = [
      "BACALL",
      "CIMAR3",
      "CIMAR5",
      "CIMBP3",
      "CIMBP4",
      "CIMBP5",
      "EAGRBP",
      "EVANBP",
      "HARRIE",
      "HEPSIS",
      "LIGB1D",
      "LONGSP",
      "M11P5D",
      "OSPREY",
      "PHASIS",
      "ROSE1L",
      "ROSE2D",
      "SKB1ST",
      "SKB2ST",
      "SKYBO3",
      "SKYBO4",
      "V11 1D",
      "V11 2D",
      "V11 4D",
      "V15C1D",
      "V15C2D",
      "V15C4D",
      "V15C4D",
      "V15CMR 1D",
      "V9 3D",
      "V9S3D",
    ];
    let param = ["R1_UV", "R2_UW", "R3_VW", "R_max_min"];
    for (let i = 0; i < models.length; i++) {
      if (models[i] === "BACALL") {
        var lines = ["2-13"];
      } else if (models[i] === "CIMAR3") {
        var lines = ["2-12", "3-28"];
      } else if (models[i] === "CIMAR5") {
        var lines = ["2-12", "2-4","2-5"];
      } else if (models[i] === "CIMBP3") {
        var lines = ["1-11","2-12","3-28"];
      } else if (models[i] === "CIMBP4") {
        var lines = ["2-12", "3-24","1-7"];
      } else if (models[i] === "CIMBP5") {
        var lines = ["2-4",];
      } else if (models[i] === "EAGRBP") {
        var lines = ["3-17",];
      } else if (models[i] === "EVANBP") {
        var lines = [
          "2-8",
          "3-17",
          "2-10",
          "3-10",
          "1-5",
        ];
      } else if (models[i] === "HARRIE") {
        var lines = ["2-8"];
      } else if (models[i] === "HEPSIS") {
        var lines = ["4-10", "4-12"];
      } else if (models[i] === "LIGB1D") {
        var lines = ["4-11","3-29"];
      } else if (models[i] === "LONGSP") {
        var lines = [
          "3-10",
          "2-6",
          "3-6",
          "3-17",
          "3-14",
          "1-4",
        ];
      } else if (models[i] === "M11P5D") {
        var lines = ["2-14"];
      } else if (models[i] === "OSPREY") {
        var lines = ["2-8"];
      } else if (models[i] === "PHASIS") {
        var lines = ["4-10", "4-12"];
      } else if (models[i] === "ROSE1L") {
        var lines = ["1-9", "2-12"];
      } else if (models[i] === "ROSE2D") {
        var lines = ["1-8", "1-10"];
      } else if (models[i] === "SKB1ST") {
        var lines = ["3-30"];
      } else if (models[i] === "SKB2ST") {
        var lines = ["3-30"];
      } else if (models[i] === "SKYBO3") {
        var lines = ["3-26"];
      } else if (models[i] === "SKYBO4") {
        var lines = ["3-26"];
      } else if (models[i] === "V11 1D") {
        var lines = ["2-9","1-10"];
      } else if (models[i] === "V11 2D") {
        var lines = ["3-29","3-22","1-6"];
      } else if (models[i] === "V11 4D") {
        var lines = ["1-7", "3-22"];
      } else if (models[i] === "V15C1D") {
        var lines = ["2-9", "1-10"];
      } else if (models[i] === "V15C2D") {
        var lines = ["1-6", "3-29"];
      } else if (models[i] === "V15C4D") {
        var lines = ["3-22"];
      } else if (models[i] === "V15CMR 1D") {
        var lines = ["2-9"];
      } else if (models[i] === "V9 3D") {
        var lines = ["2-13"];
      } else if (models[i] === "V9S3D") {
        var lines = ["2-13"];
      } else {
        var lines = [];
      }
      for (let j = 0; j < lines.length; j++) {
        for (let k = 0; k < param.length; k++) {
          // console.log(models[i] + lines[j] + param[k])
          model = models[i];
          productionline = lines[j];
          parameter = param[k];

          var input = await DataShow.sequelize.query(
            `with Xbar (x1,x2,x3,x4) as
            (select case when [DataforAnalysis].[dbo].[Hipot].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL]
            and [DataforAnalysis].[dbo].[Hipot].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL]
            then [DataforAnalysis].[dbo].[Hipot].[${parameter}] end as [X]
            ,[DataforAnalysis].[dbo].[Hipot].[Model]
            ,[DataforAnalysis].[dbo].[Hipot].[Line]
            ,[TransportData].[dbo].[Master_matchings].[Parameter]
            FROM [DataforAnalysis].[dbo].[Hipot]
            inner join [TransportData].[dbo].[Master_matchings]
            on [TransportData].[dbo].[Master_matchings].[Model] = [DataforAnalysis].[dbo].[Hipot].[Model]
            where [DataforAnalysis].[dbo].[Hipot].[Date] between '${startDate}' and '${finishDate}'
            and [DataforAnalysis].[dbo].[Hipot].[Model] = '${model}'
            and [DataforAnalysis].[dbo].[Hipot].[Line] = '${productionline}'
            and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
            and [DataforAnalysis].[dbo].[Hipot].[Barcode] not in (select [Barcode_Motor] from [TransportData].[dbo].[Register])
            ),
  
            Sbar (s1,s2) as
            (select cast(stdev(case when [DataforAnalysis].[dbo].[Hipot].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL]
            and [DataforAnalysis].[dbo].[Hipot].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL]
            then [DataforAnalysis].[dbo].[Hipot].[${parameter}] end) as decimal(10,5))
            ,[DataforAnalysis].[dbo].[Hipot].[Model]
            FROM [DataforAnalysis].[dbo].[Hipot]
            inner join [TransportData].[dbo].[Master_matchings]
            on [TransportData].[dbo].[Master_matchings].[Model] = [DataforAnalysis].[dbo].[Hipot].[Model]
            where [DataforAnalysis].[dbo].[Hipot].[Date] between '${startDate}' and '${finishDate}'
            and [DataforAnalysis].[dbo].[Hipot].[Model] = '${model}'
            and [DataforAnalysis].[dbo].[Hipot].[Line] = '${productionline}'
            and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
            and [DataforAnalysis].[dbo].[Hipot].[Barcode] not in (select [Barcode_Motor] from [TransportData].[dbo].[Register])
            group by [DataforAnalysis].[dbo].[Hipot].[Model]
            ,[DataforAnalysis].[dbo].[Hipot].[Date]
            )
  
            select
            x2 as [Model]
            ,x3 as [Line]
            ,x4 as [Parameter]
            ,cast(AVG(x1) as decimal(10,3))-(3*cast(stdev(x1) as decimal(10,3))) as [LCL]
            ,cast(AVG(x1) as decimal(10,3))+(3*cast(stdev(x1) as decimal(10,3))) as [UCL]
            ,cast(AVG(x1) as decimal(10,3)) as [CL]
            ,cast(AVG(s1) as decimal(10,3))-(3*cast(stdev(s1) as decimal(10,3))) as [LCL_STD]
            ,cast(AVG(s1) as decimal(10,3))+(3*cast(stdev(s1) as decimal(10,3))) as [UCL_STD]
            ,cast(AVG(s1) as decimal(10,3)) as [CL_STD]
            from Xbar inner join Sbar on Xbar.x2 = Sbar.s2
            group by x2,x3,x4`
          );
          console.log(input);
          console.log(input[0].length);

          //insert into SQL
          for (let i = 0; i < input[0].length; i++) {
            Model = input[0][i].Model;
            Parameter = input[0][i].Parameter;
            Line = input[0][i].Line;
            CL = input[0][i].CL;
            LCL = input[0][i].LCL;
            UCL = input[0][i].UCL;
            CL_STD = input[0][i].CL_STD;
            LCL_STD = input[0][i].LCL_STD;
            UCL_STD = input[0][i].UCL_STD;
            createdAt = moment().format();
            updatedAt = moment().format();
            try {
              let result = await AutoAlarms.sequelize
                .query(`INSERT INTO [TransportData].[dbo].[ControlSpecs]
                VALUES('${Model}','${Line}','${Parameter}',${CL},${LCL},${UCL},${CL_STD},${LCL_STD},${UCL_STD},'${createdAt}','${updatedAt}');`);
              console.log(result);
            } catch (error) {
              console.log(error);
              res.json({
                error,
                api_result: "nok",
              });
            }
          }
        }
      }
    }
  });

  //Rotor by Aew
  cron.schedule("0 1 1 1-12 *", async () => {
    //ตั้งเวลาhttps://crontab.guru
    let startDate = await moment().add("days", -91).format("yyyy-MM-DD");
    let finishDate = await moment().add("days", -1).format("yyyy-MM-DD");
    let models = [
      // "CIMAR5", "CIMBP5",
      "EVANBP",
      "LONGSP",
    ];
    let param = ["Axial_Play", "Oil_Top", "Oil_Bottom"];

    for (let i = 0; i < models.length; i++) {
      if (models[i] === "CIMAR5") {
        var lines = ["4A", "4B", "7B"];
      } else if (models[i] === "CIMBP5") {
        var lines = ["4A", "4B", "7B"];
      } else if (models[i] === "EVANBP") {
        var lines = [
          "1A",
          "1B",
          "2A",
          "2B",
          "3A",
          "3B",
          "4A",
          "5A",
          "5B",
          "6A",
          "6B",
          "8A",
        ];
      } else if (models[i] === "LONGSP") {
        var lines = [
          "1A",
          "1B",
          "2A",
          "2B",
          "3A",
          "3B",
          "4A",
          "5A",
          "5B",
          "6A",
          "6B",
          "8A",
        ];
      }
      for (let j = 0; j < lines.length; j++) {
        for (let k = 0; k < param.length; k++) {
          // console.log(models[i] + lines[j] + param[k])
          model = models[i];
          productionline = lines[j];
          parameter = param[k];

          var input = await DataShow.sequelize.query(
            `with Xbar (x1,x2,x3,x4) as
          (select case when [Temp_TransportData].[dbo].[Data_matching].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL]
          and [Temp_TransportData].[dbo].[Data_matching].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL]
          then [Temp_TransportData].[dbo].[Data_matching].[${parameter}] end as [X]
          ,[Temp_TransportData].[dbo].[Data_matching].[Model]
          ,[Temp_TransportData].[dbo].[Data_matching].[Line]
          ,[TransportData].[dbo].[Master_matchings].[Parameter]
          FROM [Temp_TransportData].[dbo].[Data_matching]
          inner join [TransportData].[dbo].[Master_matchings]
          on [TransportData].[dbo].[Master_matchings].[Model] = [Temp_TransportData].[dbo].[Data_matching].[Model]
          where cast([Temp_TransportData].[dbo].[Data_matching].[Timestamp] as Date) between '${startDate}' and '${finishDate}'
          and [Temp_TransportData].[dbo].[Data_matching].[Model] = '${model}'
          and [Temp_TransportData].[dbo].[Data_matching].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'
          ),

          Sbar (s1,s2) as
          (select cast(stdev(case when [Temp_TransportData].[dbo].[Data_matching].[${parameter}] < [TransportData].[dbo].[Master_matchings].[USL]
          and [Temp_TransportData].[dbo].[Data_matching].[${parameter}] > [TransportData].[dbo].[Master_matchings].[LSL]
          then [Temp_TransportData].[dbo].[Data_matching].[${parameter}] end) as decimal(10,5))
          ,[Temp_TransportData].[dbo].[Data_matching].[Model]
          FROM [Temp_TransportData].[dbo].[Data_matching]
          inner join [TransportData].[dbo].[Master_matchings]
          on [TransportData].[dbo].[Master_matchings].[Model] = [Temp_TransportData].[dbo].[Data_matching].[Model]
          where cast([Temp_TransportData].[dbo].[Data_matching].[Timestamp] as Date) between '${startDate}' and '${finishDate}'
          and [Temp_TransportData].[dbo].[Data_matching].[Model] = '${model}'
          and [Temp_TransportData].[dbo].[Data_matching].[Line] = '${productionline}'
          and [TransportData].[dbo].[Master_matchings].[Parameter] = '${parameter}'          
          group by [Temp_TransportData].[dbo].[Data_matching].[Model]
          ,cast([Temp_TransportData].[dbo].[Data_matching].[Timestamp] as Date)
          )

          select
          x2 as [Model]
          ,x3 as [Parameter]
          ,x4 as [Line]
          ,cast(AVG(x1) as decimal(10,3))-(3*cast(stdev(x1) as decimal(10,3))) as [LCL]
          ,cast(AVG(x1) as decimal(10,3))+(3*cast(stdev(x1) as decimal(10,3))) as [UCL]
          ,cast(AVG(x1) as decimal(10,3)) as [CL]
          ,cast(AVG(s1) as decimal(10,3))-(3*cast(stdev(s1) as decimal(10,3))) as [LCL_STD]
          ,cast(AVG(s1) as decimal(10,3))+(3*cast(stdev(s1) as decimal(10,3))) as [UCL_STD]
          ,cast(AVG(s1) as decimal(10,3)) as [CL_STD]
          from Xbar inner join Sbar on Xbar.x2 = Sbar.s2
          group by x2,x3,x4`
          );
          console.log(input);
          console.log(input[0].length);

          //insert into SQL
          for (let i = 0; i < input[0].length; i++) {
            Model = input[0][i].Model;
            Parameter = input[0][i].Parameter;
            Line = input[0][i].Line;
            CL = input[0][i].CL;
            LCL = input[0][i].LCL;
            UCL = input[0][i].UCL;
            CL_STD = input[0][i].CL_STD;
            LCL_STD = input[0][i].LCL_STD;
            UCL_STD = input[0][i].UCL_STD;
            createdAt = moment().format();
            updatedAt = moment().format();
            try {
              let result = await AutoAlarms.sequelize
                .query(`INSERT INTO [TransportData].[dbo].[ControlSpecs]
              VALUES('${Model}','${Parameter}','${Line}',${CL},${LCL},${UCL},${CL_STD},${LCL_STD},${UCL_STD},'${createdAt}','${updatedAt}');`);
              console.log(result);
            } catch (error) {
              console.log(error);
              res.json({
                error,
                api_result: "nok",
              });
            }
          }
        }
      }
    }
  });

  //55 7 * * * (8โมง)   //*/5 * * * *
  cron.schedule(" * * * *", async () => {
    let realtime = await moment().subtract(1, "days").format("yyyy-MM-DD");
    var k =
      realtime.slice(8) +
      "/" +
      realtime.slice(5, 7) +
      "/" +
      realtime.slice(0, 4);
    //var k = realtime.format("DD-MM-YYYY")
    var input = await DataShow.sequelize.query(
      `EXEC [TransportData].[dbo].[checkMasterCR] @StartDate = '${realtime}'`
    );

    var content = input[0].reduce(function (a, b) {
      return (
        a +
        "<tr><td>" +
        b.Date +
        "</a></td><td>" +
        b.Model +
        "</a></td><td>" +
        b.Process +
        "</a></td><td>" +
        b.Line +
        "</a></td><td>" +
        b.Machine +
        "</a></td><td>" +
        b.Barcode +
        "</a></td><td>" +
        b.OK_Count +
        "</a></td><td>" +
        b.NG_Count +
        "</a></td><td>" +
        b.Total_Count +
        "</a></td><td>" +
        b.Judgement +
        "</a></td><td>" +
        b.Time_Interval +
        "</td><td>"
      );
    }, "");

    var new_content = content.replace(/null/g, "-");
    console.log(new_content);

    var excelFileMaster = `D:\Project\Master_check.xlsx`;

    let xlsMaster = await json2xls(input[0]);
    await fs.writeFileSync(excelFileMaster, xlsMaster, "binary");

    console.log(input);
    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      //to: "haruethai.k@minebea.co.th, parita.k@minebea.co.th, ",
      //to: "atakahashi.na@minebeamitsumi.com, sirikate.j@minebea.co.th, tnitta@minebea.co.th, sayan.m@minebea.co.th, apisit.s@minebea.co.th, terdsak.v@minebea.co.th, bodin.p@minebea.co.th, ", // list of receivers
      //cc: "plertbun@minebea.co.th, mmueller@minebea.co.th, svicharn@minebea.co.th, haruethai.k@minebea.co.th, pakin.k@minebea.co.th, parita.k@minebea.co.th, ",
      subject: "(Auto Alert) Daily Master Checking Data Report" + " " + k, // Subject line
      text: "Alarm information", // plain text body
      html:
        "<font face='Segoe UI' color='red' >" +
        "<br/><b><h2> Master Checking Information </b></h2>" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Date</th> <th width='100px'>Model</th> <th width='150px'>Process</th> <th width='80px'>Line</th> <th width='80px'>Machine</th> <th width='410px'>Barcode</th> <th width='80px'>OK Count</th> <th width='80px'>NG Count</th> <th width='80px'>Total Count<th width='120px'>Judgement</th> <th width='120px'>Time Interval</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        new_content +
        "</td></tr></tbody>",
      attachments: [
        {
          filename: "Master Checking Information" + ".xlsx",
          content: fs.createReadStream(excelFileMaster),
        },
      ],
    };

    if (content != "") {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
  });
}
main().catch(console.error);

module.exports = router;
