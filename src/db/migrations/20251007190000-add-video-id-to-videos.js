"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("videos", "video_id", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.addIndex("videos", ["video_id"], {
            name: "idx_videos_video_id",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex("videos", "idx_videos_video_id");
        await queryInterface.removeColumn("videos", "video_id");
    },
};


