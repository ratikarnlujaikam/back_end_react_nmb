const express = require("express");
const router = express.Router();
const AP1 = require("../database/models/AP1")
const AP2 = require("../database/models/AP2")
const AP3 = require("../database/models/AP3")
const OFTOP1 = require("../database/models/OFTOP1")
const OFTOP2 = require("../database/models/OFTOP2")
const OFBTM1 = require("../database/models/OFBTM1")
const OFBTM2 = require("../database/models/OFBTM2")
const ECTOP = require("../database/models/ECTOP")
const ECBTM = require("../database/models/ECBTM")

router.post('/grline/:selectDate', async (req, res) => {
    try {
        const {selectDate} = req.params;
        let resultAP1 = await AP1.sequelize
        .query(`
        SELECT *
        FROM [GRLine].[dbo].[AP1s]
        WHERE [GRLine].[dbo].[AP1s].[Date] = '${selectDate}'
        `)
        let resultAP1AVG = await AP1.sequelize
        .query(`
        With TimeTable (N) as (select [Hour] = V.number FROM master..spt_values V
            WHERE V.type = 'P' AND V.number >= 0 AND V.number <= 23),
            selectTime (T) as (select convert(varchar(10),N) as [Time] from TimeTable),
            
			GR0 (x1) as
				(select
				Right([GRLine].[dbo].[AP1s].[Time], 9) as [Time]
                FROM [GRLine].[dbo].[AP1s]
                WHERE [GRLine].[dbo].[AP1s].[Date] = '${selectDate}'
				),

            GR1 (x1,x2,x3,x4,x5,x6,x7,x8,x9) as
                (select 
                [GRLine].[dbo].[AP1s].[Date] as [Date],
                GR0.x1 as [Time],
                [GRLine].[dbo].[AP1s].[Judge] as [Judge],
                [GRLine].[dbo].[AP1s].[Axial_Play] as [Axial_Play],
                [GRLine].[dbo].[AP1s].[Cycle_Time] as [Cycle_Time],
                [GRLine].[dbo].[AP1s].[Adjustments] as [Adjustments],
                [GRLine].[dbo].[AP1s].[Axial_Play_Before] as [Axial_Play_Before],
                [GRLine].[dbo].[AP1s].[Axial_Play_1] as [Axial_Play_1],
                [GRLine].[dbo].[AP1s].[Pre_Axial_Play] as [Pre_Axial_Play]
                FROM [GRLine].[dbo].[AP1s]
				JOIN GR0
				ON GR0.x1 = Right([GRLine].[dbo].[AP1s].[Time], 9)
                WHERE [GRLine].[dbo].[AP1s].[Date] = '${selectDate}'
                ),
            
            GR2 (x1,x2,x3) as
                (select 
                [GRLine].[dbo].[AP1s].[Date] as [Date],
                LEFT(GR0.x1, 3) as [Time],
                [GRLine].[dbo].[AP1s].[Axial_Play_1] as [Axial_Play_1]
                FROM [GRLine].[dbo].[AP1s]
				JOIN GR0
				ON GR0.x1 = Right([GRLine].[dbo].[AP1s].[Time], 9)
                WHERE [GRLine].[dbo].[AP1s].[Date] = '${selectDate}'
                and [GRLine].[dbo].[AP1s].[Axial_Play_1] != 0
                ),
            
            GR3 (x1,x2,x3,x4,x5,x6,x7,x8) as
                (select 
                LEFT(GR1.x2, 3), 
                count(GR1.x3),
                count(case when GR1.x3 = 'NG' then 1 else null end), 
                cast(AVG(GR1.x4) as decimal(10,3)),
                cast(AVG(GR1.x5) as decimal(10,3)),
                cast(AVG(GR1.x6) as decimal(10,3)),
                cast(AVG(GR1.x7) as decimal(10,3)),
                cast(AVG(GR1.x9) as decimal(10,3))
                FROM GR1 
                group by LEFT(GR1.x2, 3)
                ),
            
            GR4 (x1, x2) as
                (select
                GR2.x2 as [Time],
                cast(AVG(GR2.x3) as decimal(10,3))
                FROM GR2 
                group by GR2.x2
                ),
            
            GR5 (x1) as
                (select
                case when T<10 then  '0' + cast(T as varchar) else cast(T as varchar) end as [Time]
                FROM selectTime
                )
            
       
                select 
                GR3.x1 + ':00' as [Time],
                GR3.x2 as [Prod],
                GR3.x3 as [Judge],
                GR3.x4 as [Axial_Play],
                GR3.x5 as [Cycle_Time],
                GR3.x6 as [Adjustments],
                GR3.x7 as [Axial_Play_Before],
                GR4.x2 as [Axial_Play_1],
                GR3.x8 as [Pre_Axial_Play]
            
                from GR3 
                full join GR5 on GR5.x1 = GR3.x1
                join GR4 on GR3.x1 =GR4.x1
                order by GR3.x1 + 0
        `)
        let resultAP2 = await AP2.sequelize
        .query(`
        SELECT *
        FROM [GRLine].[dbo].[AP2s]
        WHERE [GRLine].[dbo].[AP2s].[Date] = '${selectDate}'
        `)
        let resultAP2AVG = await AP2.sequelize
        .query(`
        With TimeTable (N) as (select [Hour] = V.number FROM master..spt_values V
            WHERE V.type = 'P' AND V.number >= 0 AND V.number <= 23),
            selectTime (T) as (select convert(varchar(10),N) as [Time] from TimeTable),
            
			GR0 (x1) as
				(select
				Right([GRLine].[dbo].[AP2s].[Time], 9) as [Time]
                FROM [GRLine].[dbo].[AP2s]
                WHERE [GRLine].[dbo].[AP2s].[Date] = '${selectDate}'
				),

            GR1 (x1,x2,x3,x4,x5,x6,x7,x8,x9) as
                (select 
                [GRLine].[dbo].[AP2s].[Date] as [Date],
                GR0.x1 as [Time],
                [GRLine].[dbo].[AP2s].[Judge] as [Judge],
                [GRLine].[dbo].[AP2s].[Axial_Play] as [Axial_Play],
                [GRLine].[dbo].[AP2s].[Cycle_Time] as [Cycle_Time],
                [GRLine].[dbo].[AP2s].[Adjustments] as [Adjustments],
                [GRLine].[dbo].[AP2s].[Axial_Play_Before] as [Axial_Play_Before],
                [GRLine].[dbo].[AP2s].[Axial_Play_1] as [Axial_Play_1],
                [GRLine].[dbo].[AP2s].[Pre_Axial_Play] as [Pre_Axial_Play]
                FROM [GRLine].[dbo].[AP2s]
				JOIN GR0
				ON GR0.x1 = Right([GRLine].[dbo].[AP2s].[Time], 9)
                WHERE [GRLine].[dbo].[AP2s].[Date] = '${selectDate}'
                ),
            
            GR2 (x1,x2,x3) as
                (select 
                [GRLine].[dbo].[AP2s].[Date] as [Date],
                LEFT(GR0.x1, 3) as [Time],
                [GRLine].[dbo].[AP2s].[Axial_Play_1] as [Axial_Play_1]
                FROM [GRLine].[dbo].[AP2s]
				JOIN GR0
				ON GR0.x1 = Right([GRLine].[dbo].[AP2s].[Time], 9)
                WHERE [GRLine].[dbo].[AP2s].[Date] = '${selectDate}'
                and [GRLine].[dbo].[AP2s].[Axial_Play_1] != 0
                ),
            
            GR3 (x1,x2,x3,x4,x5,x6,x7,x8) as
                (select 
                LEFT(GR1.x2, 3), 
                count(GR1.x3),
                count(case when GR1.x3 = 'NG' then 1 else null end), 
                cast(AVG(GR1.x4) as decimal(10,3)),
                cast(AVG(GR1.x5) as decimal(10,3)),
                cast(AVG(GR1.x6) as decimal(10,3)),
                cast(AVG(GR1.x7) as decimal(10,3)),
                cast(AVG(GR1.x9) as decimal(10,3))
                FROM GR1 
                group by LEFT(GR1.x2, 3)
                ),
            
            GR4 (x1, x2) as
                (select
                GR2.x2 as [Time],
                cast(AVG(GR2.x3) as decimal(10,3))
                FROM GR2 
                group by GR2.x2
                ),
            
            GR5 (x1) as
                (select
                case when T<10 then  '0' + cast(T as varchar) else cast(T as varchar) end as [Time]
                FROM selectTime
                )
            
       
                select 
                GR3.x1 + ':00' as [Time],
                GR3.x2 as [Prod],
                GR3.x3 as [Judge],
                GR3.x4 as [Axial_Play],
                GR3.x5 as [Cycle_Time],
                GR3.x6 as [Adjustments],
                GR3.x7 as [Axial_Play_Before],
                GR4.x2 as [Axial_Play_1],
                GR3.x8 as [Pre_Axial_Play]
            
                from GR3 
                full join GR5 on GR5.x1 = GR3.x1
                join GR4 on GR3.x1 =GR4.x1
                order by GR3.x1 + 0
        `)
        let resultAP3 = await AP3.sequelize
        .query(`
        SELECT *
        FROM [GRLine].[dbo].[AP3s]
        WHERE [GRLine].[dbo].[AP3s].[Date] = '${selectDate}'
        `)
        let resultAP3AVG = await AP3.sequelize
        .query(`
        With TimeTable (N) as (select [Hour] = V.number FROM master..spt_values V
            WHERE V.type = 'P' AND V.number >= 0 AND V.number <= 23),
            selectTime (T) as (select convert(varchar(10),N) as [Time] from TimeTable),
            
			GR0 (x1) as
				(select
				Right([GRLine].[dbo].[AP3s].[Time], 9) as [Time]
                FROM [GRLine].[dbo].[AP3s]
                WHERE [GRLine].[dbo].[AP3s].[Date] = '${selectDate}'
				),

            GR1 (x1,x2,x3,x4,x5,x6,x7,x8,x9) as
                (select 
                [GRLine].[dbo].[AP3s].[Date] as [Date],
                GR0.x1 as [Time],
                [GRLine].[dbo].[AP3s].[Judge] as [Judge],
                [GRLine].[dbo].[AP3s].[Axial_Play] as [Axial_Play],
                [GRLine].[dbo].[AP3s].[Cycle_Time] as [Cycle_Time],
                [GRLine].[dbo].[AP3s].[Adjustments] as [Adjustments],
                [GRLine].[dbo].[AP3s].[Axial_Play_Before] as [Axial_Play_Before],
                [GRLine].[dbo].[AP3s].[Axial_Play_1] as [Axial_Play_1],
                [GRLine].[dbo].[AP3s].[Pre_Axial_Play] as [Pre_Axial_Play]
                FROM [GRLine].[dbo].[AP3s]
				JOIN GR0
				ON GR0.x1 = Right([GRLine].[dbo].[AP3s].[Time], 9)
                WHERE [GRLine].[dbo].[AP3s].[Date] = '${selectDate}'
                ),
            
            GR2 (x1,x2,x3) as
                (select 
                [GRLine].[dbo].[AP3s].[Date] as [Date],
                LEFT(GR0.x1, 3) as [Time],
                [GRLine].[dbo].[AP3s].[Axial_Play_1] as [Axial_Play_1]
                FROM [GRLine].[dbo].[AP3s]
				JOIN GR0
				ON GR0.x1 = Right([GRLine].[dbo].[AP3s].[Time], 9)
                WHERE [GRLine].[dbo].[AP3s].[Date] = '${selectDate}'
                and [GRLine].[dbo].[AP3s].[Axial_Play_1] != 0
                ),
            
            GR3 (x1,x2,x3,x4,x5,x6,x7,x8) as
                (select 
                LEFT(GR1.x2, 3), 
                count(GR1.x3),
                count(case when GR1.x3 = 'NG' then 1 else null end), 
                cast(AVG(GR1.x4) as decimal(10,3)),
                cast(AVG(GR1.x5) as decimal(10,3)),
                cast(AVG(GR1.x6) as decimal(10,3)),
                cast(AVG(GR1.x7) as decimal(10,3)),
                cast(AVG(GR1.x9) as decimal(10,3))
                FROM GR1 
                group by LEFT(GR1.x2, 3)
                ),
            
            GR4 (x1, x2) as
                (select
                GR2.x2 as [Time],
                cast(AVG(GR2.x3) as decimal(10,3))
                FROM GR2 
                group by GR2.x2
                ),
            
            GR5 (x1) as
                (select
                case when T<10 then  '0' + cast(T as varchar) else cast(T as varchar) end as [Time]
                FROM selectTime
                )
            
       
                select 
                GR3.x1 + ':00' as [Time],
                GR3.x2 as [Prod],
                GR3.x3 as [Judge],
                GR3.x4 as [Axial_Play],
                GR3.x5 as [Cycle_Time],
                GR3.x6 as [Adjustments],
                GR3.x7 as [Axial_Play_Before],
                GR4.x2 as [Axial_Play_1],
                GR3.x8 as [Pre_Axial_Play]
            
                from GR3 
                full join GR5 on GR5.x1 = GR3.x1
                join GR4 on GR3.x1 =GR4.x1
                order by GR3.x1 + 0
        `)
        res.json({api_result: "OK", 
            resultAP1, resultAP1AVG, 
            resultAP2, resultAP2AVG, 
            resultAP3, resultAP3AVG
        })
    } catch (error) {
        res.json({api_result: "NOK"})
    }
})

module.exports = router;