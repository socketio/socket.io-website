(function( $ ) {
	function setHeaderHeight() {
		$( '#screen-fill' ).css( 'height', $( window ).height() - 50 );
	}

	$( document ).ready( setHeaderHeight );
	$( window ).resize( setHeaderHeight );
} )( jQuery );
