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
    name='Flask-Administration',
    version=__version__(),
    packages=['flask_administration'],
    include_package_data=True,
    zip_safe=False,
    platforms='any',
    install_requires=[
        'Flask>=0.7',
        'wtforms>=0.6.3',
    ],
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ]
)