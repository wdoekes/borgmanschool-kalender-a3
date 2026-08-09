#!/bin/sh
# Requires: imagemagick, exiftran, libjpeg-turbo-progs (for jpegtran)
set -eu

maybe_convert() {
    local fn="$1"
    identify -format '%[fx:w>1920||h>1920] %[interlace] %[orientation]\n' "$fn[0]" | {
        local big il or
        read big il or
        if test "$big" = 1; then
            convert "$fn" -auto-orient -resize '1920x1920>' \
                    -interlace none -sampling-factor 4:2:0 -quality 95 "tmp-$fn" &&
                mv "tmp-$fn" "$fn" &&
                echo "$fn: resampled"
        elif test "$il" != None || { test "$or" != TopLeft && test "$or" != Undefined; }; then
            exiftran -ai "$fn" 2>/dev/null &&
                jpegtran -copy all -optimize -outfile "tmp-$fn" "$fn" &&
                mv "tmp-$fn" "$fn" &&
                echo "$fn: rotate/strip"
	else
            echo "$fn: unchanged"
        fi
    }
}

for f in "$@"; do
    maybe_convert "$f"
done
