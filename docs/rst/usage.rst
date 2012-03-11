Usage
======

Basic Usage
------------

A basic example with event driver would look like this::

	from flask import Flask
	from flask.ext.administration import event_driver, index

	def create_app():
		app = Flask(__name__)
		app.register_blueprint(event_driver.event_blueprint)
		app.register_blueprint(index.admin, url_prefix='/admin')
	    return app

	if __name__ == '__main__':
		app = create_app()
		app.run(debug=True)