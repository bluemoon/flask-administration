var Parser, events, fs, sys, tail, test_log, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

sys = require('util');

fs = require('fs');

util = require('util');

events = require('events');

tail = require('tail');

test_log = '/var/log/system.log';

Parser = (function() {

  Parser.prototype.nginx = function(line) {
    var dateISO, ip, matches;
    matches = line.match(/(\S*) - [(\S*)|-] \[(\S* \+[0-9]{4})\] \"(.*?)\" ([0-9]{3}) ([0-9]*) \"(.*?)\" \"(.*?)\"/);
    ip = matches[1];
    dateISO = matches[2];
    return {
      ip: ip,
      date: dateISO
    };
  };

  function Parser(filename, type) {
    this.filename = filename;
    this.type = type != null ? type : 'nginx';
    this.onParse = __bind(this.onParse, this);
    tail = new tail.Tail(this.filename, this.onParse);
  }

  Parser.prototype.onParse = function(line) {
    var test_line;
    test_line = '124.115.0.139 - - [25/Mar/2012:19:29:22 +0000] "GET / HTTP/1.1" 200 1116 "-" "Sosospider+(+http://help.soso.com/webspider.htm)"';
    return console.log(this.nginx(test_line));
  };

  return Parser;

})();

tail = new Parser(test_log);
