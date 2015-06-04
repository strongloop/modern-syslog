'use strict';

var assert = require('assert');
var debug = require('debug')('modern-syslog:test');
var syslog = require('../');
var tap = require('tap');

var l = syslog.level;

tap.test('setmask', function(t) {
  var mask0 = syslog.setmask(0x6);
  var mask1 = syslog.setmask(0x6);
  var mask2 = syslog.setmask(0x6);
  var mask3 = syslog.upto('LOG_DEBUG');
  var mask4 = syslog.setmask();

  t.equal(mask1, 0x6);
  t.equal(mask2, 0x6);
  t.equal(mask3, mask2);
  t.equal(mask4, syslog.logUpto('LOG_DEBUG'));
  t.equal(mask4, 0xff);
  t.end();
});

tap.test('logUpto', function(t) {
  var upto = syslog.logUpto;
  var mask;
  
  mask = upto('LOG_DEBUG');
  t.equal(mask, 0xff);
  mask = upto('LOG_INFO');
  t.equal(mask, 0x7f);
  t.assert((1 << l.LOG_CRIT) & mask);
  t.assert((1 << l.LOG_INFO) & mask);
  t.equal((1 << l.LOG_DEBUG) & mask, 0);

  mask = upto('LOG_NOTICE');
  t.equal(mask, 0x3f);
  t.assert((1 << l.LOG_NOTICE) & mask);
  t.equal((1 << l.LOG_INFO) & mask, 0);
  t.equal((1 << l.LOG_DEBUG) & mask, 0);

  mask = upto('LOG_ALERT');
  t.equal(mask, 0x03);
  t.assert((1 << l.LOG_EMERG) & mask);
  t.assert((1 << l.LOG_ALERT) & mask);
  t.equal((1 << l.LOG_CRIT) & mask, 0);
  t.equal((1 << l.LOG_DEBUG) & mask, 0);

  mask = upto('LOG_EMERG');
  t.equal(mask, 0x01);
  t.assert((1 << l.LOG_EMERG) & mask);
  t.equal((1 << l.LOG_ALERT) & mask, 0);
  t.equal((1 << l.LOG_CRIT) & mask, 0);
  t.equal((1 << l.LOG_DEBUG) & mask, 0);

  t.end();
});

tap.test('upto', function(t) {
  syslog.upto(l.LOG_NOTICE);
  t.equal(syslog.curmask(), 0x3f);

  syslog.upto(l.LOG_CRIT);
  t.equal(syslog.curmask(), 0x07);

  syslog.upto(l.LOG_EMERG);
  t.equal(syslog.curmask(), 0x01);

  syslog.upto(l.LOG_DEBUG);
  t.equal(syslog.curmask(), 0xff);

  syslog.upto('LOG_NOTICE');
  t.equal(syslog.curmask(), 0x3f);

  syslog.upto('LOG_CRIT');
  t.equal(syslog.curmask(), 0x07);

  syslog.upto('LOG_EMERG');
  t.equal(syslog.curmask(), 0x01);

  syslog.upto('LOG_DEBUG');
  t.equal(syslog.curmask(), 0xff);

  t.end();
});
