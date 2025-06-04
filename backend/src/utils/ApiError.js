/**
 * Custom error class cho API
 * @extends Error
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Thông báo lỗi
     * @param {Array} errors - Chi tiết lỗi (optional)
     * @param {boolean} isOperational - Là lỗi có thể xử lý được (optional)
     */
    constructor(statusCode, message, errors = [], isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError; 