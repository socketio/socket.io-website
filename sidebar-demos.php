<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * @package socket.io-website
 */

?>

<?php $parents = get_post_ancestors( get_the_id() ); ?>
<?php $parent = get_post( ( ! empty( $parents ) ) ? $parents[0] : get_the_id() ); ?>

<div id="sidebar" class="content-area">
	<ul id="posts">
		<?php $args = array( 'post_type' => 'page' , 'post_parent' => $parent->ID, 'orderby' => 'post_id', 'order' => 'ASC' ); ?>
		<?php $children = get_children( $args ); ?>

		<?php foreach ( $children as $child ): ?>
			<?php if ( get_the_id() == $child->ID ): ?>
				<li id="parent"><a href="<?php echo esc_url( get_permalink( get_the_id() ) ); ?>"><?php echo esc_html( get_the_title( get_the_id() ) ) ; ?></a></li>
			<?php else: ?>
				<li id="post"><a href="<?php echo esc_url( get_permalink( $child->ID ) ); ?>"><?php echo esc_html( $child->post_title ); ?></a></li>
			<?php endif; ?>
		<?php endforeach; // end of the loop. ?>
	</ul>
</div>
