var $ = require('jquery');

exports.content = function(content) {
  if (!content) {
    return $('div#content').html();
  }

  $('div#content').html(content);
};

exports.findParentByClass = function(elem, clazz) {
  while (!elem.hasClass(clazz)) {
    elem = elem.parent();
  }
  return elem;
};
