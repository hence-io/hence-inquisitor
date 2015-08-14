var _ = require('lodash');
var async = require('async');
var ascii = require('./ascii');
var beep = require('gulp-util').beep;

/**
 * @constructor
 * @param opts
 * @returns {{steps: (*|Array), addStep: Function, answers: *, inquirer: *, start: Function, complete: Function}}
 */
var Scaffold = function (opts, next) {
  var self = _.defaultsDeep(_.cloneDeep(opts), {
    done: function (err, answers) {
    },
    steps: [],
    defaults: {
      files: [],
      aborted: false
    },
    answers: {},
    inquirer: require('./inquirer'),
    content: {
      intro: '',
      aborted: " We're sorry you decided to stop here, but hope to see you again soon!",
      done: " Looks like you're all done here!"
    },
    postInstall : function(answers, done) {
      self.finalize();
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
          self.steps.push(s);
        });
      }
    },
    /**
     *
     */
    start: function (steps, done) {
      if (_.isFunction(done)) {
        self.done = done;
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
        return self.done(err);
      }

      _.extend(self.answers, answers);

      ascii.spacer(true);

      if (self.answers.aborted) {
        ascii.aborted(self.content.aborted, true);
        self.done(); // don't use finalize when aborting, end things here
      }
      else if (_.isFunction(self.install)) {
        self.install(self.answers, function (err, stream) {
          if (err) {
            return self.done(err);
          }

          // Let the user know we're all done, and provide info on how they can learn to use the gulp commands.
          if (stream) {
            return stream.on('end', function() { self.postInstall(self.answers, self.done); });
          }

          return self.postInstall(self.answers, self.done);
        });
      } else {
        self.finalize();
      }
    },
    finalize: function () {
      console.log(ascii.spacer());
      ascii.done(self.content.done, true);
      self.done(null, self.answers);
      beep();
    }
  });

  return self;
};

module.exports = Scaffold;
