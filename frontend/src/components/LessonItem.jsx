import React, { useState } from 'react';
import { 
  GripVertical, 
  Play, 
  Clock, 
  Edit3, 
  Trash2 
} from 'lucide-react';
const LessonItem = ({ lesson, onUpdate, onDelete, onDragStart, onDragOver, onDrop, isDragOver }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (field, value) => {
    onUpdate(lesson.id, { [field]: value });
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-blue-500 transform scale-105' : ''
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, lesson)}
      onDragOver={(e) => onDragOver(e, lesson)}
      onDrop={(e) => onDrop(e, lesson)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 cursor-move">
            <GripVertical size={16} />
            <span className="text-sm font-medium">{lesson.order}.</span>
          </div>
          <Play size={16} className="text-blue-500" />
          <div className="flex-1">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={lesson.title}
                  onBlur={(e) => handleUpdate('title', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdate('title', e.target.value)}
                  className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  autoFocus
                />
                <input
                  type="text"
                  defaultValue={lesson.duration}
                  onBlur={(e) => handleUpdate('duration', e.target.value)}
                  className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium">{lesson.title}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
            <Clock size={14} />
            {lesson.duration}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(lesson.id)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default LessonItem;