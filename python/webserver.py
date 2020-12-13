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
