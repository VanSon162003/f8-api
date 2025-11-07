const db = require("../src/db/models");

async function up() {
    const qi = db.sequelize.getQueryInterface();
    try {
        await qi.addColumn("users", "two_factor_recovery_codes", {
            type: db.Sequelize.TEXT,
            allowNull: true,
        });
    } catch (e) {
        console.error("skip two_factor_recovery_codes:", e.message);
    }

    try {
        await qi.addColumn("users", "two_factor_failed_count", {
            type: db.Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    } catch (e) {
        console.error("skip two_factor_failed_count:", e.message);
    }

    try {
        await qi.addColumn("users", "two_factor_locked_until", {
            type: db.Sequelize.DATE,
            allowNull: true,
        });
    } catch (e) {
        console.error("skip two_factor_locked_until:", e.message);
    }

    await db.sequelize.close();
}

up().catch((err) => {
    console.error(err);
    process.exit(1);
});
