# FreeSerif Arabic subset

Source: GNU FreeFont, release 20120503, FreeSerif.ttf.
Download: https://ftp.gnu.org/gnu/freefont/freefont-ttf-20120503.zip

License: GNU GPL v3 or later with the GNU FreeFont font embedding exception (see FreeFont-README.txt and FreeFont-COPYING.txt). Attribution is preserved in FreeFont-AUTHORS.txt and FreeFont-CREDITS.txt.

`free-serif-arabic.woff2` is a subset of FreeSerif, generated using fontTools 4.60.2 with all shaping features retained. Unicode coverage: U+0020–007F, U+0600–06FF, U+0750–077F, U+08A0–08FF, U+FB50–FDFF, U+FE70–FEFF.

Reproduce with:

```sh
python3 -m fontTools.subset FreeSerif.ttf --output-file=free-serif-arabic.woff2 --unicodes=U+0020-007F,U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF --flavor=woff2 --layout-features='*'
```
