var _ = require('lodash');
var async = require('async');

/**
 *
 * @param scaffold
 * @param steps
 * @param installOptions
 * @param done
 */
var multiInstall = function (scaffold, steps, installOptions, done) {
  var installers = [];
  var originalInstaller = _.cloneDeep(scaffold);
  var doneMessage = originalInstaller.content.done; // store the current done message for later

  originalInstaller.renderIntro();

  // Clear out content messages now, until the actual end when we can render the done message again.
  _.extend(originalInstaller.content, {
    intro: '',
    done: ''
  });

  _.each(installOptions, function (opts) {
    installers.push(function (cb) {
      var tempSteps = _.cloneDeep(steps);
      var tempInstaller = _.defaultsDeep({defaults: { skipToInstall: true }}, opts, _.cloneDeep(originalInstaller));

      if (originalInstaller._debug) {
        console.log('>> Start multi-installer with defaults of: ', _.pick(tempInstaller, 'content', 'defaults'));
      }

      tempInstaller.start(tempSteps, cb);
    });
  });

  async.series(installers, function (err) {
    // Now that all of the installers are finished, provide the done message finally if no errors occurred
    if (!err) {
      console.log(doneMessage);
    }

    // Call the stream/cli callback now everything is finished
    done();
  });

};

module.exports = multiInstall;
