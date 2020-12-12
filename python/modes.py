import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), './'))

from scales import *


class Mode:
    def __init__(self, name, chromatic):
        self.name = name
        self.chromatic = chromatic 

    def __str__(self):
        return self.name + ': ' + str(self.chromatic)

    def __repr__(self):
        return self.__str__()

scales = {}
pentatonicBase = ChromaticScale([1, 0, 2, 0, 3, 0, 0, 4, 0, 5, 0, 0])
majorBase = ChromaticScale([1, 0, 2, 0, 3, 4, 0, 5, 0, 6, 0, 7])
harmonicMinorBase = ChromaticScale([1, 0, 2, 3, 0, 4, 0, 5, 6, 0, 0, 7])
melodicMinorBase = ChromaticScale([1, 0, 2, 3, 0, 4, 0, 5, 0, 6, 0, 7])
diminishedBase = ChromaticScale([1, 0, 2, 3, 0, 4, 5, 0, 6, 7, 0, 8])
wholeToneBase = ChromaticScale([1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0])

def addMode(scale, name, chromatic):
    scales[scale][name] = Mode(name, chromatic)

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
            addMode(scale, modes[ni], ChromaticScale(chromatic))
            ni += 1
        if ni == len(modes):
            return


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
modes = {}
for s in scales:
    for name in scales[s]:
        modes[name] = scales[s][name]


def main():
    print('Available modes:')
    for mode in sorted(modes):
        print(modes[mode])


if __name__=='__main__':
    main()
