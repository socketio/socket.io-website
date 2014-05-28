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
			<span class="footer-left">SOCKET.IO IS OPEN-SOURCE (MIT) AND RUN BY <a href="https://github.com/LearnBoost/socket.io/graphs/contributors">CONTRIBUTORS</a>. <a href="https://twitter.com/socketio" class="twitter-follow-button" data-show-count="true" data-lang="en">Follow @socketio</a></span>
			<span class="footer-right"><a href="http://automattic.com">SUPPORTED BY<div id="a8c-image"></div></a></span>
		</div><!-- .site-info -->
	</footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="http://cdn.socket.io/socket.io-1.0.0-pre5.js"></script>
<!-- Twitter script -->
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

<?php if (is_home()): ?>
	<script src="/wp-content/themes/socket.io-website/js/home.js"></script>
<?php endif; ?>

</body>
</html>
