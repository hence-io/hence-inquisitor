var _ = require('lodash');
var async = require('async');
var ascii = require('./ascii');
var validation = require('./inquirer');
var beep = require('beeper');

/**
 * @constructor
 * @param opts
 * @returns {{steps: (*|Array), addStep: Function, answers: *, validation: *, start: Function, complete: Function}}
 */
var Scaffold = function (opts) {
  var self = _.defaultsDeep(_.cloneDeep(opts), {
    done: function () {},
    steps: [],
    answers: {
      files: [],
      aborted: false
    },
    validation: validation,
    content: {
      intro: '',
      aborted: " We're sorry you decided to stop here, but hope to see you again soon!",
      done: " Looks like you're all done here!"
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
        beginInstall);
    }
  });

  function beginInstall(err, answers) {
    //_.extend(self.answers, answers);
    console.log(ascii.spacer());

    if (self.answers.aborted) {
      ascii.aborted(self.content.aborted, true);
      self.done();
    } else if (_.isFunction(self.install)) {
      var pipe = self.install();

      // Let the user know we're all done, and provide info on how they can learn to use the gulp commands.
      pipe.on('end', done);
    } else {
      done();
    }
  }

  function done() {
    console.log(ascii.spacer());
    ascii.done(self.content.done, true);
    self.done();
    beep();
  }

  return self;
};

module.exports = Scaffold;
