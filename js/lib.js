class Fretboard {
    constructor(roots, fretNum, inlayPattern=null) {
        var strings = []
        for (i in roots) {
            strings.push(new GuitarString(Note.fromStr(roots[i]), fretNum))
        }
        this.strings = strings
        this.roots = roots
        this.fretNum = fretNum
        this.notesInScale = 0
        this.setInlayPattern(inlayPattern)
    }

    setChromatic(root, chromatic) {
        this.notesInScale = chromatic.notesInScale()
        for (i in this.strings) {
            var offset = root.offsetUp(this.strings[i].root)
            var rot = chromatic.rotate(offset)
            this.strings[i].setChromatic(rot)
        }
    }

    setMajor(root, major) {
        this.setChromatic(root, major.chromatic())
    }

    fullStr(start, end, printNoteLetters, printNoteNumbers, posIndexOnly) {
        var data = []
        for (i in this.strings) {
            data.push(this.strings[i].fullStr(start, end, printNoteLetters, printNoteNumbers, posIndexOnly))
        }
        return this.wrapData(data, start, end)
    }

    wrapData(data, start, end) {
        var legend, lines, slines, spaces
        [legend, lines, slines, spaces] = this.border(start, end)
        data = data.reverse().join('\n' + slines + '\n')
        return legend + '\n' + spaces + '\n' + data + '\n' + lines + '\n' + legend + reset_code +'\n'
    }


    border(start, end) {
        var frets = []
        for (var i = start; i<end; i++) { frets.push(padString('<', ' ', 10, i.toString())) }
        var legend = `Fret:      ` + frets.join('')
        var lines = '_'.repeat(legend.length)
        var slines = '-'.repeat(legend.length)
        var spaces = ' '.repeat(legend.length)
        return [ reset_code + bold_code + legend + reset_code,
                new Color() + lines + reset_code,
                new Color() + slines + reset_code,
                new Color() + overline_code + spaces + reset_code]
    }

    scaleSubset(indices, newColors) {
        var f = new Fretboard(this.roots, this.fretNum, this.inlayPattern)
        for (var i in f.strings) {
            f.strings[i] = this.strings[i].scaleSubset(indices, newColors)
        }
        return f
    }

    setColors(colors) {
        this.colors = colors
        for (var i in this.strings) {
            this.strings[i].setColorsByScaleIndex(colors)
        }
    }

    setInlayPattern(pattern) {
        this.inlayPattern = pattern
        if (pattern != null) {
            for (var string in pattern.allInlays) {
                if (string < this.strings.length) {
                    var i = string == -1 ? this.strings.length - 1 : string
                    this.strings[i].setInlays(pattern.allInlays[string])
                }
            }
        }
    }

    setMajorFormula(formula, root) {
        var majorNotes = []
        formula.forEach(function(s){ majorNotes.push(MajorNote.fromStr(s)) })
        var major_scale = new MajorScale(majorNotes)
        this.setMajor(Note.fromStr(root), major_scale)
    }

    setChromaticFormula(scale, root) {
    //  scale should be 12 len binary list // 
        var i = 1
        var chromatic_notes = []
        scale.forEach(function(c) {
            if (c == 0) {
                chromatic_notes.push(c)
            } else {
                chromatic_notes.push(i)
                i+=1
            }
        })
        this.setChromatic(Note.fromStr(root), new ChromaticScale(chromatic_notes))
    }

    setFromScaleName(scale, mode, root) {
        this.setChromatic(Note.fromStr(root), scales[scale][mode].chromatic)
    }

    intervalSubsets(subsetBase, intervals, recolor) {
        var distances = []
        for (var i = 1; i < subsetBase.length; i++) {
            distances.push(subsetBase[i] - subsetBase[i-1])
        }
        var offset = subsetBase[0] - 1
        var subsets = []
        var f = this
        intervals.forEach(function(i) {
            var subset = [i+offset]
            distances.forEach(function(d) {
                if ((subset[subset.length-1] + d) == f.notesInScale) {
                    subset.push(f.notesInScale)
                } else {
                    subset.push((subset[subset.length-1] + d) % f.notesInScale)
                }
            })
            var intervalColors = {}
            for (var j = 0; j < subset.length; j++) {
                if (subsetBase[j] in f.colors) {
                    if (recolor) {
                        intervalColors[subset[j]] = f.colors[subsetBase[j]]
                    } else {
                        intervalColors[subset[j]] = f.colors[subset[j]]
                    }
                }
            }
            subsets.push([subset, f.scaleSubset(subset, intervalColors)])
        })
        return subsets
    }

}

function getFretboardsWithName(args) {
    var fretboards = []
    end = args.end == null ? args.frets : args.end
    fretboard = new Fretboard(args.tuning, args.frets, splitTopBottomDots(args.inlay.color, args.inlay.pattern))

    var s = ''
    if (args.scale.major_formula != null) {
        fretboard.setMajorFormula(args.scale.major_formula, args.scale.root)
        fretboard.setColors(args.colors)
        s = `${args.scale.major_formula}`
        fretboards.push([`Major Relative Scale Formula ${args.scale.major_formula}`, fretboard])
    } else if (args.scale.chromatic_formula != null) {
        fretboard.setChromaticFormula(args.scale.chromatic_formula, args.scale.root)
        fretboard.setColors(args.colors)
        s = `${args.scale.chromatic_formula}`
        fretboards.push([`Chromatic Binary Scale Formula ${args.scale.chromatic_formula}`, fretboard])
    } else if (args.scale.name != null) {
        fretboard.setFromScaleName(args.scale.name[0], args.scale.name[1], args.scale.root, args.colors)
        fretboard.setColors(args.colors)
        s = `${args.scale.name}`
        fretboards.push([`Mode Name ${args.scale.name}`, fretboard])
    }
    if ( !args.scale.print_full_scale )
    {
        fretboards = []
    }
    if (args.scale.subset && args.scale.intervals) {
        var subsets = fretboard.intervalSubsets(args.scale.subset, args.scale.intervals, args.scale.recolor_intervals)
        for (i in subsets) {
            var intervals = subsets[i][0]
            var subset = subsets[i][1]
            fretboards.push([`${args.scale.root} ${s} Interval Subset (${intervals})`, subset])
        }
    }
    return fretboards
}
function wkeycol() { return new Color('black', 'white') }
function bkeycol() { return new Color('white', 'black') }
var wstarts = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0]
function numWhites(n) {
    var nwhites = 0
    for (var i = 0; i < n; i++)
    {
        if (wstarts[i % 12])
        {
            nwhites++
        }
    }
    return nwhites
}
function numBlacks(n) {
    return n - numWhites(n)
}

class Keyboard {
    constructor(keyNum) {
        this.keyNum = keyNum
        this.wroot = Note.fromStr('A')
        this.broot = Note.fromStr('A#')
        this.whites = new WhiteKeys(this.wroot, numWhites(keyNum))
        this.whites.setColorsByPosition({1: wkeycol()})
        this.blacks = new BlackKeys(this.broot, numBlacks(keyNum))
        this.blacks.setColorsByPosition({1: bkeycol()})
        this.notesInScale = 0
        this.planes = [this.whites, this.blacks]
    }

    fullStr(start, end, printNoteLetters, printNoteNumbers, posIndexOnly) {
        var wstart = numWhites(start)
        var bstart = numBlacks(start)
        var wend = numWhites(end)
        var bend = numBlacks(end)
        var data = []
        var bpre = []
        var wpre = ''
        var i = start % 12
        if (wstarts[i]) {
            while (wstarts[i]) {
                bpre.push(wkeycol() + '     ')
                i = (i + 1) % 12
            }
            if (bpre.length == 2) {
                bpre[0] += '    '
            }
        } else {
            wpre += reset_code + '     '
        }
        data.push(bpre.join('|') + this.blacks.fullStr(bstart, bend, printNoteLetters, printNoteNumbers, posIndexOnly));
        data.push(wpre + this.whites.fullStr(wstart, wend, printNoteLetters, printNoteNumbers, posIndexOnly));
        return data.join('\n')
    }

    setChromatic(root, chromatic) {
        this.notesInScale = chromatic.notesInScale()
        for (i in this.planes) {
            var offset = root.offsetUp(this.planes[i].root)
            var rot = chromatic.rotate(offset)
            this.planes[i].setChromatic(rot)
        }
    }

    setMajor(root, major) {
        this.setChromatic(root, major.chromatic())
    }

    scaleSubset(indices, wcolors, bcolors) {
        var k = new Keyboard(this.keyNum)
        k.whites = this.whites.scaleSubset(indices, wcolors)
        k.blacks = this.blacks.scaleSubset(indices, bcolors)
        return k
    }

    setColors(wcolors, bcolors) {
        this.wcolors = wcolors
        this.bcolors = bcolors
        this.whites.setColorsByScaleIndex(wcolors)
        this.blacks.setColorsByScaleIndex(bcolors)
    }


  setMajorScale(formula, root) {
      var majorNotes = []
      formula.forEach(function(s){ majorNotes.push(MajorNote.fromStr(s)) })
      var major_scale = new MajorScale(majorNotes)
      this.setMajor(Note.fromStr(root), major_scale)
  }

  setChromaticScale(scale, root) {
      //  scale should be 12 len binary list // 
      var i = 1
      var chromatic_notes = []
      scale.forEach(function(c) {
          if (c == 0) {
              chromatic_notes.push(c)
          } else {
              chromatic_notes.push(i)
              i+=1
          }
      })
      this.setChromatic(Note.fromStr(root), new ChromaticScale(chromatic_notes))
  }

  setFromScaleName(scale, mode, root) {
      this.setChromatic(Note.fromStr(root), scales[scale][mode].chromatic)
  }

  intervalSubsets(subsetBase, intervals, recolor) {
      var distances = []
      for (var i = 1; i < subsetBase.length; i++) {
          distances.push(subsetBase[i] - subsetBase[i-1])
      }
      var offset = subsetBase[0] - 1
      var subsets = []
      var k = this
      intervals.forEach(function(i) {
          var subset = [i+offset]
          distances.forEach(function(d) {
              if ((subset[subset.length-1] + d) == k.notesInScale) {
                  subset.push(k.notesInScale)
              } else {
                  subset.push((subset[subset.length-1] + d) % k.notesInScale)
              }
          })
          var wintervalColors = {}
          var bintervalColors = {}
          for (var j = 0; j < subset.length; j++) {
              var s = subset[j] 
              var sb = subsetBase[j] 
              if (recolor) {
                  wintervalColors[s] = sb in k.wcolors ? k.wcolors[sb] : wkeycol()
              } else {
                  wintervalColors[s] = s in k.wcolors ? k.wcolors[s] : wkeycol()
              }
              if (recolor) {
                  bintervalColors[s] = sb in k.bcolors ? k.bcolors[sb] : bkeycol()
              } else {
                  bintervalColors[s] = s in k.bcolors ? k.bcolors[s] : bkeycol()
              }
          }
          subsets.push([subset, k.scaleSubset(subset, wintervalColors, bintervalColors)])
      })
      return subsets
  }

}

function getKeyboardsWithName(args) {
    var keyboards = []
    var wcolors = {}
    var bcolors = {}
    for (i in args.colors) {
        if (args.colors[i].fb != '') {
          if (args.colors[i].bg == '')
          {
            wcolors[i] = new Color(args.colors[i].fg, 'white')
            bcolors[i] = new Color(args.colors[i].fg, 'black')
          }
          else
          {
            wcolors[i] = args.colors[i] 
            bcolors[i] = args.colors[i] 
          }
        }
        else if (args.colors[i].bg != '')
        {
            wcolors[i] = new Color('black', args.colors[i].bg)
            bcolors[i] = new Color('white', args.colors[i].bg)
        }
    }
    end = args.end == null ? args.keys : args.end
    keyboard = new Keyboard(args.keys)

    if (args.scale.major_formula != null) {
        keyboard.setMajorScale(args.scale.major_formula, args.scale.root)
        keyboard.setColors(wcolors, bcolors)
        keyboards.push([`Major Relative Scale Formula ${args.scale.major_formula}`, keyboard])
    } else if (args.scale.chromatic_formula != null) {
        keyboard.setChromaticScale(args.scale.chromatic_formula, args.scale.root)
        keyboard.setColors(wcolors, bcolors)
        keyboards.push([`Chromatic Binary Scale Formula ${args.scale.chromatic_formula}`, keyboard])
    } else if (args.scale.name != null) {
        keyboard.setFromScaleName(args.scale.name[0], args.scale.name[1], args.scale.root)
        keyboard.setColors(wcolors, bcolors)
        keyboards.push([`Mode Name ${args.scale.name}`, keyboard])
    }
    if ( !args.scale.print_full_scale )
    {
        keyboards = []
    }
    if (args.scale.subset && args.scale.intervals) {
        var subsets = keyboard.intervalSubsets(args.scale.subset, args.scale.intervals, args.scale.recolor_intervals)
        for (i in subsets) {
            var intervals = subsets[i][0]
            var subset = subsets[i][1]
            keyboards.push([`Interval Subset (${intervals})`, subset])
        }
    }
    return keyboards
}
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
class Inlay {

    constructor(color, design=' ') {
        this.color = color
        this.design = design
    }

    toString() {
        return this.color.toString() + this.design
    }
}

class Inlays {
    constructor(notes) {
        //  notes is map of fret num to Inlay // 
        this.notes = notes
    }

    setColor(color) {
        //  set same color for all inlays // 
        for (var i in this.notes) {
            this.notes[i].color = color
        }
    }

    setChar(design) {
        //  set same design for all inlays // 
        for (var i in this.notes) {
            this.notes[i].design = design
        }
    }
}

standardInlayNotes = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
topNotes = [12, 15, 17, 19, 21, 24]
bottomNotes = [3, 5, 7, 9, 12]
doubleDotNotes = [12, 24]

function inlaysFromNotes(notes, inlay) {
    inlays = {}
    for (f in notes) {
      inlays[f] = inlay
    }
    return new Inlays(inlays)
}

class InlayPattern {
    //  descrbes the inlays of an entire fretboard // 
    constructor(allInlays) {
        this.allInlays = allInlays 
    }
}

function dotInlays(color, fretNums, design=null) {
    var inlays = {}
    fretNums.forEach(function(i) {
        if (design==null) {
            inlays[i] = new Inlay(color, doubleDotNotes.includes(i) ? ':' : '.')
        } else {
            inlays[i] = new Inlay(color, design)
        }
    })
    return new Inlays(inlays)
}

function dotsOnFirstString(color, design=null) {
    firstStringInlays = dotInlays(color, standardInlayNotes, design)
    return new InlayPattern({'0': firstStringInlays})
}

function dotsOnLastString(color, design=null) {
    lastStringInlays = dotInlays(color, standardInlayNotes, design)
    return new InlayPattern({'-1': lastStringInlays})
}

function splitTopBottomDots(color, design=null) {
    firstStringInlays = dotInlays(color, bottomNotes, design)
    lastStringInlays = dotInlays(color, topNotes, design)
    return new InlayPattern({'0': firstStringInlays, '-1': lastStringInlays})
}

function padString(loc='^', pad=' ', width, s) {
    var padCount = width - s.length
    if (padCount < 1) {
        return s
    }
    var padL = 0
    var padR = 0
    if (loc == '^') {
        padL = Math.floor(padCount / 2)    
        padR = Math.ceil(padCount / 2)    
    } else if (loc == '<') {
        padR = padCount
    } else if (loc == '>') {
        padL = padCount
    }
    return ' '.repeat(padL) + s + ' '.repeat(padR)
}

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}
letters = {
            'A': 1,
            'B': 3,
            'C': 4,
            'D': 6,
            'E': 8,
            'F': 9,
            'G': 11,
            }

letterVals = {
            1: 'A',
            3: 'B',
            4: 'C',
            6: 'D',
            8: 'E',
            9: 'F',
            11: 'G',
            }

accidentals = {
            '#': 1,
            'b': -1,
            '': 0,
            ' ': 0,
            }


class Note {
    //     A note as a combination of a letter and accidental (Eb, A#, F, etc)   // 
    constructor(letter, accidental=' ') {
        this.letter = letter
        this.accidental = accidental
        this.val = letters[letter] + accidentals[accidental]
    }

    offset(other) {
        // returns a positive offsetUp if other is above else returns a negative offset down // 
        if (this.val <= other.val) {
            return this.offsetUp(other)
        }
        return this.offsetDown(other) * -1
    }

    offsetUp(other) {
        // return the number of semitones to move from this note up to other // 
        if (this.val > other.val) {
            return 12 - other.offsetUp(this)
        }
        return (other.val - this.val) % 12
    }

    offsetDown(other) {
        // return the number of semitones to move from this note down to other // 
        if (this.val < other.val) {
            return 12 - other.offsetDown(this)
        }
        return (this.val - other.val) % 12
    }

    toString() {
        return this.letter + this.accidental
    }

    static fromStr(s) {
        if (s.length == 1) {
            return new this(s)
        }
        if (s[0] in letters) {
            return  new this(s[0], s[1])
        }
        return new this(s[1], s[0])
    }

    noteFromOffset(offset) {
        var val = (this.val + offset) % 12
        if (val in letterVals) {
            return new Note(letterVals[val])
        }
        val = (val + 1) % 12
        return new Note(letterVals[val], 'b')
    }

    semitoneUp() {
        if ((this.val + 1) in letterVals) {
            return new Note(letterVals[this.val + 1])
        }
        return new Note(letterVals[this.val], '#')
    }

    semitoneDown() {
        if ((this.val - 1) in letterVals) {
            return new Note(letterVals[this.val - 1])
        }
        return new Note(letterVals[this.val], 'b')
    }
}


class ChromaticScale {
    // A representation of a scale as the 12 chromatic notes // 
    constructor(notes = []) {
        if (!notes.length) {
            this.notes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        } else {
            this.notes = notes
        }
    }

    toString() {
        return this.notes.toString()
    }

    rotate(semitones) {
        // return a rotated scale, cutting of the first n semitones and moving them to the end,
        // or moving the last n seminotes to the beginning if value is negative
        return new ChromaticScale(this.notes.slice(semitones).concat(this.notes.slice(0,semitones)))
    }

    notesInScale() {
        var notesInScale = 0
        this.notes.forEach(function(i) {
            if (i) {
                notesInScale++
            }
        })
        return notesInScale
    } 
}

numToChromatic = {
        1: 1,
        2: 3,
        3: 5,
        4: 6,
        5: 8,
        6: 10,
        7: 12
        }
accidentalToChromatic = {
        '#': 1,
        'b': -1
        }
class MajorNote {
    /**
    MajorNote represets a position relative to any diatonic Ionian I
    given by an Ionian scale note number and optional accidental to
    achieve all 12 chromatic notes
    */ 
    constructor(num, accidentals = []) {
        this.num = num
        this.accidentals = accidentals
        // the position of this note on the chromatic scale (1 indexed)
        
        var acc = []
        for (var i in accidentals) {
            acc.push(accidentalToChromatic[this.accidentals[i]])
        }
        this.chromatic = numToChromatic[num] + acc.reduce((a, b) => a + b, 0)
        this.chromaticMod = this.chromatic % 12 == 0 ? 12 : this.chromatic % 12
    }

    toString() {
        return this.num + this.accidentals.join('')
    }

    static fromStr(s) {
        var num = 0
        var acc = []
        for (var c in s) {
            if ( s[c] >= '0' && s[c] <= '9' ) {
                num = parseInt(s[c])
            } else {
                acc.push(s[c])
            }
        }
        return new this(num, acc)
    }

}

class MajorScale {
    // A representation of a scale as a list of MajorNotes // 
    constructor(notes) {
        this.notes = notes
    }

    chromatic() {
        chromatic = new ChromaticScale()
        for (i = 0; i<this.notes.length; i++) {
            chromatic.notes[this.notes[i].chromaticMod - 1] = i + 1
        }
        return chromatic
    }

    toString() {
        return this.notes.toString()
    }

}


class Mode {
    constructor(name, chromatic, num) {
        this.name = name
        this.chromatic = chromatic 
        this.num = num
    }

    toString() {
        return this.name + ': ' + this.chromatic.toString()
    }
}

scales = {}
pentatonicBase = new ChromaticScale([1, 0, 2, 0, 3, 0, 0, 4, 0, 5, 0, 0])
bluesBase = new ChromaticScale([1, 0, 2, 3, 4, 0, 0, 5, 0, 6, 0, 0])
majorBase = new ChromaticScale([1, 0, 2, 0, 3, 4, 0, 5, 0, 6, 0, 7])
harmonicMinorBase = new ChromaticScale([1, 0, 2, 3, 0, 4, 0, 5, 6, 0, 0, 7])
melodicMinorBase = new ChromaticScale([1, 0, 2, 3, 0, 4, 0, 5, 0, 6, 0, 7])
diminishedBase = new ChromaticScale([1, 0, 2, 3, 0, 4, 5, 0, 6, 7, 0, 8])
wholeToneBase = new ChromaticScale([1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0])
inFormula = ['1', 'b2', '4', '5', 'b6']
insenFormula = ['1', 'b2', '4', '5', 'b7']
iwatoFormula = ['1', 'b2', '4', 'b5', 'b7']
yoFormula = ['1', '2', '4', '5', '6']
hirajoshiFormula = ['1', '2', 'b3', '5', 'b6']
ryukyuFormula = ['1', '3', '4', '5', '7']
doubleHarmonicMinorFormula = ['1', 'b2', '3', '4', '5', 'b6', '7']

function addMode(scale, name, chromatic, num) {
    scales[scale][name] = new Mode(name, chromatic, num)
}

function addScale(scale, modes, base) {
    if (!(scale in scales)) {
        scales[scale] = {}
    }
    ni = 0
    for (i = 0; i < base.notes.length; i++) {
        if (base.notes[i] != 0) {
            chromatic = []
            var j = 1
            base.rotate(i).notes.forEach(function(k) {
                if (k == 0) {
                    chromatic.push(k)
                } else {
                    chromatic.push(j)
                    j+=1
                }
            })
            addMode(scale, modes[ni], new ChromaticScale(chromatic), ni)
            ni += 1
        }
        if (ni == modes.length) {
            return
        }
    }
}

function addScaleMajorFormula(scale, modes, majorFormula) {
    var majorNotes = []
    majorFormula.forEach(function(s){ majorNotes.push(MajorNote.fromStr(s)) })
    majorScale = new MajorScale(majorNotes)
    base = majorScale.chromatic()
    addScale(scale, modes, base)
}

function addAllModes(scale, base) {
    var modeNames = []
    for (i = 1; i <= base.notesInScale(); i++) {
        modeNames.push(i)
    }
    addScale(scale, modeNames, base)
}

function addAllModesMajorFormula(scale, formula) {
    var modeNames = []
    for (i = 1; i <= formula.length; i++) {
        modeNames.push(i)
    }
    addScaleMajorFormula(scale, modeNames, formula)
}

addScale('major',
        ['ionian (1)',
         'dorian (2)',
         'phrygian (3)',
         'lydian (4)',
         'mixolydian (5)',
         'aeolian (6)',
         'locrian (7)'
         ], majorBase)


//addAllModes('major', majorBase)
addAllModes('harmonic_minor', harmonicMinorBase)
addAllModes('melodic_minor', melodicMinorBase)
addAllModesMajorFormula('double_harmonic_minor', doubleHarmonicMinorFormula)
addAllModes('diminished', diminishedBase)
addAllModes('whole_tone', wholeToneBase)
addAllModes('pentatonic', pentatonicBase)
addAllModes('blues', bluesBase)
addAllModesMajorFormula('in', inFormula)
addAllModesMajorFormula('insen', insenFormula)
addAllModesMajorFormula('iwato', iwatoFormula)
addAllModesMajorFormula('yo', yoFormula)
addAllModesMajorFormula('hirajoshi', hirajoshiFormula)
addAllModesMajorFormula('ryukyu', ryukyuFormula)

function logScales() {
    console.log('Available scales:')
    for (var scale in scales) {
        console.log(`${scale} scale modes:`)
        for (var mode in scales[scale]) {
            console.log(`\t${scales[scale][mode]}`)
        }
    }
}

//logScales()
/**
 * Represents an instruments note, i.e. a single fret on a fretboard, or a single key on a piano
 * Described by a `Note`, numeric index of the note into a scale, Color, and Inlay
 */
class INote {
    constructor(note, index, color, inlay=' ') {
        this.note = note
        this.index = index
        this.color = color
        this.inlay = inlay
    }

    indexStr(posIndexOnly=false) {
        return (posIndexOnly && this.index == 0) ? '' : this.index.toString()
    }

    noteStr(posIndexOnly=false) {
        return (posIndexOnly && this.index == 0) ? '' : this.note.toString()
    }

    fullStr(printNoteLetter, printScaleIndex, posIndexOnly=false) {
        var noteStr = printNoteLetter ? this.noteStr(posIndexOnly) : ''
        var indexStr = printScaleIndex ? this.indexStr(posIndexOnly) : ''
        return `${this.color}${padString('^', ' ', 4, noteStr)}${this.inlay}${this.color}${padString('^', ' ', 4, indexStr)}`
    }
}
/**
 * Representation of a sequence of INote
 * Described by a starting root, a half-step sequence list, and length 
 * for the half step sequence list, [1] will give a chromatic output, [0] will give the root for every note
 * for major one would use [2, 2, 1, 2, 2, 2, 1], etc
 */
class INoteSequence {
    constructor(root, sequence, length) {
        this.sequence = sequence
        this.root = root
        this.notes = [new INote(this.root, 0, new Color())]
        var i = 0;
        while (this.notes.length < length)
        {
            var j = i % sequence.length;
            this.notes.push(new INote(this.notes[i].note.noteFromOffset(sequence[j]), 0, new Color()));
            i++
        }
        this.notesInScale = 0
        this.colors = {}
        for (var i = 0; i < length; i++)
        {
            this.colors[i] = new Color()
        }
    }

    setChromatic(chromatic) {
        this.notesInScale = chromatic.notesInScale()
        for (var i in this.notes) {
            var c = this.notes[i].note.offsetDown(this.root)
            this.notes[i].index = chromatic.notes[c]
        }
    }

    setColorsByScaleIndex(colors) {
        for (var note in colors) {
            this.colors[note] = colors[note]
        }
        for (var note in this.notes) {
            this.notes[note].color = this.colors[this.notes[note].index]
        }
    }

    setColorsByPosition(colors) {
        for (var i in this.colors) {
            var k = Object.keys(colors)[parseInt(i) % Object.keys(colors).length]
            this.colors[i] = colors[k]
        }
        for (var i in this.notes) {
            this.notes[i].color = this.colors[i]
        }
    }

    scaleSubset(indices, subclass, newColors, defaultColor) {
        var colors = newColors == null ? this.colors : newColors
        var s = new INoteSequence(this.root, this.sequence, this.notes.length)
        for (var i in this.notes) {
            s.notes[i].color = defaultColor
            if (indices.includes(this.notes[i].index)) {
                s.notes[i].index = this.notes[i].index
                s.notes[i].color = s.notes[i].index in colors ? colors[s.notes[i].index] : defaultColor
            }
        }
        subclass.sequence = s.sequence
        subclass.root = s.root
        subclass.notes = s.notes
        subclass.notesInScale = indices.length
        subclass.colors = colors
        return subclass
    }
}

class GuitarString extends INoteSequence {
    constructor(root, fretNum, inlays=null) {
        super(root, [1], fretNum)
        this.setInlays(inlays)
    }

    noteSep(i) {
        return new Color() + ((i == 0) ? ':' : '|')
    }

    preludeStr() { return `${new Color()}${padString('<', ' ', 5, this.root.toString())} -` }

    fullStr(start, end, printNoteLetters, printNoteNumbers, posIndexOnly) {
        var notes = []
        for (var i = start; i < end; i++) {
            notes.push(this.notes[i].fullStr(printNoteLetters, printNoteNumbers, posIndexOnly))
        }
        var ffs = this.noteSep(start)
        return this.preludeStr() + notes[0] + ffs + notes.slice(1).join(this.noteSep(1)) + this.noteSep(1) + '   ' + reset_code
    }

    setInlays(inlays) {
        this.inlays=inlays
        if (inlays) {
            for (i in inlays.notes) {
                if (i < this.notes.length) {
                    this.notes[i].inlay = inlays.notes[i]
                }
            }
        }
    }

    scaleSubset(indices, newColors) { 
        var subset = new GuitarString(this.root, this.notes.length, this.inlays)
        super.scaleSubset(indices, subset, newColors, new Color())
        subset.setInlays(this.inlays)
        return subset
    }
}

class WhiteKeys extends INoteSequence {
    constructor(root, keyNum) {
        super(root, [2, 1, 2, 2, 1, 2, 2], keyNum)
    }

    fullStr(start, end, printNoteLetters, printNoteNumbers, posIndexOnly=false) {
        var notes = []
        for (var i = start; i < end; i++) {
            notes.push(this.notes[i].fullStr(printNoteLetters, printNoteNumbers, posIndexOnly) + wkeycol() + '|')
        }
        return notes.join('') + reset_code
    }

    scaleSubset(indices, newColors) {
        var subset = new WhiteKeys(this.root, this.notes.length, this.inlays)
        super.scaleSubset(indices, subset, newColors, wkeycol())
        return subset
    }
}

class BlackKeys extends INoteSequence {
    constructor(root, keyNum) {
        super(root, [3, 2, 3, 2, 2], keyNum)
    }

    fullStr(start, end, printNoteLetters, printNoteNumbers, posIndexOnly=false) {
        var notes = []
        for (var i = start; i < end; i++) {
            notes.push(this.notes[i].fullStr(printNoteLetters, printNoteNumbers, posIndexOnly))
            if (this.sequence[i % this.sequence.length] == 3) {
                notes.push(bkeycol() + ' ' + wkeycol() + '    |    ' + bkeycol() + ' ');
            } else {
                notes[notes.length-1] += bkeycol() + '|'
            }
        }
        return notes.join('') + reset_code
    }

    scaleSubset(indices, newColors) {
        var subset = new BlackKeys(this.root, this.notes.length, this.inlays)
        super.scaleSubset(indices, subset, newColors, bkeycol())
        return subset
    }
}
/**
 * BEGIN WEB DISPLAY
 */

default_scale = {
    'root': 'A',
    'chromatic_formula': [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
    'major_formula': ['1', '2', '3', '4', '5', '6', '7'],
    'name': ['major', 'ionian'],
    'subset': [1, 3, 5],
    'intervals': [1, 2, 3, 4, 5, 6, 7] 
}

var Convert = require('ansi-to-html');
var convert = new Convert();
 
function clearSelect(select) {
    var length = select.options.length;
    for (i = length-1; i >= 0; i--) {
      select.options[i] = null;
    }
}

function addColor(i, fg, bg) {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode(`Note ${i}: `));
    // Create an <input> element, set its type and name attributes
    var fgin = document.createElement("select");
    var bgin = document.createElement("select");
    fgin.name = `color_fg_${i}`;
    bgin.name = `color_bg_${i}`;
    fgin.id = `color_fg_${i}`;
    bgin.id = `color_bg_${i}`;
    for (var i in fg_colors) {
        var fg_option = document.createElement("option");
        var bg_option = document.createElement("option");
        fg_option.value = i;
        bg_option.value = i;
        fg_option.text = i;
        bg_option.text = i;
        fgin.appendChild(fg_option);
        bgin.appendChild(bg_option);
    }
    fgin.value = fg
    bgin.value = bg
    app.appendChild(fgin);
    app.appendChild(bgin);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function setColorsFromPreset() {
    var preset = document.getElementById('preset_select').value
    for ( i in color_presets[preset] )
    {
        var fg = document.getElementById(`color_fg_${i}`)
        var bg = document.getElementById(`color_bg_${i}`)
        fg.value = color_presets[preset][i].fg
        fg.text = color_presets[preset][i].fg
        bg.value = color_presets[preset][i].bg
        bg.text = color_presets[preset][i].bg
    }
}

function addColors( colors ) {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode(`Set [foreground, background] color for nth note in scale/interval (note 0 is out of scale spaces): `));
    app.appendChild(document.createElement("br"));
    for ( var i in colors ) {
      addColor(i, colors[i].fg, colors[i].bg)
    }
    app.appendChild(document.createTextNode(`Choose color preset: `));
    var preset_select = document.createElement("select");
    preset_select.id = 'preset_select';
    for (var i in color_presets)
    {
        var preset_option = document.createElement("option");
        preset_option.value = i;
        preset_option.text = i;
        preset_select.appendChild(preset_option);
    }
    preset_select.onchange = setColorsFromPreset
    app.appendChild(preset_select); 
    app.appendChild(document.createElement("br"));
}

function addPrintNumbers() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Print Note Numbers: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "checkbox"
    input.id = "print_numbers";
    input.checked = true
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addPrintNotes() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Print Note Letters: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "checkbox"
    input.id = "print_notes";
    input.checked = true
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function downloadFiles(data, file_name, file_type) {
    var file = new Blob([data], {type: file_type});
    if (window.navigator.msSaveOrOpenBlob) 
        window.navigator.msSaveOrOpenBlob(file, file_name);
    else { 
        var a = document.createElement("a"), url = URL.createObjectURL(file);
        a.href = url;
        a.download = file_name;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function addButtons( generateF, getArgs, setArgs ){
    var app = document.getElementById("app");
    var save = document.createElement("button");
    save.id = 'save';
    save.textContent = 'Save';
    save.onclick = function() { 
        args = getArgs();
        downloadFiles( JSON.stringify(args), args.name + '.json', 'text/json' );
    }
    var load = document.createElement("input");
    var loadb = document.createElement("button");
    load.type = 'file'
    load.id = 'load';
    load.multiple = true;
    loadb.id = 'loadb';
    loadb.textContent = 'Load';
    load.style = 'display: none;';
    const upload = async (event) => {
        // Convert the FileList into an array and iterate
        let files = Array.from(event.target.files).map(file => {
            // Define a new file reader
            let reader = new FileReader();
            // Create a new promise
            return new Promise(resolve => {
                // Resolve the promise after reading file
                reader.onload = () => resolve(reader.result);
                // Read the file as a text
                reader.readAsText(file);
            });
        });
        // At this point you'll have an array of results
        let res = await Promise.all(files);
        for ( var i in res )
        {
            console.log(res[i]);
            setArgs( res[i] );
        }
    }
    load.onchange = upload;
    loadb.onclick = function() { load.click() }
    var generate = document.createElement("button");
    generate.id = 'generate';
    generate.textContent = 'Generate';
    generate.onclick = generateF;
    app.appendChild(save);
    app.appendChild(load);
    app.appendChild(loadb);
    app.appendChild(generate);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addRoot() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Scale Root Note: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "text";
    input.name = "root";
    input.id = "root";
    input.defaultValue = default_scale.root
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addChromaticFormula() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Chromatic Scale Formula: "));
    // Create an <input> element, set its type and name attributes
    var check = document.createElement("input");
    check.type = "radio"
    check.name = "scale_selector";
    check.id = "chromatic_selector";
    check.checked = false
    check.onclick = function() {
      chrombox = document.getElementById('chromatic_formula');
      chrombox.style.display='';
      scalebox = document.getElementById('major_formula');
      scalebox.style.display='none';
      snamebox = document.getElementById('scale_name_select');
      mnamebox = document.getElementById('mode_name_select');
      snamebox.style.display='none';
      mnamebox.style.display='none';
    };

    var input = document.createElement("input");
    input.type = "text"
    input.name = "chromatic_formula";
    input.id = "chromatic_formula";
    input.value = default_scale.chromatic_formula.join(' ')
    input.style.display='none'

    app.appendChild(check);
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}


function addMajorFormula() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Major Scale Formula: "));
    // Create an <input> element, set its type and name attributes
    var check = document.createElement("input");
    check.type = "radio"
    check.name = "scale_selector";
    check.id = "major_selector";
    check.checked = false 
    check.onclick = function() {
      chrombox = document.getElementById('chromatic_formula');
      chrombox.style.display='none';
      scalebox = document.getElementById('major_formula');
      scalebox.style.display='';
      snamebox = document.getElementById('scale_name_select');
      mnamebox = document.getElementById('mode_name_select');
      snamebox.style.display='none';
      mnamebox.style.display='none';
    };

    var input = document.createElement("input");
    input.type = "text"
    input.name = "major_formula";
    input.id = "major_formula";
    input.value = default_scale.major_formula.join(' ')
    input.style.display='none'

    app.appendChild(check);
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function setScaleBox() {
    var scaleBox = document.getElementById(`scale_name_select`)
    clearSelect(scaleBox)
    for (var scale in scales) {
        var option = document.createElement("option");
        option.value = scale;
        option.text = scale;
        scaleBox.appendChild(option)
    }
}

function setModeBox() {
    var modeBox = document.getElementById(`mode_name_select`)
    var scale = document.getElementById(`scale_name_select`).value
    clearSelect(modeBox)
    for (var mode in scales[scale]) {
        var option = document.createElement("option");
        option.value = mode;
        option.text = mode;
        modeBox.appendChild(option)
    }
}

function addScaleName() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Scale/Mode Name: "));
    // Create an <input> element, set its type and name attributes
    var check = document.createElement("input");
    check.type = "radio"
    check.name = "scale_selector";
    check.id = "scale_name_selector";
    check.checked = true
    check.onclick = function() {
      chrombox = document.getElementById('chromatic_formula');
      chrombox.style.display='none';
      scalebox = document.getElementById('major_formula');
      scalebox.style.display='none';
      snamebox = document.getElementById('scale_name_select');
      mnamebox = document.getElementById('mode_name_select');
      snamebox.style.display='';
      mnamebox.style.display='';
    };
    var scaleBox = document.createElement("select");
    var modeBox = document.createElement("select");
    scaleBox.name = `scale_name_select`;
    modeBox.name = `mode_name_select`;
    scaleBox.id = `scale_name_select`;
    modeBox.id = `mode_name_select`;
    scaleBox.onchange = setModeBox

    app.appendChild(check);
    app.appendChild(scaleBox);
    app.appendChild(modeBox);
    // Append a line break
    app.appendChild(document.createElement("br"));
    setScaleBox()
    setModeBox()
}

function addSubsets() {
    var app = document.getElementById("app");
    // Create an <input> element, set its type and name attributes
    var subset = document.createElement("input");
    var intervals = document.createElement("input");
    subset.type = "text";
    subset.name = "subset";
    subset.id = "subset";
    subset.defaultValue = default_scale.subset.join(' ')
    intervals.type = "text";
    intervals.name = "intervals";
    intervals.id = "intervals";
    intervals.defaultValue = default_scale.intervals.join(' ')
    app.appendChild(document.createTextNode("Subset: "));
    app.appendChild(subset);
    app.appendChild(document.createTextNode("Intervals: "));
    app.appendChild(intervals);
    // Append a line break
    app.appendChild(document.createElement("br"));

}

function addRecolorSubsets() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Recolor Intervals: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "checkbox"
    input.id = "recolor_intervals";
    input.checked = true
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addPrintFullScale() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Print Full Scale: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "checkbox"
    input.id = "print_full_scale";
    input.checked = true
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addScaleSelection() {
    addRoot()
    addChromaticFormula()
    addMajorFormula()
    addScaleName()
    addSubsets()
    addRecolorSubsets()
    addPrintFullScale()
}

function setDocumentFromArgs( args )
{
    /*
    for ( var id in args )
    {
        console.log(input)
        var input = document.getElementById( id );
        if ( input != null )
        {
            if ( id != 'colors' )
            {
                if ( input.checked != null )
                {
                    input.checked = args[id]
                }
                else
                {
                    input.value = args[id];
                }
            }
        }
    }
    */
}
function fretboarSite() {

/**
 * BEGIN ARGS
 */

var default_args = {
    'tuning': ['E', 'A', 'D', 'G', 'B', 'E'],
    'frets': 24,
    'start': 0,
    'end': null,
    'print_notes': true,
    'print_numbers': true,
    
    'colors': color_presets['default'],
    'scale': {
        'root': null,
        'major_formula': null,
        'chromatic_formula': null,
        'name': null,
        'subset': null,
        'intervals': null,
        'recolor_intervals': false,
        'print_full_scale': false
    },
    'inlay': {
        'pattern': null,
        'color': new Color('', '')
    },
    'name': ''
}

function getArgs()
{
    args = JSON.parse(JSON.stringify(default_args))
    args.tuning = removeItemAll(document.getElementById('tuning').value.split(' '), '')
    args.frets = parseInt(document.getElementById('frets').value) + 1
    args.start = parseInt(document.getElementById('start').value)
    args.end = parseInt(document.getElementById('end').value) + 1
    args.print_numbers = document.getElementById('print_numbers').checked
    args.print_notes = document.getElementById('print_notes').checked

    for (var i in default_args.colors) {
        var fg_color = document.getElementById(`color_fg_${i}`).value
        var bg_color = document.getElementById(`color_bg_${i}`).value
        args.colors[i] = new Color(fg_color, bg_color)
    }

    args.scale.root = document.getElementById('root').value
    if (document.getElementById('chromatic_selector').checked) {
        chromatic_binary = []
        removeItemAll(document.getElementById('chromatic_formula').value.split(' '), '').forEach(function(i) {
            chromatic_binary.push(parseInt(i))
        })
        args.scale.chromatic_formula = chromatic_binary
    } else if (document.getElementById('major_selector').checked) {
        args.scale.major_formula = removeItemAll(document.getElementById('major_formula').value.split(' '), '')
    } else if (document.getElementById('scale_name_selector').checked) {
        args.scale.name = [document.getElementById('scale_name_select').value, document.getElementById('mode_name_select').value]
    }

    args.inlay.pattern = '*'
    args.inlay.color = new Color(default_fg, '')
    subset = removeItemAll(document.getElementById('subset').value.split(' '), '')
    intervals = removeItemAll(document.getElementById('intervals').value.split(' '), '')
    recolor_intervals = document.getElementById('recolor_intervals').checked
    print_full_scale = document.getElementById('print_full_scale').checked
    args.scale.subset = subset.map(numStr => parseInt(numStr))
    args.scale.intervals = intervals.map(numStr => parseInt(numStr))
    args.scale.recolor_intervals = recolor_intervals
    args.scale.print_full_scale = print_full_scale
    args.name = "args_" + args.scale.root + "_" + args.scale.name
    console.log(args)
    return args
}

function setArgs(text)
{
    args = JSON.parse(text)
    for ( var i in args.colors )
    {
        args.colors[i] = Color.copy( args.colors[i] )
    }
    args.inlay.color = Color.copy( args.inlay.color );
    console.log(args)
    default_args = args
    setDocumentFromArgs( args );
    generateFretboards( args, true );
}

/**
 * END ARGS
 */

/**
 * BEGIN WEB DISPLAY
 */

function addTuning() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("String Tunings: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "text";
    input.name = "tuning";
    input.id = "tuning";
    input.defaultValue = default_args.tuning.join(' ')
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addFrets() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Frets: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "frets";
    input.id = "frets";
    for (var i = 0; i <=24; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        input.appendChild(option);
    }
    input.selectedIndex= default_args.frets
    input.onchange = setStartEndFromFrets
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function setStartFromFrets() {
    start = document.getElementById('start')
    oldStart = start.selectedIndex < 0 ? 0 : start.selectedIndex
    clearSelect(start)
    var maxStart = document.getElementById('frets').value
    for (var i = 0; i <= maxStart; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        start.appendChild(option);
    }
    start.selectedIndex = oldStart > maxStart ? maxStart : oldStart
}

function setEndFromFrets() {
    end = document.getElementById('end')
    var maxEnd = document.getElementById('frets').value
    var minEnd = parseInt(document.getElementById('start').value)
    clearSelect(end)
    for (var i = minEnd; i <= maxEnd; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        end.appendChild(option);
    }
    end.selectedIndex = maxEnd-minEnd
}

function setStartEndFromFrets() {
    setStartFromFrets()
    setEndFromFrets()
}

function addStart() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Start Fret: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "start";
    input.id = "start";
    input.onchange = setEndFromFrets
    app.appendChild(input);
    setStartFromFrets()
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addEnd() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("End Fret: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "end";
    input.id = "end";
    app.appendChild(input);
    setEndFromFrets()
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addOutputArgs() {
    addTuning()
    addFrets()
    addStart()
    addEnd()
    addPrintNumbers()
    addPrintNotes()
    addColors( default_args.colors )
}

function generateFretboards( args, append=false ) {
    fretboards = getFretboardsWithName(args)
    var data = ''
    for (i in fretboards) {
        var name = fretboards[i][0]
        var fretboard = fretboards[i][1]
        data += reset_code + name +'\n'
        data += fretboard.fullStr(args.start, args.end, args.print_notes, args.print_numbers, true) +'\n'
    }
    if (!append) { document.getElementById('fretboard').innerHTML = ''; }
    document.getElementById('fretboard').innerHTML += convert.toHtml(data)
}

function addFretboardOutput(){
    // Container <div> where dynamic content will be placed
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Fretboard output: "));
    app.appendChild(document.createElement("br"));
    var fretboardOutput = document.createElement("pre");
    fretboardOutput.id = "fretboard";
    app.appendChild(fretboardOutput);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

document.title = 'fretboar'
document.querySelector('h1').textContent = 'fretboar'
addOutputArgs()
addScaleSelection()
addButtons( function(){ generateFretboards( getArgs() ) }, getArgs, setArgs )
addFretboardOutput()

}
function pianotrollSite() {

/**
 * BEGIN ARGS
 */

var default_args = {
    'keys': 88,
    'start': 0,
    'end': null,
    'print_notes': true,
    'print_numbers': true,
    
    'colors': color_presets['empty'],
    'scale': {
        'root': null,
        'major_formula': null,
        'chromatic_formula': null,
        'name': null,
        'subset': null,
        'intervals': null,
        'recolor_intervals': false,
        'print_full_scale': false
    },
    'name': ''
}

function getArgs()
{
    args = JSON.parse(JSON.stringify(default_args))
    args.keys = parseInt(document.getElementById('keys').value)
    args.start = parseInt(document.getElementById('start').value)
    args.end = parseInt(document.getElementById('end').value)
    args.print_numbers = document.getElementById('print_numbers').checked
    args.print_notes = document.getElementById('print_notes').checked

    for (var i in default_args.colors) {
        var fg_color = document.getElementById(`color_fg_${i}`).value
        var bg_color = document.getElementById(`color_bg_${i}`).value
        args.colors[i] = new Color(fg_color, bg_color)
    }

    args.scale.root = document.getElementById('root').value
    if (document.getElementById('chromatic_selector').checked) {
        chromatic_binary = []
        removeItemAll(document.getElementById('chromatic_formula').value.split(' '), '').forEach(function(i) {
            chromatic_binary.push(parseInt(i))
        })
        args.scale.chromatic_formula = chromatic_binary
    } else if (document.getElementById('major_selector').checked) {
        args.scale.major_formula = removeItemAll(document.getElementById('major_formula').value.split(' '), '')
    } else if (document.getElementById('scale_name_selector').checked) {
        args.scale.name = [document.getElementById('scale_name_select').value, document.getElementById('mode_name_select').value]
    }

    subset = removeItemAll(document.getElementById('subset').value.split(' '), '')
    intervals = removeItemAll(document.getElementById('intervals').value.split(' '), '')
    recolor_intervals = document.getElementById('recolor_intervals').checked
    print_full_scale = document.getElementById('print_full_scale').checked
    args.scale.subset = subset.map(numStr => parseInt(numStr))
    args.scale.intervals = intervals.map(numStr => parseInt(numStr))
    args.scale.recolor_intervals = recolor_intervals
    args.scale.print_full_scale = print_full_scale
    args.name = "args_" + args.scale.root + "_" + args.scale.name
    console.log(args)
    return args
}

function setArgs(text)
{
    args = JSON.parse(text)
    for ( var i in args.colors )
    {
        args.colors[i] = Color.copy( args.colors[i] )
    }
    console.log(args)
    default_args = args
    setDocumentFromArgs( args )
}

/**
 * END ARGS
 */

/**
 * BEGIN WEB DISPLAY
 */

function addKeys() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Keys: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "keys";
    input.id = "keys";
    for (var i = 1; i <=88; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        input.appendChild(option);
    }
    input.selectedIndex= default_args.keys-1
    input.onchange = setStartEndFromKeys
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function setStartFromKeys() {
    start = document.getElementById('start')
    oldStart = start.selectedIndex < 0 ? 0 : start.selectedIndex
    clearSelect(start)
    var maxStart = document.getElementById('keys').value - 1
    for (var i = 0; i <= maxStart; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        start.appendChild(option);
    }
    start.selectedIndex = oldStart > maxStart ? maxStart : oldStart
}

function setEndFromKeys() {
    end = document.getElementById('end')
    var maxEnd = document.getElementById('keys').value
    var minEnd = parseInt(document.getElementById('start').value) + 1
    clearSelect(end)
    for (var i = minEnd; i <= maxEnd; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        end.appendChild(option);
    }
    end.selectedIndex = maxEnd-minEnd
}

function setStartEndFromKeys() {
    setStartFromKeys()
    setEndFromKeys()
}

function addStart() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Start Key: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "start";
    input.id = "start";
    input.onchange = setEndFromKeys
    app.appendChild(input);
    setStartFromKeys()
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addEnd() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("End Key: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "end";
    input.id = "end";
    app.appendChild(input);
    setEndFromKeys()
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addOutputArgs() {
    addKeys()
    addStart()
    addEnd()
    addPrintNumbers()
    addPrintNotes()
    addColors( default_args.colors )
}

function generateKeyboards() {
    var args = getArgs();
    keyboards = getKeyboardsWithName(args)
    var data = ''
    for (i in keyboards) {
        var name = keyboards[i][0]
        var keyboard = keyboards[i][1]
        data += reset_code + name +'\n'
        data += keyboard.fullStr(args.start, args.end, args.print_notes, args.print_numbers, true) +'\n'
    }
    document.getElementById('keyboard').innerHTML = convert.toHtml(data)
}

function addKeyboardOutput(){
    // Container <div> where dynamic content will be placed
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Keyboard output: "));
    app.appendChild(document.createElement("br"));
    var keyboardOutput = document.createElement("pre");
    keyboardOutput.id = "keyboard";
    app.appendChild(keyboardOutput);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

document.title = 'pianotroll'
document.querySelector('h1').textContent = 'pianotroll'
addOutputArgs()
addScaleSelection()
addButtons( function(){ generateKeyboards( getArgs() ) }, getArgs, setArgs )
addKeyboardOutput()

}
if (window.location.href.includes("fretboar.com"))
{
  fretboarSite()
}
else if (window.location.href.includes("pianotroll.com"))
{
  pianotrollSite()
}
else 
{
  //fretboarSite()
  pianotrollSite()
}
