var util = require('..');
require('should');
require('mocha');

describe('Scaffold', function(){
  it('should perform a blank install successfully', function(done){
    var step = util.ScaffoldStep({});
    var scaffold = util.Scaffold({});
    scaffold.start([step],done);
  });
});
