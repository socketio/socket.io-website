(function( $ ) {
	function setHeaderHeight() {
		$( '#screen-fill' ).css( 'height', $( window ).height() - 50 );
	}

	$( window ).load( setHeaderHeight );
	$( window ).resize( setHeaderHeight );
} )( jQuery );
