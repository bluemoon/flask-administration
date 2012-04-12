sys = require 'util'
fs = require 'fs'
util = require 'util'
events = require 'events'
tail = require 'tail'
test_log = '/var/log/nginx/access.log'

class Parser
  nginx: (line) ->
    matches = line.match /(\S*) - [(\S*)|-] \[(\S* \+[0-9]{4})\] \"(.*?)\" ([0-9]{3}) ([0-9]*) \"(.*?)\" \"(.*?)\"/
    ip = matches[1]
    dateISO = matches[2]

    {
      ip: ip
      date: dateISO
    }

  constructor: (@filename, @type = 'nginx') ->
    tail = new tail.Tail(@filename, @onParse)

  onParse: (line) =>
    console.log @nginx(line)


tail = new Parser test_log