import React from 'react';
import { GripVertical, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const SortableList = ({ 
  items, 
  onReorder, 
  onRemove, 
  renderItem, 
  itemKey = 'id',
  className = '',
  showMoveButtons = true,
  showDragHandle = true 
}) => {
  const [dragOverIndex, setDragOverIndex] = React.useState(null);

  // Move item up/down
  const moveItem = (index, direction) => {
    const newArray = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newArray.length) {
      [newArray[index], newArray[targetIndex]] = [newArray[targetIndex], newArray[index]];
      onReorder(newArray);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newArray = [...items];
    const [draggedItem] = newArray.splice(dragIndex, 1);
    
    const newDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
    
    newArray.splice(newDropIndex, 0, draggedItem);
    onReorder(newArray);

    setDragOverIndex(null);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isDraggingOver = dragOverIndex === index;
        return (
        <div
          key={item[itemKey]}
          className="relative group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          draggable={showDragHandle}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnter={() => setDragOverIndex(index)}
          onDragEnd={() => setDragOverIndex(null)}
        >
          {isDraggingOver && <div className="absolute top-0 left-0 w-full h-0.5 bg-black" />}
          {/* Controls */}
          <div className="absolute left-2 top-4 flex flex-col items-center space-y-1">
            {showDragHandle && (
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" title="Drag to reorder" />
            )}
            
            {showMoveButtons && (
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className={`p-1 rounded ${
                    index === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
                  }`}
                  title="Move up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className={`p-1 rounded ${
                    index === items.length - 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
                  }`}
                  title="Move down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Remove button */}
          {onRemove && (
            <button
              onClick={() => onRemove(item[itemKey])}
              className="absolute right-2 top-4 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Content */}
          <div className="ml-8 mr-8">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Position {index + 1}
              </span>
            </div>
            {renderItem(item, index)}
          </div>
        </div>
      )})}
    </div>
  );
};

export default SortableList;