
/**
 * BEGIN COLORS
 */

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

class Color {
    constructor(fg=default_fg, bg=default_bg) {
        this.fg = fg
        this.bg = bg
    }
    toString() {
        return colors[this.fg] + bg_colors[this.bg]
    }
}


/**
 * END COLORS
 */

/**
 * BEGIN INLAYS
 */
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
    constructor(frets) {
        //  frets is map of fret num to Inlay // 
        this.frets = frets
    }

    setColor(color) {
        //  set same color for all inlays // 
        for (i in this.frets) {
            this.frets[i].color = color
        }
    }

    setChar(design) {
        //  set same design for all inlays // 
        for (i in this.frets) {
            this.frets[i].design = design
        }
    }
}

standardInlayFrets = [1, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
topFrets = [12, 15, 17, 19, 21, 24]
bottomFrets = [1, 3, 5, 7, 9, 12]
doubleDotFrets = [12, 24]

function inlaysFromFrets(frets, inlay) {
    inlays = {}
    for (f in frets) {
      inlays[f] = inlay
    }
    return Inlays(inlays)
}

class InlayPattern {
    //  descrbes the inlays of an entire fretboard // 
    constructor(allInlays) {
        this.allInlays = allInlays 
    }
}

function dotInlays(color, fretNums, design=null) {
    inlays = {}
    for (i in fretNums) {
        if (design==null) {
            inlays[i] = Inlay(color, i in doubleDotFrets ? ':' : '.')
        } else {
            inlays[i] = Inlay(color, design)
        }
    }
    return Inlays(inlays)
}

function dotsOnFirstString(color, design=null) {
    firstStringInlays = dotInlays(color, standardInlayFrets, design)
    return InlayPattern({'0': firstStringInlays})
}

function dotsOnLastString(color, design=null) {
    lastStringInlays = dotInlays(color, standardInlayFrets, design)
    return InlayPattern({'-1': lastStringInlays})
}

function dplitTopBottomDots(color, design=null) {
    firstStringInlays = dotInlays(color, bottomFrets, design)
    lastStringInlays = dotInlays(color, topFrets, design)
    return InlayPattern({'0': firstStringInlays, '-1': lastStringInlays})
}
/**
 * END INLAYS
 */

/**
 * BEGIN SCALES/MODES
 */
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
        if (this.val < other.val) {
            return this.offsetUp(other)
        }
        return this.offsetDown(other) * -1
    }

    offsetUp(other) {
        // return the number of semitones to move from this note up to other // 
        if (this.val < other.val) {
            return other.offsetDown(this)
        }
        return (other.val - this.val) % 12
    }

    offsetDown(other) {
        // return the number of semitones to move from this note down to other // 
        if (this.val < other.val) {
            return other.offsetUp(this)
        }
        return (this.val - other.val) % 12
    }

    toString() {
        return this.letter + this.accidental
    }

    fromStr(s) {
        if (s.length == 1) {
            return this(s)
        }
        if (s[0] in Note.letters) {
            return this(s[0], s[1])
        }
        return this(s[1], s[0])
    }

    noteFromOffset(offset) {
        val = (this.val + offset) % 12
        if (val in Note.letterVals) {
            return this(letterVals[val])
        }
        val = (val + 1) % 12
        return this(letterVals[val], 'b')
    }

    semitoneUp() {
        if ((this.val + 1) in letterVals) {
            return this(letterVals[this.val + 1])
        }
        return this(letterVals[this.val], '#')
    }

    semitoneDown() {
        if ((this.val - 1) in letterVals) {
            return this(letterVals[this.val - 1])
        }
        return this(letterVals[this.val], 'b')
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
        var notesInScale = 0
        this.notes.forEach(function(i) {
            if (i) {
                notesInScale++
            }
        })
        this.notesInScale = notesInScale
    }

    toString() {
        return this.notes.toString()
    }

    rotate(semitones) {
        // return a rotated scale, cutting of the first n semitones and moving them to the end,
        // or moving the last n seminotes to the beginning if value is negative
        return new ChromaticScale(this.notes.slice(semitones).concat(this.notes.slice(0,semitones)))
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
    for (i = 1; i <= base.notesInScale; i++) {
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
        ['ionian',
         'dorian',
         'phrygian',
         'lydian',
         'mixolydian',
         'aeolian',
         'locrian'
         ], majorBase)


addAllModes('major', majorBase)
addAllModes('pentatonic', pentatonicBase)
addAllModes('harmonic_minor', harmonicMinorBase)
addAllModes('melodic_minor', melodicMinorBase)
addAllModes('diminished', diminishedBase)
addAllModes('whole_tone', wholeToneBase)
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

logScales()


/**
 * END SCALES/MODES
 */


/**
 * BEGIN FRETBOARD

class Fret:
    constructor(note, index, color, inlay=' '):
        //  A Note and a numeric index for which note in a relative scale // 
        this.note = note
        this.index = index
        this.color = color
        this.inlay = inlay

    indexStr(this):
        return '' if this.index == 0 else str(this.index)

    noteStr(indexOnly=False):
        if indexOnly and this.index == 0:
            return ''
        return str(this.note)

    fullStr(note, index, indexOnly=False):
        noteStr = this.noteStr(indexOnly) if note else ''
        indexStr = this.indexStr() if index else ''
        return '{}{:^4}{}{}{:^4}'.format(str(this.color), noteStr, str(this.inlay), str(this.color), indexStr)

    __str__(this):
        return this.fullStr(True, True)

    __repr__(this):
        return this.__str__()


class String:
    constructor(root, fretNum, inlays=null):
        this.root = root
        this.colors = { i: Color() for i in range(13) }
        this.frets = [Fret(root.noteFromOffset(i), 0, Color()) for i in range(fretNum)]
        this.notesInScale = 0
        this.inlays = null
        this.setInlays(inlays)

    setChromatic(chromatic):
        this.notesInScale = chromatic.notesInScale()
        for i in range(len(this.frets)):
            c = i % 12
            this.frets[i].index = chromatic.notes[c]

    notesStr(start, end):
        notes = this.fretsStr(start, end)
        return '{}{:<5} -{}'.format(str(Color()),
                str(this.root), notes.format(*[f.fullStr(True, False) for f in this.frets[start:end]]))

    notesWithIndexStr(start, end):
        notes = this.fretsStr(start, end)
        return '{}{:<5} -{}'.format(str(Color()),
                str(this.root), notes.format(*[f.fullStr(True, False, True) if f.index else ' '*9 for f in this.frets[start:end]]))

    indexStr(start, end):
        notes = this.fretsStr(start, end)
        return '{}{:<5} -{}'.format(str(Color()),
                str(this.root), notes.format(*[f.fullStr(False, True) for f in this.frets[start:end]]))

    fullStr(start, end, indexOnly=False):
        notes = this.fretsStr(start, end)
        return '{}{:<5} -{}'.format(str(Color()),
                str(this.root), notes.format(*[f.fullStr(True, True, indexOnly) for f in this.frets[start:end]]))

    fretsStr(start, end):
        if start == 0:
            return '{}' + str(Color()) + ':' + ('{}' + str(Color()) + '|') * (end - start - 1)
        else:
            return ('{}' + str(Color()) + '|') * (end - start)


    __str__(this):
        return this.fullStr(0, len(this.frets))

    __repr__(this):
        return this.__str__()


    scaleSubset(indices, newColors=null):
        // 
        get a string only containing frets with given indices
        // 
        if newColors is null:
            newColors = this.colors
        s = String(this.root, len(this.frets), this.inlays)
        for i in range(len(this.frets)):
            if this.frets[i].index in indices:
                s.frets[i].index = this.frets[i].index
                s.frets[i].color = Color() if s.frets[i].index not in newColors else newColors[s.frets[i].index]
        return s

    setColors(colors):
        for note in colors:
            this.colors[note] = colors[note]
        for fret in this.frets:
            fret.color = this.colors[fret.index]

    setInlays(inlays):
        this.inlays=inlays
        if inlays:
            for i in inlays.frets:
                if i < len(this.frets):
                    this.frets[i].inlay = inlays.frets[i]

class Fretboard:
    constructor(roots, fretNum, inlayPattern=null):
        this.strings = [String(Note.fromStr(root), fretNum) for root in roots]
        this.roots = roots
        this.fretNum = fretNum
        this.notesInScale = 0
        this.setInlayPattern(inlayPattern)

    setChromatic(root, chromatic):
        this.notesInScale = chromatic.notesInScale()
        for string in this.strings:
            offset = root.offset(string.root)
            rot = chromatic.rotate(offset)
            string.setChromatic(rot)

    setMajor(root, major):
        this.setChromatic(root, major.chromatic())

    notesStr(start, end):
        return this.wrapData([s.notesStr(start, end) for s in this.strings], start, end)

    notesWithIndexStr(start, end):
        return this.wrapData([s.notesWithIndexStr(start, end) for s in this.strings], start, end)

    indexStr(start, end):
        return this.wrapData([s.indexStr(start, end) for s in this.strings], start, end)

    fullStr(start, end, indexOnly=False):
        return this.wrapData([s.fullStr(start, end, indexOnly) for s in this.strings], start, end)

    wrapData(data, start, end):
        legend, lines, slines, spaces = this.border(start, end)
        data ='\n'.join(reversed([slines + '\n' + string for string in data]))
        return legend + '\n' + lines + '\n' + spaces + '\n' + data + '\n' + lines + '\n' + spaces + '\n' + legend + reset_code +'\n'


    border(start, end):
        legend = '{:<8}'.format('Fret:') + ''.join(['{:^10}'.format(i) for i in range(start, end)])
        lines = '_' * len(legend)
        slines = '-' * len(legend)
        spaces = ' ' * len(legend)
        return (str(Color()) + l for l in [legend, lines, slines, spaces])

    str(start, end, notes, index):
        if notes and index:
            return this.fullStr(start, end, True)
        elif notes:
            return this.notesWithIndexStr(start, end)
        elif index:
            return this.indexStr(start, end)

    __str__(this):
        return this.fullStr(0, this.fretNum)

    __repr__(this):
        return this.__str__()

    scaleSubset(indices, newColors=null):
        f = Fretboard(this.roots, this.fretNum, this.inlayPattern)
        for i in range(len(f.strings)):
            f.strings[i] = this.strings[i].scaleSubset(indices, newColors)
        return f

    setColors(colors):
        this.colors = colors
        for string in this.strings:
            string.setColors(colors)

    setInlayPattern(pattern):
        this.inlayPattern = pattern
        if pattern:
            for string in pattern.allInlays:
                if string < len(this.strings):
                    this.strings[string].setInlays(pattern.allInlays[string])

parse_args(args = null):
    parser = argparse.ArgumentParser(description="Create a fretboard chart")
    parser.add_argument('-t','--tuning', nargs='+', default=['E', 'A', 'D', 'G', 'B', 'E'],
                        help='A list of string tunings to use')
    parser.add_argument('-f','--frets', action='store', type=int, default=8,
                        help='Define number of frets on the fretboard (including open string).')
    scale = parser.add_argument_group('scale')
    group = scale.add_mutually_exclusive_group()
    group.add_argument('-m','--major_scale', nargs='+', type=str,
                       help='Specify the scale as a list of ionian major relative number and accidentals. '
                             'Ex: 1 2# 3 4 5 6b 7bb')
    group.add_argument('-c','--chromatic_scale', nargs='+', type=int,
                       help='Specify the scale as a list of 12 distinct chromatic values. '
                            'Ex: 0 1 1 0 0 1 0 1 0 1 1 1')
    group.add_argument('-n','--mode_name', nargs=2, type=str,
                       help='Specify the scale mode via its name and mode name. '
                            'run modes.py to get a list of scale names and mode names')
    scale.add_argument('-r', '--root', action='store',
                       help='Give the root note of the scale, the first value in scale list.')
    scale.add_argument('-s', '--subset', nargs='+', type=int, default=[],
                       help='Give a subset of relative notes to extract from the scale')
    scale.add_argument('-i', '--intervals', nargs='+', type=int, default=[],
                       help='Print given subset groupings for every given interval in the scale')
    output = parser.add_argument_group('output')
    output.add_argument('--print_numbers', action='store_true', default=False,
                        help='Output the fretboard with relative numeric scale note numbers')
    output.add_argument('--print_notes', action='store_true', default=False,
                        help='Output the fretboard with musical note values')
    output.add_argument('--start', type=int, default=0,
                        help='the start fret to output')
    output.add_argument('--end', type=int,
                        help='the last fret to output')
    output.add_argument('--color', nargs=2, action='append',
                        help='set colors for each note in the mode/interval')
    output.add_argument('--background', nargs=2, action='append',
                        help='set background colors for each note in the mode/interval')
    output.add_argument('--inlay', type=str, default='',
                        help='set inlay character')
    output.add_argument('--inlay_color', type=str, default='',
                        help='set inlay character color')
    output.add_argument('--inlay_background', type=str, default='',
                        help='set inlay background color')
    if args:
        return parser.parse_args(args)
    return parser.parse_args()


setMajorScale(fretboard, scale, root, colors):
    assert root is not null, 'must give root when giving a scale'
    major_scale = MajorScale([MajorNote.fromStr(s) for s in scale])
    fretboard.setMajor(Note.fromStr(root), major_scale)
    fretboard.setColors(colors)
    return fretboard

setChromaticScale(retboard, scale, root, colors):
    //  scale should be 12 len binary list // 
    assert root is not null, 'must give root when giving a scale'
    assert len(scale) == 12, 'chromatic scale must be exactly 12 semitones'
    i = 1
    chromatic_notes = []
    for c in scale:
        if c == 0:
            chromatic_notes.append(c)
        else:
            chromatic_notes.append(i)
            i+=1
    fretboard.setChromatic(Note.fromStr(root), ChromaticScale(chromatic_notes))
    fretboard.setColors(colors)
    return fretboard

setFromScaleName(fretboard, scale, mode, root, colors):
    assert root is not null, 'must give root when giving a scale'
    assert scale in scales, 'invalid scale name, run modes.py to get a list of valid mode names'
    assert mode in scales[scale], 'invalid mode name, run modes.py to get a list of valid mode names'
    fretboard.setChromatic(Note.fromStr(root), scales[scale][mode].chromatic)
    fretboard.setColors(colors)
    return fretboard

intervalSubsets(fretboard, subsetBase, intervals, colors):
    distances = [subsetBase[i] - subsetBase[i - 1] for i in range(1, len(subsetBase))]
    offset = subsetBase[0] - 1
    subsets = []
    for i in intervals:
        subset = [i+offset]
        for distance in distances:
            subset.append(fretboard.notesInScale if (subset[-1] + distance) == fretboard.notesInScale else (subset[-1] + distance) % fretboard.notesInScale)
        intervalColors = {}
        for j in range(len(subset)):
            if subsetBase[j] in colors:
                intervalColors[subset[j]] = colors[subsetBase[j]]
        subsets.append((subset, fretboard.scaleSubset(subset, intervalColors)))
    return subsets


getFretboardsWithName(args):
    fretboards = []
    colors = {} if not args.color else { int(i): Color(c) for i, c in args.color }
    backgrounds = {} if not args.background else { int(i): Color(bg=c) for i, c in args.background }
    for note in backgrounds:
        colors[note].bg = backgrounds[note].bg
    end = args.frets if args.end is null else args.end
    inlayColor = Color(default_fg if not args.inlay_color else args.inlay_color, args.inlay_background)
    fretboard = Fretboard(args.tuning, args.frets, InlayPattern.SplitTopBottomDots(inlayColor, args.inlay))
    fretboard.setColors(colors)

    if args.major_scale is not null:
        setMajorScale(fretboard, args.major_scale, args.root, colors)
        fretboards.append(('Major Relative Scale Formula {}'.format(args.major_scale), fretboard))
    elif args.chromatic_scale is not null:
        setChromaticScale(fretboard, args.chromatic_scale, args.root, colors)
        fretboards.append(('Chromatic Binary Scale Formula {}'.format(args.chromatic_scale), fretboard))
    elif args.mode_name is not null:
        setFromScaleName(fretboard, args.mode_name[0], args.mode_name[1], args.root, colors)
        fretboards.append(('Mode Name {}'.format(args.mode_name), fretboard))
    if args.subset and args.intervals:
        subsets = intervalSubsets(fretboard, args.subset, args.intervals, colors)
        for intervals, subset in subsets:
            fretboards.append(('Interval Subset ({}):'.format(intervals), subset))
    return fretboards



main():
    args = parse_args()
    end = args.frets if args.end is null else args.end
    fretboards = getFretboardsWithName(args)
    for name, fretboard in fretboards:
        print(name)
        print(fretboard.str(args.start, end, args.print_notes, args.print_numbers))


if __name__=='__main__':
    main()
 * END FRETBOARD
 */


