var util = require('..');
var ascii = util.ascii;

require('should');
require('mocha');

describe('ascii', function () {
  it('should format a heading', function (done) {
    ascii.heading('Test').should
      .equal('\n\n ' + ascii.rawCodes.boldUnderline.start + 'Test' + ascii.rawCodes.boldUnderline.end + '\n\n');
    done();
  });

  it('should format a heading and output to console', function (done) {
    ascii.heading('Test', true).should
      .equal('\n\n ' + ascii.rawCodes.boldUnderline.start + 'Test' + ascii.rawCodes.boldUnderline.end + '\n\n');
    done();
  });

  it('should render ascii art', function (done) {
    ascii.renderAsciiArt('----', 'Test').should
      .equal('\n' + ascii.rawCodes.bold.start + '----' + ascii.rawCodes.bold.end + '\n' + 'Test' + '\n');
    done();
  });
});
