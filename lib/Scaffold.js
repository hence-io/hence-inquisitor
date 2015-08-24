var _ = require('lodash');
var async = require('async');
var ascii = require('./ascii');
var beep = require('gulp-util').beep;
var multiInstall = require('./scaffold/multiInstall');

/**
 * @constructor
 * @param opts
 * @returns {{steps: (*|Array), addStep: Function, answers: *, inquirer: *, start: Function, complete: Function}}
 */
var Scaffold = function (opts) {
  var scaffold = _.defaultsDeep(_.cloneDeep(opts), {
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
    _debug: false,
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
     * @param {Function} done
     */
    start: function (steps, done) {
      var self = this;
      // If done is passed through, ensure that it only ever runs once. This can cause issues with streams should it
      // run multiple times causing abnormal behaviour.
      if (_.isFunction(done)) {
        self.done = _.once(done);
      }

      if (self._debug) {
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
              self.postInstall(self.answers, function () {
                self.finalize.call(self);
              });
            });
          }

          return self.postInstall(self.answers, function () {
            self.finalize.call(self);
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
