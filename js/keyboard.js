function wkeycol() { return new Color('black', 'white') }
function bkeycol() { return new Color('white', 'black') }
var wstarts = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0]
function numWhites(n) {
    var nwhites = 0
    for (var i = 0; i < n; i++)
    {
        if (wstarts[i % 12])
        {
            nwhites++
        }
    }
    return nwhites
}
function numBlacks(n) {
    return n - numWhites(n)
}

class Keyboard {
    constructor(keyNum) {
        this.keyNum = keyNum
        this.wroot = Note.fromStr('A')
        this.broot = Note.fromStr('A#')
        this.whites = new WhiteKeys(this.wroot, numWhites(keyNum))
        this.whites.setColorsByPosition({1: wkeycol()})
        this.blacks = new BlackKeys(this.broot, numBlacks(keyNum))
        this.blacks.setColorsByPosition({1: bkeycol()})
        this.notesInScale = 0
        this.planes = [this.whites, this.blacks]
    }

    fullStr(start, end, printNoteLetters, printNoteNumbers, posIndexOnly) {
        var wstart = numWhites(start)
        var bstart = numBlacks(start)
        var wend = numWhites(end)
        var bend = numBlacks(end)
        var data = []
        var bpre = []
        var wpre = ''
        var i = start % 12
        if (wstarts[i]) {
            while (wstarts[i]) {
                bpre.push(wkeycol() + '     ')
                i = (i + 1) % 12
            }
            if (bpre.length == 2) {
                bpre[0] += '    '
            }
        } else {
            wpre += reset_code + '     '
        }
        data.push(bpre.join('|') + this.blacks.fullStr(bstart, bend, printNoteLetters, printNoteNumbers, posIndexOnly));
        data.push(wpre + this.whites.fullStr(wstart, wend, printNoteLetters, printNoteNumbers, posIndexOnly));
        return data.join('\n')
    }

    setChromatic(root, chromatic) {
        this.notesInScale = chromatic.notesInScale()
        for (i in this.planes) {
            var offset = root.offsetUp(this.planes[i].root)
            var rot = chromatic.rotate(offset)
            this.planes[i].setChromatic(rot)
        }
    }

    setMajor(root, major) {
        this.setChromatic(root, major.chromatic())
    }

    scaleSubset(indices, wcolors, bcolors) {
        var k = new Keyboard(this.keyNum)
        k.whites = this.whites.scaleSubset(indices, wcolors)
        k.blacks = this.blacks.scaleSubset(indices, bcolors)
        return k
    }

    setColors(wcolors, bcolors) {
        this.wcolors = wcolors
        this.bcolors = bcolors
        this.whites.setColorsByScaleIndex(wcolors)
        this.blacks.setColorsByScaleIndex(bcolors)
    }


  setMajorScale(formula, root) {
      var majorNotes = []
      formula.forEach(function(s){ majorNotes.push(MajorNote.fromStr(s)) })
      var major_scale = new MajorScale(majorNotes)
      this.setMajor(Note.fromStr(root), major_scale)
  }

  setChromaticScale(scale, root) {
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
      this.setChromatic(Note.fromStr(root), new ChromaticScale(chromatic_notes))
  }

  setFromScaleName(scale, mode, root) {
      this.setChromatic(Note.fromStr(root), scales[scale][mode].chromatic)
  }

  intervalSubsets(subsetBase, intervals, recolor) {
      var distances = []
      for (var i = 1; i < subsetBase.length; i++) {
          distances.push(subsetBase[i] - subsetBase[i-1])
      }
      var offset = subsetBase[0] - 1
      var subsets = []
      var k = this
      intervals.forEach(function(i) {
          var subset = [i+offset]
          distances.forEach(function(d) {
              if ((subset[subset.length-1] + d) == k.notesInScale) {
                  subset.push(k.notesInScale)
              } else {
                  subset.push((subset[subset.length-1] + d) % k.notesInScale)
              }
          })
          var wintervalColors = {}
          var bintervalColors = {}
          for (var j = 0; j < subset.length; j++) {
              var s = subset[j] 
              var sb = subsetBase[j] 
              if (recolor) {
                  wintervalColors[s] = sb in k.wcolors ? k.wcolors[sb] : wkeycol()
              } else {
                  wintervalColors[s] = s in k.wcolors ? k.wcolors[s] : wkeycol()
              }
              if (recolor) {
                  bintervalColors[s] = sb in k.bcolors ? k.bcolors[sb] : bkeycol()
              } else {
                  bintervalColors[s] = s in k.bcolors ? k.bcolors[s] : bkeycol()
              }
          }
          subsets.push([subset, k.scaleSubset(subset, wintervalColors, bintervalColors)])
      })
      return subsets
  }

}

function getKeyboardsWithName(args) {
    var keyboards = []
    var wcolors = {}
    var bcolors = {}
    for (i in args.colors) {
        if (args.colors[i][0] != '') {
          if (args.colors[i][1] == 0)
          {
            wcolors[i] = new Color(args.colors[i][0], 'white')
            bcolors[i] = new Color(args.colors[i][0], 'black')
          }
          else
          {
            wcolors[i] = new Color(args.colors[i][0], args.colors[i][1])
            bcolors[i] = new Color(args.colors[i][0], args.colors[i][1])
          }
        }
        else if (args.colors[i][1] != '')
        {
            wcolors[i] = new Color('black', args.colors[i][1])
            bcolors[i] = new Color('white', args.colors[i][1])
        }
    }
    end = args.end == null ? args.keys : args.end
    keyboard = new Keyboard(args.keys)

    if (args.scale.major_formula != null) {
        keyboard.setMajorScale(args.scale.major_formula, args.scale.root)
        keyboard.setColors(wcolors, bcolors)
        keyboards.push([`Major Relative Scale Formula ${args.scale.major_formula}`, keyboard])
    } else if (args.scale.chromatic_formula != null) {
        keyboard.setChromaticScale(args.scale.chromatic_formula, args.scale.root)
        keyboard.setColors(wcolors, bcolors)
        keyboards.push([`Chromatic Binary Scale Formula ${args.scale.chromatic_formula}`, keyboard])
    } else if (args.scale.name != null) {
        keyboard.setFromScaleName(args.scale.name[0], args.scale.name[1], args.scale.root)
        keyboard.setColors(wcolors, bcolors)
        keyboards.push([`Mode Name ${args.scale.name}`, keyboard])
    }
    if ( !args.scale.print_full_scale )
    {
        keyboards = []
    }
    if (args.scale.subset && args.scale.intervals) {
        var subsets = keyboard.intervalSubsets(args.scale.subset, args.scale.intervals, args.scale.recolor_intervals)
        for (i in subsets) {
            var intervals = subsets[i][0]
            var subset = subsets[i][1]
            keyboards.push([`Interval Subset (${intervals})`, subset])
        }
    }
    return keyboards
}
