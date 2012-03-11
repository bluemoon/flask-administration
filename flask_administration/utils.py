import os
import inspect
from mongoengine import *
import mongoengine
import simplejson
from pymongo.objectid import ObjectId
from types import ModuleType
from itertools import groupby

def encode_model(obj):
    """ This is used for converting mongoengine models to JSON """
    if isinstance(obj, (mongoengine.Document, mongoengine.EmbeddedDocument)):
        out = dict(obj._data)
        for k,v in out.items():
            if isinstance(v, ObjectId):
                out[k] = str(v)
    elif isinstance(obj, mongoengine.queryset.QuerySet):
        out = list(obj)
    elif isinstance(obj, types.ModuleType):
        out = None
    elif isinstance(obj, groupby):
        out = [ (g,list(l)) for g,l in obj ]
    elif isinstance(obj, (list,dict)):
        out = obj
    else:
        raise TypeError, "Could not JSON-encode type '%s': %s" % (type(obj), str(obj))
    return out

def _get_admin_extension_dir():
    """Returns the directory path of this admin extension. This is
    necessary for setting the static_folder and templates_folder
    arguments when creating the blueprint.

    :returns: path - current path
    """
    return os.path.dirname(inspect.getfile(inspect.currentframe()))
   
template_folder = os.path.join(_get_admin_extension_dir(), 'templates')
static_folder = os.path.join(_get_admin_extension_dir(), 'static')
