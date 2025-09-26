import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Component để hiển thị một suggestion item với text highlighting
 * 
 * @param {Object} props
 * @param {Object} props.suggestion - Suggestion object với title và metadata
 * @param {string} props.query - Query string để highlight
 * @param {boolean} props.isSelected - Có phải là item được chọn không
 * @param {function} props.onClick - Handler khi click item
 * @param {function} props.onMouseEnter - Handler khi hover item
 * @param {number} props.index - Index của item trong list
 */
const SuggestionItem = ({
  suggestion,
  query,
  isSelected = false,
  onClick,
  onMouseEnter,
  index
}) => {
  /**
   * Highlight text matching query với prefix prioritization
   * @param {string} text - Text cần highlight
   * @param {string} query - Query để match
   * @returns {JSX.Element} - JSX với highlighted text
   */
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedText = text.toLowerCase();
    
    // Ưu tiên prefix match trước
    if (normalizedText.startsWith(normalizedQuery)) {
      const match = text.substring(0, query.length);
      const after = text.substring(query.length);
      
      return (
        <>
          <span className="font-semibold text-primary bg-primary/10 px-0.5 rounded">
            {match}
          </span>
          {after}
        </>
      );
    }
    
    // Nếu không phải prefix match, tìm exact substring match
    const index = normalizedText.indexOf(normalizedQuery);
    if (index !== -1) {
      const before = text.substring(0, index);
      const match = text.substring(index, index + query.length);
      const after = text.substring(index + query.length);
      
      return (
        <>
          {before}
          <span className="font-semibold text-primary bg-primary/10 px-0.5 rounded">
            {match}
          </span>
          {after}
        </>
      );
    }
    
    // Fallback: highlight theo từng từ nếu có match partial
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
    let highlightedText = text;
    
    // Tìm longest matching prefix từ đầu
    let matchEnd = 0;
    for (let i = 0; i < queryWords.length; i++) {
      const partialQuery = queryWords.slice(0, i + 1).join(' ');
      if (normalizedText.startsWith(partialQuery)) {
        matchEnd = partialQuery.length;
      } else {
        break;
      }
    }
    
    if (matchEnd > 0) {
      const match = text.substring(0, matchEnd);
      const after = text.substring(matchEnd);
      
      return (
        <>
          <span className="font-semibold text-primary bg-primary/10 px-0.5 rounded">
            {match}
          </span>
          {after}
        </>
      );
    }
    
    return text;
  };

  const handleClick = () => {
    onClick?.(suggestion);
  };

  const handleMouseEnter = () => {
    onMouseEnter?.(index);
  };

  return (
    <li
      role="option"
      aria-selected={isSelected}
      className={cn(
        "px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center",
        "hover:bg-muted/50 border-l-2 border-transparent",
        isSelected && "bg-primary/5 border-l-primary text-primary font-medium"
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Search icon */}
      <div className={cn(
        "flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center mr-3",
        isSelected ? "text-primary" : "text-muted-foreground"
      )}>
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      
      {/* Suggestion title với highlighting */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "text-sm leading-5 text-left",
          isSelected ? "text-primary" : "text-foreground"
        )}>
          {highlightText(suggestion.title, query)}
        </div>
      </div>

      {/* Optional: Prefix match indicator */}
      {suggestion.isPrefixMatch && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-2 h-2 bg-primary rounded-full" title="Prefix match" />
        </div>
      )}
    </li>
  );
};

export default SuggestionItem;