# glush-util [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]

## Information

Utilities for gulp plugins & slush scaffolding, build on gulp-util.

This is an extension built on top of [gulp-util](https://github.com/gulpjs/gulp-util), giving you access to the tools
 you know, as well as some new tools for your belt.

## Usage

```javascript
var glush = require('glush-util');
```

### Ascii

Some console helpers to provide standard formatting of headers, and some acsii art.  Each take a message/label, and
and optional flag to output directly to console, or by default returns as a string.

* ```glush.ascii.heading(msg, log)``` - A bold underlined heading with double spacing above, and single below
* ```glush.ascii.spacer(log)``` - A line separator of ------
* ```glush.ascii.hence(msg, log)``` - Ascii art of the Hence.io brand, with msg being and optional description following
* ```glush.ascii.complete(msg, log)``` - Ascii art of the word Complete, with msg being and optional description following
* ```glush.ascii.aborted(msg, log)``` - Ascii art of the word Aborted, with msg being and optional description following
* ```glush.ascii.done(msg, log)``` - Ascii art of the word Done, with msg being and optional description following

This command:
```javascript
glush.ascii.done("Thank you for using the Scaffolding Tool!", true); // Outputs directly to console with optional flag
```
Will output:
```
  ____  _____ _   _ _____
 |  _ \|  _  | \ | | ____|
 | | | | | | |  \| |  _|
 | |_| | |_| | |\  | |___
 |____/|_____|_| \_|_____|

 Thank you for using the Scaffolding Tool!
```

### Slush Specific

### ScaffoldStep

Create isolated steps are part of your scaffold installation, letting each define and managed it's set of options,
defaults (ensuring they're set should questions be bypassed), it's prompts to produce using inquirer, and processing
those results before carrying on to the next step.

```javascript
var options = {
  option1: {
    a: "Do this",
    b: "Do that"
  }
};

var defaults = {
  option1: options.option1.a
};

var step = glush.ScaffoldStep({
  options: options,
  defaults: defaults,
  // Content will support details for the current step, offer users some helpful direction on what they're configuring
  content: {
    // Displayed before the prompts
    header: {
      title: "Main Options",
      details: "This is an important decision..."
    }
    // Displays after the final prompt
    footer: '---------'
  },
  // Inquirer prompts
  prompts: [{
    type: 'list',
    name: 'option1',
    // Glush extends gulp-util, so you have access to all it's defaults, like the colors object
    message: "Select your option." + glush.colors.reset.dim('\n  See project documentation to for more information on
     Hence component types.'),
    // Display the detailed option values
    choices: _.values(options.option1),
    "default": defaults.option1
  }],
  // Once all of the prompts are complete, or bypassed, process these set of answers before continuing
  // Compounds the answers form all previous steps or the defaults set on the scaffold, allowing you to make
  // decisions based on previous options to affect these results.
  process: function(answers) {
    // files
    var files = answers.files;
    // dependencies
    var npm = answers.dependencies.npm;
    var bower = answers.dependencies.bower;

    // Did the user answer with option a?
    if(answers.option1 === options.option1.a) {
      files.push('this glob');
      _.extend(npm.dependencies, {
        "custom":"X.X.X"
      });
    } else {
      files.push('that glob');
      _.extend(bower.dependencies, {
        "custom":"X.X.X"
      });
    }
  }
});
```

### Scaffold

Create a unified scaffold installer, with any number of steps, providing some initial default options, and handling
the installation with the resulting set of answers from each questions prompts.

```javascript
var scaffold = glush.Scaffold({
  // Set some default options
  defaults : {
      someOption: true,
      dependencies: require('./dependencies.json')
  },
  // Content to
  content = {
    // Starts off the scaffold installer with an intro message
    intro: glush.ascii.heading("Welcome to this installer!") + "Follow the prompts to create your package"
    // When the install completes, this adds a DONE ascii art header, and your description below it easily
    done: glush.ascii.done("You're all done installing your package!")
  },
  install: function (answers) {
    // Provides all of the prompted answers to act upon here, likely creating optional pipes
    return gulp.src(answers.files)
      .pipe(doStuff())
      .pipe(gulp.dest(outputFolder);
    // Returning the stream ensures the Scaffold will execute a .on('end'...) and display the done message
  }
});

scaffold.start([step],done);
```

[npm-url]: https://www.npmjs.com/package/glush-util
[npm-image]: https://badge.fury.io/js/glush-util.svg
[travis-url]: https://travis-ci.org/gulpjs/glush-util
[travis-image]: https://img.shields.io/travis/gulpjs/glush-util.svg?branch=master
[coveralls-url]: https://coveralls.io/r/gulpjs/glush-util
[coveralls-image]: https://img.shields.io/coveralls/gulpjs/glush-util.svg
[depstat-url]: https://david-dm.org/gulpjs/glush-util
[depstat-image]: https://david-dm.org/gulpjs/glush-util.svg
