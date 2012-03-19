
class dashboard(object):
    """ Base class for the dashboard. 
    This should support adding in a manner like this

    >>> b = bars()
    >>> d = dashboard()
    >>> d += b
    """
    
    def __init__(self, **kwargs):
        self.clusters = kwargs.get('clusters', [])

    def __iadd__(self, other):
        if isinstance(other, cluster):
            self.clusters.append(other)
        return self


class gauge_mixin(object):
    """ Base mixin for gauge """
    pass


class gauge(gauge_mixin):
    """ Base class for the gauge """
    def __init__(self, **kwargs):
        self.mongo = kwargs.get('mongo_cls')


class cluster(object):
    def __init__(self, **kwargs):
        """ cluster initialization

        :param gauges: A list of gauges or a single element
        :param **kwargs: keyworded arguments

        """
        self.gauges = kwargs.get('gauges', [])
        #: Autoupdate defaults to 1000ms and this value should be in ms
        self.autoupdate = kwargs.get('autoupdate', 1000)


    @property
    def data(self):
        """ Some documentation text.


        >>> print 1
        1

        Some more documentation text. """
        pass


class bars(cluster):
    def __init__(self, **kwargs):
        """ Bar graph cluster

        :param **kwargs: keyworded arguments
        """
        pass
        

class top_list(cluster):
    def __init__(self):
        pass

    @property
    def data(self):
        pass



def dashboard_test():
    """ Build from classes """
    dash = dashboard()
    dash += bars()

if __name__ == "__main__":
    import doctest
    doctest.testmod()