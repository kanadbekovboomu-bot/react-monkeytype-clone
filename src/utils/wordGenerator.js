// 500+ Curated high-frequency English words for speed typing tests
export const WORD_POOL = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "great", "between", "need", "large", "under", "never", "each", "right", "world", "area",
  "very", "same", "place", "home", "around", "small", "end", "begin", "life", "always",
  "call", "side", "find", "head", "stand", "own", "page", "should", "country", "found",
  "answer", "school", "grow", "study", "still", "learn", "plant", "cover", "food", "sun",
  "four", "state", "keep", "eye", "never", "last", "let", "thought", "city", "tree",
  "cross", "farm", "hard", "start", "might", "story", "saw", "far", "sea", "draw",
  "left", "late", "run", "press", "close", "night", "real", "life", "few", "north",
  "open", "seem", "together", "next", "white", "children", "begin", "got", "walk", "example",
  "ease", "paper", "group", "always", "music", "those", "both", "mark", "often", "letter",
  "until", "mile", "river", "car", "feet", "care", "second", "book", "carry", "took",
  "science", "eat", "room", "friend", "began", "idea", "fish", "mountain", "stop", "once",
  "base", "hear", "horse", "cut", "sure", "watch", "color", "face", "wood", "main",
  "enough", "plain", "girl", "usual", "young", "ready", "above", "ever", "red", "list",
  "though", "feel", "talk", "bird", "soon", "body", "dog", "family", "direct", "pose",
  "leave", "song", "measure", "door", "product", "black", "short", "numeral", "class", "wind",
  "question", "happen", "complete", "ship", "area", "half", "rock", "order", "fire", "south",
  "problem", "piece", "told", "knew", "pass", "since", "top", "whole", "king", "space",
  "heard", "best", "hour", "better", "true", "during", "hundred", "five", "remember", "step",
  "early", "hold", "west", "ground", "interest", "reach", "fast", "verb", "sing", "listen",
  "six", "table", "travel", "less", "morning", "ten", "simple", "several", "vowel", "toward",
  "war", "lay", "against", "pattern", "slow", "center", "love", "person", "money", "serve",
  "appear", "road", "map", "rain", "rule", "govern", "pull", "cold", "notice", "voice",
  "unit", "power", "town", "fine", "certain", "fly", "fall", "lead", "cry", "dark",
  "machine", "note", "wait", "plan", "figure", "star", "box", "noun", "field", "rest",
  "correct", "able", "pound", "done", "beauty", "drive", "stood", "contain", "front", "teach",
  "week", "final", "gave", "green", "quick", "develop", "ocean", "warm", "free", "minute",
  "strong", "special", "mind", "behind", "clear", "tail", "produce", "fact", "street", "inch",
  "multiply", "nothing", "course", "stay", "wheel", "full", "force", "blue", "object", "decide",
  "surface", "deep", "moon", "island", "foot", "system", "busy", "test", "record", "boat",
  "common", "gold", "possible", "plane", "stead", "dry", "wonder", "laugh", "thousand", "ago",
  "ran", "check", "game", "shape", "equate", "hot", "miss", "brought", "heat", "snow",
  "tire", "bring", "yes", "distant", "fill", "east", "paint", "language", "among", "grand",
  "ball", "yet", "wave", "drop", "heart", "am", "present", "heavy", "dance", "engine",
  "position", "arm", "wide", "sail", "material", "size", "vary", "settle", "speak", "weight",
  "general", "ice", "matter", "circle", "pair", "include", "divide", "syllable", "felt", "perhaps",
  "pick", "sudden", "count", "square", "reason", "length", "represent", "art", "subject", "region",
  "energy", "hunt", "probable", "bed", "brother", "egg", "ride", "cell", "believe", "fraction",
  "forest", "sit", "race", "window", "store", "summer", "train", "sleep", "prove", "lone",
  "leg", "exercise", "wall", "catch", "mount", "wish", "sky", "board", "joy", "winter",
  "sat", "written", "wild", "instrument", "kept", "glass", "grass", "cow", "job", "edge",
  "sign", "visit", "past", "soft", "fun", "bright", "gas", "weather", "month", "million",
  "bear", "finish", "happy", "hope", "flower", "clothe", "strange", "gone", "jump", "baby",
  "eight", "village", "meet", "root", "buy", "raise", "solve", "metal", "whether", "push",
  "seven", "paragraph", "third", "shall", "held", "hair", "describe", "cook", "floor", "either",
  "result", "burn", "hill", "safe", "cat", "century", "consider", "type", "law", "bit",
  "coast", "copy", "phrase", "silent", "tall", "sand", "soil", "roll", "temperature", "finger",
  "industry", "value", "fight", "lie", "beat", "excite", "natural", "view", "sense", "ear",
  "else", "quite", "broke", "case", "middle", "kill", "son", "lake", "moment", "scale",
  "loud", "spring", "observe", "child", "straight", "consonant", "nation", "dictionary", "milk", "speed",
  "method", "organ", "pay", "age", "section", "dress", "cloud", "surprise", "quiet", "stone"
];

const PUNCTUATION_MARKS = [".", ",", "!", "?", ";", ":", "-", "'"];
const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "42", "100", "2026", "365", "12", "99"];

/**
 * Shuffles an array with Fisher-Yates algorithm
 */
export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates an array of words based on configuration
 * @param {Object} options
 * @param {number} options.count - Number of words to generate
 * @param {boolean} options.includePunctuation - Whether to inject punctuation and casing
 * @param {boolean} options.includeNumbers - Whether to inject numbers
 * @param {string} [options.customText] - Optional custom text to use
 * @returns {Array<{ id: number, text: string, chars: Array<{ char: string, status: 'pending'|'correct'|'incorrect'|'extra' }> }>}
 */
export function generateWords({ count = 25, includePunctuation = false, includeNumbers = false, customText = "" }) {
  let wordStrings = [];

  if (customText && customText.trim().length > 0) {
    // Sanitize and split custom text
    wordStrings = customText
      .trim()
      .replace(/[\r\n\t]+/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 0);
  } else {
    // Curated dynamic shuffle from 500+ word pool
    const shuffled = shuffleArray(WORD_POOL);
    while (wordStrings.length < count) {
      wordStrings.push(...shuffled);
    }
    wordStrings = wordStrings.slice(0, count);

    // Apply modifiers
    if (includeNumbers) {
      // Replace ~10% of words with numbers or inject numbers
      for (let i = 0; i < wordStrings.length; i++) {
        if (Math.random() < 0.12 && i > 0) {
          const num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
          wordStrings[i] = num;
        }
      }
    }

    if (includePunctuation) {
      // Capitalize first word and words following period
      let nextCapitalize = true;
      for (let i = 0; i < wordStrings.length; i++) {
        let w = wordStrings[i];
        if (nextCapitalize) {
          w = w.charAt(0).toUpperCase() + w.slice(1);
          nextCapitalize = false;
        }

        // Randomly add punctuation to ~15% of words
        if (Math.random() < 0.20 || i === wordStrings.length - 1) {
          const mark = i === wordStrings.length - 1 ? "." : PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)];
          w += mark;
          if (mark === "." || mark === "!" || mark === "?") {
            nextCapitalize = true;
          }
        }
        wordStrings[i] = w;
      }
    }
  }

  // Format into rich word objects with character states
  return wordStrings.map((word, wIdx) => ({
    id: wIdx,
    text: word,
    chars: word.split("").map(ch => ({
      char: ch,
      status: "pending"
    }))
  }));
}
