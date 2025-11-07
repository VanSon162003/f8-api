const cron = require("node-cron");
const publishScheduledPosts = require("./publishScheduledPosts");

// Chạy task mỗi phút
const initScheduleTasks = () => {
    cron.schedule("* * * * *", async () => {
        await publishScheduledPosts();
    });
    console.log("Post publishing schedule task initialized", 123);
};

module.exports = initScheduleTasks;
