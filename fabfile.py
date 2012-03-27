from fabric.api import *

def docs():
	local('cd docs && make html')

def assets():
	with cd('flask_administration/static/js'):
		local()