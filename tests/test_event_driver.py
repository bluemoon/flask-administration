import unittest
from flask import Flask
from flask.ext.administration import event_driver

class EventDriverTestCase(unittest.TestCase):
    def setUp(self):
        app = Flask(__name__)
        app.register_blueprint(event_driver.event_driver)
        self.app = app.test_client()

    def test_empty_db(self):
        rv = self.app.get('/e')
        print rv