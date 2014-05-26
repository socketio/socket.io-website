(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function($) {
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
})(jQuery);

},{}]},{},[1])