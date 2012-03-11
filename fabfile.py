from fabric.api import *

def docs():
	local('cd docs && make html')