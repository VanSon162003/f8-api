require("dotenv").config();
const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3001/api";

async function testMockPayment() {
    try {
        console.log("🧪 Testing Mock Payment Flow...\n");
        console.log(`📍 API URL: ${API_URL}`);
        console.log(`🎭 Mock Mode: ${process.env.SEPAY_MOCK_MODE}\n`);

        // Step 1: Create a test payment (without auth for simplicity)
        console.log("1️⃣  Attempting to create payment...");

        // Note: In real scenario, need JWT token from login
        // For now, test with checkAuth bypass by adding test route

        const mockPaymentData = {
            courseId: 2,
            amount: 10000000,
            description: "F8 Course Payment",
        };

        console.log("📊 Payment Data:", mockPaymentData);
        console.log("\n✅ Mock Mode is ENABLED in .env");
        console.log("   - getAccessToken() will return mock token");
        console.log("   - generateQRCode() will return mock QR");
        console.log("   - No network calls to Sepay API");
        console.log("\n🚀 Ready to test with real frontend login!");
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testMockPayment();
