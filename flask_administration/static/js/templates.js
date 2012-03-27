(function() {
  var TemplateManager;

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

}).call(this);
