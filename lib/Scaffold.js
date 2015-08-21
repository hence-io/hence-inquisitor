var _ = require('lodash');
var async = require('async');
var ascii = require('./ascii');
var beep = require('gulp-util').beep;

/**
 * @constructor
 * @param opts
 * @returns {{steps: (*|Array), addStep: Function, answers: *, inquirer: *, start: Function, complete: Function}}
 */
var Scaffold = function (opts) {
  var self = _.defaultsDeep(_.cloneDeep(opts), {
    done: function (err, answers) {
    },
    steps: [],
    defaults: {
      files: [],
      aborted: false,
      skipToInstall: false
    },
    answers: {},
    inquirer: require('./inquirer'),
    content: {
      intro: '',
      aborted: " We're sorry you decided to stop here, but hope to see you again soon!",
      done: ""
    },
    _debug: false,
    postInstall: function (answers, finalize) {
      finalize();
    },
    finalize: function (err) {
      if (err) {
        return self.error(err);
      } else if (self.content.done) {
        ascii.spacer(true);
        ascii.done(self.content.done, true);
      }

      self.done(err, self.answers);
      beep();
    }
  });

  _.extend(self, {
    /**
     *
     * @param step
     */
    addStep: function (step) {
      if (step) {
        if (!_.isArray(step)) {
          step = [step];
        }

        _.each(step, function (s) {
          s.scaffold = self;
          s.stepIndex = self.steps.length;
          self.steps.push(s);
        });
      }
    },
    /**
     *
     * @param {Array} steps
     * @param {Function} done
     */
    start: function (steps, done) {
      // If done is passed through, ensure that it only ever runs once. This can cause issues with streams should it
      // run multiple times causing abnormal behaviour.
      if (_.isFunction(done)) {
        self.done = _.once(done);
      }

      if (self._debug) {
        console.log('>> Start installer with defaults of: ', _.pick(self, 'content', 'defaults'))();
      }

      self.addStep(steps);

      self.renderIntro();

      // Pull the inquire functions together from the various steps, and remove any undefined as not to disrupt async
      async.waterfall(
        _.chain(self.steps)
          .pluck('inquire')
          .compact()
          .value(),
        self.preInstall);
    },
    renderIntro: function () {
      if (self.content.intro) {
        console.log(self.content.intro);
        beep();
      }
    },
    startMultiInstall: function (steps, installOptions, done) {
      var installers = [];
      var originalInstaller = _.cloneDeep(self);
      var doneMessage = self.content.done; // store the current done message for later

      self.renderIntro();

      // Clear out content messages now, until the actual end when we can render the done message again.
      _.extend(originalInstaller.content, {
        intro: '',
        done: ''
      });

      _.each(installOptions, function (opts) {
        var tempSteps = _.cloneDeep(steps);
        var tempInstaller = _.cloneDeep(originalInstaller);
        tempInstaller.defaults = _.defaultsDeep(opts, tempInstaller.defaults);

        installers.push(function (cb) {
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
    },
    preInstall: function (err, answers) {
      if (err) {
        return self.error(err);
      }

      _.extend(self.answers, answers);

      ascii.spacer(true);

      if (self.answers.aborted) {
        ascii.aborted(self.content.aborted, true);
        return self.done(); // don't use finalize when aborting, end things here
      }
      else if (_.isFunction(self.install)) {
        self.install(self.answers, function (err, stream) {
          if (err) {
            return self.error(err);
          }

          // Let the user know we're all done, and provide info on how they can learn to use the gulp commands.
          if (stream) {
            return stream.on('end', function () {
              self.postInstall(self.answers, self.finalize);
            });
          }

          return self.postInstall(self.answers, self.finalize);
        });
      } else {
        return self.finalize();
      }
    },
    error: function (err) {
      var errMsg = 'An error occurred: ';

      if (_.isObject(err) && err.message) {
        errMsg += err.message;
      } else {
        errMsg += err;
      }

      ascii.aborted(errMsg, true);

      return self.done(err);
    }
  });

  return self;
};

module.exports = Scaffold;
