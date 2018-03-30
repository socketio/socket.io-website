
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

function setSubscribe() {
  $('.mc4wp-form').off('submit').submit(function(ev) {
    ev.preventDefault();

    var $this = $(this);
    var $input = $(this).find('input#mc4wp_email');

    var formData = {};
    $this.find('input[type=hidden]').each(function(i, el) {
      var $el = $(el);
      formData[$el.attr('name')] = $(el).val();
    });

    $.post(window.location.href, $.extend(formData, { EMAIL: $input.val() })).
      done(function(data) {
        $input.val('');

        var $dom = $.parseHTML(data);
        for (var i = 0; i < $dom.length; i++) {
          if ('page' == $dom[i].id) {
            var $form = $($dom[i]).find('.mc4wp-form');
            $this.html($form.html());
            return;
          }
        }

        $input.attr('placeholder', 'Thanks!');
      }).
      fail(function() {
        $input.val('');
        $input.attr('placeholder', 'Error');
      });
    return false;
  });
}

function initNavMenu() {
  $('.navigation-class').click(function () {
    $('.class-details').addClass('hidden');
    $(this).siblings().removeClass('hidden');
  });
}

$(document).ready(function() {
  FastClick.attach(document.body);
  setSubscribe();
  hashLinks();
  initNavMenu();
});

$(document).ready(setHeaderHeight);
$(window).resize(setHeaderHeight);

(function initStackCount() {
  var displaySlackCount = false;
  var currentCount = -1;
  var count = $('<span id="slack-count">');
  var menu = $('#menu-item-972 a');
  var socket = io('https://socketio-slack-count.now.sh');

  socket.on('active', function(userCount, total){
    if (userCount !== currentCount) {
      count.text(userCount);
      menu.attr('title', userCount + ' users online now of ' + total + ' registered');
      count.removeClass().addClass('animated bounce').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        $(this).removeClass();
      });
      currentCount = userCount;
    }

    $('.slack-users-count').text(userCount);
    $('.slack-users-count-total').text(total);

    if (!displaySlackCount) {
      displaySlackCount = true;
      menu.append(count);
    }
  });
})();
