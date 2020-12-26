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
