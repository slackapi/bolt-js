var get = require("./get.js");
var getPrototypeOf = require("./getPrototypeOf.js");
function _superPropertyGet(t, e, r, o) {
  var p = get(getPrototypeOf(1 & o ? t.prototype : t), e, r);
  return 2 & o ? function (t) {
    return p.apply(r, t);
  } : p;
}
module.exports = _superPropertyGet, module.exports.__esModule = true, module.exports["default"] = module.exports;