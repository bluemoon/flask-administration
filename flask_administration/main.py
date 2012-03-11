from flask_administration.utils import (_get_admin_extension_dir, encode_model)
from flask_administration.blueprints import admin
from flask import render_template

@admin.route("/")
def index():
	return render_template('admin/index.html')

@admin.route("/metrics")
def metrics():
	""" The view for /metrics """
	return render_template('admin/metrics.html')

@admin.route("/metrics/new-key")
def new_event_key():
	""" The view for /metrics/new-key """
	return render_template('admin/metrics.newkey.html')

@admin.route("/log", defaults={'id':0})
@admin.route("/log/<id>")
def log(id):
	return render_template('admin/log.html', id=id)