"""
.. module:: event_driver
   :synopsis: The event driver for the administration module

.. moduleauthor:: Bradford Toney <bradford.toney@gmail.com>

"""

import flask
import os
import inspect

def _get_admin_extension_dir():
    """Returns the directory path of this admin extension. This is
    necessary for setting the static_folder and templates_folder
    arguments when creating the blueprint.

    :returns: path - current path
    """
    return os.path.dirname(inspect.getfile(inspect.currentframe()))

template_folder = os.path.join(_get_admin_extension_dir(), 'templates')
static_folder = os.path.join(_get_admin_extension_dir(), 'static')

event_driver = flask.Blueprint('event_driver', 
                               'flask.ext.administration.event_driver',
                               static_folder=static_folder, 
                               template_folder=template_folder)

@event_driver.route("/e")
def event(big_table, keys, other_silly_variable=None):
    """Fetches rows from a Bigtable.

    Retrieves rows pertaining to the given keys from the Table instance
    represented by big_table.  Silly things may happen if
    other_silly_variable is not None.

    :param name: The name to use.
    :type name: str.
    :param state: Current state to be in.
    :type state: bool.
    :returns:  int -- the return code.
    :raises: AttributeError, KeyError
    """
    pass