
class dashboard(object):
	""" Base class for the dashboard """
	pass

class gauge_mixin(object):
	""" Base mixin for gauge """
	pass

class gauge(gauge_mixin):
	""" Base class for the gauge """
	pass


class cluster(object):
	def __init__(self):
		pass

class bars(cluster):
	def __init__(self, autoupdate=60):
		pass

class top_list(cluster):
	def __init__(self):
		pass