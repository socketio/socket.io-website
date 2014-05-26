var $ = require('jquery');
var req;

exports.getContent = function(pageHTML) {
  var $dom = $.parseHTML(pageHTML);
  var content;
  $.each($dom, function(i, el) {
    if (el.id == 'wrapper') {
      var $content = $(el).find('div#content');
      content = $content.html();
    }
  });

  return content;
};

exports.fetchContent = function(url, cb) {
  req = $.get(url, function(pageHTML) {
    cb(exports.getContent(pageHTML));
  });

  return req;
};

exports.abortReq = function() {
  if (req) req.abort();
};
