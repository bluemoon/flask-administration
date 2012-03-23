(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  dashboard.Gauges = (function(_super) {

    __extends(Gauges, _super);

    function Gauges() {
      Gauges.__super__.constructor.apply(this, arguments);
    }

    Gauges.prototype.model = dashboard.Gauge;

    Gauges.prototype.initialize = function(options) {
      this.url = options.url;
      return this;
    };

    return Gauges;

  })(Backbone.Collection);

  dashboard.Dashboards = (function(_super) {

    __extends(Dashboards, _super);

    function Dashboards() {
      Dashboards.__super__.constructor.apply(this, arguments);
    }

    Dashboards.prototype.model = dashboard.Dashboard;

    Dashboards.prototype.initialize = function(options) {
      this.url = options.url;
      return this;
    };

    return Dashboards;

  })(Backbone.Collection);

}).call(this);
