from flask_administration.utils import (_get_admin_extension_dir, encode_model, make_json_response)
from flask_administration.blueprints import admin
from flask_administration.metrics import EventDocument

from flask import render_template, request, jsonify

@admin.route("/")
def index():
	return render_template('admin/index.html')

@admin.route("/metrics")
def metrics():
	""" The view for /metrics """
	return render_template('admin/metrics.html')

@admin.route("/metrics/events")
def events():
	""" The view for /metrics/events """
	return render_template('admin/metrics.events.html', events=EventDocument.objects.all())

@admin.route("/metrics/keys")
def event_keys():
	""" The view for /metrics/keys """
	if request.method == 'POST':
		pass
	return render_template('admin/metrics.keys.html')

@admin.route("/log", defaults={'id':0})
@admin.route("/log/<id>")
def log(id):
	return render_template('admin/log.html', id=id)

## Dashboard routes
@admin.route("/dashboard/load/", defaults={'dashboard':'default'})
@admin.route("/dashboard/load/<dashboard>")
def load_dashboard(dashboard):
	return make_json_response([{'id':1, 'gauge': {'type':'TimeView'}},
							   {'id':2, 'gauge': {'type':'TimeView'}},
							   {'id':3, 'gauge': {'type':'BarView'}}])
 
@admin.route("/dashboard/gauge/", defaults={'gauge_id':'1'})
@admin.route("/dashboard/gauge/<gauge_id>")
def load_gauge(gauge_id):
	return make_json_response([{'id':1, 'timezone': 'PST'}, 
							   {'id':2, 'timezone': 'EST'},
							   {'id':3, 'bar': [[55, 20, 13, 32, 5, 1, 2, 10], [10, 2, 1, 5, 32, 13, 20, 55], [12, 20, 30]]}
							   ])