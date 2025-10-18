const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

module.exports = {
    async getFailedCount(userId) {
        const v = await redis.get(`2fa:fail:${userId}`);
        return v ? parseInt(v, 10) : 0;
    },
    async incrFailed(userId) {
        const v = await redis.incr(`2fa:fail:${userId}`);
        if (v === 1) {
            // set TTL 10 minutes
            await redis.expire(`2fa:fail:${userId}`, 60 * 10);
        }
        return v;
    },
    async reset(userId) {
        await redis.del(`2fa:fail:${userId}`);
    },
    async lockUntil(userId, seconds) {
        await redis.set(`2fa:lock:${userId}`, "1", "EX", seconds);
    },
    async isLocked(userId) {
        const v = await redis.get(`2fa:lock:${userId}`);
        return !!v;
    },
};
