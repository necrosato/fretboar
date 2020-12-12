class Inlay:
    def __init__(self, color, design=' '):
        self.color = color
        self.design = design

    def __str__(self):
        return str(self.color) + self.design

class Inlays:
    def __init__(self, frets):
        ''' frets is map of fret num to Inlay '''
        self.frets = frets

    def setColor(self, color):
        ''' set same color for all inlays '''
        for i in self.frets:
            self.frets[i].color = color

    def setChar(self, design):
        ''' set same design for all inlays '''
        for i in self.frets:
            self.frets[i].design = design

standardInlayFrets = [1, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
topFrets = [12, 15, 17, 19, 21, 24]
bottomFrets = [1, 3, 5, 7, 9, 12]
doubleDotFrets = [12, 24]

def inlaysFromFrets(frets, inlay):
    return Inlays({f: inlay for f in frets})

class InlayPattern:
    ''' descrbes the inlays of an entire fretboard '''
    def __init__(self, allInlays):
        self.allInlays = allInlays 

    def DotsOnFirstString(color, design=None):
        firstStringInlays = Inlays({i: Inlay(color, ':' if i in doubleDotFrets else '.') for i in standardInlayFrets})
        if design:
            firstStringInlays = Inlays({i: Inlay(color, design) for i in standardInlayFrets})
        return InlayPattern({0: firstStringInlays})

    def DotsOnLastString(color, design=None):
        lastStringInlays = Inlays({i: Inlay(color, ':' if i in doubleDotFrets else '.') for i in standardInlayFrets})
        if design:
            lastStringInlays = Inlays({i: Inlay(color, design) for i in standardInlayFrets})
        return InlayPattern({-1: lastStringInlays})

    def SplitTopBottomDots(color, design=None):
        firstStringInlays = Inlays({i: Inlay(color, ':' if i in doubleDotFrets else '.') for i in bottomFrets})
        lastStringInlays = Inlays({i: Inlay(color, ':' if i in doubleDotFrets else '.') for i in topFrets})
        if design:
            firstStringInlays = Inlays({i: Inlay(color, design) for i in bottomFrets})
            lastStringInlays = Inlays({i: Inlay(color, design) for i in topFrets})
        return InlayPattern({0: firstStringInlays, -1: lastStringInlays})
