from flask import Flask
from flask.ext import adminitizr

def create_app(database_uri='sqlite://'):
    app = Flask(__name__)
    admin_blueprint = adminitizr.create_adminitizr_blueprint()
    app.register_blueprint(admin_blueprint, url_prefix='/admin')

    @app.route('/')
    def go_to_admin():
        return redirect('/admin')
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)