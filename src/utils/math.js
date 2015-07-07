module.exports = {
	
	Clamp : function ( value, min, max ) {

		if ( min > value ) {
			return min;
		}

		if ( max < value ) {
			return max;
		}

		return value;

	},

	Lerp : function ( a, b, w ) {
		return ( 1-w ) * a + w * b;
	} 
}