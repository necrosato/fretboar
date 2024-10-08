function fretboarSite() {

/**
 * BEGIN ARGS
 */

var default_args = {
    'tuning': ['E', 'A', 'D', 'G', 'B', 'E'],
    'frets': 24,
    'start': 0,
    'end': null,
    'print_notes': true,
    'print_numbers': true,
    
    'colors': color_presets['default'],
    'scale': {
        'root': null,
        'major_formula': null,
        'chromatic_formula': null,
        'name': null,
        'subset': null,
        'intervals': null,
        'recolor_intervals': false,
        'print_full_scale': false
    },
    'inlay': {
        'pattern': null,
        'color': new Color('', '')
    },
    'name': ''
}

function getArgs()
{
    args = JSON.parse(JSON.stringify(default_args))
    args.tuning = removeItemAll(document.getElementById('tuning').value.split(' '), '')
    args.frets = parseInt(document.getElementById('frets').value) + 1
    args.start = parseInt(document.getElementById('start').value)
    args.end = parseInt(document.getElementById('end').value) + 1
    args.print_numbers = document.getElementById('print_numbers').checked
    args.print_notes = document.getElementById('print_notes').checked

    for (var i in default_args.colors) {
        var fg_color = document.getElementById(`color_fg_${i}`).value
        var bg_color = document.getElementById(`color_bg_${i}`).value
        args.colors[i] = new Color(fg_color, bg_color)
    }

    args.scale.root = document.getElementById('root').value
    if (document.getElementById('chromatic_selector').checked) {
        chromatic_binary = []
        removeItemAll(document.getElementById('chromatic_formula').value.split(' '), '').forEach(function(i) {
            chromatic_binary.push(parseInt(i))
        })
        args.scale.chromatic_formula = chromatic_binary
    } else if (document.getElementById('major_selector').checked) {
        args.scale.major_formula = removeItemAll(document.getElementById('major_formula').value.split(' '), '')
    } else if (document.getElementById('scale_name_selector').checked) {
        args.scale.name = [document.getElementById('scale_name_select').value, document.getElementById('mode_name_select').value]
    }

    args.inlay.pattern = '*'
    args.inlay.color = new Color(default_fg, '')
    subset = removeItemAll(document.getElementById('subset').value.split(' '), '')
    intervals = removeItemAll(document.getElementById('intervals').value.split(' '), '')
    recolor_intervals = document.getElementById('recolor_intervals').checked
    print_full_scale = document.getElementById('print_full_scale').checked
    args.scale.subset = subset.map(numStr => parseInt(numStr))
    args.scale.intervals = intervals.map(numStr => parseInt(numStr))
    args.scale.recolor_intervals = recolor_intervals
    args.scale.print_full_scale = print_full_scale
    args.name = "args_" + args.scale.root + "_" + args.scale.name
    console.log(args)
    return args
}

function setArgs(text)
{
    args = JSON.parse(text)
    for ( var i in args.colors )
    {
        args.colors[i] = Color.copy( args.colors[i] )
    }
    args.inlay.color = Color.copy( args.inlay.color );
    console.log(args)
    default_args = args
    setDocumentFromArgs( args );
    generateFretboards( args, true );
}

/**
 * END ARGS
 */

/**
 * BEGIN WEB DISPLAY
 */

function addTuning() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("String Tunings: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "text";
    input.name = "tuning";
    input.id = "tuning";
    input.defaultValue = default_args.tuning.join(' ')
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addFrets() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Frets: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "frets";
    input.id = "frets";
    for (var i = 0; i <=24; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        input.appendChild(option);
    }
    input.selectedIndex= default_args.frets
    input.onchange = setStartEndFromFrets
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function setStartFromFrets() {
    start = document.getElementById('start')
    oldStart = start.selectedIndex < 0 ? 0 : start.selectedIndex
    clearSelect(start)
    var maxStart = document.getElementById('frets').value
    for (var i = 0; i <= maxStart; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        start.appendChild(option);
    }
    start.selectedIndex = oldStart > maxStart ? maxStart : oldStart
}

function setEndFromFrets() {
    end = document.getElementById('end')
    var maxEnd = document.getElementById('frets').value
    var minEnd = parseInt(document.getElementById('start').value)
    clearSelect(end)
    for (var i = minEnd; i <= maxEnd; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        end.appendChild(option);
    }
    end.selectedIndex = maxEnd-minEnd
}

function setStartEndFromFrets() {
    setStartFromFrets()
    setEndFromFrets()
}

function addStart() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Start Fret: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "start";
    input.id = "start";
    input.onchange = setEndFromFrets
    app.appendChild(input);
    setStartFromFrets()
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addEnd() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("End Fret: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "end";
    input.id = "end";
    app.appendChild(input);
    setEndFromFrets()
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addOutputArgs() {
    addTuning()
    addFrets()
    addStart()
    addEnd()
    addPrintNumbers()
    addPrintNotes()
    addColors( default_args.colors )
}

function generateFretboards( args, append=false ) {
    fretboards = getFretboardsWithName(args)
    var data = ''
    for (i in fretboards) {
        var name = fretboards[i][0]
        var fretboard = fretboards[i][1]
        data += reset_code + name +'\n'
        data += fretboard.fullStr(args.start, args.end, args.print_notes, args.print_numbers, true) +'\n'
    }
    if (!append) { document.getElementById('fretboard').innerHTML = ''; }
    document.getElementById('fretboard').innerHTML += convert.toHtml(data)
}

function addFretboardOutput(){
    // Container <div> where dynamic content will be placed
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Fretboard output: "));
    app.appendChild(document.createElement("br"));
    var fretboardOutput = document.createElement("pre");
    fretboardOutput.id = "fretboard";
    app.appendChild(fretboardOutput);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

document.title = 'fretboar'
document.querySelector('h1').textContent = 'fretboar'
addOutputArgs()
addScaleSelection()
addButtons( function(){ generateFretboards( getArgs() ) }, getArgs, setArgs )
addFretboardOutput()

}
