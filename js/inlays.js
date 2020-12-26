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

