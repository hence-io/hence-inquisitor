// # Scaffold
//
// Scaffold is used to define your installer.

var _ = require('lodash');
var async = require('async');
var ascii = require('./ascii');
var beep = require('gulp-util').beep;
var multiInstall = require('./scaffold/multiInstall');
var env = require('gulp-util').env;

// ```Scaffold(config)```
// The Scaffold constructor builds your installer object, taking in an optional configuration argument.
// * config - Defines the setting and method to be used in processing an installation.
// * returns - The configured scaffold installer to be consumed.
/**
 * @param {Object} config
 * @returns {Object}
 */
var Scaffold = function (config) {
  var scaffold = _.cloneDeep(config || {});

  // ## Default Members
  _.defaultsDeep(scaffold, {
    // **Steps**
    // These define the different steps, each with their own set of prompts and defaults, which are processed to
    // culminate a pool of answers to be used for the installation.
    steps: [],
    // **Defaults**
    // The default answers or globally shared attributes between all of the steps.
    // * files - The glob file patterns to be used by the installer.
    // * aborted - Toggling whether or not the process should be aborted.
    // * skipToInstall - A special toggle used for multi-installers, which allows bypassing the steps prompts to assume and process their defaults and run the installer off the hop.
    defaults: {
      files: [],
      aborted: false,
      skipToInstall: false
    },
    // **Answers**
    // The accumulated set of answers/responses from the defaults here, and results of the various steps in this
    // installer.
    answers: {},
    // **Inquirer**
    // A set of helpers and checks provided to the step prompts, allowing you to make custom when/validate checks
    // while defining them globally on the install for all steps to have access to.
    inquirer: require('./inquirer'),
    // **Content**
    // Messages to help control the flow of the installer, allowing you to provide an introduction, handle a custom
    // message on user manually aborting the process, and any final messages to convey when the process has
    // completed successfully
    content: {
      intro: '',
      aborted: " We're sorry you decided to stop here, but hope to see you again soon!",
      done: ''
    },
    // **cliArg(arg)**
    // Process cli args to be used in a multi-install.
    cliArg: function (arg) {
      return {};
    },
    // **Debug**
    // A flag to toggle whether or not to display some lower level processing details, helpful when first building
    // your installers should run into issues.
    debug: !!env.debug
  });

  // ## Placeholder Methods
  // These methods ensure the scaffold will run effectively without any additional tweaking beyond providing an
  // install method, however you are free to adjust and provide you own overrides to any of these as needed.
  _.defaultsDeep(scaffold, {
    // ```postInstall(answers, finalize)```
    // This method is fired following the completion of the installation, if stream based once the end event is emitted.
    // * answers - Serving the scaffold's answer object for ease of use, vs typing ```var answers = this.answers;```
    // * finalize - A callback to finish up the installer, outputting any final messages and execute the done function.
    postInstall: function (answers, finalize) {
      finalize();
    },
    // ```finalize(err)```
    // This method outs any final messages, or errors, and finally execute the done function.
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
    },
    // ```done(err, answers)```
    // Should no done method be configured from a cli/gulp/slush, this ensures the flow is processed without issue.
    done: function (err, answers) {
    }
  });

  // ## Essential Methods
  _.extend(scaffold, {
    // ```addStep(step)```
    // This method will add more steps to the installer.
    /**
     * @param {Object|Array} step
     */
    addStep: function (step) {
      var self = this;

      if (step) {
        if (!_.isArray(step)) {
          step = _.compact([step]);
        }

        if (step.length) {
          _.each(step, function (s) {
            self.steps.push(s);
          });
        }
      }
    },
    // ```processSteps(step)```
    // This method will configure the steps for installer.
    /**
     */
    processSteps: function () {
      var self = this;
      var steps = self.steps;
      var revisedSteps = [];
      var err;

      if (steps.length) {
        _.each(steps, function (s) {
          // Ensure that the step has the essential inquire function to preform the installer's waterfall
          if (_.isFunction(s.inquire)) {
            // Include a reference back to the scaffold in the step.
            s.scaffold = self;
            // Include a reference to the inquirer checks and validation to be readily accessible by the step's prompts.
            s.inquirer = self.inquirer;
            // The current index of the step against the whole. Since this is using in an async waterfall, this isn't
            // available as a normal array index and must be explicit.
            s.stepIndex = self.steps.length;
            // This builds the needed waterfall callback method, leveraging the steps inquire function to be
            // used by the scaffold when processing all of the steps to build their answers.
            s.waterfall = function (a, c) {
              s.inquire.call(s, a, c);
            };

            // Include this properly formed step into the revised array.
            revisedSteps.push(s);
          } else { // Flag this step for error diagnosis.
            err = s;
          }
        });
      }

      if (err) {
        // Flag the malformed step so the scaffold author can diagnose the issue.
        self.error('Your ScaffoldStep is mis-configured. Please ensure it contains an inquire function for' +
          ' prompting.' + JSON.stringify(err));
      } else {
        // Update the valid steps.
        self.steps = revisedSteps;
      }

      return !err;
    },
    run: function (done, args) {
      var self = this;

      // Because glush leverages gulp-util, the .env for cli args is available
      // We must always drop the first non-flagged arg, as it's always your generator's name
      // This doesn't count actual flags set '--flag', just normal args on the cli
      var cliArgs = args || _.drop(env._);

      /* istanbul ignore next */
      if (self.debug) {
        console.log('debug args', args, cliArgs, self);
      }

      if (cliArgs.length) {
        self.startMultiInstall.call(self, _.map(cliArgs, self.cliArg), done);
      }
      else {
        self.start.call(self, done);
      }
    },
    // ```start(steps, overrides, done)```
    // This method begins your installation, running through all of your steps, and finally on completion executing
    // the done method provided.
    //
    // * steps - An array of ScaffoldSteps, or a single ScaffoldStep object, to provide prompts for your install to act upon
    // * overrides - Any run time/CLI overrides that you'd like to pass in to affect your installers out coming or defaults.
    // * done - The final callback to execute when the installation has finished, successfully or not, to tie up streams or asyncs.
    start: function () {
      var self = this;

      // Arguments
      var arg0 = arguments[0];
      var arg1 = arguments[1];

      var steps = _.isArray(arg0) ? arg0 : (_.isObject(arg0) && _.has(arg0, 'inquire') ? arg0 : undefined);
      var overrides = !_.isArray(arg0) && _.isObject(arg0) && !_.has(arg0, 'inquire') ? arg0 : (_.isObject(arg1) ? arg1 : undefined);
      var done = arguments[2] || (_.isFunction(arg1) ? arg1 : (_.isFunction(arg0) ? arg0 : undefined));

      if (overrides) {
        self = _.defaultsDeep(overrides, self);
      }
      if (_.isFunction(done)) {
        self.done = done;
      }

      // Ensure that done only ever runs once. This can cause issues with streams should it run multiple times causing
      // abnormal behaviour.
      self.done = _.once(self.done);

      /* istanbul ignore next */
      if (self.debug) {
        console.log('>> Start installer with defaults of: ', _.pick(self, 'content', 'defaults'));
      }

      self.renderIntro();

      self.addStep(steps);

      if (self.processSteps()) {
        // Pull the inquire functions together from the various steps, and remove any undefined as not to disrupt async
        if (self.steps.length && !self.answers.aborted) {
          var prompters = _.chain(self.steps).pluck('waterfall').compact().value();

          async.waterfall(prompters, function (err, answers) {
            self.preInstall.call(self, err, answers);
          });
        } else if (_.isFunction(self.install)) {
          self.install.call(self, self.answers, function (err, stream) {
            self.installResolve.call(self, err, stream);
          });
        } else {
          return self.finalize.call(self);
        }
      }
    },
    renderIntro: function () {
      if (this.content.intro) {
        console.log(this.content.intro);
        beep();
      }
    },
    startMultiInstall: function () {
      // Arguments
      var arg0 = arguments[0];
      var arg1 = arguments[1];
      var isArgZeroAnArray = _.isArray(arg0) && arg0.length && _.isObject(arg0[0]);

      var steps = isArgZeroAnArray && _.has(arg0[0], 'inquire') ? arg0 : (_.isObject(arg0) && _.has(arg0, 'inquire') ? arg0 : undefined);
      var installOptions = isArgZeroAnArray && !_.has(arg0[0], 'inquire') ? arg0 : (_.isArray(arg1) ? arg1 : undefined);
      var done = arguments[2] || (_.isFunction(arg1) ? arg1 : (_.isFunction(arg0) ? arg0 : undefined));

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
        self.install.call(self, self.answers, function (err, stream) {
          self.installResolve.call(self, err, stream);
        });
      } else {
        return self.finalize.call(self);
      }
    },
    installResolve: function (err, stream) {
      var self = this;

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
