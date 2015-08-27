require('mocha');
var util = require('..');
var _ = require('lodash');
var async = require('async');
var should = require('should');
var es = require('event-stream');
var inquirer = require('inquirer');

describe('Scaffold Multi Install', function () {
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

  it('should perform a blank multi-install successfully', function (done) {
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = util.Scaffold({
      content: {
        intro: 'Multi-install start',
        done: "Multi-install complete."
      }
    });
    scaffold.startMultiInstall([step], [
      {option1: 'x'},
      {option1: 'y'},
      {option1: 'z'}
    ], done);
  });

  it('should perform a blank multi-install successfully, with debug', function (done) {
    var step = util.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = util.Scaffold({
      debug: true,
      content: {
        intro: 'Multi-install start',
        done: "Multi-install complete."
      }
    });
    scaffold.startMultiInstall([step], [
      {option1: 'x'},
      {option1: 'y'},
      {option1: 'z'}
    ], done);
  });
});
