const { Sequelize, DataTypes } = require("sequelize");
const database = require("../grl_connection");
const AP3 = database.define(
        "AP3",
        {
            Date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                primaryKey: false,
            },
            Time: {
                type: Sequelize.STRING,
                allowNull: false,
    //             unique: true,
            },
            Judge: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            Axial_Play: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            Cycle_Time: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            Adjustments: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            Axial_Play_Before: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            Axial_Play_1: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            Pre_Axial_Play: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
        },
        {
            //option
        }
    );
    (async () => {
        await AP3.sync({ force: false });
    })();
    module.exports = AP3;
    