const express = require("express");
const bodyParser = require("body-parser"); //add
const app = express();
const multer = require('multer');
const path = require('path');
const cors = require("cors");

app.use(cors());

// const corsOptions = {
//   origin: 'http://10.120.122.28:2017', 
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


app.use(bodyParser.json()); //add
app.use(bodyParser.urlencoded({ extended: false })); //add

app.get("/api/test", (req, res) => {
  res.json({ result: "hello", test: 1 });
});
//app.get คือ http method /api/test จะเป็น path ที่นำไปหน้าเว็บ ใช้ของตัวเองได้เลย

app.use("/api/production_result", require("./api/api_production_result"));
app.use("/api/authorize", require("./api/api_authorize"));
app.use("/api/mail", require("./api/api_mail"));
app.use("/api/iSpindle", require("./api/api_iSpindle"));
app.use("/api/dataanalysis", require("./api/api_dataanalysis"));
app.use("/api/motor_dim", require("./api/api_motor_dim"));
app.use("/api/motor_dim_AiPress", require("./api/api_motor_dim_AiPress"));
app.use("/api/motor_dim_RTB", require("./api/api_motor_dim_RTB"));
app.use("/api/motor_EWMS", require("./api/api_motor_EWMS"));
app.use("/api/motor_hipot", require("./api/api_motor_hipot"));
app.use("/api/motor_He", require("./api/api_motor_He"));
app.use("/api/stack_height", require("./api/api_stack_height"));
app.use("/api/grline", require("./api/api_grline"));
app.use("/api/diecast", require("./api/api_diecast"));
app.use("/api/VMI", require("./api/api_VMI"));
app.use("/api/ML", require("./api/api_ML"));
app.use("/api/ML2", require("./api/api_ML2"));
app.use("/api/QAInspection", require("./api/api_QAInspection"));
app.use("/api/Rejection", require("./api/api_Rejection"));
app.use("/api/monthlyQA", require("./api/api_monthlyQA"));
app.use("/api/Vrecode", require("./api/api_Vrecode"));
app.use("/api/Movement", require("./api/api_Movement"));
app.use("/api/defectNG", require("./api/api_defectNG"));
app.use("/api/LAR", require("./api/api_LAR"));
app.use("/api/MQT", require("./api/api_MQT"));
app.use("/api/MQTByModel", require("./api/api_MQTByModel"));
app.use("/api/MasterItemNO", require("./api/api_MasterItemNO"));
app.use("/api/MasterSupplier", require("./api/api_MasterSupplier"));
app.use("/api/MasterLine", require("./api/api_MasterLine"));
app.use("/api/LARMonth", require("./api/api_LARMonth"));
app.use("/api/DailyML", require("./api/api_DailyML"));
app.use("/api/DailyML1", require("./api/api_DailyML1"));
app.use("/api/Dailypacking", require("./api/api_Dailypacking"));
app.use("/api/Rejectbyteam", require("./api/api_Rejectbyteam"));
app.use("/api/OutPutCo2", require("./api/api_OutPutCo2"));
app.use("/api/reportCo2", require("./api/api_reportCo2"));
app.use("/api/HoldCo2", require("./api/api_Hold_OutPutCo2"));
app.use("/api/AfterQA", require("./api/api_AfterQA"));
app.use("/api/shipmentdata", require("./api/api_shipmentdata"))
app.use("/api/Packed_Half_Pallet", require("./api/api_Packed_Half_Pallet"))
app.use("/api/status1", require("./api/api_status1"))
app.use("/api/OPT", require("./api/api_OPT"))
app.use("/api/QPM", require("./api/api_QPM"))
app.use("/api/QAInspectionHOLD", require("./api/api_QAInspectionHOLD"))
app.use("/api/checkData", require("./api/api_checkData"));
app.use("/api/MC_Error", require("./api/api_MC_Error"));
app.use("/api/Report_printlabal", require("./api/api_Report_printlabal"));
app.use("/api/HOME", require("./api/api_HOME"));
app.use("/api/MLranking", require("./api/api_MLranking"));
app.use("/api/trace_back_ng", require("./api/api_trace_back_ng"));
app.use("/api/MC_Error_Month", require("./api/api_MC_Error_Month"));



app.use("/api/Master_ML", require("./api/api_Master_ML"));
app.use("/api/store_issue", require("./api/api_store_issue"));
app.use("/api/Trace_Dynamic", require("./api/api_Trace_Dynamic_parallelirm"));
app.use("/api/Monthly_Operator", require("./api/api_Monthly_Operator"));
app.use("/api/graph_output", require("./api/api_graph_output"));
app.use("/api/percen_ng", require("./api/api_percen_ng"));
app.use("/api/mailcleanliness",require("./api/api_mailcleanliness"));
app.use("/api/cleanlinesssample",require("./api/api_cleanlinesssample"));
app.use("/api/Compare_Output",require("./api/api_graph_Compare"));
app.use("/api/Packing_output",require("./api/api_graph_Packing_output"));


//NAS
const Url = "192.168.101.13";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, `\\\\${Url}\\Public\\Datacleanliness`);  // Update the destination path
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully!' });
});

// Serve files statically
app.use('/cleanliness-files', express.static(`\\\\${Url}\\Public\\Datacleanliness`));


//app.use จะใช้เพื่อไปเรียกอีกหน้า ในที่นี้คือหน้า api_test

//control + space เพื่อให้โชว์ path

// //2010 spd
// app.listen(2010, () => {
//   console.log("Backend is running...");
// });

//2012 nmd
// app.listen(2012, () => {
//   console.log("Backend is running...");
// });



app.listen(2010, () => {
  console.log("Backend is running...");
});