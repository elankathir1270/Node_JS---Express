class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    //400-499 -> client error, 500-599 -> server error
    this.statusCode = statusCode;

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); //current object, class
  }
}

module.exports = CustomError;

//const error = new CustomError("some error message", 404) ex: class instantiate
