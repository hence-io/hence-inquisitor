require('mocha');
var should = require('should');
var util = require('..');
var es = require('event-stream');

describe('Scaffold', function () {
  it('should perform a blank install successfully', function (done) {
    var step = util.ScaffoldStep({
      defaults: {
        test: true
      }
    });
    var scaffold = util.Scaffold({
      //_debug: true,
    });
    scaffold.start([step], function (err) {
      should.not.exist(err);
      done();
    });
  });

  it('should perform a blank install and catch an error', function (done) {
    var step = util.ScaffoldStep({});
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
    var step = util.ScaffoldStep({});
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

  it('should perform a blank multi-install successfully', function (done) {
    var step = util.ScaffoldStep({});
    var scaffold = util.Scaffold({
      //_debug: true,
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
