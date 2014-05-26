var $ = require('jquery');

// Attach fastclick
var attachFastClick = require('fastclick');
$(document).ready(function(){ attachFastClick(document.body); });

// Home page header resize and fade in/out
function setHeaderHeight() {
  $('#screen-fill').css('height', $(window).height() - 50);
}

$(document).ready(setHeaderHeight);
$(window).resize(setHeaderHeight);

$(window).scroll(function() {
  var currentY = window.scrollY;
  $('.fading').each(function(i, el) {
    var elemY = Math.round($(el).position().top);
    var offset = (elemY / 2) - currentY;
    if (currentY <= 0) {
      $(el).css('opacity', 1);
    } else if (offset > 0) {
      $(el).css('opacity', ((offset * 1.0) / elemY).toFixed(2));
    } else {
      $(el).css('opacity', 0);
    }
  });
});
