from flask import Flask
from flask.ext.administration import metrics, main

def create_app():
    app = Flask(__name__)
    app.register_blueprint(metrics.event_blueprint)
    app.register_blueprint(main.admin, url_prefix='/admin')
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)