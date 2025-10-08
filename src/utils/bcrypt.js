const bcrypt = require("bcrypt");
const saltRounds = 10;
const plainPassword = "mySecurePassword";

exports.hash = (plainPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
        });
    });
};

exports.compare = (userPassword, storePassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(userPassword, storePassword, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};
