var fmt = require('util').format;
var syslog = require('../');
var tap = require('tap');

tap.test('core properties exist', function(t) {
  t.assert(syslog.core);
  t.assert(syslog.core.openlog);
  t.assert(syslog.core.syslog);
  t.assert(syslog.core.setlogmask);
  t.assert(syslog.core.closelog);
  t.assert(syslog.core.option.LOG_PID);
  t.assert(syslog.core.facility.LOG_LOCAL0);
  t.assert(syslog.core.level.LOG_DEBUG);
  t.end();
});

function accept(m) {
  tap.test(fmt('core syslog accepts %j', m), function(t) {
    t.plan(1);
    syslog.core.syslog(syslog.core.level.LOG_DEBUG, m, function() {
      t.assert(true, 'called back');
    });
  });
}

accept('string');
accept(Buffer('buffer'));
accept(undefined);
accept(null);
accept({some: 5});
accept(function fn() {});
