const success = (res, status, data, message) => {
    res.status(status).json({
        success: true,
        data,
        message,
    });
};

const error = (res, status, message, error) => {
    res.status(status).json({
        success: false,
        message,
        error,
    });
};

module.exports = { success, error };
