var colors = require('gulp-util').colors;

var defaultBg = colors.bold;
var defaultHeading = colors.bold.underline;

function heading(placeholder, log) {
  var message = '\n\n ' + defaultHeading(placeholder) + '\n\n';

  if (log === true) {
    console.log(message);
  }

  return message;
}

function renderAsciiArt(art, placeholder, log) {
  var message = defaultBg('\n' +
      art +
      ' \n') +
    placeholder +
    '\n';

  if (log === true) {
    console.log(message);
  }

  return message;
}

function hence(placeholder, log) {
  /*
   '  _   _ _____ _   _  ____ _____   _              \n' +
   ' | | | | ____| \ | |/ ___| ____| (_) ___        \n' +
   ' | |_| |  _| |  \| | |   |  _|   | |/ _ \      \n' +
   ' |  _  | |___| |\  | |___| |___ _| | (_) |      \n' +
   ' |_| |_|_____|_| \_|\____|_____(_)_|\___/     \n',
   */

  return renderAsciiArt(
    '  _   _ _____ _   _  ____ _____   _              \n' +
    ' | | | | ____| \\ | |/ ___| ____| (_) ___        \n' +
    ' | |_| |  _| |  \\| | |   |  _|   | |/ _ \\      \n' +
    ' |  _  | |___| |\\  | |___| |___ _| | (_) |      \n' +
    ' |_| |_|_____|_| \\_|\\____|_____(_)_|\\___/     \n',
    placeholder, log);
}

function complete(placeholder, log) {
  /*
   '  _____ _____ _    _ _____ __    _____ _____ _____        \n' +
   ' /  ___|  _  | \  / |  _  | |   | ____|_   _| ____|     \n' +
   ' | |   | | | | |\/| | |_| | |   |  _|   | | |  _|        \n' +
   ' | |___| |_| | |  | |  ___| |___| |___  | | | |___       \n' +
   ' \_____|_____|_|  |_|_|   |_____|_____| |_| |_____|     \n',
   */
  return renderAsciiArt(
    '  _____ _____ _    _ _____ __    _____ _____ _____        \n' +
    ' /  ___|  _  | \\  / |  _  | |   | ____|_   _| ____|     \n' +
    ' | |   | | | | |\\/| | |_| | |   |  _|   | | |  _|        \n' +
    ' | |___| |_| | |  | |  ___| |___| |___  | | | |___       \n' +
    ' \\_____|_____|_|  |_|_|   |_____|_____| |_| |_____|     \n',
    placeholder, log);
}

function aborted(placeholder, log) {
  /*
   '    _   ____  _____ _____ _____ _____ ____         \n' +
   '   / \ |  _ \|  _  |  _  |_   _| ____|  _ \\     \n' +
   '  / _ \| |_| | | | | |_| / | | |  _| | | | |      \n' +
   ' | |_| | |_| | |_| |  _ \  | | | |___| |_| |      \n' +
   ' |_| |_|____/|_____|_| \_\ |_| |_____|____/      \n',
   */
  return renderAsciiArt(
    '    _   ____  _____ _____ _____ _____ ____         \n' +
    '   / \\ |  _ \\|  _  |  _  |_   _| ____|  _ \\     \n' +
    '  / _ \\| |_| | | | | |_| / | | |  _| | | | |      \n' +
    ' | |_| | |_| | |_| |  _ \\  | | | |___| |_| |      \n' +
    ' |_| |_|____/|_____|_| \\_\\ |_| |_____|____/      \n' +
    ' \n' +
    '                ¯\\_(ツ)_/¯\n' +
    ' \n',
    placeholder, log);
}

function done(placeholder, log) {
  /*
   '  ____  _____ _   _ _____        \n' +
   ' |  _ \|  _  | \ | | ____|     \n' +
   ' | | | | | | |  \| |  _|        \n' +
   ' | |_| | |_| | |\  | |___       \n' +
   ' |____/|_____|_| \_|_____|     \n',
   */
  return renderAsciiArt(
    '  ____  _____ _   _ _____        \n' +
    ' |  _ \\|  _  | \\ | | ____|     \n' +
    ' | | | | | | |  \\| |  _|        \n' +
    ' | |_| | |_| | |\\  | |___       \n' +
    ' |____/|_____|_| \\_|_____|     \n',
    placeholder, log);
}


function spacer(log) {
  var message = defaultBg('-----------------------------------------------------------------------------------------------------------------------');

  if (log === true) {
    console.log(message);
  }

  return message;
}

module.exports = {
  renderAsciiArt:renderAsciiArt,
  heading: heading,
  hence: hence,
  done: done,
  complete: complete,
  aborted: aborted,
  spacer: spacer
};
