var $ = require('jquery');

var attachFastClick = require('fastclick');

$(document).ready(function() {
  attachFastClick(document.body);
  $('#subscribe').submit(function(ev) {
    $('#subscribe').attr('placeholder', 'Subscribed');
    return false;
  });
});

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

//var i = 0;
//var to;
//$(window).mousemove(function(ev) {
//  $('#bar').css('background-position', 'left ' + i + '%');
//  i += 0.01;
//  if (i > 100) {
//    i = 0;
//  }
//});

// Attach dual rendering
var nav = require('./lib/nav.js');
var ajax = require('./lib/ajax.js');
var dom = require('./lib/dom-helpers.js');

var supportsHistoryAPI = require('./lib/supports-history-api.js');
var isSafari = ~navigator.userAgent.indexOf('Safari');
var isChrome = ~navigator.userAgent.indexOf('Chrome');

function setBackButtonHandler() {
  $('.back').click(function(e) {
    e.preventDefault();
    nav.goBack();
  });
}

function setClickHandlers() {
 $('.post a').click(function(e) {
    ajax.abortReq();

    // Navigate only if the url is in local context
    var $this = $(this);
    var permalink = $this.attr('href');
    if (!nav.isLocalUrl(permalink)) {
      return;
    }

    e.preventDefault();

    nav.saveScrollState(window.scrollY, window.location.href);
    var currentContent = dom.content();
    var post = dom.findParentByClass($this, 'post');

    // Clear the content and inject the content we've got now for best effect
    // and navigate to top to make it seem like we moved to another page
    dom.content('<div class="post single">' + post.html() + '</div>');
    $(document).scrollTop(0);

    // Enable back button
    // Navigate to new page and poll for new content
    nav.toPage(permalink);
    ajax.fetchContent(permalink, function(content) {
      if (content) {
        dom.content(content);
        nav.cacheContent(content, permalink);
        setClickHandlers();
      }
    });
  });
}

$(document).ready(function() {
  return; // Disable dual rendering for now (until it's properly working)
  // Normal requests if histry API not supported
  if (!supportsHistoryAPI) return;

  setBackButtonHandler();

  setClickHandlers();
  nav.cacheContent(dom.content());

  $(window).on('popstate', function(event) {
    ajax.abortReq(); // Abort a possible existing request

    var e = event.originalEvent;
    console.log(e);

    // If we know the contents, we can just reuse it
    if (e.state && e.state.cached) {
      console.log('Using cached content');
      dom.content(e.state.cached);
      setClickHandlers();
      if (e.state.scrollState) {
        if (isSafari && !isChrome) { // user agent is purely safari
          setTimeout(function() {
            $(document).scrollTop(e.state.scrollState);
          }, 10);
        } else {
          $(document).scrollTop(e.state.scrollState);
        }
      }
      return;
    }

    // If the data isn't cached for some reason, let's fetch it
    ajax.fetchContent(window.location.href, function(content) {
      if (content) {
        dom.content(content);
        setClickHandlers();
      }
    });
  });
});
