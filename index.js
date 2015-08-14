var _ = require('lodash');

module.exports = _.extend(require('gulp-util'),{
  ascii: require('./lib/ascii'),
  Scaffold: require('./lib/Scaffold'),
  ScaffoldStep: require('./lib/ScaffoldStep'),
  inquirer: require('./lib/inquirer'),
  validator: require('./lib/validator')
});
