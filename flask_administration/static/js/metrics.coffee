class events
	constructor: (@key, @endpoint) ->

	push: (event) ->
		$.ajax
			url: @endpoint + '/e'
			context: document.body
		

class metrics_dashboard
	