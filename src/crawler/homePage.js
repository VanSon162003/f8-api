const axios = require("axios");

const url = "https://fullstack.edu.vn/";

const userAgents = {
    browser:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.88 Safari/537.36",
    bot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
};

async function checkRobotsTxt() {
    console.log("🧾 Kiểm tra robots.txt ...");
    try {
        const res = await axios.get(url + "robots.txt");
        console.log("Trạng thái:", res.status);
        console.log(
            "Nội dung robots.txt:\n",
            res.data || "(Không có file robots.txt)"
        );
        console.log("\n");
    } catch (err) {
        console.log("⚠️ Không tìm thấy robots.txt hoặc bị chặn:", err.message);
    }
}

async function compareUserAgents() {
    console.log("🕵️‍♂️ So sánh phản hồi giữa browser và bot ...");

    try {
        const [browserRes, botRes] = await Promise.all([
            axios.get(url, { headers: { "User-Agent": userAgents.browser } }),
            axios.get(url, { headers: { "User-Agent": userAgents.bot } }),
        ]);

        const browserText = browserRes.data;
        const botText = botRes.data;

        console.log("Browser:", {
            status: browserRes.status,
            length: browserText.length,
        });
        console.log("Bot:", {
            status: botRes.status,
            length: botText.length,
        });

        console.log("\n🔍 Kết quả so sánh:");
        if (browserText.length > botText.length * 2) {
            console.log(
                "⚠️ Có thể website chặn crawler hoặc trả nội dung khác khi là bot!"
            );
        } else {
            console.log("✅ Không phát hiện chặn crawler rõ ràng.");
        }
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
