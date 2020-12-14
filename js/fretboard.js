
/**
 * BEGIN HELPERS
 */

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

/**
 * END HELPERS
 */

/**
 * BEGIN COLORS
 */

/**
 * BEGIN ARGS
 */

colors = {
        'black'  : '\x1b[30m',
        'red'    : '\x1b[31m',
        'green'  : '\x1b[32m',
        'yellow' : '\x1b[33m',
        'blue'   : '\x1b[34m',
        'magenta': '\x1b[35m',
        'cyan'   : '\x1b[36m',
        'white'  : '\x1b[97m',
        'light-grey'  : '\x1b[37m',
        'grey'   : '\x1b[90m',
        ''       : ''
        }
bg_colors = {
        'black'  : '\x1b[40m',
        'red'    : '\x1b[41m',
        'green'  : '\x1b[42m',
        'yellow' : '\x1b[43m',
        'blue'   : '\x1b[44m',
        'magenta': '\x1b[45m',
        'cyan'   : '\x1b[46m',
        'white'  : '\x1b[107m',
        'light-grey'  : '\x1b[47m',
        'grey'   : '\x1b[100m',
        ''       : ''
        }

default_fg = 'white'
default_bg = 'black'
reset_code = '\x1b[0m'

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
        for (var i in this.frets) {
            this.frets[i].color = color
        }
    }

    setChar(design) {
        //  set same design for all inlays // 
        for (var i in this.frets) {
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
            inlays[i] = new Inlay(color, doubleDotFrets.includes(i) ? ':' : '.')
        } else {
            inlays[i] = new Inlay(color, design)
        }
    })
    return new Inlays(inlays)
}

function dotsOnFirstString(color, design=null) {
    firstStringInlays = dotInlays(color, standardInlayFrets, design)
    return new InlayPattern({'0': firstStringInlays})
}

function dotsOnLastString(color, design=null) {
    lastStringInlays = dotInlays(color, standardInlayFrets, design)
    return new InlayPattern({'-1': lastStringInlays})
}

function splitTopBottomDots(color, design=null) {
    firstStringInlays = dotInlays(color, bottomFrets, design)
    lastStringInlays = dotInlays(color, topFrets, design)
    return new InlayPattern({'0': firstStringInlays, '-1': lastStringInlays})
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

//logScales()


/**
 * END SCALES/MODES
 */


/**
 * BEGIN FRETBOARD
 */

class Fret {
    constructor(note, index, color, inlay=' ') {
        //  A Note and a numeric index for which note in a relative scale // 
        this.note = note
        this.index = index
        this.color = color
        this.inlay = inlay
    }

    indexStr() {
        return this.index == 0 ? '' : this.index.toString()
    }

    noteStr(indexOnly=false) {
        return (indexOnly && this.index == 0) ? '' : this.note.toString()
    }

    fullStr(note, index, indexOnly=false) {
        var noteStr = note ? this.noteStr(indexOnly) : ''
        var indexStr = index ? this.indexStr() : ''
        return `${this.color}${padString('^', ' ', 4, noteStr)}${this.inlay}${this.color}${padString('^', ' ', 4, indexStr)}`
    }

    toString() {
        return this.fullStr(true, true)
    }
}

class GuitarString {
    constructor(root, fretNum, inlays=null) {
        this.root = root
        this.colors = {}
        for (var i = 0; i < 13; i++)
        {
            colors[i] = new Color()
        }
        this.frets = []
        for (var i = 0; i < fretNum; i++)
        {
            this.frets.push(new Fret(root.noteFromOffset(i), 0, new Color()))
        }
        this.notesInScale = 0
        this.inlays = null
        this.setInlays(inlays)
    }

    setChromatic(chromatic) {
        this.notesInScale = chromatic.notesInScale()
        for (var i in this.frets) {
            var c = i % 12
            this.frets[i].index = chromatic.notes[c]
        }
    }


    fretSep(i) {
        return reset_code + ((i == 0) ? ':' : '|')
    }

    notesStr(start, end) {
        var frets = []
        for (var i = start; i < end; i++) {
            frets.push(this.frets[i].fullStr(true, false))
        }
        var ffs = this.fretSep(start)
        return this.preludeStr() + frets[0] + ffs + frets.slice(start+1).join(this.fretSep(1)) + this.fretSep(1)
    }

    notesWithIndexStr(start, end) {
        var frets = []
        for (var i = start; i < end; i++) {
            if (this.frets[i].index) {
                frets.push(this.frets[i].fullStr(true, false, true))
            } else {
                frets.push(' '*9)
            }
        }
        var ffs = this.fretSep(start)
        return this.preludeStr() + frets[0] + ffs + frets.slice(start+1).join(this.fretSep(1)) + this.fretSep(1)
    }

    indexStr(start, end) {
        var frets = []
        for (var i = start; i < end; i++) {
            frets.push(this.frets[i].fullStr(false, true))
        }
        var ffs = this.fretSep(start)
        return this.preludeStr() + frets[0] + ffs + frets.slice(start+1).join(this.fretSep(1)) + this.fretSep(1)
    }

    fullStr(start, end, indexOnly=false) {
        var frets = []
        for (var i = start; i < end; i++) {
            frets.push(this.frets[i].fullStr(true, true, indexOnly))
        }
        var ffs = this.fretSep(start)
        return this.preludeStr() + frets[0] + ffs + frets.slice(start+1).join(this.fretSep(1)) + this.fretSep(1)
    }

    preludeStr() { return `${reset_code}${padString('<', ' ', 5, this.root.toString())} -` }

    toString() {
        return this.fullStr(0, this.frets.length)
    }

    scaleSubset(indices, newColors=null) {
        var colors = newColors == null ? this.colors : newColors
        var s = new GuitarString(this.root, this.frets.length, this.inlays)
        for (var i in this.frets) {
            if (indices.includes(this.frets[i].index)) {
                s.frets[i].index = this.frets[i].index
                s.frets[i].color = s.frets[i].index in colors ? colors[s.frets[i].index] : new Color()
            }
        }
        return s
    }

    setColors(colors) {
        for (var note in colors) {
            this.colors[note] = colors[note]
        }
        for (var fret in this.frets) {
            this.frets[fret].color = this.colors[this.frets[fret].index]
        }
    }

    setInlays(inlays) {
        this.inlays=inlays
        if (inlays) {
            for (i in inlays.frets) {
                if (i < this.frets.length) {
                    this.frets[i].inlay = inlays.frets[i]
                }
            }
        }
    }
}

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
            var offset = root.offset(this.strings[i].root)
            var rot = chromatic.rotate(offset)
            this.strings[i].setChromatic(rot)
        }
    }

    setMajor(root, major) {
        this.setChromatic(root, major.chromatic())
    }

    notesStr(start, end) {
        var data = []
        for (i in this.strings) { data.push(this.strings[i].notesStr(start, end)) }
        return this.wrapData(data, start, end)
    }

    notesWithIndexStr(start, end) {
        var data = []
        for (i in this.strings) { data.push(this.strings[i].notesWithIndexStr(start, end)) }
        return this.wrapData(data, start, end)
    }

    indexStr(start, end) {
        var data = []
        for (i in this.strings) { data.push(this.strings[i].indexStr(start, end)) }
        return this.wrapData(data, start, end)
    }

    fullStr(start, end, indexOnly=false) {
        var data = []
        for (i in this.strings) { data.push(this.strings[i].fullStr(start, end, indexOnly)) }
        return this.wrapData(data, start, end)
    }

    wrapData(data, start, end) {
        var legend, lines, slines, spaces
        [legend, lines, slines, spaces] = this.border(start, end)
        data = data.reverse().join('\n' + slines + '\n')
        return legend + '\n' + lines + '\n' + spaces + '\n' + data + '\n' + lines + '\n' + spaces + '\n' + legend + reset_code +'\n'
    }


    border(start, end) {
        var frets = []
        for (var i = start; i<end; i++) { frets.push(padString('^', ' ', 10, i.toString())) }
        var legend = `Fret:     ` + frets.join('')
        var lines = '_'.repeat(legend.length)
        var slines = '-'.repeat(legend.length)
        var spaces = ' '.repeat(legend.length)
        return [new Color() + legend,
                new Color() + lines,
                new Color() + slines,
                new Color() + spaces]
    }

    str(start, end, notes, index) {
        if (notes && index) {
            return this.fullStr(start, end, true)
        } else if (notes) {
            return this.notesWithIndexStr(start, end)
        } else if (index) {
            return this.indexStr(start, end)
        }
        return ''
    }

    toString() {
        return this.fullStr(0, this.fretNum)
    }

    scaleSubset(indices, newColors=null) {
        var f = new Fretboard(this.roots, this.fretNum, this.inlayPattern)
        for (var i in f.strings) {
            f.strings[i] = this.strings[i].scaleSubset(indices, newColors)
        }
        return f
    }

    setColors(colors) {
        this.colors = colors
        for (var i in this.strings) {
            this.strings[i].setColors(colors)
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
}

function setMajorScale(fretboard, formula, root, colors) {
    var majorNotes = []
    formula.forEach(function(s){ majorNotes.push(MajorNote.fromStr(s)) })
    var major_scale = new MajorScale(majorNotes)
    fretboard.setMajor(Note.fromStr(root), major_scale)
    fretboard.setColors(colors)
    return fretboard
}

function setChromaticScale(fretboard, scale, root, colors) {
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
    fretboard.setChromatic(Note.fromStr(root), new ChromaticScale(chromatic_notes))
    fretboard.setColors(colors)
    return fretboard
}

function setFromScaleName(fretboard, scale, mode, root, colors) {
    fretboard.setChromatic(Note.fromStr(root), scales[scale][mode].chromatic)
    fretboard.setColors(colors)
    return fretboard
}

function intervalSubsets(fretboard, subsetBase, intervals, colors) {
    var distances = []
    for (var i = 1; i < subsetBase.length; i++) {
        distances.push(subsetBase[i] - subsetBase[i-1])
    }
    var offset = subsetBase[0] - 1
    var subsets = []
    intervals.forEach(function(i) {
        var subset = [i+offset]
        distances.forEach(function(d) {
            if ((subset[subset.length-1] + d) == fretboard.notesInScale) {
                subset.push(fretboard.notesInScale)
            } else {
                subset.push((subset[subset.length-1] + d) % fretboard.notesInScale)
            }
        })
        intervalColors = {}
        for (var j = 0; j < subset.length; j++) {
            if (subsetBase[j] in colors) {
                intervalColors[subset[j]] = colors[subsetBase[j]]
            }
        }
        subsets.push([subset, fretboard.scaleSubset(subset, intervalColors)])
    })
    return subsets
}

function getFretboardsWithName(args) {
    var fretboards = []
    var colors = {}
    for (i in args.colors) {
        colors[i] = new Color(args.colors[i][0], args.colors[i][1])
    }
    end = args.end == null ? args.frets : args.end
    inlayColor = new Color(args.inlay.color[0], args.inlay.color[1])
    fretboard = new Fretboard(args.tuning, args.frets, splitTopBottomDots(inlayColor, args.inlay.pattern))
    fretboard.setColors(colors)

    if (args.scale.major_formula != null) {
        setMajorScale(fretboard, args.scale.major_formula, args.scale.root, colors)
        fretboards.push([`Major Relative Scale Formula ${args.scale.major_formula}`, fretboard])
    } else if (args.scale.chromatic_formula != null) {
        setChromaticScale(fretboard, args.scale.chromatic_formula, args.scale.root, colors)
        fretboards.push([`Chromatic Binary Scale Formula ${args.scale.chromatic_formula}`, fretboard])
    } else if (args.scale.name != null) {
        setFromScaleName(fretboard, args.scale.name[0], args.scale.name[1], args.scale.root, colors)
        fretboards.push([`Mode Name ${args.scale.name}`, fretboard])
    }
    if (args.scale.subset && args.scale.intervals) {
        var subsets = intervalSubsets(fretboard, args.scale.subset, args.scale.intervals, colors)
        for (i in subsets) {
            var intervals = subsets[i][0]
            var subset = subsets[i][1]
            fretboards.push([`Interval Subset (${intervals})`, subset])
        }
    }
    return fretboards
}

/**
 * END FRETBOARD
 */

var default_args = {
    'tuning': ['E', 'A', 'D', 'G', 'B', 'E'],
    'frets': 15,
    'start': 0,
    'end': null,
    'print_notes': true,
    'print_numbers': true,
    
    'colors': {
        0: ['white', 'black'],
        1: ['white', 'black'],
        2: ['white', 'black'],
        3: ['white', 'black'],
        4: ['white', 'black'],
        5: ['white', 'black'],
        6: ['white', 'black'],
        7: ['white', 'black'],
        8: ['white', 'black'],
        9: ['white', 'black'],
       10: ['white', 'black'],
       11: ['white', 'black'],
       12: ['white', 'black']
    },
    'scale': {
        'root': null,
        'major_formula': null,
        'chromatic_formula': null,
        'name': null,
        'subset': null,
        'intervals': null
    },
    'inlay': {
        'pattern': null,
        'color': ['', '']
    }
}

function test() {
    args = JSON.parse(JSON.stringify(default_args))
    args.scale.root = 'A'
    //args.scale.name = ['major', 'ionian']
    //args.scale.chromatic_formula = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]
    args.scale.major_formula = ['1', '2', '3', '4', '5', '6', '7']
    args.colors[1] = ['red', 'white']
    args.colors[3] = [default_fg, 'light-grey']
    args.colors[5] = [default_fg, 'grey']
    args.inlay.pattern = '*'
    args.inlay.color = [default_fg, '']
    args.scale.subset = [1, 3, 5]
    args.scale.intervals = [1, 2, 3, 4, 5, 6, 7]
    end = args.end == null ? args.frets : args.end
    fretboards = getFretboardsWithName(args)
    for (i in fretboards) {
        var name = fretboards[i][0]
        var fretboard = fretboards[i][1]
        console.log(name)
        console.log(fretboard.str(args.start, end, args.print_notes, args.print_numbers))
    }
}

test()

/**
 * END ARGS
 */



