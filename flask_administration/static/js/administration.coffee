$ = jQuery

BASE_URL = 'http://127.0.0.1:5000/admin'

models = {}
collections = {}
views = {}
dashboard = {}
Emitter = _.extend({}, Backbone.Events)

_.mixin _.string.exports()

timer = true

dash:
  "Total Notifications":
    source: "http://localhost:5000/"
    GaugeLabel:
      parent: "#hero-one"
      title: "Notifications Served"
      type: "max"



TemplateManager =
  poisoned: false # for debugging
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
    if window.localStorage
      hasStorage = true
    else
      hasStorage = false

    if hasStorage
      item = localStorage.getItem 'template-' + name
      if item != null and not @poisoned
        template = _.template ($ item).html()
        return callback(template)

    $.ajax '/admin/static/views/' + name,
      type: 'GET'
      dataType: 'html'
      error: (jqXHR, textStatus, errorThrown) ->
        ($ 'body').append 'AJAX Error: #{textStatus}'
      success: (data, textStatus, jqXHR) =>
        @template = _.template ($ data).html()
        if hasStorage
          localStorage.setItem 'template-' + name, data
        else
          @templates[name] = @template
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
class views.GaugeView extends Backbone.View
  initialize: (options) ->
    @nid = options.nid
    @parent = options.parent
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



class views.Settings extends Backbone.View
  events:
    "change input" :"changed",
    "change select" :"changed"

  initialize: ->


  changed: (event) ->
    target = event.currentTarget
    item = $('#' + target.id)
    value = item.val()
    localStorage.setItem 'tick-time', value
    item.val(null)
    item.attr('placeholder', value)

  render: ->
    Emitter.trigger 'tick:stop'
    ($ '#js-loading').remove()
    @$el.empty()
    ($ 'li.active').removeClass('active')
    ($ '#settings').addClass('active')
    TemplateManager.get 'settings-template', (Template) =>
      ($ @el).append ($ Template
        tickTime: localStorage.getItem 'tick-time' )



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
    try () =>
      @Jugs = new Juggernaut
      @hasJugs = true
    catch e then () =>
      console.log e
      @hasJugs = false

    Emitter.on 'tick:stop', () =>
      timer = false

    @handleCloseButton()
    @startTimerOrChannel(options)
    @widgetWell()
    this

  toggleSidebar: ->
    $('#sidebar-toggle').click () ->
      $('#sidebar-toggle i').toggleClass('icon-chevron-left icon-chevron-right')

      $('#sidebar').animate
        width: 'toggle'
        , 250
      $('#main').toggleClass('span10 span12')

  handleCloseButton: ->
    $('.close').live('click',() ->
      gauge = $(this).parent().parent()
      gauge.remove()
      if _(gauge.attr('id')).startsWith('gauge')
        console.log 'Stopping events from being fired'
      else
        # Otherwise it's the widget add box
        $('#main').toggleClass('span8 span10')
    )

  widgetWell: ->
    TemplateManager.get 'widget-well-template', (Template) =>
      $('a.toggles').click () ->
        $('#main').toggleClass('span8 span10')
        $('#main-row').append Template

        $('#main').droppable
          drop: () ->
            console.log 'dropped'


        $('#main, .widgets').sortable(
          connectWith: "#main"
        ).disableSelection()


  startTimerOrChannel: (options) ->
    if @hasJugs
      @startRTC()
      @openChannel(options.channel)
    else
      @startRTC()

  openChannel: (channelName) ->
    @Jugs.subscribe channelName, (data) ->
      Emitter.trigger chanelName, data

  startRTC: =>
    if timer
      @_interval = window.setTimeout @startRTC, 1000
      Emitter.trigger('tick:rtc')


  incrementTick: =>
    if timer
      @_interval = window.setTimeout @incrementTick, localStorage.getItem 'tick-time'
      if @ticks % 2 == 0
        Emitter.trigger('tick:rtc')
      Emitter.trigger('tick:increment')
      @ticks++


  render: ->
    ($ 'li.active').removeClass('active')
    ($ '#home').addClass('active')
    ($ '#js-loading').remove()
    ($ '#main').show()
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

class DashboardSpace extends Backbone.Router
  initialize: ->
    @settings = new views.Settings
      el: $ '#main'
    @appView = new views.Dashboard
      el: $ '#main'

  routes:
    "/settings/": "settings"
    "*actions": "default"

  settings: ->
    @settings.render()

  default: (actions) ->
    @appView.preRender()

$ ->
  router = new DashboardSpace
  Backbone.history.start()