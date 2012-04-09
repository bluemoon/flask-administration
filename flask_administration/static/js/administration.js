var $, BASE_URL, DashboardSpace, Emitter, TemplateManager, collections, dashboard, models, views,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = jQuery;

BASE_URL = 'http://127.0.0.1:5000/admin';

models = {};

collections = {};

views = {};

dashboard = {};

Emitter = _.extend({}, Backbone.Events);

_.mixin(_.string.exports());

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

TemplateManager = {
  poisoned: true,
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
    return this;
  };

  GaugeView.prototype.render = function() {
    var _this = this;
    TemplateManager.get('gauge-template', function(Template) {
      return _this.parent.collections.gauges.fetch({
        success: function() {
          var data;
          data = _this.parent.collections.gauges.get(_this.nid).attributes.data;
          _this.$el.html($(Template({
            'id': _this.nid,
            'data': data
          })));
          return _this.$el.draggable({
            snap: '#main'
          });
        }
      });
    });
    return this;
  };

  return GaugeView;

})(Backbone.View);

views.SunView = (function(_super) {

  __extends(SunView, _super);

  function SunView() {
    this.render = __bind(this.render, this);
    SunView.__super__.constructor.apply(this, arguments);
  }

  SunView.prototype.height = 410;

  SunView.prototype.width = 550;

  SunView.prototype.initialize = function(options) {
    return SunView.__super__.initialize.call(this, options);
  };

  SunView.prototype.render = function() {
    var _this = this;
    TemplateManager.get('sun-template', function(Template) {
      return _this.parent.collections.gauges.fetch({
        success: function() {
          var countries, data, path, svg, xy;
          data = _this.parent.collections.gauges.get(_this.nid);
          _this.$el.html($(Template({
            'id': _this.nid,
            'data': data
          })));
          xy = d3.geo.mercator().translate([270, 250]);
          path = d3.geo.path().projection(xy);
          svg = d3.select("#canvas-" + _this.nid).append("svg").attr("width", _this.width).attr("height", _this.height);
          countries = svg.append("g").attr("id", "countries");
          return d3.json("/admin/static/js/world.json", function(json) {
            return countries.selectAll("path").data(json.features).enter().append("path").attr("d", path);
          });
        }
      });
    });
    return this;
  };

  return SunView;

})(views.GaugeView);

views.TimeView = (function(_super) {

  __extends(TimeView, _super);

  function TimeView() {
    this.update = __bind(this.update, this);
    TimeView.__super__.constructor.apply(this, arguments);
  }

  TimeView.prototype.template = _.template($('#gauge-timeline-template').html());

  TimeView.prototype.timezoneInteger = 0;

  TimeView.prototype.initialize = function(options) {
    var _this = this;
    this.nid = options.nid;
    this.parent = options.parent;
    this.timeElement = $("#time-" + this.nid);
    this.parent.collections.gauges.fetch({
      success: function() {
        _this.tz = _this.parent.collections.gauges.get(_this.nid).get('timezone');
        switch (_this.tz) {
          case 'EST':
            _this.timezoneInteger = -5;
            break;
          case 'PST':
            _this.timezoneInteger = -8;
        }
        return Emitter.on('tick:rtc', _this.update);
      }
    });
    return this;
  };

  TimeView.prototype.update = function() {
    var now;
    now = new Time({
      timezone: this.tz
    });
    return $("#time-" + this.nid).text(now.nowString());
  };

  return TimeView;

})(views.GaugeView);

views.TimelineView = (function(_super) {

  __extends(TimelineView, _super);

  function TimelineView() {
    TimelineView.__super__.constructor.apply(this, arguments);
  }

  return TimelineView;

})(views.GaugeView);

views.BulletView = (function(_super) {

  __extends(BulletView, _super);

  function BulletView() {
    BulletView.__super__.constructor.apply(this, arguments);
  }

  BulletView.prototype.orient = "left";

  BulletView.prototype.reverse = false;

  BulletView.prototype.duration = 0;

  BulletView.prototype.width = 380;

  BulletView.prototype.height = 30;

  BulletView.prototype.tickFormat = null;

  BulletView.prototype.bulletRanges = function(d) {
    return d.ranges;
  };

  BulletView.prototype.bulletMarkers = function(d) {
    return d.markers;
  };

  BulletView.prototype.bulletMeasures = function(d) {
    return d.measures;
  };

  return BulletView;

})(views.GaugeView);

views.BarView = (function(_super) {

  __extends(BarView, _super);

  function BarView() {
    this.render = __bind(this.render, this);
    BarView.__super__.constructor.apply(this, arguments);
  }

  BarView.prototype.height = 100;

  BarView.prototype.width = 35;

  BarView.prototype._timer = true;

  BarView.prototype.initialize = function(options) {
    var _this = this;
    this.t = 1297110663;
    this.v = 70;
    Emitter.on('tick:stop', function() {
      return _this._timer = false;
    });
    return BarView.__super__.initialize.call(this, options);
  };

  BarView.prototype.next = function() {
    var v;
    return {
      time: ++this.t,
      value: v = ~~Math.max(10, Math.min(90, this.v + 10 * (Math.random() - .5)))
    };
  };

  BarView.prototype.render = function() {
    var _this = this;
    TemplateManager.get('bar-template', function(Template) {
      return _this.parent.collections.gauges.fetch({
        success: function() {
          var chart, data, redraw, x, y, _interval;
          data = _this.parent.collections.gauges.get(_this.nid);
          _this.$el.html($(Template({
            'id': _this.nid,
            'data': data
          })));
          data = d3.range(10).map(_this.next);
          redraw = function() {
            var rect;
            rect = chart.selectAll("rect").data(data, function(d) {
              return d.time;
            });
            rect.enter().insert("rect", "line").attr("x", function(d, i) {
              return x(i) - .5;
            }).attr("y", function(d) {
              return _this.height - y(d.value) - .5;
            }).attr("width", _this.width).attr("height", function(d) {
              return y(d.value);
            });
            rect.transition().duration(1000).attr("x", function(d, i) {
              return x(i) - .5;
            });
            return rect.exit().transition().duration(1000).attr("x", function(d, i) {
              return x(i - 1) - .5;
            }).remove();
          };
          x = d3.scale.linear().domain([0, 1]).range([0, _this.width]);
          y = d3.scale.linear().domain([0, 100]).rangeRound([0, _this.height]);
          chart = d3.select('#canvas-' + _this.nid).append("svg").attr("class", "chart").attr("width", _this.width * data.length - 1).attr("height", _this.height);
          chart.selectAll("rect").data(data).enter().append("rect").attr("x", function(d, i) {
            return x(i) - .5;
          }).attr("y", function(d) {
            return _this.height - y(d.value) - .5;
          }).attr("width", _this.width).attr("height", function(d) {
            return y(d.value);
          });
          _interval = function() {
            data.shift();
            data.push(_this.next());
            return redraw();
          };
          if (_this._timer) {
            return setInterval(_interval, localStorage.getItem('tick-time'));
          }
        }
      });
    });
    return this;
  };

  return BarView;

})(views.GaugeView);

views.ArcView = (function(_super) {

  __extends(ArcView, _super);

  function ArcView() {
    this.render = __bind(this.render, this);
    ArcView.__super__.constructor.apply(this, arguments);
  }

  ArcView.prototype.initialize = function(options) {
    Emitter.on('tick:rtc', this.render);
    return ArcView.__super__.initialize.call(this, options);
  };

  ArcView.prototype.data = function() {
    return [[3], [3], [3]];
  };

  ArcView.prototype.arc = function(positionX, positionY, size, start, end) {
    var arcCoef, path;
    start = start * Math.PI / 180;
    arcCoef = end * Math.PI / 180;
    return path = ["M", positionX, positionY, "L", positionX + size * Math.cos(start, positionY - size * Math.sin(start, "A", size, size, 0, 0, 1, positionX + size * Math.cos(arcCoef, positionY - size * Math.sin(arcCoef))))].join(",");
  };

  ArcView.prototype.render = function() {
    var _this = this;
    TemplateManager.get('bar-template', function(Template) {
      return _this.parent.collections.gauges.fetch({
        success: function() {
          var barData, data;
          data = _this.parent.collections.gauges.get(_this.nid);
          _this.$el.html($(Template({
            'id': _this.nid,
            'data': data
          })));
          barData = data.get('bar');
          return _this.paper = Raphael('canvas-' + _this.nid, 370, 250);
        }
      });
    });
    return this;
  };

  return ArcView;

})(views.GaugeView);

views.DotView = (function(_super) {

  __extends(DotView, _super);

  function DotView() {
    this.render = __bind(this.render, this);
    DotView.__super__.constructor.apply(this, arguments);
  }

  DotView.prototype.x = 10;

  DotView.prototype.y = 20;

  DotView.prototype.sizeX = 12;

  DotView.prototype.sizeY = 12;

  DotView.prototype.padX = 2;

  DotView.prototype.padY = 2;

  DotView.prototype.baseColor = "#ff9900";

  DotView.prototype.baseStroke = "#ffffff";

  DotView.prototype.render = function() {
    var _this = this;
    TemplateManager.get('bar-template', function(Template) {
      return _this.parent.collections.gauges.fetch({
        success: function() {
          var barData, c, column, data, f_in, f_out, items, position, positionX, positionY, row, _ref, _results;
          data = _this.parent.collections.gauges.get(_this.nid);
          _this.$el.html($(Template({
            'id': _this.nid,
            'data': data
          })));
          barData = data.get('bar');
          _this.paper = Raphael('canvas-' + _this.nid, 370, 250);
          items = [];
          row = 0;
          column = 0;
          _results = [];
          for (position = 0, _ref = _this.x * _this.y; 0 <= _ref ? position < _ref : position > _ref; 0 <= _ref ? position++ : position--) {
            if (position % _this.y === 0) {
              row++;
              column = 0;
            }
            column++;
            positionX = column * (_this.sizeX + _this.padX);
            positionY = row * (_this.sizeY + _this.padY);
            console.log(positionX, positionY);
            c = _this.paper.rect(positionX, positionY, _this.sizeX, _this.sizeY, 0);
            c.attr({
              fill: _this.baseColor,
              stroke: _this.baseStroke
            });
            f_in = function() {
              return this.stop().animate({
                transform: "s1.5 1.5 "
              }, 250, "elastic");
            };
            f_out = function() {
              return this.stop().animate({
                transform: "s1.0 1.0 "
              }, 250, "elastic");
            };
            c.mouseover(f_in);
            c.mouseout(f_out);
            _results.push(items.push(c));
          }
          return _results;
        }
      });
    });
    return this;
  };

  return DotView;

})(views.GaugeView);

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
    console.log(target);
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
      console.log(_this.$el);
      ($(_this.el)).append($(Template({
        tickTime: localStorage.getItem('tick-time')
      })));
      return console.log('hi');
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

  Dashboard.prototype._timer = true;

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
    this.el = $(options.el);
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
      return _this._timer = false;
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
      return this.incrementTick();
    }
  };

  Dashboard.prototype.openChannel = function(channelName) {
    return this.Jugs.subscribe(channelName, function(data) {
      return Emitter.trigger(chanelName, data);
    });
  };

  Dashboard.prototype.startRTC = function() {
    if (this._timer) {
      this._interval = window.setTimeout(this.startRTC, 1000);
      return Emitter.trigger('tick:rtc');
    }
  };

  Dashboard.prototype.incrementTick = function() {
    if (this._timer) {
      this._interval = window.setTimeout(this.incrementTick, localStorage.getItem('tick-time'));
      if (this.ticks % 2 === 0) Emitter.trigger('tick:rtc');
      Emitter.trigger('tick:increment');
      return this.ticks++;
    }
  };

  Dashboard.prototype.render = function() {
    var _this = this;
    ($('li.active')).removeClass('active');
    ($('#home')).addClass('active');
    ($('#js-loading')).remove();
    ($('#main')).show();
    this.views = [];
    this.el.empty();
    this.collections.dashboards.map(function(item) {
      var ele, element, gauge, gauge_id, k_instance, klass;
      gauge = item.get('gauge');
      gauge_id = item.get('id');
      klass = views[gauge.type];
      ele = '#gauge-' + gauge_id;
      k_instance = new klass({
        parent: _this,
        nid: gauge_id,
        id: ele
      });
      element = k_instance.render().el;
      _this.el.append(element);
      return _this.views.push(k_instance);
    });
    return this;
  };

  Dashboard.prototype.preRender = function() {
    var _this = this;
    return this.collections.dashboards.fetch({
      success: function() {
        return _this.render();
      }
    });
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
    return this.appView = new views.Dashboard({
      el: $('#main')
    });
  };

  DashboardSpace.prototype.routes = {
    "/settings/": "settings",
    "*actions": "default"
  };

  DashboardSpace.prototype.settings = function() {
    return this.settings.render();
  };

  DashboardSpace.prototype["default"] = function(actions) {
    return this.appView.preRender();
  };

  return DashboardSpace;

})(Backbone.Router);

$(function() {
  var router;
  router = new DashboardSpace;
  return Backbone.history.start();
});
