#!/usr/bin/python
from flask import escape
from juggernaut import Juggernaut
from flask import Flask
from flask.ext.administration import event_driver, index

import gevent
from gevent import monkey
from gevent.wsgi import WSGIServer
from werkzeug.contrib.fixers import ProxyFix
    
import time
    
monkey.patch_all()
jug = Juggernaut()


def start_webserver():
    app = Flask(__name__)
    app.register_blueprint(event_driver.event_blueprint)
    app.register_blueprint(index.admin, url_prefix='/admin')
    app.wsgi_app = ProxyFix(app.wsgi_app)
    http_server = WSGIServer(('127.0.0.1', 5003), app)
    http_server.serve_forever()

def start_file_monitor(follow_file, idx):
    follow_file = open(follow_file, 'r')
    follow_file.seek(0, 2)
    while True:
        line = follow_file.readline()
        if not line:
            time.sleep(0.1)
            continue
        line = escape(line)
        jug.publish('logger-{}'.format(idx), line)


if __name__ == '__main__':
    file_monitors = ['/var/log/kernel.log', '/var/log/system.log']
    jobs = []
    try:
        jobs.append(gevent.spawn(start_webserver))
        for idx, monitor in enumerate(file_monitors):
            jobs.append(gevent.spawn(start_file_monitor, monitor, idx))
        gevent.joinall(jobs)
    except KeyboardInterrupt:
        raise Exception

    #http_server.serve_forever()