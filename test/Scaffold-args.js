require('mocha');
var glush = require('..');
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

  it('should perform a blank install successfully, with overrides', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = glush.Scaffold(_.extend(this.scaffoldOpts, {
      debug: true
    }));
    var introMsg = 'See this here and now';
    var doneMsg = 'Not woohoo!';
    var install = function install(a, b) {b();};
    scaffold.start(step, {
        content: {
          intro: introMsg,
          done: doneMsg
        },
        debug: false,
        install: install
      }, function (err) {
        this.debug.should.equal(false);
        this.install.should.equal(install);
        this.content.intro.should.equal(introMsg);
        should.not.exist(err);
        done();
      }
    );
  });

  it('should perform a blank install with all argument options: no args', function (done) {
    var scaffold = glush.Scaffold();
    scaffold.done = done;
    scaffold.start();
  });

  it('should perform a blank install with all argument options: step args', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = glush.Scaffold();
    scaffold.done = done;
    scaffold.start(step);
  });

  it('should perform a blank install with all argument options: options args', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = glush.Scaffold();
    scaffold.done = done;
    scaffold.start(this.scaffoldOpts);
  });

  it('should perform a blank install with all argument options: done args', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = glush.Scaffold();
    scaffold.start(done);
  });

  it('should perform a blank install with all argument options: step & options args', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = glush.Scaffold();
    scaffold.done = done;
    scaffold.start(step, this.scaffoldOpts);
  });

  it('should perform a blank install with all argument options: step & done args', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = glush.Scaffold();
    scaffold.start(step, done);
  });

  it('should perform a blank install with all argument options: options & done args', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = glush.Scaffold();
    scaffold.start(this.scaffoldOpts, done);
  });

  it('should perform a blank install with all argument options: all args', function (done) {
    var step = glush.ScaffoldStep(this.scaffoldStepOpts);
    var scaffold = glush.Scaffold();
    scaffold.start(step, this.scaffoldOpts, done);
  });
});
