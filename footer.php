<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 *
 * @package socket.io-website
 */
?>

	</div><!-- #content -->

	<footer id="colophon" class="site-footer" role="contentinfo">
		<div class="site-info">
			<span class="footer-left">SOCKET.IO IS OPEN-SOURCE (MIT). RUN BY <a href="https://github.com/Automattic/socket.io/graphs/contributors">CONTRIBUTORS</a>. <a href="https://twitter.com/socketio" class="twitter-follow-button" data-show-count="true" data-lang="en">Follow @socketio</a></span>
      <span class="footer-right">
      </span>
		</div><!-- .site-info -->
	</footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

<?php
  $redis = new TinyRedisClient('localhost:6379');
?>

<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="http://cdn.socket.io/socket.io-1.3.0.js"></script>
<!-- Twitter script -->
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

<script>
(function() {
  var slack_users_count = <?php echo $redis->get('slack_users_count') ?>;
  var li = $('<li class="menu-item"><a href="/slack">Slack</a></li>')
  var count = $('<span id="slack-count">').text(slack_users_count);
  var socket = io('http://slack-io.socket.io');

  li.find('a').append(count);
  $('#menu-item-43').before(li);

  socket.on('slack users count', function(val, total){
    var old = Number(count.text());
    count.text(val);
    li.find('a').attr('title', val + ' users of online of ' + total);

    if (val > old) {
      count.removeClass().addClass('animated bounce').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        $(this).removeClass();
      });
    }

    $('.slack-users-count').text(val);
    $('.slack-users-count-total').text(total);
  });
})();
</script>

<?php if (is_home()): ?>
	<script src="/wp-content/themes/socket.io-website/js/home.js"></script>
<?php endif; ?>

</body>
</html>
