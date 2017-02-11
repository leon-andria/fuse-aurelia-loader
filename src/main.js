import environment from './environment';
import * as Bluebird from 'bluebird';

import "babel-polyfill";
import './fuse-aurelia-loader';
import 'aurelia-bootstrapper';

//Configure Bluebird Promises.
Bluebird.config({
  longStackTraces: environment.debug,
  warnings: {
    wForgottenReturn: false
  }
});

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('~/resources');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
