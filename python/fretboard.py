import argparse
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), './'))

from scales import *
from modes import * 
from colors import *
from inlays import *

class Fret:
    def __init__(self, note, index, color, inlay=' '):
        ''' A Note and a numeric index for which note in a relative scale '''
        self.note = note
        self.index = index
        self.color = color
        self.inlay = inlay

    def indexStr(self):
        return '' if self.index == 0 else str(self.index)

    def noteStr(self, indexOnly=False):
        if indexOnly and self.index == 0:
            return ''
        return str(self.note)

    def fullStr(self, note, index, indexOnly=False):
        noteStr = self.noteStr(indexOnly) if note else ''
        indexStr = self.indexStr() if index else ''
        return '{}{:^4}{}{}{:^4}'.format(str(self.color), noteStr, str(self.inlay), str(self.color), indexStr)

    def __str__(self):
        return self.fullStr(True, True)

    def __repr__(self):
        return self.__str__()


class String:
    def __init__(self, root, fretNum, inlays=None):
        self.root = root
        self.colors = { i: Color() for i in range(13) }
        self.frets = [Fret(root.noteFromOffset(i), 0, Color()) for i in range(fretNum)]
        self.notesInScale = 0
        self.inlays = None
        self.setInlays(inlays)

    def setChromatic(self, chromatic):
        self.notesInScale = chromatic.notesInScale()
        for i in range(len(self.frets)):
            c = i % 12
            self.frets[i].index = chromatic.notes[c]

    def notesStr(self, start, end):
        notes = self.fretsStr(start, end)
        return '{}{:<5} -{}'.format(str(Color()),
                str(self.root), notes.format(*[f.fullStr(True, False) for f in self.frets[start:end]]))

    def notesWithIndexStr(self, start, end):
        notes = self.fretsStr(start, end)
        return '{}{:<5} -{}'.format(str(Color()),
                str(self.root), notes.format(*[f.fullStr(True, False, True) if f.index else ' '*9 for f in self.frets[start:end]]))

    def indexStr(self, start, end):
        notes = self.fretsStr(start, end)
        return '{}{:<5} -{}'.format(str(Color()),
                str(self.root), notes.format(*[f.fullStr(False, True) for f in self.frets[start:end]]))

    def fullStr(self, start, end, indexOnly=False):
        notes = self.fretsStr(start, end)
        return '{}{:<5} -{}'.format(str(Color()),
                str(self.root), notes.format(*[f.fullStr(True, True, indexOnly) for f in self.frets[start:end]]))

    def fretsStr(self, start, end):
        if start == 0:
            return '{}' + str(Color()) + ':' + ('{}' + str(Color()) + '|') * (end - start - 1)
        else:
            return ('{}' + str(Color()) + '|') * (end - start)


    def __str__(self):
        return self.fullStr(0, len(self.frets))

    def __repr__(self):
        return self.__str__()


    def scaleSubset(self, indices, newColors=None):
        '''
        get a string only containing frets with given indices
        '''
        if newColors is None:
            newColors = self.colors
        s = String(self.root, len(self.frets), self.inlays)
        for i in range(len(self.frets)):
            if self.frets[i].index in indices:
                s.frets[i].index = self.frets[i].index
                s.frets[i].color = Color() if s.frets[i].index not in newColors else newColors[s.frets[i].index]
        return s

    def setColors(self, colors):
        for note in colors:
            self.colors[note] = colors[note]
        for fret in self.frets:
            fret.color = self.colors[fret.index]

    def setInlays(self, inlays):
        self.inlays=inlays
        if inlays:
            for i in inlays.frets:
                if i < len(self.frets):
                    self.frets[i].inlay = inlays.frets[i]

class Fretboard:
    def __init__(self, roots, fretNum, inlayPattern=None):
        self.strings = [String(Note.fromStr(root), fretNum) for root in roots]
        self.roots = roots
        self.fretNum = fretNum
        self.notesInScale = 0
        self.setInlayPattern(inlayPattern)

    def setChromatic(self, root, chromatic):
        self.notesInScale = chromatic.notesInScale()
        for string in self.strings:
            offset = root.offset(string.root)
            rot = chromatic.rotate(offset)
            string.setChromatic(rot)

    def setMajor(self, root, major):
        self.setChromatic(root, major.chromatic())

    def notesStr(self, start, end):
        return self.wrapData([s.notesStr(start, end) for s in self.strings], start, end)

    def notesWithIndexStr(self, start, end):
        return self.wrapData([s.notesWithIndexStr(start, end) for s in self.strings], start, end)

    def indexStr(self, start, end):
        return self.wrapData([s.indexStr(start, end) for s in self.strings], start, end)

    def fullStr(self, start, end, indexOnly=False):
        return self.wrapData([s.fullStr(start, end, indexOnly) for s in self.strings], start, end)

    def wrapData(self, data, start, end):
        legend, lines, slines, spaces = self.border(start, end)
        data ='\n'.join(reversed([slines + '\n' + string for string in data]))
        return legend + '\n' + lines + '\n' + spaces + '\n' + data + '\n' + lines + '\n' + spaces + '\n' + legend + reset_code +'\n'


    def border(self, start, end):
        legend = '{:<8}'.format('Fret:') + ''.join(['{:^10}'.format(i) for i in range(start, end)])
        lines = '_' * len(legend)
        slines = '-' * len(legend)
        spaces = ' ' * len(legend)
        return (str(Color()) + l for l in [legend, lines, slines, spaces])

    def str(self, start, end, notes, index):
        if notes and index:
            return self.fullStr(start, end, True)
        elif notes:
            return self.notesWithIndexStr(start, end)
        elif index:
            return self.indexStr(start, end)

    def __str__(self):
        return self.fullStr(0, self.fretNum)

    def __repr__(self):
        return self.__str__()

    def scaleSubset(self, indices, newColors=None):
        f = Fretboard(self.roots, self.fretNum, self.inlayPattern)
        for i in range(len(f.strings)):
            f.strings[i] = self.strings[i].scaleSubset(indices, newColors)
        return f

    def setColors(self, colors):
        self.colors = colors
        for string in self.strings:
            string.setColors(colors)

    def setInlayPattern(self, pattern):
        self.inlayPattern = pattern
        if pattern:
            for string in pattern.allInlays:
                if string < len(self.strings):
                    self.strings[string].setInlays(pattern.allInlays[string])

def parse_args(args = None):
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


def setMajorScale(fretboard, scale, root, colors):
    assert root is not None, 'must give root when giving a scale'
    major_scale = MajorScale([MajorNote.fromStr(s) for s in scale])
    fretboard.setMajor(Note.fromStr(root), major_scale)
    fretboard.setColors(colors)
    return fretboard

def setChromaticScale(retboard, scale, root, colors):
    ''' scale should be 12 len binary list '''
    assert root is not None, 'must give root when giving a scale'
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

def setFromScaleName(fretboard, scale, mode, root, colors):
    assert root is not None, 'must give root when giving a scale'
    assert scale in scales, 'invalid scale name, run modes.py to get a list of valid mode names'
    assert mode in scales[scale], 'invalid mode name, run modes.py to get a list of valid mode names'
    fretboard.setChromatic(Note.fromStr(root), scales[scale][mode].chromatic)
    fretboard.setColors(colors)
    return fretboard

def intervalSubsets(fretboard, subsetBase, intervals, colors):
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


def getFretboardsWithName(args):
    fretboards = []
    colors = {} if not args.color else { int(i): Color(c) for i, c in args.color }
    backgrounds = {} if not args.background else { int(i): Color(bg=c) for i, c in args.background }
    for note in backgrounds:
        colors[note].bg = backgrounds[note].bg
    end = args.frets if args.end is None else args.end
    inlayColor = Color(default_fg if not args.inlay_color else args.inlay_color, args.inlay_background)
    fretboard = Fretboard(args.tuning, args.frets, InlayPattern.SplitTopBottomDots(inlayColor, args.inlay))
    fretboard.setColors(colors)

    if args.major_scale is not None:
        setMajorScale(fretboard, args.major_scale, args.root, colors)
        fretboards.append(('Major Relative Scale Formula {}'.format(args.major_scale), fretboard))
    elif args.chromatic_scale is not None:
        setChromaticScale(fretboard, args.chromatic_scale, args.root, colors)
        fretboards.append(('Chromatic Binary Scale Formula {}'.format(args.chromatic_scale), fretboard))
    elif args.mode_name is not None:
        setFromScaleName(fretboard, args.mode_name[0], args.mode_name[1], args.root, colors)
        fretboards.append(('Mode Name {}'.format(args.mode_name), fretboard))
    if args.subset and args.intervals:
        subsets = intervalSubsets(fretboard, args.subset, args.intervals, colors)
        for intervals, subset in subsets:
            fretboards.append(('Interval Subset ({}):'.format(intervals), subset))
    return fretboards



def main():
    args = parse_args()
    end = args.frets if args.end is None else args.end
    fretboards = getFretboardsWithName(args)
    for name, fretboard in fretboards:
        print(name)
        print(fretboard.str(args.start, end, args.print_notes, args.print_numbers))


if __name__=='__main__':
    main()
