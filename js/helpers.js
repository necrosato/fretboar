function padString(loc='^', pad=' ', width, s) {
    var padCount = width - s.length
    if (padCount < 1) {
        return s
    }
    var padL = 0
    var padR = 0
    if (loc == '^') {
        padL = Math.floor(padCount / 2)    
        padR = Math.ceil(padCount / 2)    
    } else if (loc == '<') {
        padR = padCount
    } else if (loc == '>') {
        padL = padCount
    }
    return ' '.repeat(padL) + s + ' '.repeat(padR)
}

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}
