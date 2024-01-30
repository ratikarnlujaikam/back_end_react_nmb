const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
var moment = require("moment");
const DataShow = require("./../database/models/model_data_show");
const json2xls = require("json2xls");
const fs = require("fs");

// Sent email NMB member
async function main() {
  let transporter = nodemailer.createTransport({
    host: "10.120.10.42", //10.121.1.22 ลพบุรี
    port: 25,
  });

  let cron = require("node-cron");
  cron.schedule("*/100000 * * * *", () => {
    console.log("running a task every 62 minute");
  });

  let realtime = await moment().subtract(1, "days").format("yyyy-MM-DD");

  //0 8 * * * (8โมง)   //*/5 * * * *
  cron.schedule("*/100000 * * * *", async () => {
    var input = await DataShow.sequelize.query(
      `with MasterMotor (a1,a2,a3,a4,a5) as
      (select [Barcode_Motor]
            ,[Model]
            ,[Status]
            ,[Process]
          ,[Line]
      from [TransportData].[dbo].[Register_MasterMotor]
      )
      , Process (b1,b2,b3,b4,b5,b6,b7) as
      (
      --[Air_leak]
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'3:00 - 6:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Air_leak]
      on [TransportData].[dbo].[Air_leak].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Air_leak].[Time] between '${realtime} 03:00:00' and '${realtime} 06:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'6:00 - 8:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Air_leak]
      on [TransportData].[dbo].[Air_leak].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Air_leak].[Time] between '${realtime} 06:00:00' and '${realtime} 08:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'10:00 - 13:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Air_leak]
      on [TransportData].[dbo].[Air_leak].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Air_leak].[Time] between '${realtime} 10:00:00' and '${realtime} 13:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'15:00 - 18:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Air_leak]
      on [TransportData].[dbo].[Air_leak].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Air_leak].[Time] between '${realtime} 15:00:00' and '${realtime} 18:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'18:00 - 20:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Air_leak]
      on [TransportData].[dbo].[Air_leak].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Air_leak].[Time] between '${realtime} 18:00:00' and '${realtime} 20:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'Failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'22:00 - 24:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Air_leak]
      on [TransportData].[dbo].[Air_leak].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Air_leak].[Time] between '${realtime} 22:00:00' and '${realtime} 23:59:59'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      
      --[Dynamic_Parallelism]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'3:00 - 6:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Dynamic_Parallelism]
      on [TransportData].[dbo].[Dynamic_Parallelism].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Dynamic_Parallelism].[Time] between '${realtime} 03:00:00' and '${realtime} 06:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'6:00 - 8:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Dynamic_Parallelism]
      on [TransportData].[dbo].[Dynamic_Parallelism].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Dynamic_Parallelism].[Time] between '${realtime} 06:00:00' and '${realtime} 08:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'10:00 - 13:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Dynamic_Parallelism]
      on [TransportData].[dbo].[Dynamic_Parallelism].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Dynamic_Parallelism].[Time] between '${realtime} 10:00:00' and '${realtime} 13:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'15:00 - 18:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Dynamic_Parallelism]
      on [TransportData].[dbo].[Dynamic_Parallelism].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Dynamic_Parallelism].[Time] between '${realtime} 15:00:00' and '${realtime} 18:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'18:00 - 20:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Dynamic_Parallelism]
      on [TransportData].[dbo].[Dynamic_Parallelism].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Dynamic_Parallelism].[Time] between '${realtime} 18:00:00' and '${realtime} 20:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'22:00 - 24:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Dynamic_Parallelism]
      on [TransportData].[dbo].[Dynamic_Parallelism].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Dynamic_Parallelism].[Time] between '${realtime} 22:00:00' and '${realtime} 23:59:59'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      
      --[EWMS]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'3:00 - 6:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[EWMS]
      on [TransportData].[dbo].[EWMS].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[EWMS].[Time] between '${realtime} 03:00:00' and '${realtime} 06:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'6:00 - 8:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[EWMS]
      on [TransportData].[dbo].[EWMS].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[EWMS].[Time] between '${realtime} 06:00:00' and '${realtime} 08:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'10:00 - 13:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[EWMS]
      on [TransportData].[dbo].[EWMS].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[EWMS].[Time] between '${realtime} 10:00:00' and '${realtime} 13:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'15:00 - 18:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[EWMS]
      on [TransportData].[dbo].[EWMS].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[EWMS].[Time] between '${realtime} 15:00:00' and '${realtime} 18:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'18:00 - 20:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[EWMS]
      on [TransportData].[dbo].[EWMS].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[EWMS].[Time] between '${realtime} 18:00:00' and '${realtime} 20:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'22:00 - 24:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[EWMS]
      on [TransportData].[dbo].[EWMS].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[EWMS].[Time] between '${realtime} 22:00:00' and '${realtime} 23:59:59'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      
      --[G-meter]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'3:00 - 6:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[G_meter]
      on [TransportData].[dbo].[G_meter].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[G_meter].[Time] between '${realtime} 03:00:00' and '${realtime} 06:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'6:00 - 8:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[G_meter]
      on [TransportData].[dbo].[G_meter].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[G_meter].[Time] between '${realtime} 06:00:00' and '${realtime} 08:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'10:00 - 13:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[G_meter]
      on [TransportData].[dbo].[G_meter].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[G_meter].[Time] between '${realtime} 10:00:00' and '${realtime} 13:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'15:00 - 18:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[G_meter]
      on [TransportData].[dbo].[G_meter].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[G_meter].[Time] between '${realtime} 15:00:00' and '${realtime} 18:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'18:00 - 20:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[G_meter]
      on [TransportData].[dbo].[G_meter].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[G_meter].[Time] between '${realtime} 18:00:00' and '${realtime} 20:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'22:00 - 24:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[G_meter]
      on [TransportData].[dbo].[G_meter].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[G_meter].[Time] between '${realtime} 22:00:00' and '${realtime} 23:59:59'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      
      --[Hipot]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'3:00 - 6:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Hipot]
      on [TransportData].[dbo].[Hipot].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Hipot].[Time] between '${realtime} 03:00:00' and '${realtime} 06:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'6:00 - 8:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Hipot]
      on [TransportData].[dbo].[Hipot].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Hipot].[Time] between '${realtime} 06:00:00' and '${realtime} 08:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'10:00 - 13:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Hipot]
      on [TransportData].[dbo].[Hipot].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Hipot].[Time] between '${realtime} 10:00:00' and '${realtime} 13:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'15:00 - 18:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Hipot]
      on [TransportData].[dbo].[Hipot].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Hipot].[Time] between '${realtime} 15:00:00' and '${realtime} 18:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'18:00 - 20:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Hipot]
      on [TransportData].[dbo].[Hipot].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Hipot].[Time] between '${realtime} 18:00:00' and '${realtime} 20:00:00'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],[Machine_no]
      ,COUNT(CASE WHEN [Master_Judgment] = 'passed' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [Master_Judgment] = 'failed' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'22:00 - 24:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Hipot]
      on [TransportData].[dbo].[Hipot].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Hipot].[Time] between '${realtime} 22:00:00' and '${realtime} 23:59:59'
      group by [Barcode],[Date],[Machine_no],[TransportData].[dbo].[Register_MasterMotor].[Status]
      
      --[Camera_Motor]
      union all
      select [Barcode],[Date],null as [Machine_no]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'OK' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'NG' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'3:00 - 6:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Camera_Motor]
      on [TransportData].[dbo].[Camera_Motor].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Camera_Motor].[Time] between '${realtime} 03:00:00' and '${realtime} 06:00:00'
      group by [Barcode],[Date],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],null as [Machine_no]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'OK' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'NG' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'6:00 - 8:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Camera_Motor]
      on [TransportData].[dbo].[Camera_Motor].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Camera_Motor].[Time] between '${realtime} 06:00:00' and '${realtime} 08:00:00'
      group by [Barcode],[Date],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],null as [Machine_no]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'OK' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'NG' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'10:00 - 13:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Camera_Motor]
      on [TransportData].[dbo].[Camera_Motor].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Camera_Motor].[Time] between '${realtime} 10:00:00' and '${realtime} 13:00:00'
      group by [Barcode],[Date],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],null as [Machine_no]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'OK' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'NG' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'15:00 - 18:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Camera_Motor]
      on [TransportData].[dbo].[Camera_Motor].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Camera_Motor].[Time] between '${realtime} 15:00:00' and '${realtime} 18:00:00'
      group by [Barcode],[Date],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],null as [Machine_no]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'OK' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'NG' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'18:00 - 20:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Camera_Motor]
      on [TransportData].[dbo].[Camera_Motor].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Camera_Motor].[Time] between '${realtime} 18:00:00' and '${realtime} 20:00:00'
      group by [Barcode],[Date],[TransportData].[dbo].[Register_MasterMotor].[Status]
      union all
      select [Barcode],[Date],null as [Machine_no]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'OK' THEN 1 END) as [Count_OK]
      ,COUNT(CASE WHEN [TransportData].[dbo].[Camera_Motor].[Status] = 'NG' THEN 1 END) as [Count_NG]
      ,[TransportData].[dbo].[Register_MasterMotor].[Status]
      ,'22:00 - 24:00' as Time
      from  [TransportData].[dbo].[Register_MasterMotor]
      full outer join [TransportData].[dbo].[Camera_Motor]
      on [TransportData].[dbo].[Camera_Motor].[Barcode] = [TransportData].[dbo].[Register_MasterMotor].[Barcode_Motor]
      where [TransportData].[dbo].[Camera_Motor].[Time] between '${realtime} 22:00:00' and '${realtime} 23:59:59'
      group by [Barcode],[Date],[TransportData].[dbo].[Register_MasterMotor].[Status]
      )
      
      select 
      b2 as [Date]
      ,a2 as [Model]
      ,a4 as [Process]
      ,a5 as [Line]
      ,b3 as [Machine]
      ,a1 as [Barcode]
      ,b4 as [OK_Count]
      ,b5 as [NG_Count]
      ,b4+b5 as [Total_Count]
      ,case when (b4 > b5 and b6 = 'OK') then 'PASS' when (b5 > b4 and b6 = 'NG') then 'PASS'
      when (b4 > b5 and b6 = 'NG') then 'FAIL' when (b5 > b4 and b6 = 'OK') then 'FAIL' else 'FAIL' end as [Judgement]
      ,b7 as [Time_Interval]
      from MasterMotor
      left join Process
      on MasterMotor.a1 = Process.b1
      group by b2,a2,a4,a5,b3,a1,b7,b4+b5,b6,b5,b4
      order by b2 desc ,a2,a4,b7`
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
    //pakin.k@minebea.co.th, parita.k@minebea.co.th, sirikate.j@minebea.co.th, tnitta@minebea.co.th, svicharn@minebea.co.th,

    var mailOptions = {
      from: '"Auto Alarm" <Auto@Alarm.Example>', // sender address
      //to: "haruethai.k@minebea.co.th,", // list of receivers
      subject: "(Auto Alert) Abnormal Master Checking Warning", // Subject line
      text: "Alarm information", // plain text body
      html:
        "* This is an example email to showcase what the auto alarm email for abnormal master checking would look like. Finalized version may have different wordings/template. *" +
        "<font face='Segoe UI' color='red' >" +
        "<br/><b><h2> Master Checking Information </b></h2>" +
        "<table border='1' height='100px' cellspacing='0' cellpadding='0' >" +
        "<thead align='center' bgcolor='#D5DBDB'}><tr> <th width='100px'>Date</th> <th width='100px'>Model</th> <th width='150px'>Process</th> <th width='80px'>Line</th> <th width='80px'>Machine</th> <th width='410px'>Barcode</th> <th width='80px'>OK Count</th> <th width='80px'>NG Count</th> <th width='80px'>Total Count<th width='120px'>Judgement</th> <th width='120px'>Time Interval</th> </tr></thead>" +
        "<tbody align='center'><tr><td>" +
        new_content +
        "</td></tr></tbody>",
      attachments: [
        {
          filename:
            "Master Checking Information" + ".xlsx",
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
