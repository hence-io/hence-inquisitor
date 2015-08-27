require('mocha');
var util = require('..');
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
      content: {
        done: 'Woohoo!'
      }
    };
  });

  it('should perform a blank install successfully', function (done) {
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = util.Scaffold(this.scaffoldOpts);
    scaffold.start(step, function (err) {
        should.not.exist(err);
        done();
      }
    );
  });

  it('should perform a blank install successfully be aborted', function (done) {
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = util.Scaffold({
      defaults: {
        aborted: true
      }
    });
    scaffold.start([step], function (err) {
      should.not.exist(err);
      done();
    });
  });

  it('should perform a blank install and receive a preinstall error', function (done) {
    var step = util.ScaffoldStep(_.defaultsDeep({
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

    var scaffold = util.Scaffold({
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
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = util.Scaffold({
      debug: true,
      install: function (answers, finalize) {
        finalize();
      }
    });
    scaffold.start([step], function (err) {
      should.not.exist(err);
      done();
    });
  });

  it('should perform a blank install and catch an error', function (done) {
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = util.Scaffold({
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
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = util.Scaffold({
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
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = util.Scaffold({
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
