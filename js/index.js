(function( $ ) {
	function setHeaderHeight() {
		$( '#screen-fill' ).css( 'height', $( window ).height() - 50 );
	}

	$( document ).ready( setHeaderHeight );
	$( window ).resize( setHeaderHeight );
	$( window ).scroll( function() {
		var currentY = window.scrollY;
		var elemY = $( '#screen-fill span' ).position().top;

		var offset = elemY - currentY;
		if ( offset > 0 ) {
			$( '#screen-fill span' ).fadeTo( 0, offset / elemY );
		}
	} );
} )( jQuery );
