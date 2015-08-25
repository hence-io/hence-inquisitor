# glush-util [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]

## Information

Utilities for gulp plugins & slush scaffolding, build on gulp-util.

This is an extension built on top of [gulp-util](https://github.com/gulpjs/gulp-util), giving you access to the tools
 you know, as well as some new tools for your belt.

### Usage

Installing the package:
```bash
$ npm i --save hence-io/glush-util
```

Using the package in your gulp/slush project:
```javascript
var glush = require('glush-util');
```

>

## Streamlined Scaffolding

There are any number of way of creating a slush scaffolding generator, and while it is open and unrestricted,
something is lost when no standards are applied to the process in how to build these.

Glush-util in part was born out of this, seeing the need and desire of having some reusable scaffolding structure,
while remaining as flexible as possible. One library in particular was leveraged to help achieve this goal in
managing a console based installer, and that library is [inquirer](https://github.com/sboudrias/Inquirer.js).

The Scaffold & ScaffoldStep built on top of inquirer allow you to rapid create new generators with ease. Breaking
down the overall installer and it's prompts into meaningful steps by grouping concerns, offers a smaller more
manageable generator, presented in a wizardequse style. This also allows you to easily share steps across
multiple sub-generators (or other generators) with ease, helping to keep your generators DRY.

While these tools were primarily designed to assist in creating Slush generators, they can be adopted to power any node
based scaffolding tool you may require. Nothing is imposed on what the installer does, it's up to you.

### glush.Scaffold

#### Purpose

Scaffold is used to define your installer.

* ```defaults``` Assigning some default options and settings, which will be inherited and accessible to any steps you
add. This is
handy for common shared options or things like folder paths.
* ```content``` Providing some helpful intro and completion copy to detail to users what your installer will do, and any
 helpful
tips as they're finishing things up.
* ```inquirer``` Allowing you to define inquirer specific checks accessible to each step, handy for when checks on
prompts.
* ```install``` Managing how the installation takes place once all of the steps have been executed, providing you a
communal pool
of the final adjusted answers.

Once defined, you can kick start the install process whenever you're ready, triggered by a slush/gulp task or by
whatever CLI tools you're leveraging.

#### Usage

```javascript
// scaffold.js
var scaffold = glush.Scaffold({
  // Set some default options
  defaults : {
      someOption: true,
      dependencies: require('./dependencies.json')
  },
  content = {
    // Starts off the scaffold installer with an intro message
    intro: glush.tempalte("<%= heading %> Follow the prompts to create your package", {
      heading: glush.ascii.heading("Welcome to this installer!")
    }),
    // When the install completes, this adds a DONE ascii art header, and your description below it easily
    done: glush.ascii.done("You're all done installing your package!")
  },
  inquirer {
    // Provide a validation check as to whether or not to include a prompt based on this check.
    allowThisQuestions: function() {
      return scaffold.answers.someOption === false
    }
  },
  // Process and install
  install: function (answers, resolve) {
    var err;

    try {
      // Provides all of the prompted answers to act upon here, likely creating optional pipes
      var stream = gulp.src(answers.files)
        .pipe(doStuff())
        .pipe(gulp.dest(outputFolder);
    } catch(e) {
      err = e;
    }

    // Returning the stream ensures the Scaffold will execute a .on('end'...) and display the done message
    resolve(err, stream);
  },
  // PostInstall - Your install/streams have all finished successfully. Perform any final actions or clean up as needed.
  postInstall(answers, finalize) {
    doMoreStuffAsync(function(err){
      if(!err) {
        doStuff();
      }

      finalize(err);
    });
  }
});

// Launch the installer
module.export = scaffold;
```

```javascript
// slushfile.js
var scaffold = require('./scaffold.js');

gulp.task('default', function(done){
  var steps = [
    require('./step1')
  ];

  scaffold.start(steps, done);
});
```

#### The Scaffold Process

1. ```scaffold.start(steps, overrides, doneFn)``` Start will begin the install, by storing and initializing the steps
passed  in. Each step is provided a reference to the scaffold object. The installers intro copy will display if provided, and then
begin to run the first step object. An optional overrides object can be passed in to handle runtime/cli flags which
could modify your scaffold as you see fit.
2. ```stepX.process(answers, continue)``` The installer will run inquirer against the steps prompts (or by pass them all
 if they  all fail their when checks if provided) and begin to process those answers. The complete set of answers is
 stored on the scaffold object itself, and ongoing set of answers are shared between each step.
3. ```scaffold.install(answers, resolve)``` When all of the steps have finished processing, the final set of answers is
ready to be acted upon and allow you to perform your desired install method. When your stream or process to install
is ready to execute, you can resolve the installer to finalize the scaffolding process.


#### Advanced: Multi-install & CLI Flags

##### Purpose

In advanced uses of the scaffold, you may want to provide some CLI usage which negates the need to run through the
prompts for users, and rather instead run through the install process multiple times with different sets of options.
An alternative start method was introduced to help accommodate this need for you.

##### Usage
```bash
$ slush mygeny argName1 argName2 --debug
```
```javascript
// slushfile.js
var _ = require('lodash');
var glush = require('glush-util');
var scaffold = require('./scaffold.js');

gulp.task('default', function(done){
  var steps = [
    require('./step1')
  ];

  // Because glush leverages gulp-util, the .env for cli args is available
  // We must always drop the first non-flagged arg, as it's always your generator's name
  var cliArgs = _.drop(glush.env._);

  // Check if the CLI had non-flagged args passed through to it
  if(cliArgs.length) {
    // Pull a collection of the varied cli arguments to process for the multi installl
    var installOptions = _.map(cliArgs, function(arg){
      // Build the unique set of options to be used for each installation
      return {
        defaults : {
          debug: !!glush.env.debug // true if a --debug flag is passed in,
          name: arg // The unique arg name passed along
        }
      };
    });

    // Run the multi install with options list.
    scaffold.startMultiInstall(steps, installOptions, done);
  } else {
    // If no arg list was passed through the CLI, run the default prompts with some specific CLI flag overrides
    scaffold.start(steps, {
      debug: !!glush.env.debug // true if a --debug flag is passed in,
    }, done);
  }
});
```


### glush.ScaffoldStep

#### Purpose

ScaffoldStep is used to help define an isolated set of inquirer prompts to be used by a Scaffold installer.

* ```options``` Define a set of unique options supporting the prompts in this step.
* ```defaults``` Set the default options which should be assigned, even if the prompt doesn't pass it's when check.
* ```content``` Controls the console output before and after the step, allowing you to leverage built in Glush
formatting easily.
* ```prompts[]``` Provide the various questions to be posed to the user for this step.
* ```process(answers, continue)``` Process, format, and extend the answer set based on the answers the user provide for
 the prompts in this step, leveraging questions answered in previous steps or defaults from the scaffold. Executing
 continue moves on to the next step in the scaffold, or if this is the last step, begins the installer.

The ScaffoldSteps are utilized automatically from the Scaffold, and do not require you to manually execute them, or
share the data between them, it's already handled for you so you can focus on what's important.

#### Usage

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
    footer: glush.ascii.spacer()
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
  // decisions based on previous options to affect these results. A callback to control when you're ready to begin
  // the next step or start installation is provided, taking an optional error parameter.
  process: function(answers, continue) {
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
    }

    // Run something to instsall system dependencies
    installDepsOverAsync(function(err) {
      if(!err) { // Deps installed successfully, apply some more files/options
        files.push('that glob');
        _.extend(bower.dependencies, {
          "custom":"X.X.X"
        });
      }

      // Finally relinquish control back to the sacffold
      continue(err);
    });
  }
});
```

module.exports = step;
>

## Supporting Tools

### Ascii

Some console helpers to provide standard formatting of headers, and some acsii art.  Each take a message/label, and
and optional flag to output directly to console, or by default returns as a string.

* ```glush.ascii.heading(msg, log)``` - A bold underlined heading with double spacing above, and single below
* ```glush.ascii.complete(msg, log)``` - Ascii art of the word Complete, with msg being and optional description following
* ```glush.ascii.aborted(msg, log)``` - Ascii art of the word Aborted, with msg being and optional description following
* ```glush.ascii.done(msg, log)``` - Ascii art of the word Done, with msg being and optional description following
* ```glush.ascii.spacer(log)``` - A line separator of ------

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

[npm-url]: https://www.npmjs.com/package/glush-util
[npm-image]: https://badge.fury.io/js/glush-util.svg
[travis-url]: https://travis-ci.org/hence-io/glush-util.svg
[travis-image]: https://img.shields.io/travis/hence-io/glush-util.svg?branch=master
[coveralls-url]: https://coveralls.io/r/hence-io/glush-util
[coveralls-image]: https://img.shields.io/coveralls/hence-io/glush-util.svg
[depstat-url]: https://david-dm.org/hence-io/glush-util
[depstat-image]: https://david-dm.org/hence-io/glush-util.svg
