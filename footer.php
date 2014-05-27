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
			<span class="footer-left">SOCKET.IO IS OPEN-SOURCE (MIT) AND RUN BY <a href="#">CONTRIBUTORS</a></span>
			<span class="footer-right"><a href="http://automattic.com">SUPPORTED BY<div id="a8c-image"></div></a></span>
		</div><!-- .site-info -->
	</footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

  <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
  <script src="http://cdn.socket.io/socket.io-1.0.0-pre5.js"></script>
<script src="/wp-content/themes/socket.io-website/js/javascripts.js"></script>
  <?php if (is_home()): ?>
  <script src="/wp-content/themes/socket.io-website/js/home.js"></script>
  <?php endif; ?>

</body>
</html>
