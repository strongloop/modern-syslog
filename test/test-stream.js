var assert = require('assert');
var fmt = require('util').format;
var syslog = require('../');
var tap = require('tap');

var l = syslog.level;

// Patch out the core syslog() so we can verify its arguments.
function onLog(callback) {
  syslog.callback = function() {
    callback.apply(null, arguments);
    syslog.callback = null;
  };
}

syslog.core.syslog = function() {
  if (syslog.callback) {
    syslog.callback.apply(null, arguments);
    return;
  }
};

function test(level, facility) {
  tap.test(fmt('level=%s facility=%s', level, facility), function(t) {
    var strm = new syslog.Stream(level, facility);
    var _level = syslog.toLevel(level);
    var _facility = syslog.toFacility(facility);
    var _priority = _level | _facility;

    t.plan(2);

    onLog(function(priority, msg) {
      t.equal(priority, _priority, 'priority');
      t.equal(String(msg), 'hello', 'message');
    });

    strm.end('hello');
    strm.once('finish', function() {
      t.end();
    });
  });
}

test(l.LOG_DEBUG);
test(l.LOG_CRIT);
test('LOG_CRIT');
test('LOG_CRIT', syslog.facility.LOG_LOCAL0);
test('LOG_CRIT', 'LOG_LOCAL7');
test(l.LOG_INFO, syslog.facility.LOG_LOCAL6);
test('LOG_EMERG', 'LOG_USER');
