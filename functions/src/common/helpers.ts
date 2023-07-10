import {wordsToRemove} from "./static";

export const extractKeywords = (text: string, limit = 25) => {
  const words = text.split(/\s+/);

  const frequencyMap: any = {};
  for (const word of words) {
    const cleanedWord = word.toLowerCase().replace(/[^\w\s]/gi, "");
    if (cleanedWord) {
      frequencyMap[cleanedWord] = (frequencyMap[cleanedWord] || 0) + 1;
    }
  }

  const sortedWords = Object.keys(frequencyMap).sort(
    (a, b) => frequencyMap[b] - frequencyMap[a]
  );

  const filteredWords = sortedWords.filter(
    (word) => !wordsToRemove.includes(word)
  );

  const numKeywords = limit;
  return filteredWords.slice(0, numKeywords);
};

export const estimateReadingTime = (content: string, wordPerMinute = 150) => {
  const wordCount = content.trim().split(/\s+/).length;

  const readingTime = Math.ceil(wordCount / wordPerMinute);
  return readingTime;
};
