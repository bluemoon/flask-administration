"""
.. module:: metric
   :synopsis: The event driver for the administration module

.. moduleauthor:: Bradford Toney <bradford.toney@gmail.com>

"""
from flask import jsonify, Blueprint, request, Response, render_template
from flask_administration.utils import (static_folder, template_folder, encode_model)
from flask_administration import apachelog

#from flask_administration.blueprints import event_blueprint
from mongoengine import *

import mongoengine
import datetime
import redisco
import flask
import json
import time
import base64
from juggernaut import Juggernaut

DATA = '_d'
KEY = '_k'
EVENT = '_n'
TIME = '_t'
IDENT = '_p'

event_blueprint = Blueprint('event_driver', 
                         'flask.ext.administration.metrics',
                          static_folder=static_folder, 
                          template_folder=template_folder)

event_blueprint.db = mongoengine.connect(db='events')
jug = Juggernaut()


class EventDocument(mongoengine.Document):
    name = StringField()
    ip = StringField()
    type = StringField()
    time = FloatField()
    key = StringField()
    identity = StringField()
    custom = DictField()

    #@classmethod
    #def post_save(cls, sender, document, *args, **kwargs):
    #    result = json.dumps(document, default=encode_model)
        #jug.publish('event-{}'.format(), result)


class Event(object):
    pass


class Events(object):
    def from_log(self):
        format = r'%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"'
        p = apachelog.parser(format)
        data = []
        with open('access.log') as f:
            for line in f:
                try:
                    data.append(p.parse(line))
                except:
                    pass
        return jsonify(data=data)



def store_event(event_dict):
    """ Stores an event

    :returns: None
    """
    custom_properties = dict((key, value) for key, value in \
        event_dict.iteritems() if not key.startswith('_'))

    converted = [{k: v} for k, v in custom_properties.items()]

    e = EventDocument(name=event_dict.get(EVENT), 
              time=time.time(), 
              identity=event_dict.get(IDENT),
              custom=custom_properties)
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
    name = request.args.get('name', None)
    before = request.args.get('before', False)
    after = request.args.get('after', False)

    if before:
        before = float(request.args.get('before'))
    if after:
        after = float(request.args.get('after'))
    
    if before and not after:
        events = EventDocument.objects(time__lt=before)
    elif after and not before:
        events = EventDocument.objects(time__gt=after)
    elif after and before:
        events = EventDocument.objects(time__lt=before, time__gt=after)
    else:
        result = json.dumps(Event.objects.all(), default=encode_model)
        return Response(response=result)

    result = json.dumps(events, default=encode_model, indent=4)
    return Response(response=result)


#mongoengine.signals.post_save.connect(EventDocument.post_save, sender=EventDocument)


@event_blueprint.route('/log/nginx/')
def log_lighttpd():
    format = r'%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"'
    p = apachelog.parser(format)
    data = []
    for line in open('access.log'):
        try:
           data.append(p.parse(line))
        except:
           pass
    return jsonify(data=data)
