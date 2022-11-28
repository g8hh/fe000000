let coordinate = function (ifSome, ifNone, x) {
  x = x.filter(i => i !== null);
  if (x.length === 0) {
    return ifNone;
  } else if (x.length < 3) {
    return ifSome.replace(/\*/g, x.join('和'));
  } else {
    return ifSome.replace(/\*/g, x.slice(0, -1).join('，') + '和' + x[x.length - 1]);
  }
}
