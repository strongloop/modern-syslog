// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: modern-syslog
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var tap = require('tap');
var syslog = require('../');
var o = syslog.option;
var f = syslog.facility;

tap.test(function(t) {
  t.doesNotThrow(function() {
    syslog.open('June', o.LOG_PERROR + o.LOG_PID, f.LOG_LOCAL1);
    syslog.upto('LOG_DEBUG');
    syslog.log('LOG_DEBUG', 'expected on stderr with a PID', function() {
      syslog.open('Leonie', o.LOG_PERROR, f.LOG_LOCAL2);
      syslog.upto('LOG_DEBUG');
      syslog.debug('Expected on stderr %s a PID', 'without');
    });
  }, 'open and log');
  t.end();
});
