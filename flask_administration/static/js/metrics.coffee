class UnifiedEvents
  constructor: (@key, @endpoint) ->
    
  push: (event) ->
    $.ajax
      url: @endpoint + '/e'
      context: document.body
    

  