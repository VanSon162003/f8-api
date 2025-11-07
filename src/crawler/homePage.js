const axios = require("axios");

const url = "https://fullstack.edu.vn/";

const userAgents = {
    browser:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.88 Safari/537.36",
    bot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
};

async function checkRobotsTxt() {
    try {
        const res = await axios.get(url + "robots.txt");
    } catch (err) {
        console.log("⚠️ Không tìm thấy robots.txt hoặc bị chặn:", err.message);
    }
}

async function compareUserAgents() {
    try {
        const [browserRes, botRes] = await Promise.all([
            axios.get(url, { headers: { "User-Agent": userAgents.browser } }),
            axios.get(url, { headers: { "User-Agent": userAgents.bot } }),
        ]);

        const browserText = browserRes.data;
        const botText = botRes.data;
    } catch (err) {
        console.error("Lỗi khi so sánh:", err.message);
    }
}

(async () => {
    try {
        await checkRobotsTxt();
        await compareUserAgents();
    } catch (err) {
        console.error("Lỗi khi kiểm tra:", err);
    }
})();
