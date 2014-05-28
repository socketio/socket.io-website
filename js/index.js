var $ = require('jquery');

var attachFastClick = require('fastclick');

// Home page header resize and fade in/out
function setHeaderHeight() {
  $('#screen-fill').css('height', $(window).height() - 50);
}

function slug(str) {
  return str
    .replace(new RegExp(' ', 'g'), '-')
    .toLowerCase();
}

function refreshHash() {
  var hash = document.location.hash;
  document.location.hash = '#' + hash;
  document.location.hash = hash;
}

function hashLinks() {
  var hx;
  if ($('body').hasClass('single')) {
    hx = $('#content').find('h1, h2, h3');
  } else {
    hx = $('.with-sidebar').find('h1, h2');
  }

  for (var i = 0; i < hx.length; i++) {
    var header = hx.eq(i);
    if (!header.hasClass('entry-title') && !header.hasClass('excerpt-title')) {
      var s = slug(header.text());

      var link = $('<a>', {
        'class': 'icon-link deep-link',
        href: window.location.href.split('#')[0] + '#' + s,
        style: 'position: absolute; margin-left: -18px; text-decoration: none; color: #999;',
        html: '#'
      });

      header
      .attr('id', s)
      .prepend(link);
    }
    refreshHash();
  }
}

$(document).ready(function() {
  attachFastClick(document.body);
  hashLinks();
});

$(document).ready(setHeaderHeight);
$(window).resize(setHeaderHeight);

