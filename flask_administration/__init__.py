from __future__ import absolute_import

import datetime
from functools import wraps
import inspect
import os
import time
import types

import flask
from flask import flash, render_template, redirect, request, url_for

def __version__():
    file_base = os.path.dirname(inspect.getfile(inspect.currentframe()))
    with open(os.path.join(file_base, "VERSION")) as f:
        data = f.read()
        return '0.1.{}'.format(data)

def view_decorator(f):
    @wraps(f)
    def wrapper(*args, **kwds):
        return f(*args, **kwds)
    return wrapper
    
def create_adminitizr_blueprint(view_decorator=view_decorator, 
                                 template_folder=None,
                                 static_folder=None):
    if not template_folder:
        template_folder = os.path.join(
            _get_admin_extension_dir(), 'templates')
    if not static_folder:
        static_folder = os.path.join(
            _get_admin_extension_dir(), 'static')

    admin_blueprint = flask.Blueprint('adminitizr', 
                                  'flask.ext.adminitizr',
                                  static_folder=static_folder, 
                                  template_folder=template_folder)
    
    
    def get_model_url_key(model_instance):
        """Helper function that turns a set of model keys into a
        unique key for a url.
        """
        values = datastore.get_model_keys(model_instance)
        return '/'.join([unicode(value) if value else empty_sequence
                         for value in values])
    
    def create_index_view():
        @view_decorator
        def index():
            """Landing page view for admin module"""
            return render_template('admin/index.html')
        return index
        
    def create_log_view():
        @view_decorator
        def log():
            LOG_FILE = '/var/log/system.log'
            MAX_LEN = -100
            with open(LOG_FILE, 'r') as f:
                log_buffer = f.readlines()
                return render_template('admin/log.html', log_buffer=log_buffer[MAX_LEN:])

        return log
        
    admin_blueprint.add_url_rule('/', 'index', view_func=create_index_view())
    admin_blueprint.add_url_rule('/log/', 'index', view_func=create_log_view())

    return admin_blueprint
    
    
def _get_admin_extension_dir():
    """Returns the directory path of this admin extension. This is
    necessary for setting the static_folder and templates_folder
    arguments when creating the blueprint.
    """
    return os.path.dirname(inspect.getfile(inspect.currentframe()))