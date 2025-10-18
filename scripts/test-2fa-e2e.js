const axios = require("axios").default;
const speakeasy = require("speakeasy");
const db = require("../src/db/models");
const bcrypt = require("../src/utils/bcrypt");

const API = "http://localhost:3001/api/v1/auth";

async function createTestUser() {
    // create a user via register endpoint
    const email = `e2e_${Date.now()}@example.test`;
    const password = "Password123!";
    try {
        await axios.post(`${API}/register`, {
            email,
            frist_name: "E2E",
            last_name: "Tester",
            password,
        });
    } catch (err) {
        console.error("Register error:", err.response?.data || err.message);
    }
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
        throw new Error("Failed to create test user");
    }
    return { email, password, id: user.id };
}

async function login(email, password) {
    const r = await axios.post(`${API}/login`, { email, password });
    return r.data;
}

async function enable2fa(accessToken) {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const setup = await axios.get(`${API}/2fa/setup`, { headers });
    const { secret, qr } = setup.data;
    const token = speakeasy.totp({ secret, encoding: "base32" });
    const verify = await axios.post(
        `${API}/2fa/verify`,
        { token, secret },
        { headers }
    );
    return verify.data;
}

async function testFlow() {
    console.log("Creating user...");
    const u = await createTestUser();
    console.log("Logging in...");
    const res = await login(u.email, u.password);
    if (res.require2fa)
        throw new Error("User unexpectedly has 2FA before test");
    console.log("Enabling 2FA...");
    const enable = await enable2fa(res.access_token);
    console.log("Enable response:", enable);
    const recoveryCodes = enable.recovery_codes;
    if (!recoveryCodes || recoveryCodes.length === 0)
        throw new Error("No recovery codes returned");
    console.log("Recovery codes:", recoveryCodes.slice(0, 3));

    // Now attempt login which should return require2fa + tmpToken
    console.log("Attempting login (should require 2FA)...");
    const loginResp = await axios.post(`${API}/login`, {
        email: u.email,
        password: u.password,
    });
    if (!loginResp.data.require2fa)
        throw new Error("Login did not require 2FA");
    console.log("tmpToken:", loginResp.data.tmpToken.slice(0, 20), "...");

    // Use one recovery code to finish login
    const tmpToken = loginResp.data.tmpToken;
    const token = recoveryCodes[0];
    const final = await axios.post(`${API}/login/2fa`, { tmpToken, token });
    console.log("Final login:", final.data);
}

if (require.main === module) {
    testFlow()
        .then(() => {
            console.log("E2E success");
            process.exit(0);
        })
        .catch((err) => {
            console.error(err.response?.data || err.message || err);
            process.exit(1);
        });
}
