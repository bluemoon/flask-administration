SHELL := /bin/bash

init:
	python setup.py develop
test:
	nosetests ./tests/*
ci: init
	nosetests tests/test_event_driver.py --with-xunit --xunit-file=junit-report.xml
simpleci:
	nosetests tests/test_event_driver.py --with-xunit --xunit-file=junit-report.xml
site:
	cd docs; make dirhtml
docs: site