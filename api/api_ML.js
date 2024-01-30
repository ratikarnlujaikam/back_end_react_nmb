const express = require("express");
const router = express.Router();
const user = require("../database/models/user");

//motor
//DataML
router.get(
  "/dataML/:startDate/:finishDate/:myModel/:myLine/:KPOV/:KPOV_Table/:KPIV1/:KPIV1_Table/:KPIV2/:KPIV2_Table/:KPIV3/:KPIV3_Table/:KPIV4/:KPIV4_Table/:KPIV5/:KPIV5_Table/:KPIV6/:KPIV6_Table/:KPIV7/:KPIV7_Table/:KPIV8/:KPIV8_Table/:KPIV9/:KPIV9_Table/:KPIV10/:KPIV10_Table/:KPIV11/:KPIV11_Table/:KPIV12/:KPIV12_Table/:KPIV13/:KPIV13_Table/:KPIV14/:KPIV14_Table/:KPIV15/:KPIV15_Table",
  async (req, res) => {
    try {
      const { startDate, finishDate, myModel, myLine, KPOV, KPOV_Table, KPIV1, KPIV2, KPIV3, KPIV4, KPIV5, KPIV1_Table, KPIV2_Table, KPIV3_Table, KPIV4_Table, KPIV5_Table, KPIV6, KPIV7, KPIV8, KPIV9, KPIV10, KPIV6_Table, KPIV7_Table, KPIV8_Table, KPIV9_Table, KPIV10_Table, KPIV11, KPIV12, KPIV13, KPIV14, KPIV15, KPIV11_Table, KPIV12_Table, KPIV13_Table, KPIV14_Table, KPIV15_Table } =
        req.params;
          //MBA
          var result1 =[[],];
          var result2 =[[],];
          var result3 =[[],];

          if (KPIV1 !== 'blank' && KPIV2 === 'blank' && KPIV3 === 'blank' && KPIV4 === 'blank' && KPIV5 === 'blank') {
              var result1 = await user.sequelize.query(`
              SELECT [${KPOV_Table}].[Model]
              ,[${KPOV_Table}].[Line]
              ,[${KPOV_Table}].[Date]
              ,[${KPOV_Table}].[Barcode]
              ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
	            ,[Table1].[${KPIV1}] AS ${KPIV1}
            	FROM [DataforAnalysis].[dbo].${KPOV_Table}
                INNER JOIN [DataforAnalysis].[dbo].${KPIV1_Table} AS Table1 ON ${KPOV_Table}.Barcode = Table1.Barcode
			          WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
                order by [${KPOV_Table}].[Date]
              `)
          } else if (KPIV1 !== 'blank' && KPIV2 !== 'blank' && KPIV3 === 'blank' && KPIV4 === 'blank' && KPIV5 === 'blank') {
              var result1 = await user.sequelize.query(`
              SELECT [${KPOV_Table}].[Model]
              ,[${KPOV_Table}].[Line]
              ,[${KPOV_Table}].[Date]
              ,[${KPOV_Table}].[Barcode]
              ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
	            ,[Table1].[${KPIV1}] AS ${KPIV1}
	            ,[Table2].[${KPIV2}] AS ${KPIV2}
            	FROM [DataforAnalysis].[dbo].${KPOV_Table}
                INNER JOIN [DataforAnalysis].[dbo].${KPIV1_Table} AS Table1 ON ${KPOV_Table}.Barcode = Table1.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV2_Table} AS Table2 ON ${KPOV_Table}.Barcode = Table2.Barcode
			          WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
                order by [${KPOV_Table}].[Date]
              `)
          } else if (KPIV1 !== 'blank' && KPIV2 !== 'blank' && KPIV3 !== 'blank' && KPIV4 === 'blank' && KPIV5 === 'blank') {
              var result1 = await user.sequelize.query(`
              SELECT [${KPOV_Table}].[Model]
              ,[${KPOV_Table}].[Line]
              ,[${KPOV_Table}].[Date]
              ,[${KPOV_Table}].[Barcode]
              ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
	            ,[Table1].[${KPIV1}] AS ${KPIV1}
	            ,[Table2].[${KPIV2}] AS ${KPIV2}
            	,[Table3].[${KPIV3}] AS ${KPIV3}
            	FROM [DataforAnalysis].[dbo].${KPOV_Table}
                INNER JOIN [DataforAnalysis].[dbo].${KPIV1_Table} AS Table1 ON ${KPOV_Table}.Barcode = Table1.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV2_Table} AS Table2 ON ${KPOV_Table}.Barcode = Table2.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV3_Table} AS Table3 ON ${KPOV_Table}.Barcode = Table3.Barcode
			          WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
                order by [${KPOV_Table}].[Date]
              `)
          } else if (KPIV1 !== 'blank' && KPIV2 !== 'blank' && KPIV3 !== 'blank' && KPIV4 !== 'blank' && KPIV5 === 'blank') {
              var result1 = await user.sequelize.query(`
              SELECT [${KPOV_Table}].[Model]
              ,[${KPOV_Table}].[Line]
              ,[${KPOV_Table}].[Date]
              ,[${KPOV_Table}].[Barcode]
              ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
	            ,[Table1].[${KPIV1}] AS ${KPIV1}
	            ,[Table2].[${KPIV2}] AS ${KPIV2}
            	,[Table3].[${KPIV3}] AS ${KPIV3}
            	,[Table4].[${KPIV4}] AS ${KPIV4}
            	FROM [DataforAnalysis].[dbo].${KPOV_Table}
                INNER JOIN [DataforAnalysis].[dbo].${KPIV1_Table} AS Table1 ON ${KPOV_Table}.Barcode = Table1.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV2_Table} AS Table2 ON ${KPOV_Table}.Barcode = Table2.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV3_Table} AS Table3 ON ${KPOV_Table}.Barcode = Table3.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV4_Table} AS Table4 ON ${KPOV_Table}.Barcode = Table4.Barcode
			          WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
                order by [${KPOV_Table}].[Date]
              `)
          } else if (KPIV1 !== 'blank' && KPIV2 !== 'blank' && KPIV3 !== 'blank' && KPIV4 !== 'blank' && KPIV5 !== 'blank') {
              var result1 = await user.sequelize.query(`
              SELECT [${KPOV_Table}].[Model]
              ,[${KPOV_Table}].[Line]
              ,[${KPOV_Table}].[Date]
              ,[${KPOV_Table}].[Barcode]
              ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
	            ,[Table1].[${KPIV1}] AS ${KPIV1}
	            ,[Table2].[${KPIV2}] AS ${KPIV2}
            	,[Table3].[${KPIV3}] AS ${KPIV3}
            	,[Table4].[${KPIV4}] AS ${KPIV4}
            	,[Table5].[${KPIV5}] AS ${KPIV5} 
            	FROM [DataforAnalysis].[dbo].${KPOV_Table}
                INNER JOIN [DataforAnalysis].[dbo].${KPIV1_Table} AS Table1 ON ${KPOV_Table}.Barcode = Table1.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV2_Table} AS Table2 ON ${KPOV_Table}.Barcode = Table2.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV3_Table} AS Table3 ON ${KPOV_Table}.Barcode = Table3.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV4_Table} AS Table4 ON ${KPOV_Table}.Barcode = Table4.Barcode
                INNER JOIN [DataforAnalysis].[dbo].${KPIV5_Table} AS Table5 ON ${KPOV_Table}.Barcode = Table5.Barcode
			          WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
                order by [${KPOV_Table}].[Date]
              `)
              
          } ;
          //Rotor
          if (KPIV6 !== 'blank' && KPIV7 === 'blank' && KPIV8 === 'blank' && KPIV9 === 'blank' && KPIV10 === 'blank') {
            var result2 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV6}] AS ${KPIV6}
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching] ON Matching.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [SPD_Fac2].[dbo].${KPIV6_Table} AS Table1 ON Table1.Barcode = Matching.Barcode_rotor
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
          } else if (KPIV6 !== 'blank' && KPIV7 !== 'blank' && KPIV8 === 'blank' && KPIV9 === 'blank' && KPIV10 === 'blank') {
            var result2 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV6}] AS ${KPIV6}
            ,[Table2].[${KPIV7}] AS ${KPIV7}
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching] ON Matching.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [SPD_Fac2].[dbo].${KPIV6_Table} AS Table1 ON Table1.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV7_Table} AS Table2 ON Table2.Barcode = Matching.Barcode_rotor
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
          } else if (KPIV6 !== 'blank' && KPIV7 !== 'blank' && KPIV8 !== 'blank' && KPIV9 === 'blank' && KPIV10 === 'blank') {
            var result2 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV6}] AS ${KPIV6}
            ,[Table2].[${KPIV7}] AS ${KPIV7}
            ,[Table3].[${KPIV8}] AS ${KPIV8}
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching] ON Matching.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [SPD_Fac2].[dbo].${KPIV6_Table} AS Table1 ON Table1.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV7_Table} AS Table2 ON Table2.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV8_Table} AS Table3 ON Table3.Barcode = Matching.Barcode_rotor
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
          } else if (KPIV6 !== 'blank' && KPIV7 !== 'blank' && KPIV8 !== 'blank' && KPIV9 !== 'blank' && KPIV10 === 'blank') {
            var result2 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV6}] AS ${KPIV6}
            ,[Table2].[${KPIV7}] AS ${KPIV7}
            ,[Table3].[${KPIV8}] AS ${KPIV8}
            ,[Table4].[${KPIV9}] AS ${KPIV9}
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching] ON Matching.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [SPD_Fac2].[dbo].${KPIV6_Table} AS Table1 ON Table1.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV7_Table} AS Table2 ON Table2.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV8_Table} AS Table3 ON Table3.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV9_Table} AS Table4 ON Table4.Barcode = Matching.Barcode_rotor
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
          } else if (KPIV6 !== 'blank' && KPIV7 !== 'blank' && KPIV8 !== 'blank' && KPIV9 !== 'blank' && KPIV10 !== 'blank') {
            var result2 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV6}] AS ${KPIV6}
            ,[Table2].[${KPIV7}] AS ${KPIV7}
            ,[Table3].[${KPIV8}] AS ${KPIV8}
            ,[Table4].[${KPIV9}] AS ${KPIV9}
            ,[Table5].[${KPIV10}] AS ${KPIV10} 
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching] ON Matching.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [SPD_Fac2].[dbo].${KPIV6_Table} AS Table1 ON Table1.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV7_Table} AS Table2 ON Table2.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV8_Table} AS Table3 ON Table3.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV9_Table} AS Table4 ON Table4.Barcode = Matching.Barcode_rotor
              INNER JOIN [SPD_Fac2].[dbo].${KPIV10_Table} AS Table5 ON Table5.Barcode = Matching.Barcode_rotor
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
            
          };
          //Base
          if (KPIV11 !== 'blank' && KPIV12 === 'blank' && KPIV13 === 'blank' && KPIV14 === 'blank' && KPIV15 === 'blank') {
            var result3 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV11}] AS ${KPIV11}
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching_Auto_Unit1] ON Matching_Auto_Unit1.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [DataforAnalysis].[dbo].${KPIV11_Table} AS Table1 ON Table1.Part_ID = Matching_Auto_Unit1.Barcode_Base
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
          } else if (KPIV11 !== 'blank' && KPIV12 !== 'blank' && KPIV13 === 'blank' && KPIV14 === 'blank' && KPIV15 === 'blank') {
            var result3 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV11}] AS ${KPIV11}
            ,[Table2].[${KPIV12}] AS ${KPIV12}
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching_Auto_Unit1] ON Matching_Auto_Unit1.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [DataforAnalysis].[dbo].${KPIV11_Table} AS Table1 ON Table1.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV12_Table} AS Table2 ON Table2.Part_ID = Matching_Auto_Unit1.Barcode_Base
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
          } else if (KPIV11 !== 'blank' && KPIV12 !== 'blank' && KPIV13 !== 'blank' && KPIV14 === 'blank' && KPIV15 === 'blank') {
            var result3 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV11}] AS ${KPIV11}
            ,[Table2].[${KPIV12}] AS ${KPIV12}
            ,[Table3].[${KPIV13}] AS ${KPIV13}
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching_Auto_Unit1] ON Matching_Auto_Unit1.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [DataforAnalysis].[dbo].${KPIV11_Table} AS Table1 ON Table1.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV12_Table} AS Table2 ON Table2.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV13_Table} AS Table3 ON Table3.Part_ID = Matching_Auto_Unit1.Barcode_Base
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
          } else if (KPIV11 !== 'blank' && KPIV12 !== 'blank' && KPIV13 !== 'blank' && KPIV14 !== 'blank' && KPIV15 === 'blank') {
            var result3 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV11}] AS ${KPIV11}
            ,[Table2].[${KPIV12}] AS ${KPIV12}
            ,[Table3].[${KPIV13}] AS ${KPIV13}
            ,[Table4].[${KPIV14}] AS ${KPIV14}
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching_Auto_Unit1] ON Matching_Auto_Unit1.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [DataforAnalysis].[dbo].${KPIV11_Table} AS Table1 ON Table1.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV12_Table} AS Table2 ON Table2.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV13_Table} AS Table3 ON Table3.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV14_Table} AS Table4 ON Table4.Part_ID = Matching_Auto_Unit1.Barcode_Base
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
          } else if (KPIV11 !== 'blank' && KPIV12 !== 'blank' && KPIV13 !== 'blank' && KPIV14 !== 'blank' && KPIV15 !== 'blank') {
            var result3 = await user.sequelize.query(`
            SELECT [${KPOV_Table}].[Model]
            ,[${KPOV_Table}].[Line]
            ,[${KPOV_Table}].[Date]
            ,[${KPOV_Table}].[Barcode]
            ,[${KPOV_Table}].[${KPOV}] AS ${KPOV}
            ,[Table1].[${KPIV11}] AS ${KPIV11}
            ,[Table2].[${KPIV12}] AS ${KPIV12}
            ,[Table3].[${KPIV13}] AS ${KPIV13}
            ,[Table4].[${KPIV14}] AS ${KPIV14}
            ,[Table5].[${KPIV15}] AS ${KPIV15} 
            FROM [DataforAnalysis].[dbo].${KPOV_Table}
              INNER JOIN [Temp_TransportData].[dbo].[Matching_Auto_Unit1] ON Matching_Auto_Unit1.Barcode_Motor = ${KPOV_Table}.Barcode
              INNER JOIN [DataforAnalysis].[dbo].${KPIV11_Table} AS Table1 ON Table1.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV12_Table} AS Table2 ON Table2.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV13_Table} AS Table3 ON Table3.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV14_Table} AS Table4 ON Table4.Part_ID = Matching_Auto_Unit1.Barcode_Base
              INNER JOIN [DataforAnalysis].[dbo].${KPIV15_Table} AS Table5 ON Table5.Part_ID = Matching_Auto_Unit1.Barcode_Base
              WHERE [${KPOV_Table}].[Model] = '${myModel}' AND [${KPOV_Table}].[Line] = '${myLine}' AND [${KPOV_Table}].[Date] BETWEEN '${startDate}' and '${finishDate}'
              order by [${KPOV_Table}].[Date]
            `)
            
          };

      res.json({
        result1: result1[0],
        result2: result2[0],
        result3: result3[0],
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

router.get("/model", async (req, res) => {
  try {
    let result = await user.sequelize.query(`Select distinct [Model]
    FROM [TransportData].[dbo].[Master_matchings]
    where [Model] != 'EVANS'
    order by [Model]`);
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

router.get("/line/:myModel", async (req, res) => {
  try {
    const { myModel } = req.params;
    let result = await user.sequelize.query(`Select distinct [Model], [Line]
    FROM [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester]
    where [DataforAnalysis].[dbo].[Dynamic_Parallelism_Tester].[Model] = '${myModel}'`);
    // console.log(result);

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

router.get("/dataSourceKPOV", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Process]
    FROM [TransportData].[dbo].[Master_productionlines]
    order by [Process]`);
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

router.get("/dataSourceMBA", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Process]
    FROM [TransportData].[dbo].[Master_productionlines]
    where [Level] = 'MBA'
    order by [Process]`);
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

router.get("/dataSourceRotor", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Process]
    FROM [TransportData].[dbo].[Master_productionlines]
    where [Level] = 'Rotor'
    order by [Process]`);
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

router.get("/dataSourceBase", async (req, res) => {
  try {
    let result = await user.sequelize.query(`select distinct [Process]
    FROM [TransportData].[dbo].[Master_productionlines]
    where [Level] = 'Base'
    order by [Process]`);
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

router.get("/parameter/:process", async (req, res) => {
  try {
    const { process } = req.params;
    let result = await user.sequelize.query(`select distinct [Process],[Parameter]
    FROM [TransportData].[dbo].[ControlLimits]
    where [Process] = '${process}'`);
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


module.exports = router;
