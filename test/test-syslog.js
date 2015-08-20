var assert = require('assert');
var fmt = require('util').format;
var syslog = require('../');
var tap = require('tap');

var l = syslog.level;

function h(n) {
  return '0x' + n.toString(16);
}

var currentMask;

function setmask(mask) {
  tap.test(fmt('set mask to %j', mask), function(t) {
    var last = syslog.setmask(mask);
    var now = syslog.setmask(mask);
    t.comment('set mask: was %s, set %s, now %s', h(last), h(mask), h(now));
    currentMask = fmt('mask=%s', h(now));
    if (mask === 0) {
      t.equal(last, now);
    } else {
      t.equal(mask, now);
    }
    t.end();
  });
}

var count = 0;

function expect(l, m) {
  tap.test(fmt('log at %j msg %s', l, m), function(t) {
    var prefix = fmt('%s index %d level %s EXPECTED: (%s) ',
                     currentMask, ++count, l, Buffer.isBuffer(m) ? 'buf' : 'str');

    if (Buffer.isBuffer(m)) {
      m = Buffer(prefix + m);
    } else {
      m = prefix + m;
    }

    syslog.log(l, m, function() {
      t.end();
    });
  });
}

function masked(l, m) {
  tap.test(fmt('masked at %j msg %s', l, m), function(t) {
    var m = fmt('%s level %s NOT EXPECTED: ', currentMask, l, m);
    syslog.log(l, m, function() {
      t.end();
    });
  });
}

setmask(0xff);

expect('LOG_CRIT', 'message');
expect('LOG_CRIT', Buffer('message'));
expect(l.LOG_CRIT, 'message');
expect(l.LOG_CRIT, Buffer('message'));
expect(l.LOG_DEBUG, 'debug');

setmask(syslog.logUpto('LOG_INFO'));

expect(l.LOG_NOTICE, 'should see');
expect(l.LOG_INFO, 'should see');
masked(l.LOG_DEBUG, 'should not see');

setmask(syslog.logMask('LOG_INFO'));

masked(l.LOG_NOTICE, 'should see');
expect(l.LOG_INFO, 'should see');
masked(l.LOG_DEBUG, 'should not see');

tap.test('MANUAL VERIFICATION ABOVE REQUIRED', function(t) {
  t.pass('test logs sent to syslog');
  t.comment('%d log messages should be in syslog, looking like:', count);
  t.comment('   ... index 1 level (?) EXPECTED...');
  t.comment('   ... index %d level (?) EXPECTED...', count);
  t.comment('And the indices should be ordered and consecutive');
  t.end();
});

return
