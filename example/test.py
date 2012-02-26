from flask import Flask
from flask.ext import adminitizer

def create_app(database_uri='sqlite://'):
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SECRET_KEY'] = 'not secure'
    admin_blueprint = adminitizer.create_adminitizer_blueprint()
    app.register_blueprint(admin_blueprint, url_prefix='/admin')

    @app.route('/')
    def go_to_admin():
        return redirect('/admin')
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)