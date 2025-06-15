const ApiError = require('./ApiError');

/**
 * Validate dữ liệu với schema Joi
 * @param {Object} schema - Schema Joi để validate
 * @param {Object} data - Dữ liệu cần validate
 * @returns {Promise<Object>} - Dữ liệu đã được validate
 * @throws {ApiError} - Lỗi validation
 */
const validateSchema = async (schema, data) => {
    try {
        // Validate dữ liệu với schema
        const validatedData = await schema.validateAsync(data, {
            abortEarly: false, // Trả về tất cả lỗi
            stripUnknown: true, // Loại bỏ các trường không có trong schema
            convert: true // Tự động chuyển đổi kiểu dữ liệu nếu có thể
        });

        return validatedData;
    } catch (error) {
        // Nếu là lỗi validation của Joi
        if (error.isJoi) {
            // Format lại thông báo lỗi
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            throw new ApiError(400, 'Dữ liệu không hợp lệ', errors);
        }

        // Nếu là lỗi khác
        throw error;
    }
};

module.exports = {
    validateSchema
}; 