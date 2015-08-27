require('mocha');
var _ = require('lodash');
var should = require('should');
var glush = require('..');
var es = require('event-stream');
var inquirer = require('inquirer');

describe('ScaffoldStep', function () {
  beforeEach(function () {
    this.scaffoldStepOpts = {
      defaults: {
        test: true,
        q1: false,
        q2: false,
        q3: false
      },
      content: {
        header: 'Woot',
        footer: '---All done---'
      },
      prompter: inquirer.createPromptModule()
    };
  });

  it('should perform a blank step inquire successfully', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    step.inquire(function (err, answers) {
      should.not.exist(err);
      should.exist(answers);
      done();
    });
  });

  it('should perform a blank step inquire successfully, with a detailed header', function (done) {
    var step = glush.ScaffoldStep(_.defaultsDeep({
      prompts: [
        {
          type: "confirm",
          name: "q1",
          message: 'Test'
        }
      ],
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

    step.prompter.rl.emit("line");
  });

  it('should perform a simple step with a prompt successfully', function (done) {
    var step = glush.ScaffoldStep(_.defaultsDeep({
      prompts: [
        {
          type: "confirm",
          name: "q1",
          message: 'Test'
        },
        {
          type: "confirm",
          name: "q2",
          message: 'Test',
          when: function () { return true; }
        },
        {
          type: "confirm",
          name: "q3",
          message: 'Test',
          when: function () { return false; }
        }
      ]
    }, this.scaffoldStepOpts));
    step.inquire(function (err, answers) {
      should.not.exist(err);
      should.exist(answers);
      answers.q1.should.equal(true);
      answers.q2.should.equal(true);
      answers.q3.should.equal(false);
      done();
    });

    step.prompter.rl.emit("line");
    step.prompter.rl.emit("line");
  });

});
