var $ = require('jquery');

exports.isLocalUrl = function(url) {
  var regex = new RegExp(location.host);
  return regex.test(url);
};

exports.toPage = function(url) {
  history.pushState({ isFirstPage: false }, 'changed', url);
};

exports.saveScrollState = function(scrollState, url) {
  history.replaceState($.extend(history.state, { scrollState: scrollState }), 'scroll', url);
};

exports.cacheContent = function(content, url) {
  history.replaceState($.extend(history.state, { cached: content, isFirstPage: !url }), 'content', url);
};

exports.goBack = function() {
  history.back();
};
