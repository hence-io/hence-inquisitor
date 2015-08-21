var util = require('..');
require('should');
require('mocha');

describe('Scaffold', function(){
  it('should perform a blank install successfully', function(done){
    var step = util.ScaffoldStep({});
    var scaffold = util.Scaffold({
      //_debug: true,
    });
    scaffold.start([step],done);
  });
  it('should perform a blank multi-install successfully', function(done){
    var step = util.ScaffoldStep({});
    var scaffold = util.Scaffold({
      //_debug: true,
      content: {
        intro: 'Multi-install start',
        done: "Multi-install complete."
      }
    });
    scaffold.startMultiInstall([step],[
      {option1:'x'},
      {option1:'y'},
      {option1:'z'}
    ],done);
  });
});
