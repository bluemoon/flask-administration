Dashboard Design
=================

Designing an endpoint for the javascript to build the dashboard from

Enpoint JSON
-------------

The endpoint will a starting point for the javascript to be generated from::

    {
      "dashboard" : [
        {
          "type": "bar",
          "autoupdate" : "30",
          "title" : "Bar Metric",
          "size": "3x5"
        },
      ],
	}

The available **types** for widgets are going to be roughly:

* bar - bar chart
* pie - pie chart
* count - a counter
* sum - a counter that is summing
* average - an averaging metric


Backend Design
---------------

The backend design will be made up by several parts, there will be the **gauge** which provides the specific data source and type, the **gauge cluster** which is made up of gauges, and the dashboard which will be made up of a cluster or several clusters.

