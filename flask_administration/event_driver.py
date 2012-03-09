"""
.. module:: event_driver
   :synopsis: The event driver for the administration module

.. moduleauthor:: Bradford Toney <bradford.toney@gmail.com>

"""
from flask import jsonify, Blueprint, request, Response
from flask_administration.utils import (static_folder, template_folder, encode_model)
from mongoengine import *

import mongoengine
import datetime
import redisco
import flask
import json
import time
import base64

DATA = '_d'
KEY = '_k'
EVENT = '_n'
TIME = '_t'

event_blueprint = Blueprint('event_driver', 
                         'flask.ext.administration.event_driver',
                          static_folder=static_folder, 
                          template_folder=template_folder)

event_blueprint.db = mongoengine.connect(db='events')


class Event(mongoengine.Document):
    name = StringField()
    time = FloatField()
    key = StringField()
    identity = StringField()
    custom = DictField()


def store_event(event_dict):
    """ Stores an event

    :returns: None
    """
    custom_properties = dict((key, value) for key, value in \
        event_dict.iteritems() if not key.startswith('_'))
    internal_properties = dict((key, value) for key, value in \
        event_dict.iteritems() if key.startswith('_'))

    converted = [{k: v} for k, v in custom_properties.items()]

    e = Event(name=event_dict.get(EVENT), time=time.time(), custom=custom_properties)
    e.save()



@event_blueprint.route("/e", methods=['POST', 'GET'])
def e():
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

    key = arguments.get(KEY)
    event_name = arguments.get(EVENT)
    store_event(request.args)
    return jsonify(status=1)

@event_blueprint.route("/events")
def events():
    """
    Displays all of the events

    """

    before = request.args.get('before', False)
    after = request.args.get('after', False)

    if before:
        before = float(request.args.get('before'))
    if after:
        after = float(request.args.get('after'))
    
    if before and not after:
        events = Event.objects(time__lt=before)
    elif after and not before:
        events = Event.objects(time__gt=after)
    elif after and before:
        events = Event.objects(time__lt=before, time__gt=after)
    else:
        result = json.dumps(Event.objects.all(), default=encode_model)
        return Response(response=result)

    result = json.dumps(events, default=encode_model)
    return Response(response=result)
