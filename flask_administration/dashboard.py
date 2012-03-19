class size_mixin(object):
    def __init__(self, **kwargs):
        """ Size mixin with all the relevant functions """
        self.columns = kwargs.get('columns', 10)
        self.rows = kwargs.get('rows', 10)
        self.width = 0
        self.height = 0

    def get_size(self):
        """ return a tuple of the width and height """
        return self.width, self.height

    def set_size(self, size):
        """ set the size with a tuple of width and height in that order """
        self.width, self.height = size

    #: Returns the current size in a tuple, or sets the size
    size = property(get_size, set_size)
    
    @property
    def cell_width_px(self):
        """ return the width of a single cell in pixels """
        pass

    @property
    def cell_height_px(self):
        """ return the height of a single cell in pixels """
        pass

    @property
    def cell_width_percent(self):
        """ return the width of a single cell in pixels """
        pass
    
    @property
    def cell_height_percent(self):
        """ return the height of a single cell in pixels """
        pass

    @property
    def cell_px(self):
        """ return the size of a single cell as a tuple using the previous 
        decorators """
        return self.cell_width_px, self.cell_height_px



class dashboard(size_mixin):
    """ Base class for the dashboard. We can start off by creating an instance 
    of the dashboard and then adding items to the dashboard like in the example 
    below.

    **Class based usage**

    >>> dash = dashboard()
    >>> dash += bars()
    

    """
    
    def __init__(self, **kwargs):
        """ :arguments: clusters

        """

        self.clusters = kwargs.get('clusters', [])
        
        self.title = kwargs.get('title', 'Dashboard')

    def __iadd__(self, other):
        """ """
        if isinstance(other, cluster):
            self.clusters.append(other)
        return self


    @property
    def id(self):
        return '%s-dashboard' % self.title

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