$ = jQuery

_.mixin _.string.exports()


BASE_URL = 'http://127.0.0.1:5000/admin'

models = {}
collections = {}
views = {}

dashboard = {}

TemplateManager = 
  templates: {}
  get: (name, callback) ->
    template = @templates[name]
    if template
      callback(template)
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
        @template = _.template ($ data).html()
        callback(@template)


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
    @id = options.nid
    @parent = options.parent
    this

  render: ->
    TemplateManager.get 'gauge-template', (Template) =>
      @parent.collections.gauges.fetch success: () =>
        data = @parent.collections.gauges.get(@id).attributes.data
        @$el.html ($ Template
          'id': @id
          'data': data)
    this


class views.TimelineView extends views.GaugeView
  template: _.template($('#gauge-timeline-template').html())

class views.TimeView extends views.GaugeView
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
  collections:
    dashboards: new collections.Dashboards
      url: '/admin/dashboard/load'

    gauges: new collections.Gauges
      url: '/admin/dashboard/gauge/'

  initialize: (options) ->
    @el = $ options.el
    console.log @collections
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
      console.log k_instance.el
      @el.append k_instance.render().el
      @views.push k_instance

    #result = (item.render().el for item in @views)
    #console.log result
    this
    

  preRender: ->
    @collections.dashboards.fetch success: () =>
      @render()

$ ->
  appView = new views.DashboardView
    el: $ '#main'
  appView.preRender()

