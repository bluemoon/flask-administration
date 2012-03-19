
class dashboard(object):
	""" Base class for the dashboard """
	
	def __init__(self, **kwargs):
		self.clusters = kwargs.get('clusters', [])


class gauge_mixin(object):
	""" Base mixin for gauge """
	pass

class gauge(gauge_mixin):
	""" Base class for the gauge """
	pass


class cluster(object):
	""" A set of gauges in a cluster """
	def __init__(self):
		pass

	@property
	def data(self):
		pass

class bars(cluster):
	def __init__(self, gauges, **kwargs):
		""" Bar graph cluster
		:param gauges: A list of gauges or a single element
		:param **kwargs: keyworded arguments
		"""
		self.gauges = gauges
		#: Autoupdate defaults to 1000ms and this value should be in ms
		self.autoupdate = kwargs.get('autoupdate', 1000)

class top_list(cluster):
	def __init__(self):
		pass

	@property
	def data(self):
		pass
