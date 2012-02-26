from flask import Flask

def create_app(database_uri='sqlite://'):
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SECRET_KEY'] = 'not secure'
    #db.init_app(app)
    #datastore = SQLAlchemyDatastore(
    #    (Course, Student, Teacher), db.session)
    admin_blueprint = admin.create_admin_blueprint(datastore)
    app.register_blueprint(admin_blueprint, url_prefix='/admin')
    #db.create_all(app=app)

    @app.route('/')
    def go_to_admin():
        return redirect('/admin')
    return app
