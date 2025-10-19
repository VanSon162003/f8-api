const Pusher = require("pusher");

// check
const pusher = new Pusher({
    appId: "1",
    key: "app1",
    secret: "app1-secret-key",
    useTLS: true,
    cluster: "",
    host: "chat.vsron.site",
    port: 443,
});

module.exports = pusher;
