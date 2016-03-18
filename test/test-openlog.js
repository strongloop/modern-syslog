// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: modern-syslog
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var tap = require('tap');
var assert = require('assert');
var syslog = require('../');
var o = syslog.option;
var f = syslog.facility;

tap.test(function(t) {
  t.doesNotThrow(function() {
    syslog.open('June', o.LOG_PERROR + o.LOG_PID, f.LOG_LOCAL1);
    syslog.upto('LOG_DEBUG');
    t.comment('Expect on stderr a greeting to June with a PID:');
    syslog.log('LOG_DEBUG', 'Hi, June', function() {
      syslog.open('Leonie', o.LOG_PERROR, f.LOG_LOCAL2);
      syslog.upto('LOG_DEBUG');
      t.comment('Expect on stderr a greeting to Leonie without a PID:');
      syslog.debug('Hi, %s', 'Leonie');
    });
  }, 'open and log');
  t.end();
});
