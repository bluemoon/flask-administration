"""
.. module:: event_driver
   :synopsis: The event driver for the administration module

.. moduleauthor:: Bradford Toney <bradford.toney@gmail.com>

"""
from flask import jsonify, Blueprint, request
from redish.client import Client
import flask
import os
import inspect
import json
import time
import base64

DATA = '_d'
KEY = '_k'
EVENT = '_n'

def _get_admin_extension_dir():
    """Returns the directory path of this admin extension. This is
    necessary for setting the static_folder and templates_folder
    arguments when creating the blueprint.

    :returns: path - current path
    """
    return os.path.dirname(inspect.getfile(inspect.currentframe()))

template_folder = os.path.join(_get_admin_extension_dir(), 'templates')
static_folder = os.path.join(_get_admin_extension_dir(), 'static')

event_driver = Blueprint('event_driver', 
                         'flask.ext.administration.event_driver',
                          static_folder=static_folder, 
                          template_folder=template_folder)


db = Client()
event_driver.redis = db

def store_event(dictionary):
    unix_time = time.time()
    base_name = 'events:time:{}'.format(unix_time)
    db[base_name] = dictionary


@event_driver.route("/e", methods=['POST', 'GET'])
def event():
    """ Records an event

    :param _k: Unique key
    :type name: str.
    :param _n: The event name
    :type state: str.
    :returns:  json -- the return code (status=0 or status=1).
    """
    if request.method == 'GET':
        arguments = request.args
    elif request.method == 'POST':
        arguments = request.form

    if arguments.get(DATA):
        decoded = base64.b64decode(arguments.get(DATA))
        json_args = json.loads(decoded)
        if isinstance(json_args, list):
            for arg in json_args:
                store_event(arg)

            return jsonify(status=1)

        arguments = json_args

    custom_properties = dict((key, value) for key, value in \
        arguments.iteritems() if not key.startswith('_'))
    internal_properties = dict((key, value) for key, value in \
        arguments.iteritems() if key.startswith('_'))

    key = arguments.get(KEY)
    event_name = arguments.get(EVENT)
    try:
        store_event(request.args)
    except:
        return jsonify(status=0)

    return jsonify(status=1)
