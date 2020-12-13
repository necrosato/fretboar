import sys
import os
import functools
sys.path.append(os.path.join(os.path.dirname(__file__), './'))

from scales import *


@functools.total_ordering
class Mode:
    def __init__(self, name, chromatic, num):
        self.name = name
        self.chromatic = chromatic 
        self.num = num

    def __str__(self):
        return self.name + ': ' + str(self.chromatic)

    def __repr__(self):
        return self.__str__()

    def __eq__(self, other):
        return self.num == other.num

    def __lt__(self, other):
        return self.num < other.num

scales = {}
pentatonicBase = ChromaticScale([1, 0, 2, 0, 3, 0, 0, 4, 0, 5, 0, 0])
majorBase = ChromaticScale([1, 0, 2, 0, 3, 4, 0, 5, 0, 6, 0, 7])
harmonicMinorBase = ChromaticScale([1, 0, 2, 3, 0, 4, 0, 5, 6, 0, 0, 7])
melodicMinorBase = ChromaticScale([1, 0, 2, 3, 0, 4, 0, 5, 0, 6, 0, 7])
diminishedBase = ChromaticScale([1, 0, 2, 3, 0, 4, 5, 0, 6, 7, 0, 8])
wholeToneBase = ChromaticScale([1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0])
inFormula = ['1', 'b2', '4', '5', 'b6']
insenFormula = ['1', 'b2', '4', '5', 'b7']
iwatoFormula = ['1', 'b2', '4', 'b5', 'b7']
yoFormula = ['1', '2', '4', '5', '6']
hirajoshiFormula = ['1', '2', 'b3', '5', 'b6']
ryukyuFormula = ['1', '3', '4', '5', '7']

def addMode(scale, name, chromatic, num):
    scales[scale][name] = Mode(name, chromatic, num)

def addScale(scale, modes, base):
    assert len(modes) <= base.notesInScale()
    if scale not in scales:
        scales[scale] = {}
    ni = 0
    for i in range(len(base.notes)):
        if base.notes[i] != 0:
            chromatic = []
            j = 1
            for k in base.rotate(i).notes:
                if k == 0:
                    chromatic.append(k)
                else:
                    chromatic.append(j)
                    j+=1
            addMode(scale, modes[ni], ChromaticScale(chromatic), ni)
            ni += 1
        if ni == len(modes):
            return

def addScaleMajorFormula(scale, modes, majorFormula):
    majorScale = MajorScale([MajorNote.fromStr(s) for s in majorFormula])
    base = majorScale.chromatic()
    addScale(scale, modes, base)


addScale('major',
        ['ionian',
         'dorian',
         'phrygian',
         'lydian',
         'mixolydian',
         'aeolian',
         'locrian'
         ], majorBase)


addScale('pentatonic', ['pentatonic_' + str(i+1) for i in range(pentatonicBase.notesInScale())], pentatonicBase)
addScale('harmonic_minor', ['harmonic_minor_' + str(i+1) for i in range(harmonicMinorBase.notesInScale())], harmonicMinorBase)
addScale('melodic_minor', ['melodic_minor_' + str(i+1) for i in range(harmonicMinorBase.notesInScale())], melodicMinorBase)
addScale('diminished', ['diminished'], diminishedBase)
addScale('whole_tone', ['whole_tone'], wholeToneBase)
addScaleMajorFormula('in', [str(i+1) for i in range(len(inFormula))], inFormula)
addScaleMajorFormula('insen', [str(i+1) for i in range(len(insenFormula))], insenFormula)
addScaleMajorFormula('iwato', [str(i+1) for i in range(len(iwatoFormula))], iwatoFormula)
addScaleMajorFormula('yo', [str(i+1) for i in range(len(yoFormula))], yoFormula)
addScaleMajorFormula('hirajoshi', [str(i+1) for i in range(len(hirajoshiFormula))], hirajoshiFormula)
addScaleMajorFormula('ryukyu', [str(i+1) for i in range(len(ryukyuFormula))], ryukyuFormula)

def main():
    print('Available scales:')
    for scale in sorted(scales):
        print('{} scale modes:'.format(scale))
        for name, mode in sorted(scales[scale].items(), key=lambda item: item[1]):
            print('\t{}'.format(mode))


if __name__=='__main__':
    main()
