
(function initTweetStream(){
  var socket = io('https://socketio-tweet-stream.now.sh');
  socket.on('tweet', function(t){
    add(t).prependTo('#tweets').addClass('new');
    slice();
  });

  if (!$('#tweets').length) {
    $('#screen-fill').prepend($('#tweets-tpl').html());
  }

  socket.on('buffer', function(ts){
    if (!$('#tweets').length) {
      $('#screen-fill').prepend($('#tweets-tpl').html());
    }

    $('#tweets').empty();

    for (var i = 0; i < ts.length; i++) {
      $('#tweets').append(add(ts[i]));
    }

    slice();
  });

  function slice(){
    $('#tweets > li').slice(100).remove();
  }

  function add(data){
    var text = $('<span class="tweet">').text(data.text);
    var str = text.text().replace(/(javascript|socket\.io)/i, '<b>$1</b>');
    text.html(str);
    var t = $('<li>');
    t.append($('<img>').attr('src', data.user.profile_image_url_https));
    t.append(text);
    t.append($('<a class="time">')
     .attr('href', 'https://twitter.com/' + data.user.name + '/status/' + data.id_str)
     .attr('target', '_blank')
     .data('time', data.timestamp_ms)
     .text(pretty(data.timestamp_ms) || 'now')
    );
    return t;
  }

  setInterval(function(){
    $('.time').each(function(){
      $(this).text(pretty($(this).data('time')));
    });
  }, 10 * 1000);

  // from ejohn.org/blog/javascript-pretty-date/
  function pretty(timestamp){
    var date = new Date(parseInt(timestamp, 10)),
    diff = (((new Date()).getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 ) return;
    return day_diff == 0 && (
      diff < 60 && "now" ||
      diff < 120 && "1m" ||
      diff < 3600 && Math.floor( diff / 60 ) + "m" ||
      diff < 7200 && "1h" ||
      diff < 86400 && Math.floor( diff / 3600 ) + "h") ||
    day_diff == 1 && "1d" ||
    day_diff < 7 && day_diff + "d" ||
    day_diff < 31 && Math.ceil( day_diff / 7 ) + "w";
  }
})();

(function initStackCount() {
  var slack_users_count = 42;
  var count = $('<span id="slack-count">').text(slack_users_count);
  var socket = io('https://socketio-slack-count.now.sh');
  $('#menu-item-972 a').append(count);

  socket.on('active', function(val, total){
    var old = Number(count.text());
    count.text(val);
    $('#menu-item-972 a').attr('title', val + ' users online now of ' + total + ' registered');

    if (val !== old) {
      count.removeClass().addClass('animated bounce').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        $(this).removeClass();
      });
    }

    $('.slack-users-count').text(val);
    $('.slack-users-count-total').text(total);
  });
})();
