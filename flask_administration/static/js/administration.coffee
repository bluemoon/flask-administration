$ = jQuery
BASE_URL = 'http://127.0.0.1:5000/admin'

models = {}
collections = {}
views = {}

dashboard = {}

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
  template: _.template($('#gauge-template').html())
  parent: $ '#main'
  
  initialize: (options) ->
    console.log options
    @id = options.id
    @el = options.el
    console.log @el
    @

  render: ->
    app.collections.gauges.fetch success: () =>
      data = app.collections.gauges.get(@id).attributes.data
      @parent.append(@template({'id': @id, 'data': data}))
    @

  hide: ->
    @el.remove()

  close: (e) ->
    console.log 'Closing'
    closing = $ '#gauge-' + @id
    console.log closing
    closing.remove()
    false

  events: 'click .close' : 'hide'

class dashboard.TimelineView extends views.GaugeView
  template: _.template($('#gauge-timeline-template').html())

class dashboard.TimeView extends views.GaugeView
  updateTime: ->
    now      = new Date
    hours    = now.getHours()
    minutes  = now.getMinutes()
    seconds  = now.getSeconds()
    meridian = if hours < 12 then "AM" else "PM"

    hours   -= 12 if hours > 12
    hours    = 12 if hours == 0
    minutes  = "0#{minutes}" if minutes < 10
    seconds  = "0#{seconds}" if seconds < 10
    this.$("#time span").text("#{hours}:#{minutes}:#{seconds} #{meridian}")

class views.DashboardView extends Backbone.View
  views: []

  render: =>
    @views = []
    @el.empty()
    app.collections.dashboards.map (i) =>
      gauge = i.get('gauge')
      klass = dashboard[gauge.type]
      k_instance = new klass
        id: i.get('id')
        el: $('gauge-' + i.get('id'))
      @views.push k_instance
      #app.views.other.push k_instance

    result = (item.render() for item in @views)
    @
    

class dashboard.ApplicationRouter extends Backbone.Router
  routes:
    "*actions": "home"

  home: ->
    documents = new collections.Dashboards
      url: '/admin/dashboard/load/'
    documents.fetch
      success: () ->
        new views.DashboardView({ collection: documents })

$ ->
  new dashboard.ApplicationRouter
  Backbone.history.start()
