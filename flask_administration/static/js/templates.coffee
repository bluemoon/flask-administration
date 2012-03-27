TemplateManager = 
  templates: {}
  get: (name, callback) ->
    name.replace "#", ""
    template = @templates[name]
    if template
      callback(template)
    else
      @fetch(name + '.html', callback)
    if _(@name).endsWith 'html'
      @fetch(name, callback)


  fetch: (name, callback) ->
    $.ajax '/admin/static/views/' + name,
      type: 'GET'
      dataType: 'html'
      error: (jqXHR, textStatus, errorThrown) ->
        ($ 'body').append 'AJAX Error: #{textStatus}'
      success: (data, textStatus, jqXHR) =>
        @template = _.template ($ data).html()
        callback(@template)
