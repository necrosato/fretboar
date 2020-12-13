import logging
import sys

def GetLogger(name='Fretboard'):
    '''
    Create a new logging object for home alert
    Can give name for logger
    '''
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(name)s : %(asctime)s : %(levelname)s : %(message)s')
    stdout_handler.setFormatter(formatter)
    logger.addHandler(stdout_handler)
    return logger

from flask import Flask, Response, request, render_template

def create_hover_tool(key):
    return HoverTool(tooltips=[('date', '@date_str'), (key, '@' + key)])


def create_bar_chart(data, title, x_name, y_name, hover_tool=None,
                     width=1200, height=300, days=None):
    '''Creates a bar chart plot with the exact styling for the centcom
       dashboard. Pass in data as a dictionary, desired plot title,
       name of x axis, y axis and the hover tool HTML.
    '''
    source = ColumnDataSource(data)
    date_end = max(data[x_name])
    if days is None:
        date_start = min(data[x_name])
    else:
        date_start = date_end - datetime.timedelta(days=days)
    xdr = Range1d(start=date_start, end=date_end)
    ydr = Range1d(start=min(data[y_name]),end=max(data[y_name]))

    tools = []
    if hover_tool:
        tools = [hover_tool,]

    plot = figure(title=title, x_range=xdr, y_range=ydr, plot_width=width,
                  plot_height=height, min_border=0, toolbar_location='above', tools=tools,
                  sizing_mode='scale_width', outline_line_color='#666666', x_axis_type='datetime')

    line_glyph = Line(x=x_name, y=y_name, line_width=2, line_color='#e12127')
    circle_glyph = Circle(x=x_name, y=y_name, size=3, line_width=2, line_color='#e12127', fill_color='#e12127')
    plot.add_glyph(source, line_glyph)
    plot.add_glyph(source, circle_glyph)

    xaxis = LinearAxis()
    yaxis = LinearAxis()

    plot.add_layout(Grid(dimension=0, ticker=xaxis.ticker))
    plot.add_layout(Grid(dimension=1, ticker=yaxis.ticker))
    plot.toolbar.logo = None
    plot.min_border_top = 0
    plot.xgrid.grid_line_color = None
    plot.ygrid.grid_line_color = '#999999'
    plot.yaxis.axis_label = y_name
    plot.ygrid.grid_line_alpha = 0.1
    plot.xaxis.axis_label = x_name 
    plot.xaxis.major_label_orientation = 1
    return plot


class EndpointAction:
    '''
    action is expected to return a valid response
    '''
    def __init__(self, action):
        self.action = action


    def __call__(self, *args):
        return self.action()

class LoggingMiddleware(object):
    def __init__(self, app):
        self._app = app

    def __call__(self, environ, resp):
        errorlog = environ['wsgi.errors']
        pprint.pprint(('REQUEST', environ), stream=errorlog)

        def log_response(status, headers, *args):
            pprint.pprint(('RESPONSE', status, headers), stream=errorlog)
            return resp(status, headers, *args)

        return self._app(environ, log_response)

class FretboardWebServer:
    '''
    Class holding a flask app and smtp server
    '''
    def __init__(self, http_logging = False, s3_bucket = None):
        '''
        '''
        self.logger = GetLogger()
        self.logger.info('Creating Web Server')
        self.app = Flask('Fretboard Server')
        if http_logging:
            self.app.wsgi_app = LoggingMiddleware(self.app.wsgi_app)

        # Add endpoints
        self.add_endpoint(endpoint='/',
                endpoint_name='index', handler=self.index)

    def index(self):
        '''
        Index page
        '''
        return ''

    def run(self, port):
        '''
        Run the flask app
        '''
        self.app.run(debug=False, host='0.0.0.0', port=port)


    def add_endpoint(self, endpoint=None, endpoint_name=None, handler=None, **options):
        '''
        Register an endpoint function to the flask app
        '''
        self.app.add_url_rule(endpoint, endpoint_name, EndpointAction(handler), **options)

def main():
    server = FretboardWebServer()
    server.run(5050)


if __name__ == '__main__':
    main()
