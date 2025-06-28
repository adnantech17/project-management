export const sequentialMatch = (text: string, search: string): boolean => {
  const textLower = text.toLowerCase();
  const searchLower = search.toLowerCase();

  let searchIndex = 0;

  for (
    let i = 0;
    i < textLower.length && searchIndex < searchLower.length;
    i++
  ) {
    if (textLower[i] === searchLower[searchIndex]) {
      searchIndex++;
    }
  }

  return searchIndex === searchLower.length;
};
