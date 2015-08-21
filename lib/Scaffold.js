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
     * @param {Object|Function} overrides
     * @param {Function} done
     */
    start: function (steps, overrides, done) {
      if (_.isFunction(overrides)) {
        done = overrides;
        overrides = {};
      }

      if (_.isObject(overrides)) {
        _.extend(self, _.omit(overrides || {}, 'defaults', 'content'));
        _.extend(self.defaults, _.defaultsDeep(overrides.defaults,self.defaults) || {});
        _.extend(self.content, overrides.content || {});
      }

      // If done is passed through, ensure that it only ever runs once. This can cause issues with streams should it
      // run multiple times causing abnormal behaviour.
      if (_.isFunction(done)) {
        self.done = _.once(done);
      }

      self.addStep(steps);

      if (self.content.intro) {
        console.log(self.content.intro);
      }
      beep();

      // Pull the inquire functions together from the various steps, and remove any undefined as not to disrupt async
      async.waterfall(
        _.chain(self.steps)
          .pluck('inquire')
          .compact()
          .value(),
        self.preInstall);
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
            return stream.on('end', function () { self.postInstall(self.answers, self.finalize); });
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
