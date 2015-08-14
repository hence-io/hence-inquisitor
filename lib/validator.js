var validator = require('validator');

validator.extend('isTruthy', function (v) {
  return !!(v === true || v === "true" || v === "y" || v === "yes" || v === "Y" || v === "Yes");
});

module.exports = validator;
