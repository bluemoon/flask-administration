
class dashboard.Gauges extends Backbone.Collection
  model: dashboard.Gauge

  initialize: (options) ->
    @url = options.url
    return @

class dashboard.Dashboards extends Backbone.Collection
  model: dashboard.Dashboard

  initialize: (options) ->
    @url = options.url
    return @