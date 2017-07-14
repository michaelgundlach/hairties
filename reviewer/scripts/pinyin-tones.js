// Convert a pinyin string into an array of tones.
// Example:
// "Yùxí xīn kè de shēng cí , yào huì dú huì xiě" becomes
// [4,2,1,4,5,1,2,4,4,2,4,3]
// If it can't figure it out, it returns null.
//
// Does not support fifth tone syllables mid-word.
//   e.g. yao4 ti wen2 -> [4,5,2]
//        yao4tiwen2 -> failure
// Does not support fifth-tone syllables starting with a vowel.
//   e.g. yao4ti -> [4,2]
//        yao4a -> failure
function tonesInPinyin(pinyin) {
    var tones = {
      'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4,
      'ē': 1, 'é': 2, 'ě': 3, 'è': 4,
      'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4,
      'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4,
      'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4,
      'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    };
  var syllable_re = /([BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz]|sh|zh|ch|Sh|Zh|Ch)+[aeiouüāáǎàēéěèūúǔùīíǐìōóǒòǖǘǚǜ]{1,2}(n?g?)[^bcdfghjklmnpqrstvwxyzaeiouüāáǎàēéěèūúǔùīíǐìōóǒòǖǘǚǜ]*/g;
  var syllables = pinyin.match(syllable_re);
  var syllables_and_tones = syllables.map(syl => {
    var syl_tones = syl.split('').map(c=>tones[c]).filter(c=>c);
    if (syl_tones.length > 1) {
      // Somehow two tone marks in one syllable; we don't know what to do
      return [syl, 0];
    }
    if (syl_tones.length === 0) {
      return [syl, 5]; // e.g. "de "
    }
    return [syl, syl_tones[0]];
  });
  return syllables_and_tones;
}
