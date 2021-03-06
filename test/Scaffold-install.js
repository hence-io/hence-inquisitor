require('mocha');

var inquisitor = require('..');
var _ = require('lodash');
var async = require('async');
var should = require('should');
var es = require('event-stream');
var inquirer = require('inquirer');

describe('Scaffold', function () {
  beforeEach(function () {
    this.scaffoldStepOpts = {
      defaults: {
        test: true
      },
      prompter: inquirer.createPromptModule()
    };

    this.scaffoldOpts = {
      defaults: {
        scaffoldTest: true
      },
      content: {
        done: 'Woohoo!'
      }
    };
  });

  it('should perform a blank install successfully', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold(this.scaffoldOpts);
    scaffold.start(step, function (err) {
        should.not.exist(err);
        done();
      }
    );
  });

  it('should perform a blank install successfully using run w/ args', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold(this.scaffoldOpts);
    scaffold.steps.push(step);
    scaffold.debug = true;
    scaffold.run(function (err) {
      should.not.exist(err);
      done();
    }, [
      'first',
      'second',
      'third'
    ]);
  });

  it('should perform a blank install successfully using run w/ args and test cliArg', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold(_.extend(this.scaffoldOpts, {
      cliArg: function (arg) {
        should.exist(arg);
        should.exist(this);
        should.exist(this.defaults);
        should(this.defaults.scaffoldTest).equal(true);

        return {};
      }
    }));
    scaffold.steps.push(step);
    scaffold.debug = true;
    scaffold.run(function (err) {
      should.not.exist(err);
      done();
    }, [
      'first',
      'second',
      'third'
    ]);
  });

  it('should perform a blank install successfully using run', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold(this.scaffoldOpts);
    scaffold.steps.push(step);
    scaffold.run(function (err) {
      should.not.exist(err);
      done();
    });
  });

  it('should perform a blank install without valid steps should fail', function (done) {
    var scaffold = inquisitor.Scaffold(this.scaffoldOpts);
    scaffold.start([{}], function (err) {
        should.exist(err);
        done();
      }
    );
  });

  it('should perform a blank install successfully be aborted', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold({
      defaults: {
        aborted: true
      },
      install: function (a, b) {b();}
    });
    scaffold.start([step], function (err) {
      should.not.exist(err);
      done();
    });
  });

  it('should perform a blank install and receive a preinstall error', function (done) {
    var step = inquisitor.ScaffoldStep(_.defaultsDeep({
      prompts: [
        {
          type: 'confirm',
          message: 'Test',
          name: 'q1'
        }
      ],
      process: function (answers, next) {
        should.exist(answers);

        next({message: 'Error!'});
      }
    }, this.scaffoldStepOpts));

    var scaffold = inquisitor.Scaffold({
      defaults: {
        aborted: true
      }
    });
    scaffold.start([step], function (err) {
      should.exist(err);
      done();
    });

    step.prompter.rl.emit("line");
  });

  it('should perform a blank install successfully, with debug', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold({
      debug: true,
      install: function (answers, finalize) {
        finalize();
      }
    });
    scaffold.start([step], function (err, answers) {
      should.exist(answers);
      should.not.exist(err);
      done();
    });
  });

  it('should perform a blank install successfully, without any steps', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold({
      install: function (answers, finalize) {
        finalize();
      }
    });
    scaffold.start(function (err, answers) {
      should.exist(answers);
      should.not.exist(err);
      done();
    });
  });

  it('should perform a blank install and catch an error', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold({
      install: function (answers, finalize) {
        should.exist(answers);

        finalize('This should error');
      }
    });
    scaffold.start([step], function (err) {
      should.exist(err);
      done();
    });
  });

  it('should perform a blank install successfully with a fake install stream', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold({
      install: function (answers, finalize) {
        var stream = es.readArray([1, 2, 3]);

        should.exist(answers);

        finalize(null, stream);
      }
    });
    scaffold.start([step], function (err) {
      should.not.exist(err);
      done();
    });
  });

  it('should perform a blank install fail on postInstall with error', function (done) {
    var step = inquisitor.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = inquisitor.Scaffold({
      install: function (answers, finalize) {
        var stream = es.readArray([1, 2, 3]);

        should.exist(answers);

        finalize(null, stream);
      },
      postInstall: function (answers, finalize) {
        finalize('This should error');
      }
    });
    scaffold.start([step], function (err) {
      should.exist(err);
      done();
    });
  });
});
