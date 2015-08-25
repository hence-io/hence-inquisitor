// # Scaffold
//
// Scaffold is used to define your installer.

var _ = require('lodash');
var async = require('async');
var ascii = require('./ascii');
var beep = require('gulp-util').beep;
var multiInstall = require('./scaffold/multiInstall');

// ## Constructor
//
// The Scaffold constructor builds your installer object, taking in an optional configuration argument.
// * config - Defines the setting and method to be used in processing an installation.
/**
 * @param config
 * @returns {Object}
 * @constructor
 */
var Scaffold = function (config) {
  var scaffold = _.defaultsDeep(_.cloneDeep(config), {
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
      done: ''
    },
    debug: false,
    postInstall: function (answers, finalize) {
      finalize();
    },
    finalize: function (err) {
      if (err) {
        return this.error(err);
      } else if (this.content.done) {
        ascii.spacer(true);

        if (this.content.done !== ascii.spacer()) {
          ascii.done(this.content.done, true);
        }
      }

      this.done(err, this.answers);
      beep();
    }
  });

  _.extend(scaffold, {
    /**
     *
     * @param step
     */
    addStep: function (step) {
      var self = this;

      if (step) {
        if (!_.isArray(step)) {
          step = [step];
        }

        _.each(step, function (s) {
          s.scaffold = self;
          s.inquirer = self.inquirer;
          s.stepIndex = self.steps.length;
          s.waterfall = function (a, c) {
            s.inquire.call(s, a, c);
          };
          self.steps.push(s);
        });
      }
    },
    /**
     *
     * @param {Array} steps
     * @param {Function|Object} overrides
     * @param {Function|undefined} done
     */
    start: function (steps, overrides, done) {
      var self = this;

      // Check for the override object to see if we should apply this run time additions, else ensure we're setting done.
      if (_.isFunction(overrides)) {
        done = overrides;
      } else if (_.isObject(overrides)) {
        self = _.defaultsDeep(overrides, self);
      }

      // If done is passed through, ensure that it only ever runs once. This can cause issues with streams should it
      // run multiple times causing abnormal behaviour.
      if (_.isFunction(done)) {
        self.done = _.once(done);
      }

      if (self.debug) {
        console.log('>> Start installer with defaults of: ', _.pick(self, 'content', 'defaults'));
      }

      self.addStep(steps);

      self.renderIntro();

      // Pull the inquire functions together from the various steps, and remove any undefined as not to disrupt async
      async.waterfall(
        _.chain(self.steps)
          .pluck('waterfall')
          .compact()
          .value(),
        function (err, answers) {
          self.preInstall.call(self, err, answers);
        });
    },
    renderIntro: function () {
      if (this.content.intro) {
        console.log(this.content.intro);
        beep();
      }
    },
    startMultiInstall: function (steps, installOptions, done) {
      multiInstall(this, steps, installOptions, done);
    },
    preInstall: function (err, answers) {
      var self = this;

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
        this.install(self.answers, function (err, stream) {
          if (err) {
            return self.error(err);
          }

          // Let the user know we're all done, and provide info on how they can learn to use the gulp commands.
          if (stream) {
            return stream.on('end', function () {
              self.postInstall(self.answers, function (err) {
                self.finalize.call(self, err);
              });
            });
          }

          return self.postInstall(self.answers, function (err) {
            self.finalize.call(self, err);
          });
        });
      } else {
        return self.finalize.call(self);
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

      return this.done(err);
    }
  });

  return scaffold;
};

module.exports = Scaffold;
