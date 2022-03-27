function pianotrollSite() {

/**
 * BEGIN ARGS
 */

var default_args = {
    'keys': 88,
    'start': 0,
    'end': null,
    'print_notes': true,
    'print_numbers': true,
    
    'colors': color_presets['empty'],
    'scale': {
        'root': null,
        'major_formula': null,
        'chromatic_formula': null,
        'name': null,
        'subset': null,
        'intervals': null,
        'recolor_intervals': false 
    }
}

default_scale = {
    'root': 'A',
    'chromatic_formula': [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
    'major_formula': ['1', '2', '3', '4', '5', '6', '7'],
    'name': ['major', 'ionian'],
    'subset': [1, 3, 5],
    'intervals': [1, 2, 3, 4, 5, 6, 7] 
}

/**
 * END ARGS
 */

/**
 * BEGIN WEB DISPLAY
 */

function addKeys() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Keys: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "keys";
    input.id = "keys";
    for (var i = 1; i <=88; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        input.appendChild(option);
    }
    input.selectedIndex= default_args.keys-1
    input.onchange = setStartEndFromKeys
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function setStartFromKeys() {
    start = document.getElementById('start')
    oldStart = start.selectedIndex < 0 ? 0 : start.selectedIndex
    clearSelect(start)
    var maxStart = document.getElementById('keys').value - 1
    for (var i = 0; i <= maxStart; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        start.appendChild(option);
    }
    start.selectedIndex = oldStart > maxStart ? maxStart : oldStart
}

function setEndFromKeys() {
    end = document.getElementById('end')
    var maxEnd = document.getElementById('keys').value
    var minEnd = parseInt(document.getElementById('start').value) + 1
    clearSelect(end)
    for (var i = minEnd; i <= maxEnd; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        end.appendChild(option);
    }
    end.selectedIndex = maxEnd-minEnd
}

function setStartEndFromKeys() {
    setStartFromKeys()
    setEndFromKeys()
}

function addStart() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Start Key: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "start";
    input.id = "start";
    input.onchange = setEndFromKeys
    app.appendChild(input);
    setStartFromKeys()
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addEnd() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("End Key: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("select");
    input.name = "end";
    input.id = "end";
    app.appendChild(input);
    setEndFromKeys()
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addOutputArgs() {
    addKeys()
    addStart()
    addEnd()
    addPrintNumbers()
    addPrintNotes()
    addColors( default_args.colors )
}

function generateKeyboards() {
    var data = ''
    args = JSON.parse(JSON.stringify(default_args))
    args.keys = parseInt(document.getElementById('keys').value)
    args.start = parseInt(document.getElementById('start').value)
    args.end = parseInt(document.getElementById('end').value)
    args.print_numbers = document.getElementById('print_numbers').checked
    args.print_notes = document.getElementById('print_notes').checked

    for (var i in default_args.colors) {
        var fg_color = document.getElementById(`color_fg_${i}`).value
        var bg_color = document.getElementById(`color_bg_${i}`).value
        args.colors[i] = [fg_color, bg_color]
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

    subset = removeItemAll(document.getElementById('subset').value.split(' '), '')
    intervals = removeItemAll(document.getElementById('intervals').value.split(' '), '')
    recolor_intervals = document.getElementById('recolor_intervals').checked
    args.scale.subset = subset.map(numStr => parseInt(numStr))
    args.scale.intervals = intervals.map(numStr => parseInt(numStr))
    args.recolor_intervals = recolor_intervals
    console.log(args)
    fretboards = getKeyboardsWithName(args)
    for (i in fretboards) {
        var name = fretboards[i][0]
        var fretboard = fretboards[i][1]
        data += reset_code + name +'\n'
        data += fretboard.fullStr(args.start, args.end, args.print_notes, args.print_numbers, true) +'\n'
    }
    document.getElementById('fretboard').innerHTML = convert.toHtml(data)
}

function addKeyboardOutput(){
    // Container <div> where dynamic content will be placed
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Keyboard output: "));
    app.appendChild(document.createElement("br"));
    var fretboardOutput = document.createElement("pre");
    fretboardOutput.id = "fretboard";
    app.appendChild(fretboardOutput);
    // Append a line break
    app.appendChild(document.createElement("br"));
}
addOutputArgs()
addScaleSelection()
addButtons( generateKeyboards )
addKeyboardOutput()

}
