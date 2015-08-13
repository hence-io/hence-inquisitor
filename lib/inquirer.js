var inquirer = require('inquirer');
var _validator = require('validator');

function isTruthy(v) {
  return !!(v === true || v === "true" || v === "y" || v === "yes" || v === "Y" || v === "Yes");
}

function separator() {
  return new inquirer.Separator();
}

function validator(type, message, negate) {
  return function (input) {
    // Declare function as asynchronous, and save the done callback
    var done = this.async();

    // Do async stuff
    setTimeout(function () {
      var valid = negate ? !_validator[type](input) : _validator[type](input);

      if (!valid) {
        // Pass the return value in the done callback
        return done(message || "Invalid Option");
      }
      // Pass the return value in the done callback
      return done(true);
    }, 250);
  };
}

module.exports = {
  isTruthy: isTruthy,
  separator: separator,
  validator: validator
};
