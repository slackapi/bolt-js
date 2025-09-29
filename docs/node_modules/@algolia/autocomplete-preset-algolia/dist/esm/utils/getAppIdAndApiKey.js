export function getAppIdAndApiKey(searchClient) {
  var _ref = searchClient.transporter || {},
    _ref$headers = _ref.headers,
    headers = _ref$headers === void 0 ? {} : _ref$headers,
    _ref$queryParameters = _ref.queryParameters,
    queryParameters = _ref$queryParameters === void 0 ? {} : _ref$queryParameters;
  var APP_ID = 'x-algolia-application-id';
  var API_KEY = 'x-algolia-api-key';
  var appId = headers[APP_ID] || queryParameters[APP_ID];
  var apiKey = headers[API_KEY] || queryParameters[API_KEY];
  return {
    appId: appId,
    apiKey: apiKey
  };
}