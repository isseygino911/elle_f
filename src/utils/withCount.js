// t() resolves keys only -- it takes no interpolation arguments (see
// LanguageContext). Substituting here keeps that shared signature unchanged
// rather than growing it for the handful of screens that count something, and
// the singular/plural split stays in the dictionary where a translator can see
// both forms.
//
// Callers pick the form and pass it in:
//   count === 1 ? t('x.oneKey') : withCount(t('x.manyKey'), count)
export function withCount(template, count) {
  return template.replace('{count}', String(count))
}
