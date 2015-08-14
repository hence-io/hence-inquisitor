var _ = require('lodash');
var inquirer = require('inquirer');
var ascii = require('./ascii');
var isTruthy = require('./validator').isTruthy;

var ScaffoldStep = function (opts) {
  var self = _.defaultsDeep(_.cloneDeep(opts), {
    scaffold: {},
    options: {},
    defaults: {},
    content: {
      header: '',
      footer: ''
    },
    prompts: [],
    process: function (results, next) {
      next();
    }
  });

  _.extend(self, {
    inquire: function (answers, callback) {
      var byPassPrompts = 0;
      var prompts = self.prompts;

      // On the first run, the callback is the only parameter. Set it an initialize answers object
      if (arguments.length === 1) {
        callback = arguments[0];
        // make sure we initialize the answer with whatever the scaffolds defaults are
        answers = self.scaffold.defaults || {};
      }

      // Run the when checks on all the prompts to find out if any questions will be asked. Count how many are being
      // by passed.
      _.each(prompts, function (prompt) {
        _.extend(prompt, {
          step: self,
          validation: self.scaffold.inquirer || {}
        });

        if (_.isFunction(prompt.when) && !prompt.when()) {
          byPassPrompts++;
        }
      });

      // If all questions are being by passed, finalize and move on without triggering inquirer, so the
      // answers/defaults are still processed
      if (byPassPrompts === prompts.length) {
        finalize();
      }
      // We have questions to be answered
      else {
        // Display the header
        var header = self.content.header;
        if (header) {
          if (_.isObject(header)) {
            header = ascii.heading(header.title) + ' ' + header.details + "\n";
          }

          console.log(header);
        }

        inquirer.prompt(prompts,
          function (results) {
            _.extend(answers, results);

            // Display the footer
            if (self.content.footer) {
              console.log(self.content.footer);
            }

            finalize();
          }
        );
      }

      function finalize() {
        _.defaults(answers, self.defaults);

        // Process any isTruthy values for potential booleans, saving the dev from having to do this after the fact.
        _.each(self.defaults, function (val, key) {
          if (_.isBoolean(val)) {
            answers[key] = isTruthy(answers[key]);
          }
        });

        self.process(answers, function (err) {

          _.extend(self.scaffold.answers, answers);

          callback(err, answers);
        });
      }
    }
  });

  return self;
};

module.exports = ScaffoldStep;
