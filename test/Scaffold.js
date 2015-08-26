require('mocha');
var _ = require('lodash');
var should = require('should');
var util = require('..');
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
  });

  //it('should perform a blank install successfully', function (done) {
  //  var step = util.ScaffoldStep(this.scaffoldStepOpts);
  //  var scaffold = util.Scaffold({
  //    content: {
  //      done: 'Woohoo!'
  //    }
  //  });
  //  scaffold.start(step, {
  //      content: {
  //        intro: 'See this here and now'
  //      }
  //    }, function (err) {
  //      should.not.exist(err);
  //      done();
  //    }
  //  );
  //});

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
