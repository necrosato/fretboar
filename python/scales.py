
class Note:
    '''
    A note as a combination of a letter and accidental (Eb, A#, F, etc)
    '''
    letters = {
            'A': 1,
            'B': 3,
            'C': 4,
            'D': 6,
            'E': 8,
            'F': 9,
            'G': 11,
            }
    accidentals = {
            '#': 1,
            'b': -1,
            '': 0,
            ' ': 0,
            }
    letterVals = dict([(v,k) for k, v in letters.items()])
    def __init__(self, letter, accidental=' '):
        self.letter = letter
        self.accidental = accidental
        self.val = Note.letters[letter] + Note.accidentals[accidental]

    def offset(self, other):
        '''
        returns a positive offsetUp if other is above self, else returns a negative offset down
        '''
        if (self.val < other.val):
            return self.offsetUp(other)
        return self.offsetDown(other) * -1

    def offsetUp(self, other):
        '''
        return the number of semitones to move from this note up to other
        '''
        if (self.val < other.val):
            return other.offsetDown(self)
        return (other.val - self.val) % 12

    def offsetDown(self, other):
        '''
        return the number of semitones to move from this note down to other
        '''
        if (self.val < other.val):
            return other.offsetUp(self)
        return (self.val - other.val) % 12

    def __str__(self):
        return self.letter + self.accidental

    def __repr__(self):
        return self.__str__()

    def fromStr(s):
        assert (len(s) == 1 or len(s) == 2)
        if len(s) == 1:
            assert(s.isalpha())
            return Note(s)
        if s[0] in Note.letters:
            assert(s[1] in Note.accidentals)
            return Note(s[0], s[1])
        assert(s[0] in Note.accidentals)
        assert(s[1] in Note.letters)
        return Note(s[1], s[0])


    def noteFromOffset(self, offset):
        val = (self.val + offset) % 12
        if val in Note.letterVals:
            return Note(Note.letterVals[val])
        val = (val + 1) % 12
        return Note(Note.letterVals[val], 'b')

    def semitoneUp(self):
        if (self.val + 1) in Note.letterVals:
            return Note(Note.letterVals[self.val + 1])
        return Note(Note.letterVals[self.val], '#')

    def semitoneDown(self):
        if (self.val - 1) in Note.letterVals:
            return Note(Note.letterVals[self.val - 1])
        return Note(Note.letterVals[self.val], 'b')



class ChromaticScale:
    '''
    A representation of a scale as the 12 chromatic notes
    '''
    def __init__(self, notes = []):
        if not notes:
            self.notes = [0] * 12
        else:
            assert len(notes) == 12
            self.notes = notes

    def notesInScale(self):
        return len(self.notes) - self.notes.count(0)

    def __str__(self):
        return str(self.notes)

    def __repr__(self):
        return self.__str__()

    def rotate(self, semitones):
        '''
        return a rotated scale, cutting of the first n semitones and moving them to the end,
        or moving the last n seminotes to the beginning if value is negative
        '''
        return ChromaticScale(self.notes[semitones:] + self.notes[:semitones])


class MajorNote:
    '''
    MajorNote represets a position relative to any diatonic Ionian I
    given by an Ionian scale note number and optional accidental to
    achieve all 12 chromatic notes
    '''
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
    def __init__(self, num, accidentals = []):
        self.num = num
        self.accidentals = accidentals
        #the position of this note on the chromatic scale (1 indexed)
        self.chromatic = MajorNote.numToChromatic[num] + sum([MajorNote.accidentalToChromatic[a] for a in accidentals])
        self.chromaticMod = 12 if self.chromatic % 12 == 0 else self.chromatic % 12

    def __str__(self):
        return str(self.num) + ''.join(self.accidentals)

    def __repr__(self):
        return self.__str__()

    def fromStr(s):
        num = 0
        acc = []
        for c in s:
            if c.isnumeric():
                num = int(c)
            else:
                acc.append(c)
        return MajorNote(num, acc)


class MajorScale:
    '''
    A representation of a scale as a list of MajorNotes
    '''
    def __init__(self, notes):
        self.notes = notes

    def chromatic(self):
        chromatic = ChromaticScale()
        for i in range(len(self.notes)):
            chromatic.notes[self.notes[i].chromaticMod - 1] = i + 1
        return chromatic

    def __str__(self):
        return str(self.notes)

    def __repr__(self):
        return self.__str__()


def testMajorNote():
    notes = []
    for i in range(1, 8):
        notes.append(MajorNote(i))
        notes.append(MajorNote(i, ['#']))
    for note in notes:
        print('{} : {}'.format(note, note.chromaticMod))

def testMajorChromatic():
    notes = []
    for i in range(1, 8):
        notes.append(MajorNote(i))
    major = MajorScale(notes)
    print(major)
    print(major.chromatic())
    print(major.chromatic().rotate(2))
    print(major.chromatic().rotate(-2))

def testNoteOffset():
    a = Note('A')
    e = Note('E')
    f = Note('F')
    g = Note('G')
    gs = Note('G', '#')
    print(a.offset(e))
    print(a.offsetUp(e))
    print(a.offsetDown(e))
    print(a.offsetUp(gs))
    print(a.offsetDown(gs))
    print(g.offsetUp(e))
    print(g.offsetDown(e))
    print(a.offset(e))
    print(gs.offset(a))
    print(a.offset(gs))

def testNoteFromOffset():
    a = Note('A')
    e = Note('E')
    f = Note('F')
    g = Note('G')
    gs = Note('G', '#')
    for i in range(24):
        print(e.noteFromOffset(i))


def main():
    testNoteFromOffset()

if __name__=='__main__':
    main()
