from flask import jsonify, Blueprint, request, Response, render_template
from .utils import (static_folder, template_folder, encode_model)

admin = Blueprint('main', 
	             'flask.ext.administration.main',
                  static_folder=static_folder, 
                  template_folder=template_folder)
