(function() {
  var UnifiedEvents;

  UnifiedEvents = (function() {

    function UnifiedEvents(key, endpoint) {
      this.key = key;
      this.endpoint = endpoint;
    }

    UnifiedEvents.prototype.push = function(event) {
      return $.ajax({
        url: this.endpoint + '/e',
        context: document.body
      });
    };

    return UnifiedEvents;

  })();

}).call(this);
