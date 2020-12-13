
colors = {
        'black'  : '\u001b[30m',
        'red'    : '\u001b[31m',
        'green'  : '\u001b[32m',
        'yellow' : '\u001b[33m',
        'blue'   : '\u001b[34m',
        'magenta': '\u001b[35m',
        'cyan'   : '\u001b[36m',
        'white'  : '\u001b[97m',
        'light-grey'  : '\u001b[37m',
        'grey'   : '\u001b[90m',
        ''       : ''
        }
bg_colors = {
        'black'  : '\u001b[40m',
        'red'    : '\u001b[41m',
        'green'  : '\u001b[42m',
        'yellow' : '\u001b[43m',
        'blue'   : '\u001b[44m',
        'magenta': '\u001b[45m',
        'cyan'   : '\u001b[46m',
        'white'  : '\u001b[107m',
        'light-grey'  : '\u001b[47m',
        'grey'   : '\u001b[100m',
        ''       : ''
        }

default_fg = 'white'
default_bg = 'black'
reset_code = '\u001b[0m'

class Color:
    def __init__(self, fg=default_fg, bg=default_bg):
        self.fg = fg
        self.bg = bg
    def __str__(self):
        return colors[self.fg] + bg_colors[self.bg]
