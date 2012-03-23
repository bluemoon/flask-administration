(function() {
  var $, BASE_URL, TemplateManager, collections, dashboard, models, views,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  _.mixin(_.string.exports());

  BASE_URL = 'http://127.0.0.1:5000/admin';

  models = {};

  collections = {};

  views = {};

  dashboard = {};

  TemplateManager = {
    templates: {},
    get: function(name, callback) {
      var template;
      template = this.templates[name];
      if (template) {
        callback(template);
      } else {
        this.fetch(name + '.html', callback);
      }
      if (_(this.name).endsWith('html')) return this.fetch(name, callback);
    },
    fetch: function(name, callback) {
      var _this = this;
      return $.ajax('/admin/static/views/' + name, {
        type: 'GET',
        dataType: 'html',
        error: function(jqXHR, textStatus, errorThrown) {
          return ($('body')).append('AJAX Error: #{textStatus}');
        },
        success: function(data, textStatus, jqXHR) {
          _this.template = _.template(($(data)).html());
          return callback(_this.template);
        }
      });
    }
  };

  models.Gauge = (function(_super) {

    __extends(Gauge, _super);

    function Gauge() {
      Gauge.__super__.constructor.apply(this, arguments);
    }

    return Gauge;

  })(Backbone.Model);

  models.Dashboard = (function(_super) {

    __extends(Dashboard, _super);

    function Dashboard() {
      Dashboard.__super__.constructor.apply(this, arguments);
    }

    return Dashboard;

  })(Backbone.Model);

  collections.Gauges = (function(_super) {

    __extends(Gauges, _super);

    function Gauges() {
      Gauges.__super__.constructor.apply(this, arguments);
    }

    Gauges.prototype.model = models.Gauge;

    Gauges.prototype.initialize = function(options) {
      return this.url = options.url;
    };

    return Gauges;

  })(Backbone.Collection);

  collections.Dashboards = (function(_super) {

    __extends(Dashboards, _super);

    function Dashboards() {
      Dashboards.__super__.constructor.apply(this, arguments);
    }

    Dashboards.prototype.model = models.Dashboard;

    Dashboards.prototype.initialize = function(options) {
      return this.url = options.url;
    };

    return Dashboards;

  })(Backbone.Collection);

  views.GaugeView = (function(_super) {

    __extends(GaugeView, _super);

    function GaugeView() {
      GaugeView.__super__.constructor.apply(this, arguments);
    }

    GaugeView.prototype.tagName = "div";

    GaugeView.prototype.template = _.template($('#gauge-template').html());

    GaugeView.prototype.initialize = function(options) {
      this.id = options.nid;
      this.parent = options.parent;
      return this;
    };

    GaugeView.prototype.render = function() {
      var _this = this;
      TemplateManager.get('gauge-template', function(Template) {
        return _this.parent.collections.gauges.fetch({
          success: function() {
            var data;
            data = _this.parent.collections.gauges.get(_this.id).attributes.data;
            return _this.$el.html($(Template({
              'id': _this.id,
              'data': data
            })));
          }
        });
      });
      return this;
    };

    return GaugeView;

  })(Backbone.View);

  views.TimelineView = (function(_super) {

    __extends(TimelineView, _super);

    function TimelineView() {
      TimelineView.__super__.constructor.apply(this, arguments);
    }

    TimelineView.prototype.template = _.template($('#gauge-timeline-template').html());

    return TimelineView;

  })(views.GaugeView);

  views.TimeView = (function(_super) {

    __extends(TimeView, _super);

    function TimeView() {
      TimeView.__super__.constructor.apply(this, arguments);
    }

    TimeView.prototype.updateTime = function() {
      var hours, meridian, minutes, now, seconds;
      now = new Date;
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
      meridian = hours < 12 ? "AM" : "PM";
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      if (minutes < 10) minutes = "0" + minutes;
      if (seconds < 10) seconds = "0" + seconds;
      return this.$("#time span").text("" + hours + ":" + minutes + ":" + seconds + " " + meridian);
    };

    return TimeView;

  })(views.GaugeView);

  views.DashboardView = (function(_super) {

    __extends(DashboardView, _super);

    function DashboardView() {
      DashboardView.__super__.constructor.apply(this, arguments);
    }

    DashboardView.prototype.views = [];

    DashboardView.prototype.collections = {
      dashboards: new collections.Dashboards({
        url: '/admin/dashboard/load'
      }),
      gauges: new collections.Gauges({
        url: '/admin/dashboard/gauge/'
      })
    };

    DashboardView.prototype.initialize = function(options) {
      this.el = $(options.el);
      console.log(this.collections);
      return this;
    };

    DashboardView.prototype.render = function() {
      var _this = this;
      ($('#js-loading')).remove();
      this.views = [];
      this.el.empty();
      this.collections.dashboards.map(function(item) {
        var ele, gauge, gauge_id, k_instance, klass;
        gauge = item.get('gauge');
        gauge_id = item.get('id');
        klass = views[gauge.type];
        ele = '#gauge-' + gauge_id;
        k_instance = new klass({
          parent: _this,
          nid: gauge_id,
          id: ele
        });
        console.log(k_instance.el);
        _this.el.append(k_instance.render().el);
        return _this.views.push(k_instance);
      });
      return this;
    };

    DashboardView.prototype.preRender = function() {
      var _this = this;
      return this.collections.dashboards.fetch({
        success: function() {
          return _this.render();
        }
      });
    };

    return DashboardView;

  })(Backbone.View);

  $(function() {
    var appView;
    appView = new views.DashboardView({
      el: $('#main')
    });
    return appView.preRender();
  });

}).call(this);
