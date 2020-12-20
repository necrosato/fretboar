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

standardInlayFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
topFrets = [12, 15, 17, 19, 21, 24]
bottomFrets = [3, 5, 7, 9, 12]
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

