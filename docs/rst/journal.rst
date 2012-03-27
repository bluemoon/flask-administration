
Development Journal
--------------------


3/19
=====

Things that a dashboard would have.

* Twitter/Sentinment analysis.
* Timeline(facebook style)
* Server Status
* Metrics, lots of metrics, cohort, funnel etc.
* Integration with external services (stripe, github)




3/22
=====

I have chosen to start building the dashboard with javascript, well it's really coffeescript but i digress. 
I've run into a small issue with backbone.js, the issue being that when i dynamically create an instance of
a class it does not seem to run the event delegation, I am not sure if this is an issue with dynamically creating
the instance but from what i've googled it should not be. 


3/26
=====

I tend to be having some problems with backbone because of the way I am doing it, but i think that this may be normal.
I may look at just using Backbone.Models so that i can fetch the json from the server in a simple manner and not have 
to deal with getting and handling the request, Even still I am questioning whether or not I even need to use backbone,
while it seems nice it may be something that is just useful and not essential.