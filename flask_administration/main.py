from flask_administration.utils import (_get_admin_extension_dir, encode_model)
from flask import jsonify, Blueprint, request, Response, render_template
import os
template_folder = os.path.join(_get_admin_extension_dir(), 'templates')
static_folder = os.path.join(_get_admin_extension_dir(), 'static')

admin = Blueprint('admin', 
                  'flask.ext.administration.main',
                   static_folder=static_folder, 
                   template_folder=template_folder)

@admin.route("/")
def index():
	return render_template('admin/index.html')

@admin.route("/log", defaults={'id':0})
@admin.route("/log/<id>")
def log(id):
	return render_template('admin/log.html', id=id)