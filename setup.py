from flask_administration import __version__
from setuptools import setup

import os
import inspect
import json


def version_increment():
    file_base = os.path.dirname(inspect.getfile(inspect.currentframe()))
    version_file = os.path.join(file_base, "flask_administration/VERSION")
    if not os.path.exists(version_file):
        with open(version_file, 'w') as f:
            f.write('1')

    version = ''
    with open(version_file, 'r') as f:
        version = int(f.read()) + 1
    with open(version_file, 'w+') as f:
        f.truncate(0)
        f.write(str(version))

    
#version_increment()

setup(
    author='Bradford Toney',
    name='Flask-Administration',
    scripts=['scripts/flask_admin_manage'],
    version=__version__(),
    packages=['flask_administration'],
    include_package_data=True,
    zip_safe=False,
    platforms='any',
    classifiers = [
        'License :: OSI Approved :: GNU General Public License (GPL)',
        'Development Status :: 3 - Alpha',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Programming Language :: Python'],

)