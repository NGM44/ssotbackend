"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    httpStatusCode;
    errorType;
    errors;
    errorRaw;
    errorsValidation;
    constructor(httpStatusCode, errorType, message, errors = null, errorRaw = null, errorsValidation = null) {
        super(errorRaw ? errorRaw.message : message);
        this.name = this.constructor.name;
        this.httpStatusCode = httpStatusCode;
        this.errorType = errorType;
        this.errors = errors;
        this.errorRaw = errorRaw;
        this.errorsValidation = errorsValidation;
        if (errorRaw)
            this.stack = errorRaw.stack;
    }
    get HttpStatusCode() {
        return this.httpStatusCode;
    }
    get JSON() {
        return {
            errorType: this.errorType,
            errorMessage: this.message,
            errors: this.errors,
            errorRaw: ["localhost", "dev"].includes(process.env.NODE_ENV || "localhost") ? this.errorRaw : {},
            errorsValidation: this.errorsValidation,
            stack: ["localhost", "dev"].includes(process.env.NODE_ENV || "localhost") ? this.stack : "",
        };
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=CustomError.js.map