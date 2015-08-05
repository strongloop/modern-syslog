var Syslog = require('../');
var assert = require('assert');
var tap = require('tap');

tap.test(function(t) {
  Syslog.init("node-syslog-test", Syslog.LOG_PID | Syslog.LOG_ODELAY, Syslog.LOG_LOCAL0);
  Syslog.log(Syslog.LOG_INFO, "news info log test");
  Syslog.log(Syslog.LOG_ERR, "news log error test");
  Syslog.log(Syslog.LOG_DEBUG, "Last log message as debug: " + new Date());
  Syslog.close();
  t.end();
});
