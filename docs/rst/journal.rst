
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