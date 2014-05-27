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

	<div id="primary" class="content-area with-sidebar">
		<?php $parents = get_post_ancestors( get_the_id() ); ?>
		<?php $parent_post_id = ( ! empty( $parents ) ) ? $parents[0] : get_the_id(); ?>
		<?php $sidebar_slug = get_post( $parent_post_id )->post_name; ?>
		<?php get_template_part( 'sidebar', $sidebar_slug ); ?>
		<main id="main" class="site-main" role="main">
			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'page' ); ?>

			<?php endwhile; // end of the loop. ?>

		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer(); ?>
