require('mocha');
var should = require('should');
var inquisitor = require('..');
var es = require('event-stream');
var inquirer = require('inquirer');

describe('inquirer', function () {
  it('should perform a inquirer field check on a boolean find it to be true', function (done) {
    var check = inquisitor.inquirer.validatePrompt('isBoolean', 'isBoolean', false);

    check.call({
      async: function () {
        return function (result) {
          should.exist(result);
          result.should.equal(true);
          done();
        };
      }
    }, true);
  });

  it('should perform a inquirer field check on a boolean find it to be false', function (done) {
    var message = 'Boolean failed';
    var check = inquisitor.inquirer.validatePrompt('isBoolean', message, true);

    check.call({
      async: function () {
        return function (result) {
          should.exist(result);
          result.should.equal(message);
          done();
        };
      }
    }, true);
  });
});
