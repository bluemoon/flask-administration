sys = require 'util'
fs = require 'fs'
util = require 'util'
events = require 'events'
tail = require 'tail'
test_log = '/var/log/system.log'

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
    test_line = '124.115.0.139 - - [25/Mar/2012:19:29:22 +0000] "GET / HTTP/1.1" 200 1116 "-" "Sosospider+(+http://help.soso.com/webspider.htm)"'
    console.log @nginx(test_line)


tail = new Parser test_log