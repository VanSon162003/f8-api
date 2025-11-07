const axios = require("axios");
(async () => {
    try {
        const res = await axios.post(
            "http://localhost:3001/api/v1/auth/register",
            {
                email: "debug@example.test",
                frist_name: "A",
                last_name: "B",
                password: "Password123",
            }
        );
    } catch (err) {
        console.error(
            "ERR status",
            err.response?.status,
            "data",
            err.response?.data || err.message
        );
    }
})();
