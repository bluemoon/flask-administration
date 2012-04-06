$ = jQuery

BASE_URL = 'http://127.0.0.1:5000/admin'

models = {}
collections = {}
views = {}
dashboard = {}
Emitter = _.extend({}, Backbone.Events)

_.mixin _.string.exports()

dash:
  "Total Notifications":
    source: "http://localhost:5000/"
    GaugeLabel:
      parent: "#hero-one"
      title: "Notifications Served"
      type: "max"
  


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



class views.SunView extends views.GaugeView
  height: 410
  width: 550

  initialize: (options) ->
    super options

  render: =>
    TemplateManager.get 'sun-template', (Template) =>
      @parent.collections.gauges.fetch success: () =>
        data = @parent.collections.gauges.get(@nid)
        @$el.html ($ Template
          'id': @nid
          'data': data)
        
        @$el.draggable
          snap: '#main'

        xy = d3.geo.mercator().translate([270, 250])
        path = d3.geo.path().projection(xy)
        svg = d3.select("#canvas-" + @nid)
        .append("svg")
        .attr("width", @width)
        .attr("height", @height)
      
        countries = svg.append("g")
        .attr("id", "countries")

        d3.json("/admin/static/js/world.json", (json) ->
          countries.selectAll("path")
          .data(json.features)
          .enter().append("path")
          .attr("d", path)
        )
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


class views.BulletView extends views.GaugeView
  orient: "left"
  reverse: false
  duration: 0
  width: 380
  height: 30
  tickFormat: null
  bulletRanges: (d) ->
    d.ranges
  bulletMarkers: (d) ->
    d.markers
  bulletMeasures: (d) ->
    d.measures

class views.BarView extends views.GaugeView
  height: 100
  width: 35
  

  initialize: (options) ->
    @t = 1297110663
    @v = 70
    super options

  next: ->
    return {
      time: ++@t,
      value: v = ~~Math.max(10, Math.min(90, @v + 10 * (Math.random() - .5)))
    }

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

         # start time (seconds since epoch)
        data = d3.range(10).map(@next) # starting dataset
        redraw = =>
          rect = chart.selectAll("rect")
          .data(data, (d) ->
            d.time
          )

          rect.enter().insert("rect", "line")
          .attr("x", (d, i) ->
            x(i) - .5
          )
          .attr("y", (d) => 
            @height - y(d.value) - .5
          )
          .attr("width", @width)
          .attr("height", (d) -> 
            y(d.value))
          
          rect.transition()
          .duration(1000)
          .attr("x", (d, i) -> 
            x(i) - .5)
          
          rect.exit()
          .transition()
          .duration(1000)
          .attr("x", (d, i) ->
            x(i - 1) - .5 )
          .remove()

        x = d3.scale.linear()
        .domain([0, 1])
        .range([0, @width])
        
        y = d3.scale.linear()
        .domain([0, 100])
        .rangeRound([0, @height])

        chart = d3.select('#canvas-'+@nid).append("svg")
        .attr("class", "chart")
        .attr("width", @width * data.length - 1)
        .attr("height", @height)

        chart.selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("x", (d, i) ->
          x(i) - .5 )
        .attr("y", (d) => 
          @height - y(d.value) - .5)
        .attr("width", @width)
        .attr("height", (d) -> 
          y(d.value))
        
        _interval = =>
          data.shift()
          data.push(@next())
          redraw()

        setInterval _interval, 1500


       
        console.log data
    this


class views.ArcView extends views.GaugeView
  initialize: (options) ->
    Emitter.on 'tick:rtc', @render
    super options

  data: ->
    [[3], [3], [3]]

  arc: (positionX, positionY, size, start, end) ->
    start = start * Math.PI / 180
    arcCoef = end * Math.PI / 180
    path = [
      "M", positionX, positionY,
      "L", positionX + size * Math.cos start, positionY - size * Math.sin start,
      "A", size, size, 0, 0, 1, positionX + size * Math.cos arcCoef, positionY - size * Math.sin(arcCoef)
    ].join(",")

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
        @paper = Raphael 'canvas-' + @nid, 370, 250

    this

class views.DotView extends views.GaugeView
  x: 10
  y: 20
  sizeX: 12
  sizeY: 12
  padX: 2
  padY: 2
  baseColor: "#ff9900"
  baseStroke: "#ffffff"
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
        @paper = Raphael 'canvas-' + @nid, 370, 250

        items = []
        row = 0
        column = 0
        for position in [0...@x*@y]
          # Stride is @y
          if position % @y == 0
            row++
            column = 0
          column++

          positionX = column * (@sizeX + @padX)
          positionY = row * (@sizeY + @padY)
          console.log positionX, positionY
          c = @paper.rect positionX, positionY, @sizeX, @sizeY, 0
          c.attr
            fill: @baseColor
            stroke: @baseStroke

          #@c.tag positionX - (@sizeX + @padX), positionY, "test1", 0
          f_in = () ->
            this.stop().animate({transform: "s1.5 1.5 "}, 250, "elastic")
          f_out = () ->
            this.stop().animate({transform: "s1.0 1.0 "}, 250, "elastic")

          c.mouseover f_in
          c.mouseout f_out


          items.push c

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

