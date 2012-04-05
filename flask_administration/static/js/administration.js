(function() {
  var $, BASE_URL, Emitter, TemplateManager, Time, collections, dashboard, models, views,
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

  TemplateManager = {
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
      var _this = this;
      return $.ajax('/admin/static/views/' + name, {
        type: 'GET',
        dataType: 'html',
        error: function(jqXHR, textStatus, errorThrown) {
          return ($('body')).append('AJAX Error: #{textStatus}');
        },
        success: function(data, textStatus, jqXHR) {
          _this.templates[name] = _.template(($(data)).html());
          _this.template = _.template(($(data)).html());
          return callback(_this.template);
        }
      });
    }
  };

  Time = (function() {

    function Time(options) {
      this.timezone = 'UTC' != null ? 'UTC' : options.timezone;
      this.nowLocal = new Date;
      this.nowUTC = new Date(this.nowLocal.getUTCFullYear(), this.nowLocal.getUTCMonth(), this.nowLocal.getUTCDate(), this.nowLocal.getUTCHours(), this.nowLocal.getUTCMinutes(), this.nowLocal.getUTCSeconds());
      this.tz(this.timezone);
    }

    Time.prototype.current_tz_offset = function() {
      var current_date, gmt_offset;
      current_date = new Date;
      return gmt_offset = current_date.getTimezoneOffset() / 60;
    };

    Time.prototype.tz = function(tz) {
      switch (tz) {
        case 'PST':
          this.offset = -8;
          break;
        case 'MST':
          this.offset = -7;
          break;
        case 'CST':
          this.offset = -6;
          break;
        case 'EST':
          this.offset = -5;
      }
      return this;
    };

    Time.prototype.nowString = function() {
      var hours, meridian, minutes, now, offset, seconds;
      if (this.timezone === 'UTC') {
        now = this.nowUTC;
      } else {
        offset = this.nowUTC.getTime() + (3600000 * this.offset);
        now = new Date(offset);
      }
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
      meridian = hours < 12 ? "AM" : "PM";
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      if (minutes < 10) minutes = "0" + minutes;
      if (seconds < 10) seconds = "0" + seconds;
      return "" + hours + ":" + minutes + ":" + seconds + " " + meridian;
    };

    return Time;

  })();

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
      this.nid = options.nid;
      this.parent = options.parent;
      _.bindAll(this, "render");
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

  views.BarView = (function(_super) {

    __extends(BarView, _super);

    function BarView() {
      this.render = __bind(this.render, this);
      BarView.__super__.constructor.apply(this, arguments);
    }

    BarView.prototype.initialize = function(options) {
      Emitter.on('tick:rtc', this.render);
      return BarView.__super__.initialize.call(this, options);
    };

    BarView.prototype.data = function() {
      return [[3], [3], [3]];
    };

    BarView.prototype.render = function() {
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
            _this.$el.draggable({
              snap: '#main'
            });
            barData = data.get('bar');
            _this.raphael = Raphael('canvas-' + _this.nid, 370, 250);
            return _this.chart = _this.raphael.barchart(10, 10, 360, 250, _this.data());
          }
        });
      });
      return this;
    };

    return BarView;

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
            _this.$el.draggable({
              snap: '#main'
            });
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
      this.el = $(options.el);
      _.bindAll(this, 'render');
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
      this.startTimerOrChannel(options);
      return this;
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
      this._interval = window.setTimeout(this.startRTC, 1000);
      Emitter.trigger('tick:rtc');
      return this;
    };

    Dashboard.prototype.incrementTick = function() {
      this._interval = window.setTimeout(this.incrementTick, 500);
      if (this.ticks % 2 === 0) Emitter.trigger('tick:rtc');
      Emitter.trigger('tick:increment');
      this.ticks++;
      return this;
    };

    Dashboard.prototype.render = function() {
      var _this = this;
      ($('#js-loading')).remove();
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

  $(function() {
    var appView;
    appView = new views.Dashboard({
      el: $('#main')
    });
    return appView.preRender();
  });

}).call(this);
