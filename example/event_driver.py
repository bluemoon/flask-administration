from flask import Flask
from flask.ext.administration import event_driver

def create_app():
    app = Flask(__name__)
    app.register_blueprint(event_driver.event_blueprint)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)