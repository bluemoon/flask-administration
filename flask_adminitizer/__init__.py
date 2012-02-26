from __future__ import absolute_import

import datetime
from functools import wraps
import inspect
import os
import time
import types

import flask
from flask import flash, render_template, redirect, request, url_for


admin_blueprint = flask.Blueprint('adminitizer', 
                                  'flask.ext.adminitizer',
                                  static_folder='static', 
                                  template_folder='templates')