$ = jQuery

BASE_URL = 'http://127.0.0.1:5000/admin'

models = {}
collections = {}
views = {}
dashboard = {}
Emitter = _.extend({}, Backbone.Events)

_.mixin _.string.exports()

TemplateManager = 
  templates: {}
  get: (name, callback) ->
    name.replace "#", ""
    if @templates[name + '.html'] != undefined
      callback(@templates[name + '.html'])
    else
      @fetch(name + '.html', callback)
    if _(@name).endsWith 'html'
      @fetch(name, callback)

  fetch: (name, callback) ->
    $.ajax '/admin/static/views/' + name,
      type: 'GET'
      dataType: 'html'
      error: (jqXHR, textStatus, errorThrown) ->
        ($ 'body').append 'AJAX Error: #{textStatus}'
      success: (data, textStatus, jqXHR) =>
        @templates[name] = _.template ($ data).html()
        @template = _.template ($ data).html()
        callback(@template)


class Time
  constructor: (options) ->
    @timezone = 'UTC' ? options.timezone
    @nowLocal = new Date
    @nowUTC = new Date @nowLocal.getUTCFullYear(), 
                       @nowLocal.getUTCMonth(), 
                       @nowLocal.getUTCDate(),  
                       @nowLocal.getUTCHours(), 
                       @nowLocal.getUTCMinutes(), 
                       @nowLocal.getUTCSeconds()
    @tz(@timezone)

  current_tz_offset: ->
    current_date = new Date
    gmt_offset = current_date.getTimezoneOffset() / 60

  tz: (tz) ->
    switch tz
      when 'PST' then @offset = -8
      when 'MST' then @offset = -7
      when 'CST' then @offset = -6
      when 'EST' then @offset = -5
    this

  nowString: ->
    if @timezone == 'UTC'
      now = @nowUTC
    else
      offset = @nowUTC.getTime() + (3600000 * @offset)
      now = new Date offset

    hours    = now.getHours()
    minutes  = now.getMinutes()
    seconds  = now.getSeconds()
    meridian = if hours < 12 then "AM" else "PM"
    hours   -= 12 if hours > 12
    hours    = 12 if hours == 0
    minutes  = "0#{minutes}" if minutes < 10
    seconds  = "0#{seconds}" if seconds < 10
    "#{hours}:#{minutes}:#{seconds} #{meridian}"

##: Models
class models.Gauge extends Backbone.Model
  
class models.Dashboard extends Backbone.Model

##: Collections
class collections.Gauges extends Backbone.Collection
  model: models.Gauge
  initialize: (options) ->
    @url = options.url

class collections.Dashboards extends Backbone.Collection
  model: models.Dashboard
  initialize: (options) ->
    @url = options.url

##: Views
#dashboard.GaugeView = Backbone.View
class views.GaugeView extends Backbone.View
  tagName: "div"
  template: _.template($('#gauge-template').html())

  initialize: (options) ->
    @nid = options.nid
    @parent = options.parent
    _.bindAll this, "render"
    this

  render: ->
    TemplateManager.get 'gauge-template', (Template) =>
      @parent.collections.gauges.fetch success: () =>
        data = @parent.collections.gauges.get(@nid).attributes.data
        @$el.html ($ Template
          'id': @nid
          'data': data)
        ## Make the bad boys draggable
        @$el.draggable
          snap: '#main'

    this


class views.TimeView extends views.GaugeView
  template: _.template($('#gauge-timeline-template').html())
  timezoneInteger: 0

  initialize: (options) ->
    @nid = options.nid
    @parent = options.parent
    @timeElement = $("#time-" + @nid)
    @parent.collections.gauges.fetch
      success: () =>
        @tz = @parent.collections.gauges.get(@nid).get('timezone')
        switch @tz
          when 'EST' then @timezoneInteger = -5
          when 'PST' then @timezoneInteger = -8
        Emitter.on 'tick:rtc', @update
    this

  update: =>
    now = new Time
      timezone: @tz
    $("#time-" + @nid).text(now.nowString())

class views.TimelineView extends views.GaugeView

class views.BarView extends views.GaugeView
  initialize: (options) ->
    Emitter.on 'tick:rtc', @render
    super options

  data: ->
    [[3], [3], [3]]

  render: =>
    TemplateManager.get 'bar-template', (Template) =>
      @parent.collections.gauges.fetch success: () =>
        data = @parent.collections.gauges.get(@nid)
        @$el.html ($ Template
          'id': @nid
          'data': data)
        ## Make the bad boys draggable
        @$el.draggable
          snap: '#main'
        barData = data.get 'bar'
        @raphael = Raphael 'canvas-' + @nid, 370, 250
        @chart = @raphael.barchart 10, 10, 360, 250, @data()
        #@tempChart = @raphael.barchart 10, 10, 360, 250, @data()
        #$.each @chart.bars[0], (k, v) =>
        #  v.animate 
        #    path: @chart.bars[0][k].attr('path'), 200

        # v.value[0] = Math.random()
        #@tempChart.remove()
    this


class views.Dashboard extends Backbone.View
  ticks: 0
  views: []
  collections:
    dashboards: new collections.Dashboards
      url: '/admin/dashboard/load'

    gauges: new collections.Gauges
      url: '/admin/dashboard/gauge/'

  initialize: (options) ->
    @el = $ options.el
    _.bindAll(this, 'render');
    try () =>
      @Jugs = new Juggernaut
      @hasJugs = true
    catch e then () =>
      console.log e
      @hasJugs = false 

    @startTimerOrChannel(options)
    this
  
  startTimerOrChannel: (options) ->
    if @hasJugs
      @startRTC()
      @openChannel(options.channel)
    else
      @incrementTick()

  openChannel: (channelName) ->
    @Jugs.subscribe channelName, (data) ->
      Emitter.trigger chanelName, data

  startRTC: =>
    @_interval = window.setTimeout @startRTC, 1000
    Emitter.trigger('tick:rtc')
    this

  incrementTick: =>
    @_interval = window.setTimeout @incrementTick, 500
    if @ticks % 2 == 0
      Emitter.trigger('tick:rtc')
    Emitter.trigger('tick:increment')
    @ticks++
    this
    
  render: ->
    ($ '#js-loading').remove()
    @views = []
    @el.empty()
    @collections.dashboards.map (item) =>
      gauge = item.get('gauge')
      gauge_id = item.get('id')
      klass = views[gauge.type]
      ele = '#gauge-' + gauge_id
      k_instance = new klass
        parent: this
        nid: gauge_id
        id: ele
      element = k_instance.render().el
      @el.append element
      @views.push k_instance
    this
  
  preRender: ->
    @collections.dashboards.fetch success: () =>
      @render()

$ ->
  appView = new views.Dashboard
    el: $ '#main'
  appView.preRender()

