var inquirer = require('inquirer');
var validator = require('./validator');

/* istanbul ignore next */
function separator() {
  return new inquirer.Separator();
}

function validatePrompt(type, message, negate) {
  return function (input) {
    // Declare function as asynchronous, and save the done callback
    var done = this.async();

    // Do async stuff
    setTimeout(function () {
      var valid = negate ? !validator[type](input) : validator[type](input);

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
  separator: separator,
  validatePrompt: validatePrompt
};
