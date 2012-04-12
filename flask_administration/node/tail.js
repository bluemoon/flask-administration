var Tail, events, fs, sys, test_log, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

sys = require('util');

fs = require('fs');

util = require('util');

events = require('events');

test_log = '/var/log/system.log';

Tail = (function(_super) {

  __extends(Tail, _super);

  function Tail(filename, callback, separator) {
    var _this = this;
    this.filename = filename;
    this.callback = callback;
    this.separator = separator != null ? separator : '\n';
    this.getBlock = __bind(this.getBlock, this);
    this.internalEmitter = new events.EventEmitter;
    this.queue = [];
    this.previousSize = 0;
    this.size = 0;
    this.buffer = '';
    this.getSize();
    this.internalEmitter.on('next', function() {
      return _this.getBlock();
    });
    fs.watch(this.filename, function(event, filename) {
      if (_this.size > _this.previousSize) {
        _this.queue.push({
          start: _this.previousSize,
          end: _this.size
        });
        if (_this.queue.length === 1) _this.internalEmitter.emit('next');
        _this.getSize();
        return _this.previousSize = _this.size;
      }
    });
  }

  Tail.prototype.unwatch = function() {
    fs.unwatchFile(this.filename);
    return this.queue = [];
  };

  Tail.prototype.getSize = function() {
    var _this = this;
    return fs.stat(this.filename, function(err, stat) {
      return _this.size = stat.size;
    });
  };

  Tail.prototype.getBlock = function() {
    var block, stream,
      _this = this;
    if (this.queue.length >= 1) {
      block = this.queue[0];
      if (block.end > block.start) {
        stream = fs.createReadStream(this.filename, {
          start: block.start,
          end: block.end - 1,
          encoding: "utf-8"
        });
        stream.on('error', function(error) {
          console.log("Tail error:" + error);
          return _this.emit('error', error);
        });
        stream.on('end', function() {
          _this.queue.shift();
          if (_this.queue.length >= 1) return _this.internalEmitter.emit("next");
        });
        return stream.on('data', function(data) {
          var chunk, parts, _i, _len, _results;
          _this.buffer += data;
          parts = _this.buffer.split(_this.separator);
          _this.buffer = parts.pop();
          _results = [];
          for (_i = 0, _len = parts.length; _i < _len; _i++) {
            chunk = parts[_i];
            _results.push(_this.callback(chunk));
          }
          return _results;
        });
      }
    }
  };

  return Tail;

})(events.EventEmitter);

exports.Tail = Tail;
