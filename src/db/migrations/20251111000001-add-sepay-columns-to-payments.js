"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            // Check if columns already exist to avoid duplicate errors
            const table = await queryInterface.describeTable("payments");

            // Add reference_code if it doesn't exist
            if (!table.reference_code) {
                await queryInterface.addColumn("payments", "reference_code", {
                    type: Sequelize.STRING,
                    allowNull: true,
                    unique: true,
                });
                console.log("Added reference_code column");
            }

            // Add qr_code if it doesn't exist
            if (!table.qr_code) {
                await queryInterface.addColumn("payments", "qr_code", {
                    type: Sequelize.TEXT,
                    allowNull: true,
                });
                console.log("Added qr_code column");
            }

            // Add order_code if it doesn't exist
            if (!table.order_code) {
                await queryInterface.addColumn("payments", "order_code", {
                    type: Sequelize.STRING,
                    allowNull: true,
                });
                console.log("Added order_code column");
            }

            // Add sepay_transaction_id if it doesn't exist
            if (!table.sepay_transaction_id) {
                await queryInterface.addColumn(
                    "payments",
                    "sepay_transaction_id",
                    {
                        type: Sequelize.STRING,
                        allowNull: true,
                    }
                );
                console.log("Added sepay_transaction_id column");
            }

            // Add payment_method if it doesn't exist
            if (!table.payment_method) {
                await queryInterface.addColumn("payments", "payment_method", {
                    type: Sequelize.ENUM("stripe", "sepay"),
                    defaultValue: "stripe",
                });
                console.log("Added payment_method column");
            }

            // Add expires_at if it doesn't exist
            if (!table.expires_at) {
                await queryInterface.addColumn("payments", "expires_at", {
                    type: Sequelize.DATE,
                    allowNull: true,
                });
                console.log("Added expires_at column");
            }

            // Add transaction_date if it doesn't exist
            if (!table.transaction_date) {
                await queryInterface.addColumn("payments", "transaction_date", {
                    type: Sequelize.DATE,
                    allowNull: true,
                });
                console.log("Added transaction_date column");
            }

            // Add indexes
            try {
                await queryInterface.addIndex("payments", ["reference_code"]);
            } catch (e) {
                console.log("Index on reference_code already exists");
            }

            try {
                await queryInterface.addIndex("payments", [
                    "sepay_transaction_id",
                ]);
            } catch (e) {
                console.log("Index on sepay_transaction_id already exists");
            }

            try {
                await queryInterface.addIndex("payments", ["payment_method"]);
            } catch (e) {
                console.log("Index on payment_method already exists");
            }

            try {
                await queryInterface.addIndex("payments", ["status"]);
            } catch (e) {
                console.log("Index on status already exists");
            }

            console.log("Migration completed successfully");
        } catch (error) {
            console.error("Migration error:", error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        try {
            const table = await queryInterface.describeTable("payments");

            // Remove indexes safely
            try {
                if (table.reference_code) {
                    await queryInterface.removeIndex("payments", [
                        "reference_code",
                    ]);
                }
            } catch (e) {
                console.log("Index on reference_code not found");
            }

            try {
                if (table.sepay_transaction_id) {
                    await queryInterface.removeIndex("payments", [
                        "sepay_transaction_id",
                    ]);
                }
            } catch (e) {
                console.log("Index on sepay_transaction_id not found");
            }

            try {
                if (table.payment_method) {
                    await queryInterface.removeIndex("payments", [
                        "payment_method",
                    ]);
                }
            } catch (e) {
                console.log("Index on payment_method not found");
            }

            // Remove columns if they exist
            if (table.reference_code) {
                await queryInterface.removeColumn("payments", "reference_code");
            }
            if (table.qr_code) {
                await queryInterface.removeColumn("payments", "qr_code");
            }
            if (table.order_code) {
                await queryInterface.removeColumn("payments", "order_code");
            }
            if (table.sepay_transaction_id) {
                await queryInterface.removeColumn(
                    "payments",
                    "sepay_transaction_id"
                );
            }
            if (table.payment_method) {
                await queryInterface.removeColumn("payments", "payment_method");
            }
            if (table.expires_at) {
                await queryInterface.removeColumn("payments", "expires_at");
            }
            if (table.transaction_date) {
                await queryInterface.removeColumn(
                    "payments",
                    "transaction_date"
                );
            }
        } catch (error) {
            console.error("Migration error:", error);
            throw error;
        }
    },
};
