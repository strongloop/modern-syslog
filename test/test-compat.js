// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: modern-syslog
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var Syslog = require('../');
var tap = require('tap');

tap.test(function(t) {
  t.doesNotThrow(function() {
    Syslog.init("node-syslog-test", Syslog.LOG_PID | Syslog.LOG_ODELAY, Syslog.LOG_LOCAL0);
  }, 'Syslog.init');
  t.doesNotThrow(function() {
    Syslog.log(Syslog.LOG_INFO, "news info log test");
  }, 'Syslog.log/Syslog.LOG_INFO');
  t.doesNotThrow(function() {
    Syslog.log(Syslog.LOG_ERR, "news log error test");
  }, 'Syslog.log/Syslog.LOG_ERR');
  t.doesNotThrow(function() {
    Syslog.log(Syslog.LOG_DEBUG, "Last log message as debug: " + new Date());
  }, 'Syslog.log/Syslog.LOG_DEBUG');
  t.doesNotThrow(function() {
    Syslog.close();
  }, 'Syslog.close');
  t.equal(Syslog.LOG_KERN, Syslog.facility.LOG_KERN);
  t.equal(Syslog.LOG_PID, Syslog.option.LOG_PID);
  t.equal(Syslog.LOG_EMERG, Syslog.level.LOG_EMERG);
  t.end();
});
