export const highlightMatches = (
  text: string,
  searchQuery: string
): (string | { text: string; highlighted: boolean })[] => {
  if (!searchQuery.trim()) {
    return [text];
  }

  const query = searchQuery.trim();
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);

  return parts
    .map((part, index) => {
      // Even indices are non-matching text, odd indices are matches
      if (index % 2 === 0) {
        return part;
      }
      return { text: part, highlighted: true };
    })
    .filter((part) => part !== ""); // Remove empty strings
};

/**
 * Check if text contains the search query
 */
export const containsMatch = (text: string, searchQuery: string): boolean => {
  if (!searchQuery.trim()) return false;
  return text.toLowerCase().includes(searchQuery.toLowerCase());
};
