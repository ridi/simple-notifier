/**
 * Hapi middleware for handling errors
 *
 * @since 1.0.0
 */

const SSSError = require('../common/Error');

const defaultOptions = Object.freeze({
  apiPrefix: '/api',
  errorView: 'error',
});

const generateErrorResponseBody = request => ({
  code: request.response.errorCode,
  message: request.response.message,
  success: false,
});

const getStatusCode = request => request.response.statusCode || request.response.output.statusCode;

/* eslint no-param-reassign: ["error", { "props": false }] */
const onSuccess = (request, h, options) => {
  const { path, response } = request;
  if (path.includes(options.apiPrefix)) {
    const responseObj = response.source || {};
    responseObj.success = true;
    response.source = responseObj;
  }
  return null;
};

const onApiError = (request, h) => {
  const statusCode = getStatusCode(request);
  const responseBody = generateErrorResponseBody(request);
  switch (statusCode) {
    case 400:
      if (request.response.data && request.response.data.name === 'ValidationError') {
        responseBody.code = SSSError.Types.BAD_REQUEST_INVALID.code;
        responseBody.message = SSSError.Types.BAD_REQUEST_INVALID.message({ message: request.response.message });
      }
      return h.response(responseBody).code(statusCode);
    case 401:
    case 403:
      return h.response(responseBody).unstate('token').code(statusCode);
    case 500:
      if (!responseBody.code) {
        responseBody.code = SSSError.Types.SERVER.code;
      }
      return h.response(responseBody).code(statusCode);
    default:
      return h.response(responseBody).code(statusCode);
  }
};

const onUIError = (request, h, options) => {
  const statusCode = getStatusCode(request);
  const responseBody = generateErrorResponseBody(request);
  switch (statusCode) {
    case 401:
    case 403:
      return h.redirect(`/login?redirect=${request.path || '/'}`).unstate('token');
    case 404:
    case 500:
      responseBody.statusCode = statusCode;
      return h.view(options.errorView, responseBody).code(statusCode);
    default:
      return null;
  }
};

const onError = (request, h, options) => {
  const isApi = request.path.includes(options.apiPrefix);
  return isApi
    ? onApiError(request, h)
    : onUIError(request, h, options);
};

const register = (server, opts) => {
  const options = Object.assign({}, defaultOptions, opts);
  server.ext('onPreResponse', (request, h) => {
    const statusCode = request.response.statusCode || request.response.output.statusCode;
    const response = (statusCode === 200)
      ? onSuccess(request, h, options)
      : onError(request, h, options);

    if (response) {
      return response;
    }
    return h.continue;
  });
};

module.exports = {
  register,
  name: 'hapi-error-handler',
  version: '1.0.0',
};
