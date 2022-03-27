/**
 * BEGIN WEB DISPLAY
 */

var Convert = require('ansi-to-html');
var convert = new Convert();
 
function clearSelect(select) {
    var length = select.options.length;
    for (i = length-1; i >= 0; i--) {
      select.options[i] = null;
    }
}

function addColor(i, fg, bg) {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode(`Note ${i}: `));
    // Create an <input> element, set its type and name attributes
    var fgin = document.createElement("select");
    var bgin = document.createElement("select");
    fgin.name = `color_fg_${i}`;
    bgin.name = `color_bg_${i}`;
    fgin.id = `color_fg_${i}`;
    bgin.id = `color_bg_${i}`;
    for (var i in fg_colors) {
        var fg_option = document.createElement("option");
        var bg_option = document.createElement("option");
        fg_option.value = i;
        bg_option.value = i;
        fg_option.text = i;
        bg_option.text = i;
        fgin.appendChild(fg_option);
        bgin.appendChild(bg_option);
    }
    fgin.value = fg
    bgin.value = bg
    app.appendChild(fgin);
    app.appendChild(bgin);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function setColorsFromPreset() {
    var preset = document.getElementById('preset_select').value
    for ( i in color_presets[preset] )
    {
        var fg = document.getElementById(`color_fg_${i}`)
        var bg = document.getElementById(`color_bg_${i}`)
        fg.value = color_presets[preset][i].fg
        fg.text = color_presets[preset][i].fg
        bg.value = color_presets[preset][i].bg
        bg.text = color_presets[preset][i].bg
    }
}

function addColors( colors ) {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode(`Set [foreground, background] color for nth note in scale/interval: `));
    app.appendChild(document.createElement("br"));
    for ( var i in colors ) {
      addColor(i, colors[i].fg, colors[i].bg)
    }
    app.appendChild(document.createTextNode(`Choose color preset: `));
    var preset_select = document.createElement("select");
    preset_select.id = 'preset_select';
    for (var i in color_presets)
    {
        var preset_option = document.createElement("option");
        preset_option.value = i;
        preset_option.text = i;
        preset_select.appendChild(preset_option);
    }
    preset_select.onchange = setColorsFromPreset
    app.appendChild(preset_select); 
    app.appendChild(document.createElement("br"));
}

function addPrintNumbers() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Print Note Numbers: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "checkbox"
    input.id = "print_numbers";
    input.checked = true
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addPrintNotes() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Print Note Letters: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "checkbox"
    input.id = "print_notes";
    input.checked = true
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addButtons( clickf ){
    var app = document.getElementById("app");
    var generate = document.createElement("button");
    generate.id = 'generate';
    generate.textContent = 'Generate';
    generate.onclick = clickf;
    app.appendChild(generate);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addRoot() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Scale Root Note: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "text";
    input.name = "root";
    input.id = "root";
    input.defaultValue = default_scale.root
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addChromaticFormula() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Chromatic Scale Formula: "));
    // Create an <input> element, set its type and name attributes
    var check = document.createElement("input");
    check.type = "radio"
    check.name = "scale_selector";
    check.id = "chromatic_selector";
    check.checked = false
    check.onclick = function() {
      chrombox = document.getElementById('chromatic_formula');
      chrombox.style.display='';
      scalebox = document.getElementById('major_formula');
      scalebox.style.display='none';
      snamebox = document.getElementById('scale_name_select');
      mnamebox = document.getElementById('mode_name_select');
      snamebox.style.display='none';
      mnamebox.style.display='none';
    };

    var input = document.createElement("input");
    input.type = "text"
    input.name = "chromatic_formula";
    input.id = "chromatic_formula";
    input.value = default_scale.chromatic_formula.join(' ')
    input.style.display='none'

    app.appendChild(check);
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}


function addMajorFormula() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Major Scale Formula: "));
    // Create an <input> element, set its type and name attributes
    var check = document.createElement("input");
    check.type = "radio"
    check.name = "scale_selector";
    check.id = "major_selector";
    check.checked = false 
    check.onclick = function() {
      chrombox = document.getElementById('chromatic_formula');
      chrombox.style.display='none';
      scalebox = document.getElementById('major_formula');
      scalebox.style.display='';
      snamebox = document.getElementById('scale_name_select');
      mnamebox = document.getElementById('mode_name_select');
      snamebox.style.display='none';
      mnamebox.style.display='none';
    };

    var input = document.createElement("input");
    input.type = "text"
    input.name = "major_formula";
    input.id = "major_formula";
    input.value = default_scale.major_formula.join(' ')
    input.style.display='none'

    app.appendChild(check);
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function setScaleBox() {
    var scaleBox = document.getElementById(`scale_name_select`)
    clearSelect(scaleBox)
    for (var scale in scales) {
        var option = document.createElement("option");
        option.value = scale;
        option.text = scale;
        scaleBox.appendChild(option)
    }
}

function setModeBox() {
    var modeBox = document.getElementById(`mode_name_select`)
    var scale = document.getElementById(`scale_name_select`).value
    clearSelect(modeBox)
    for (var mode in scales[scale]) {
        var option = document.createElement("option");
        option.value = mode;
        option.text = mode;
        modeBox.appendChild(option)
    }
}

function addScaleName() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Scale/Mode Name: "));
    // Create an <input> element, set its type and name attributes
    var check = document.createElement("input");
    check.type = "radio"
    check.name = "scale_selector";
    check.id = "scale_name_selector";
    check.checked = true
    check.onclick = function() {
      chrombox = document.getElementById('chromatic_formula');
      chrombox.style.display='none';
      scalebox = document.getElementById('major_formula');
      scalebox.style.display='none';
      snamebox = document.getElementById('scale_name_select');
      mnamebox = document.getElementById('mode_name_select');
      snamebox.style.display='';
      mnamebox.style.display='';
    };
    var scaleBox = document.createElement("select");
    var modeBox = document.createElement("select");
    scaleBox.name = `scale_name_select`;
    modeBox.name = `mode_name_select`;
    scaleBox.id = `scale_name_select`;
    modeBox.id = `mode_name_select`;
    scaleBox.onchange = setModeBox

    app.appendChild(check);
    app.appendChild(scaleBox);
    app.appendChild(modeBox);
    // Append a line break
    app.appendChild(document.createElement("br"));
    setScaleBox()
    setModeBox()
}

function addSubsets() {
    var app = document.getElementById("app");
    // Create an <input> element, set its type and name attributes
    var subset = document.createElement("input");
    var intervals = document.createElement("input");
    subset.type = "text";
    subset.name = "subset";
    subset.id = "subset";
    subset.defaultValue = default_scale.subset.join(' ')
    intervals.type = "text";
    intervals.name = "intervals";
    intervals.id = "intervals";
    intervals.defaultValue = default_scale.intervals.join(' ')
    app.appendChild(document.createTextNode("Subset: "));
    app.appendChild(subset);
    app.appendChild(document.createTextNode("Intervals: "));
    app.appendChild(intervals);
    // Append a line break
    app.appendChild(document.createElement("br"));

}

function addRecolorSubsets() {
    var app = document.getElementById("app");
    app.appendChild(document.createTextNode("Recolor Intervals: "));
    // Create an <input> element, set its type and name attributes
    var input = document.createElement("input");
    input.type = "checkbox"
    input.id = "recolor_intervals";
    input.checked = true
    app.appendChild(input);
    // Append a line break
    app.appendChild(document.createElement("br"));
}

function addScaleSelection() {
    addRoot()
    addChromaticFormula()
    addMajorFormula()
    addScaleName()
    addSubsets()
    addRecolorSubsets()
}

