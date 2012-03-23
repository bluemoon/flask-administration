(function() {
  var events, metrics_dashboard;

  events = (function() {

    function events(key, endpoint) {
      this.key = key;
      this.endpoint = endpoint;
    }

    events.prototype.push = function(event) {
      return $.ajax({
        url: this.endpoint + '/e',
        context: document.body
      });
    };

    return events;

  })();

  metrics_dashboard = (function() {

    function metrics_dashboard() {}

    return metrics_dashboard;

  })();

}).call(this);
