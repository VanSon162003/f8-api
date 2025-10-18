const crypto = require("crypto");

const ALGO = "aes-256-gcm";

// key should be 32 bytes (base64 or hex) provided via ENV
const getKey = () => {
    const k = process.env.TFA_ENCRYPTION_KEY || process.env.TFA_KEY || null;
    if (!k) throw new Error("TFA_ENCRYPTION_KEY not set in env");
    // assume base64
    return Buffer.from(k, "base64");
};

function encrypt(plaintext) {
    const key = getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("base64")}.${tag.toString(
        "base64"
    )}.${encrypted.toString("base64")}`;
}

function decrypt(payload) {
    const key = getKey();
    const parts = payload.split(".");
    if (parts.length !== 3) throw new Error("Invalid encrypted payload");
    const iv = Buffer.from(parts[0], "base64");
    const tag = Buffer.from(parts[1], "base64");
    const encrypted = Buffer.from(parts[2], "base64");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
}

module.exports = {
    encrypt,
    decrypt,
};
