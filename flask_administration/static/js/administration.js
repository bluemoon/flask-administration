var BASE_URL, DashboardSpace, Emitter, TemplateManager, collections, dashboard, log, models, timer, views,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

BASE_URL = 'http://127.0.0.1:5000/admin';

models = {};

collections = {};

views = {};

dashboard = {};

Emitter = _.extend({}, Backbone.Events);

_.mixin(_.string.exports());

timer = true;

({
  dash: {
    "Total Notifications": {
      source: "http://localhost:5000/",
      GaugeLabel: {
        parent: "#hero-one",
        title: "Notifications Served",
        type: "max"
      }
    }
  }
});

log = {
  bind: function() {},
  send: function(item) {
    $.ajax({
      type: 'GET',
      url: '/admin/?hashmonitor=' + encodeURIComponent(item)
    });
    return console.log(item);
  },
  error: function(item) {
    return log.send(item);
  }
};

TemplateManager = {
  poisoned: false,
  templates: {},
  get: function(name, callback) {
    name.replace("#", "");
    if (this.templates[name + '.html'] !== void 0) {
      callback(this.templates[name + '.html']);
    } else {
      this.fetch(name + '.html', callback);
    }
    if (_(this.name).endsWith('html')) return this.fetch(name, callback);
  },
  fetch: function(name, callback) {
    var hasStorage, item, template,
      _this = this;
    if (window.localStorage) {
      hasStorage = true;
    } else {
      hasStorage = false;
    }
    if (hasStorage) {
      item = localStorage.getItem('template-' + name);
      if (item !== null && !this.poisoned) {
        template = _.template(($(item)).html());
        return callback(template);
      }
    }
    return $.ajax('/admin/static/views/' + name, {
      type: 'GET',
      dataType: 'html',
      error: function(jqXHR, textStatus, errorThrown) {
        return ($('body')).append('AJAX Error: #{textStatus}');
      },
      success: function(data, textStatus, jqXHR) {
        _this.template = _.template(($(data)).html());
        if (hasStorage) {
          localStorage.setItem('template-' + name, data);
        } else {
          _this.templates[name] = _this.template;
        }
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

  GaugeView.prototype.initialize = function(options) {
    this.nid = options.nid;
    this.parent = options.parent;
    this.template = 'gauge-template';
    return this;
  };

  GaugeView.prototype.update = function() {};

  GaugeView.prototype.render = function() {
    var _this = this;
    TemplateManager.get(this.template, function(Template) {
      return _this.parent.collections.gauges.fetch({
        success: function() {
          var data;
          data = _this.parent.collections.gauges.get(_this.nid).attributes.data;
          _this.$el.html($(Template({
            'id': _this.nid,
            'data': data
          })));
          return _this.update();
        }
      });
    });
    return this;
  };

  return GaugeView;

})(Backbone.View);

views.BusinessEngagement = (function(_super) {

  __extends(BusinessEngagement, _super);

  function BusinessEngagement() {
    BusinessEngagement.__super__.constructor.apply(this, arguments);
  }

  BusinessEngagement.prototype.initialize = function() {
    return this.template = 'gauge-template';
  };

  BusinessEngagement.prototype.render = function() {
    var _this = this;
    TemplateManager.get(this.template, function(Template) {
      return _this.$el.html($(Template));
    });
    return this;
  };

  return BusinessEngagement;

})(Backbone.View);

views.Settings = (function(_super) {

  __extends(Settings, _super);

  function Settings() {
    Settings.__super__.constructor.apply(this, arguments);
  }

  Settings.prototype.events = {
    "change input": "changed",
    "change select": "changed"
  };

  Settings.prototype.changed = function(event) {
    var item, target, value;
    target = event.currentTarget;
    item = $('#' + target.id);
    value = item.val();
    localStorage.setItem('tick-time', value);
    item.val(null);
    return item.attr('placeholder', value);
  };

  Settings.prototype.render = function() {
    var _this = this;
    Emitter.trigger('tick:stop');
    ($('#js-loading')).remove();
    this.$el.empty();
    ($('li.active')).removeClass('active');
    ($('#settings')).addClass('active');
    return TemplateManager.get('settings-template', function(Template) {
      return ($(_this.el)).append($(Template({
        tickTime: localStorage.getItem('tick-time')
      })));
    });
  };

  return Settings;

})(Backbone.View);

views.Dashboard = (function(_super) {

  __extends(Dashboard, _super);

  function Dashboard() {
    this.incrementTick = __bind(this.incrementTick, this);
    this.startRTC = __bind(this.startRTC, this);
    Dashboard.__super__.constructor.apply(this, arguments);
  }

  Dashboard.prototype.ticks = 0;

  Dashboard.prototype.views = [];

  Dashboard.prototype.collections = {
    dashboards: new collections.Dashboards({
      url: '/admin/dashboard/load'
    }),
    gauges: new collections.Gauges({
      url: '/admin/dashboard/gauge/'
    })
  };

  Dashboard.prototype.initialize = function(options) {
    var _this = this;
    try {
      (function() {
        _this.Jugs = new Juggernaut;
        return _this.hasJugs = true;
      });
    } catch (e) {
      (function() {
        console.log(e);
        return _this.hasJugs = false;
      });
    }
    Emitter.on('tick:stop', function() {
      return timer = false;
    });
    this.handleCloseButton();
    this.startTimerOrChannel(options);
    this.widgetWell();
    return this;
  };

  Dashboard.prototype.toggleSidebar = function() {
    return $('#sidebar-toggle').click(function() {
      $('#sidebar-toggle i').toggleClass('icon-chevron-left icon-chevron-right');
      $('#sidebar').animate({
        width: 'toggle'
      }, 250);
      return $('#main').toggleClass('span10 span12');
    });
  };

  Dashboard.prototype.handleCloseButton = function() {
    return $('.close').live('click', function() {
      var gauge;
      gauge = $(this).parent().parent();
      gauge.remove();
      if (_(gauge.attr('id')).startsWith('gauge')) {
        return console.log('Stopping events from being fired');
      } else {
        return $('#main').toggleClass('span8 span10');
      }
    });
  };

  Dashboard.prototype.widgetWell = function() {
    var _this = this;
    return TemplateManager.get('widget-well-template', function(Template) {
      return $('a.toggles').click(function() {
        $('#main').toggleClass('span8 span10');
        $('#main-row').append(Template);
        $('#main').droppable({
          drop: function() {
            return console.log('dropped');
          }
        });
        return $('#main, .widgets').sortable({
          connectWith: "#main"
        }).disableSelection();
      });
    });
  };

  Dashboard.prototype.startTimerOrChannel = function(options) {
    if (this.hasJugs) {
      this.startRTC();
      return this.openChannel(options.channel);
    } else {
      return this.startRTC();
    }
  };

  Dashboard.prototype.openChannel = function(channelName) {
    return this.Jugs.subscribe(channelName, function(data) {
      return Emitter.trigger(chanelName, data);
    });
  };

  Dashboard.prototype.startRTC = function() {
    if (timer) {
      this._interval = window.setTimeout(this.startRTC, 1000);
      return Emitter.trigger('tick:rtc');
    }
  };

  Dashboard.prototype.incrementTick = function() {
    if (timer) {
      this._interval = window.setTimeout(this.incrementTick, localStorage.getItem('tick-time'));
      if (this.ticks % 2 === 0) Emitter.trigger('tick:rtc');
      Emitter.trigger('tick:increment');
      return this.ticks++;
    }
  };

  Dashboard.prototype.Render = function() {
    ($('li.active')).removeClass('active');
    ($('#home')).addClass('active');
    ($('#js-loading')).remove();
    ($('#main')).show();
    return ($('#main')).append($('<canvas id="canvas" width="300" height="300"></canvas>'));
  };

  Dashboard.prototype.render = function() {
    var _this = this;
    ($('li.active')).removeClass('active');
    ($('#home')).addClass('active');
    ($('#js-loading')).remove();
    ($('#main')).show();
    this.views = [];
    this.$el.empty();
    this.collections.dashboards.map(function(item) {
      var classInstance, className, ele, element, gauge, gaugeId;
      gauge = item.get('gauge');
      gaugeId = item.get('id');
      ele = '#gauge-' + gaugeId;
      try {
        className = views[gauge.type];
        classInstance = new className({
          parent: _this,
          nid: gaugeId,
          id: ele
        });
        element = classInstance.render().el;
        _this.$el.append(element);
        return _this.views.push(classInstance);
      } catch (error) {
        return log.error(error);
      }
    });
    return this;
  };

  return Dashboard;

})(Backbone.View);

DashboardSpace = (function(_super) {

  __extends(DashboardSpace, _super);

  function DashboardSpace() {
    DashboardSpace.__super__.constructor.apply(this, arguments);
  }

  DashboardSpace.prototype.initialize = function() {
    this.settings = new views.Settings({
      el: $('#main')
    });
    this.appView = new views.Dashboard({
      el: $('#main')
    });
    this.business = new views.BusinessEngagement({
      el: $('#main')
    });
    return this.dashboard = new collections.Dashboards({
      url: '/admin/dashboard/load'
    });
  };

  DashboardSpace.prototype.routes = {
    "/settings/": "settings",
    "/business/": "business",
    "*actions": "default"
  };

  DashboardSpace.prototype.business = function() {
    return this.business.render();
  };

  DashboardSpace.prototype.settings = function() {
    return this.settings.render();
  };

  DashboardSpace.prototype["default"] = function(actions) {
    var _this = this;
    return this.dashboard.fetch({
      success: function() {
        return _this.appView.Render();
      }
    });
  };

  return DashboardSpace;

})(Backbone.Router);

$(function() {
  var router;
  router = new DashboardSpace;
  return Backbone.history.start();
});
