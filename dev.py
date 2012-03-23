from flask import Flask
from flask_administration import metrics, main
from flask.ext.mustache import FlaskMustache

def create_app():
    app = Flask(__name__)
    app.register_blueprint(metrics.event_blueprint)
    app.register_blueprint(main.admin, url_prefix='/admin')
    app = FlaskMustache.attach(app)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)