<?php
/**
 *
 * Template Name: My Sidebar Page
 *
 * The Template for displaying all single posts.
 *
 * @package socket.io-website
 */

get_header(); ?>

	<?php get_template_part( 'sidebar' ); ?>
	<div id="primary" class="content-area with-sidebar">
		<main id="main" class="site-main" role="main">
			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'page' ); ?>

			<?php endwhile; // end of the loop. ?>

		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer(); ?>
