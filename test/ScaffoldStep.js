require('mocha');
var _ = require('lodash');
var should = require('should');
var util = require('..');
var es = require('event-stream');
var inquirer = require('inquirer');

describe('ScaffoldStep', function () {
  beforeEach(function () {
    this.scaffoldStepOpts = {
      defaults: {
        test: true
      },
      content: {
        header: 'Woot',
        footer: '---All done---'
      },
      prompter: inquirer.createPromptModule()
    };
  });

  it('should perform a blank step inquire successfully', function (done) {
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    step.inquire(function (err, answers) {
      should.not.exist(err);
      should.exist(answers);
      done();
    });
  });

  it('should perform a blank step inquire successfully, with a detailed header', function (done) {
    var step = util.ScaffoldStep(_.defaultsDeep({
      content: {
        header: {
          title: 'Test',
          details: 'Dets'
        }
      }
    }, this.scaffoldStepOpts));
    step.inquire(function (err, answers) {
      should.not.exist(err);
      should.exist(answers);
      done();
    });
  });

  it('should perform a simple step with a prompt successfully', function (done) {
    var step = util.ScaffoldStep(_.defaultsDeep({
      prompts: [
        {
          type: "confirm",
          name: "q1",
          message: 'Test'
        }
      ]
    }, this.scaffoldStepOpts));
    step.inquire(function (err, answers) {
      should.not.exist(err);
      should.exist(answers);
      done();
    });

    step.prompter.rl.emit("line");
  });

});
