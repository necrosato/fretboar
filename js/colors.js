fg_colors = {
        'black'       : '\u001b[30m',
        'red'         : '\u001b[31m',
        'green'       : '\u001b[32m',
        'yellow'      : '\u001b[33m',
        'blue'        : '\u001b[34m',
        'magenta'     : '\u001b[35m',
        'cyan'        : '\u001b[36m',
        'white'       : '\u001b[97m',
        'light-grey'  : '\u001b[37m',
        'grey'        : '\u001b[90m',
        ''            : ''
        }
bg_colors = {
        'black'       : '\u001b[40m',
        'red'         : '\u001b[41m',
        'green'       : '\u001b[42m',
        'yellow'      : '\u001b[43m',
        'blue'        : '\u001b[44m',
        'magenta'     : '\u001b[45m',
        'cyan'        : '\u001b[46m',
        'white'       : '\u001b[107m',
        'light-grey'  : '\u001b[47m',
        'grey'        : '\u001b[100m',
        ''            : ''
        }

reset_code = '\u001b[0m'
bold_code = '\u001b[1m'
overline_code = '\u001b[53m'
no_overline_code = '\u001b[55m'

default_fg = 'white'
default_bg = 'black'
default_note_fg = 'black'
default_note_bg = 'light-grey'

class Color {
    constructor(fg=default_fg, bg=default_bg) {
        this.fg = fg
        this.bg = bg
    }
    toString() {
        return fg_colors[this.fg] + bg_colors[this.bg]
    }
}
