sys = require 'util'
fs = require 'fs'
util = require 'util'
events = require 'events'
test_log = '/var/log/system.log'

class Tail extends events.EventEmitter
  constructor: (@filename, @callback, @separator = '\n') ->
    @internalEmitter = new events.EventEmitter
    @queue = []
    @previousSize = 0
    @size = 0
    @buffer = ''

    @getSize()
    @internalEmitter.on 'next',=>
      @getBlock()

    fs.watch @filename, (event, filename) =>
      if @size > @previousSize
        @queue.push {
          start: @previousSize
          end: @size
        }
        @internalEmitter.emit 'next' if @queue.length is 1
        @getSize()
        @previousSize = @size

  unwatch:->
    fs.unwatchFile @filename
    @queue = []

  getSize: ->
    fs.stat @filename, (err, stat) =>
      @size = stat.size

  getBlock: =>
    if @queue.length >= 1
      block = @queue[0]
      if block.end > block.start
        stream = fs.createReadStream @filename,
          start: block.start,
          end: block.end-1,
          encoding:"utf-8"

        stream.on 'error', (error) =>
          console.log("Tail error:#{error}")
          @emit('error', error)

        stream.on 'end',=>
          @queue.shift()
          @internalEmitter.emit("next") if @queue.length >= 1

        stream.on 'data', (data) =>
          @buffer += data
          parts = @buffer.split(@separator)
          @buffer = parts.pop()
          @callback(chunk) for chunk in parts

exports.Tail = Tail