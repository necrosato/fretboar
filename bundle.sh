#!/bin/bash

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
JSDIR="$SCRIPTDIR/js"
JS=(
  "$JSDIR/fretboard.js"
  "$JSDIR/keyboard.js"
  "$JSDIR/colors.js"
  "$JSDIR/inlays.js"
  "$JSDIR/helpers.js"
  "$JSDIR/scales.js"
  "$JSDIR/inote.js"
  "$JSDIR/inotesequence.js"
  "$JSDIR/shared_site.js"
  "$JSDIR/fretboar_site.js"
  "$JSDIR/pianotroll_site.js"
  )
JSENTRY="$JSDIR/entry.js"

JSBUNDLE="$JSDIR/bundle.js"
JSLIB="$JSDIR/lib.js"
rm -f "$JSLIB"
for f in ${JS[@]}; do
  cat "$f" >> "$JSLIB"
done
cat "$JSENTRY" >> "$JSLIB"

browserify "$JSLIB" -o "$JSBUNDLE" 
