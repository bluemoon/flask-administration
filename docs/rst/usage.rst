Usage
======

Basic Usage
------------
The simplest example is adding it only as a blueprint::

    from flask.ext.administration import index
    app.register_blueprint(index.admin)

A basic example with event driver would look like this::

    from flask import Flask
    from flask.ext.administration.blueprints import admin, events

    def create_app():
        app = Flask(__name__)
        app.register_blueprint(event_driver.event_blueprint)
        app.register_blueprint(index.admin, url_prefix='/admin')
        return app

    if __name__ == '__main__':
        app = create_app()
        app.run(debug=True)


With login protection
-----------------------



Generating an event key
------------------------

Go to the metrics panel


