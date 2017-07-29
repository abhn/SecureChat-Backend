function getKeyByValue(obj, value) {
  for( var prop in obj ) {
    if( obj.hasOwnProperty( prop ) ) {
      if( obj[ prop ] === value )
        return prop;
    }
  }
}

module.exports = getKeyByValue