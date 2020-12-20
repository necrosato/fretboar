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
        return new Color() + ((i == 0) ? ':' : '|')
    }

    notesStr(start, end) {
        var frets = []
        for (var i = start; i < end; i++) {
            frets.push(this.frets[i].fullStr(true, false))
        }
        var ffs = this.fretSep(start)
        return this.preludeStr() + frets[0] + ffs + frets.slice(1).join(this.fretSep(1)) + this.fretSep(1) + '   ' + reset_code
    }

    notesWithIndexStr(start, end) {
        var frets = []
        for (var i = start; i < end; i++) {
            if (this.frets[i].index) {
                frets.push(this.frets[i].fullStr(true, false, true))
            } else {
                frets.push(this.frets[i].fullStr(false, false, false))
            }
        }
        var ffs = this.fretSep(start)
        return this.preludeStr() + frets[0] + ffs + frets.slice(1).join(this.fretSep(1)) + this.fretSep(1) + '   ' + reset_code
    }

    indexStr(start, end) {
        var frets = []
        for (var i = start; i < end; i++) {
            frets.push(this.frets[i].fullStr(false, true))
        }
        var ffs = this.fretSep(start)
        return this.preludeStr() + frets[0] + ffs + frets.slice(1).join(this.fretSep(1)) + this.fretSep(1) + '   ' + reset_code
    }

    fullStr(start, end, indexOnly=false) {
        var frets = []
        for (var i = start; i < end; i++) {
            frets.push(this.frets[i].fullStr(true, true, indexOnly))
        }
        var ffs = this.fretSep(start)
        return this.preludeStr() + frets[0] + ffs + frets.slice(1).join(this.fretSep(1)) + this.fretSep(1) + '   ' + reset_code
    }

    preludeStr() { return `${new Color()}${padString('<', ' ', 5, this.root.toString())} -` }

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

function intervalSubsets(fretboard, subsetBase, intervals, colors, recolor) {
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
                if (recolor) {
                    intervalColors[subset[j]] = colors[subsetBase[j]]
                } else {
                    intervalColors[subset[j]] = colors[subset[j]]
                }
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
        var subsets = intervalSubsets(fretboard, args.scale.subset, args.scale.intervals, colors, args.recolor_intervals)
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

