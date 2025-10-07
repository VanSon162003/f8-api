require("dotenv").config();
require("module-alias/register");
const express = require("express");
const cors = require("cors");
const router = require("./src/routes");
const methodOverride = require("method-override");
const { sequelize } = require("./src/db/models");

const notFoundHandle = require("./src/middlewares/errors/notFoundHandle");
const errorHandler = require("./src/middlewares/errors/erorrHandle");
// dấu hiệu
const path = require("path");

const app = express();
const port = 3001;

app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded());

// lấy dữ liệu từ database thông qua sequelize

async function sendDb() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

sendDb();

// Hỗ trợ từ query hoặc input hidden

app.use(methodOverride("_method"));

// cấu hình router public
app.use(express.static("public"));

// router tổng

app.use("/api/v1", router);

// xử lý tài nguyên không chính xác

app.use(notFoundHandle);

// hàm xử lý lỗi

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
