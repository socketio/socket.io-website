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

<div id="sidebar" class="content-area">
	<ul id="posts">
	<?php $children = get_children( array( 'post_type' => 'page' , 'post_parent' => get_the_id()) ); ?>
	<?php foreach ( $children as $child ): ?>
		<li id="post"><a href="<?php echo get_permalink( $child->ID ); ?>"><?php echo $child->post_title; ?></a></li>
	<?php endforeach; // end of the loop. ?>
	</ul>
</div>
