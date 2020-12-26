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
