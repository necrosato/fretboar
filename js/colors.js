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
    static copy( other )
    {
        return new Color( other.fg, other.bg );
    }
    constructor(fg=default_fg, bg=default_bg) {
        this.fg = fg
        this.bg = bg
    }
    toString() {
        return fg_colors[this.fg] + bg_colors[this.bg]
    }
}

color_presets = {
  'default': {
      0: new Color('', ''),
      1: new Color(default_note_fg, default_note_bg),
      2: new Color(default_note_fg, default_note_bg),
      3: new Color(default_note_fg, default_note_bg),
      4: new Color(default_note_fg, default_note_bg),
      5: new Color(default_note_fg, default_note_bg),
      6: new Color(default_note_fg, default_note_bg),
      7: new Color(default_note_fg, default_note_bg),
      8: new Color(default_note_fg, default_note_bg),
      9: new Color(default_note_fg, default_note_bg),
     10: new Color(default_note_fg, default_note_bg),
     11: new Color(default_note_fg, default_note_bg),
     12: new Color(default_note_fg, default_note_bg)
  },
  'empty': {
      0: new Color('', ''),
      1: new Color('', ''),
      2: new Color('', ''),
      3: new Color('', ''),
      4: new Color('', ''),
      5: new Color('', ''),
      6: new Color('', ''),
      7: new Color('', ''),
      8: new Color('', ''),
      9: new Color('', ''),
     10: new Color('', ''),
     11: new Color('', ''),
     12: new Color('', '')
  },
  'unique_bg': {
      0: new Color('', ''),
      1: new Color(default_note_fg, 'red'),
      2: new Color(default_note_fg, 'yellow'),
      3: new Color(default_note_fg, 'white'),
      4: new Color(default_note_fg, 'cyan'),
      5: new Color(default_note_fg, 'light-grey'),
      6: new Color(default_note_fg, 'green'),
      7: new Color(default_note_fg, 'grey'),
      8: new Color(default_note_fg, default_note_bg),
      9: new Color(default_note_fg, default_note_bg),
     10: new Color(default_note_fg, default_note_bg),
     11: new Color(default_note_fg, default_note_bg),
     12: new Color(default_note_fg, default_note_bg)
  }
}
