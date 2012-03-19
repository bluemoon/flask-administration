from math import floor, ceil
from metrics import Event
from pandas import *

class Menu(object):
    pass

class SizeMixin(object):
    """ Size mixin with all the relevant functions 

    **Extend the class**
        
    >>> class test(SizeMixin):
    >>>     pass

    **Create an instance**

    >>> t = test(columns=15, rows=10)
    >>> t.size = (100, 100)ß

    """
    def __init__(self, **kwargs):
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



class Dashboard(SizeMixin):
    """ Base class for the dashboard. We can start off by creating an instance 
    of the dashboard and then adding items to the dashboard like in the example 
    below.

    **Class based usage**

    >>> dash = Dashboard()
    >>> dash += Bars()
    

    """
    
    def __init__(self, **kwargs):
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


class GaugeMixin(object):
    """ Base mixin for gauge """
    pass


class Gauge(GaugeMixin):
    """ Base class for the gauge """
    def __init__(self, **kwargs):
        self.event_name = kwargs.get('event_name')
        self.tick = float(kwargs.get('tick', 3600))
        self.has_tick = kwargs.get('has_tick', False)
        self.aggregate = kwargs.get('aggregate', False)

    def tick_at(self, tick):
        if self.aggregate:
            return floor(tick / self.tick) * tick
        else:
            return len(Event.objects(name=self.event_name))

    def value_at(self, tick):
        return Event.objects(name=self.event)

    def values_in(self, begin, end):
        return ceil((end - begin)/self.tick)+1


class Cluster(object):
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
        """ """
        pass


class Bars(cluster):
    pass

        

class top_list(cluster):
    def __init__(self):
        pass

    @property
    def data(self):
        pass



def dashboard_test():
    """ Build from classes """
    dash = Dashboard()
    dash += Bars()

if __name__ == "__main__":
    import doctest
    doctest.testmod()