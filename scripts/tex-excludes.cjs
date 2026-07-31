const TEX_EXCLUDES = [
  // hyph-ar.tex, hyph-eo.tex, hyph-fa.tex, hyph-he.tex, hyph-vi.tex
  //   fail the tex2js eval() translator (TeX macros: \nom{}, \ver{}, \adj{})
  //   and would produce empty pattern files.
  // hyph-grc-x-ibycus.tex
  //   has no \patterns{} marker, so it cannot be compiled by build-patterns.
  "hyph-ar.tex",
  "hyph-eo.tex",
  "hyph-fa.tex",
  "hyph-grc-x-ibycus.tex",
  "hyph-he.tex",
  "hyph-vi.tex"
];

module.exports = { TEX_EXCLUDES };
