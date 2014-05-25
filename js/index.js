(function( $ ) {
	function setHeaderHeight() {
		$( '#screen-fill' ).css( 'height', $( window ).height() - 50 );
	}

	$( document ).ready( setHeaderHeight );
	$( window ).resize( setHeaderHeight );

	$( window ).scroll( function() {
		var currentY = window.scrollY;
		$( '.fading' ).each( function(i, el) {
			var elemY = $( el ).position().top;
			var offset = ( elemY / 2 ) - currentY;
			if ( currentY <= 0 ) {
				$( el ).css( 'opacity', 1 );
			} else if ( offset > 0 ) {
				$( el ).css( 'opacity', ( ( offset * 1.0 ) / elemY ).toFixed(2) );
			}
		} );
	} );
} )( jQuery );
