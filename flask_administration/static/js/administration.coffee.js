var $, BASE_URL, TemplateManager, collections, dashboard, dispatch, models, views;
$ = jQuery;
_.mixin(_.string.exports());
BASE_URL = 'http://127.0.0.1:5000/admin';
models = {};
collections = {};
views = {};
dispatch = _.extend({}, Backbone.Events);
dashboard = {};
TemplateManager = {
  templates: {},
  get: function(name, callback) {
    var template;
    name.replace("#", "");
    template = this.templates[name];
    if (template) {
      callback(template);
    } else {
      this.fetch(name + '.html', callback);
    }
    if (_(this.name).endsWith('html')) {
      return this.fetch(name, callback);
    }
  },
  fetch: function(name, callback) {
    return $.ajax('/admin/static/views/' + name, {
      type: 'GET',
      dataType: 'html',
      error: function(jqXHR, textStatus, errorThrown) {
        return ($('body')).append('AJAX Error: #{textStatus}');
      },
      success: __bind(function(data, textStatus, jqXHR) {
        this.template = _.template(($(data)).html());
        return callback(this.template);
      }, this)
    });
  }
};
/**
 * @constructor
 * @extends {Backbone.Model}
 */
var models.Gauge = function() {
  models.Gauge.__super__.constructor.apply(this, arguments);
};
__extends(models.Gauge, Backbone.Model);
;
/**
 * @constructor
 * @extends {Backbone.Model}
 */
var models.Dashboard = function() {
  models.Dashboard.__super__.constructor.apply(this, arguments);
};
__extends(models.Dashboard, Backbone.Model);
;
/**
 * @constructor
 * @extends {Backbone.Collection}
 */
var collections.Gauges = function() {
  collections.Gauges.__super__.constructor.apply(this, arguments);
};
__extends(collections.Gauges, Backbone.Collection);

collections.Gauges.prototype.model = models.Gauge;
collections.Gauges.prototype.initialize = function(options) {
  return this.url = options.url;
};;
/**
 * @constructor
 * @extends {Backbone.Collection}
 */
var collections.Dashboards = function() {
  collections.Dashboards.__super__.constructor.apply(this, arguments);
};
__extends(collections.Dashboards, Backbone.Collection);

collections.Dashboards.prototype.model = models.Dashboard;
collections.Dashboards.prototype.initialize = function(options) {
  return this.url = options.url;
};;
/**
 * @constructor
 * @extends {Backbone.View}
 */
var views.GaugeView = function() {
  views.GaugeView.__super__.constructor.apply(this, arguments);
};
__extends(views.GaugeView, Backbone.View);

views.GaugeView.prototype.tagName = "div";
views.GaugeView.prototype.template = _.template($('#gauge-template').html());
views.GaugeView.prototype.initialize = function(options) {
  this.nid = options.nid;
  this.parent = options.parent;
  dispatch.on("tick:rtc", this.update);
  return this;
};
views.GaugeView.prototype.update = function() {};
views.GaugeView.prototype.render = function() {
  TemplateManager.get('gauge-template', __bind(function(Template) {
    return this.parent.collections.gauges.fetch({
      success: __bind(function() {
        var data;
        data = this.parent.collections.gauges.get(this.nid).attributes.data;
        return this.$el.html($(Template({
          'id': this.nid,
          'data': data
        })));
      }, this)
    });
  }, this));
  return this;
};;
/**
 * @constructor
 * @extends {views.GaugeView}
 */
var views.TimelineView = function() {
  this.update = __bind(this.update, this);
  views.TimelineView.__super__.constructor.apply(this, arguments);
};
__extends(views.TimelineView, views.GaugeView);

views.TimelineView.prototype.template = _.template($('#gauge-timeline-template').html());
views.TimelineView.prototype.initialize = function(options) {
  this.nid = options.nid;
  this.parent = options.parent;
  this.timeElement = $("#time-" + this.nid);
  console.log(this.nid);
  dispatch.on("tick:rtc", this.update);
  return this;
};
views.TimelineView.prototype.update = function() {
  var hours, meridian, minutes, now, seconds;
  now = new Date;
  hours = now.getHours();
  minutes = now.getMinutes();
  seconds = now.getSeconds();
  meridian = hours < 12 ? "AM" : "PM";
  if (hours > 12) {
    hours -= 12;
  }
  if (hours === 0) {
    hours = 12;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  console.log(this.timeElement);
  return $("#time-" + this.nid).text("" + hours + ":" + minutes + ":" + seconds + " " + meridian);
};;
/**
 * @constructor
 * @extends {views.GaugeView}
 */
var views.TimeView = function() {
  views.TimeView.__super__.constructor.apply(this, arguments);
};
__extends(views.TimeView, views.GaugeView);
;
/**
 * @constructor
 * @extends {Backbone.View}
 */
var views.Dashboard = function() {
  this.incrementTick = __bind(this.incrementTick, this);
  views.Dashboard.__super__.constructor.apply(this, arguments);
};
__extends(views.Dashboard, Backbone.View);

views.Dashboard.prototype.ticks = 0;
views.Dashboard.prototype.views = [];
views.Dashboard.prototype.collections = {
  dashboards: new collections.Dashboards({
    url: '/admin/dashboard/load'
  }),
  gauges: new collections.Gauges({
    url: '/admin/dashboard/gauge/'
  })
};
views.Dashboard.prototype.initialize = function(options) {
  this.el = $(options.el);
  this.incrementTick();
  return this;
};
views.Dashboard.prototype.render = function() {
  ($('#js-loading')).remove();
  this.views = [];
  this.el.empty();
  this.collections.dashboards.map(__bind(function(item) {
    var ele, gauge, gauge_id, k_instance, klass;
    gauge = item.get('gauge');
    gauge_id = item.get('id');
    klass = views[gauge.type];
    ele = '#gauge-' + gauge_id;
    k_instance = new klass({
      parent: this,
      nid: gauge_id,
      id: ele
    });
    this.el.append(k_instance.render().el);
    return this.views.push(k_instance);
  }, this));
  return this;
};
views.Dashboard.prototype.incrementTick = function() {
  dispatch.trigger('tick:increment');
  this._intervalFetch = window.setTimeout(this.incrementTick, 100);
  if (this.ticks % 10 === 0) {
    dispatch.trigger('tick:rtc');
  }
  this.ticks++;
  return this;
};
views.Dashboard.prototype.preRender = function() {
  return this.collections.dashboards.fetch({
    success: __bind(function() {
      return this.render();
    }, this)
  });
};;
$(function() {
  var appView;
  appView = new views.Dashboard({
    el: $('#main')
  });
  return appView.preRender();
});
