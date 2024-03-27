function sendError(res, statusCode, message, errorString='') {
  res.status(statusCode).send({ message, error: errorString });
}

function sendSuccess(res, message, data = {}) {
  const responseData = Object.keys(data).length > 0 ? { message, data } : { message};
  res.status(200).send(responseData);
}

module.exports = { sendError, sendSuccess };
