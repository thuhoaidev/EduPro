import React, { useState } from 'react';
import { GripVertical, ChevronDown, ChevronRight, Edit3, Trash2, Plus } from 'lucide-react';
import AddLessonForm from './AddLessonForm';
import LessonItem from './LessonItem';
const SectionItem = ({ section, onUpdate, onDelete, onToggle, onAddLesson, onUpdateLesson, onDeleteLesson, onDragStart, onDragOver, onDrop, onLessonDragStart, onLessonDragOver, onLessonDrop, isDragOver, showAddLesson, setShowAddLesson, dragOverLesson }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (field, value) => {
    onUpdate(section.id, { [field]: value });
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-blue-500 transform scale-105' : ''
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, section)}
      onDragOver={(e) => onDragOver(e, section)}
      onDrop={(e) => onDrop(e, section)}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 cursor-move">
              <GripVertical size={20} />
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm font-medium">
                {section.order}
              </span>
            </div>
            <button
              onClick={() => onToggle(section.id)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {section.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    defaultValue={section.title}
                    onBlur={(e) => handleUpdate('title', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdate('title', e.target.value)}
                    className="w-full px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                  />
                  <textarea
                    defaultValue={section.description}
                    onBlur={(e) => handleUpdate('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                  {section.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{section.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{section.lessons.length} bài học</span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onDelete(section.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {section.isExpanded && (
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50">
          {showAddLesson === section.id && (
            <AddLessonForm
              onAdd={(lessonData) => onAddLesson(section.id, lessonData)}
              onCancel={() => setShowAddLesson(null)}
            />
          )}
          <div className="space-y-2">
            {section.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                onUpdate={(lessonId, updates) => onUpdateLesson(section.id, lessonId, updates)}
                onDelete={(lessonId) => onDeleteLesson(section.id, lessonId)}
                onDragStart={onLessonDragStart}
                onDragOver={onLessonDragOver}
                onDrop={onLessonDrop}
                isDragOver={dragOverLesson?.id === lesson.id}
              />
            ))}
          </div>
          <button
            onClick={() => setShowAddLesson(section.id)}
            className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Thêm bài học mới
          </button>
        </div>
      )}
    </div>
  );
};
export default SectionItem;