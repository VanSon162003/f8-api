const ejs = require("ejs");
const path = require("path");

async function loadEmail(template, data) {
    const emailPath = path.join(__dirname, "..", "views", `${template}.ejs`);
    try {
        const html = await ejs.renderFile(emailPath, data);

        return html;
    } catch (error) {
        console.log(error);
    }
}

module.exports = loadEmail;
