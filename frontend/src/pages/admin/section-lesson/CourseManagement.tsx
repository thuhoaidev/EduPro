//quản lí chương học và bài học
import React, { useState, useEffect } from 'react';
import CourseHeader from '../../../components/CourseHeader';
import SectionItem from '../../../components/SectionItem';
import AddSectionForm from '../../../components/AddSectionForm';
import AddLessonForm from '../../../components/AddLessonForm';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import LessonItem from '../../../components/LessonItem';
import { courseService } from '../../../services/courseService'; // Import API service

const CourseManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [dragOverLesson, setDragOverLesson] = useState(null);

  // Load sections from API on component mount
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await courseService.getSections();
      setSections(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load sections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop handlers
  const handleSectionDragStart = (e, section) => {
    setDraggedItem({ ...section, type: 'section' });
  };

  const handleSectionDragOver = (e, section) => {
    e.preventDefault();
    setDragOverItem(section);
  };

  const handleSectionDrop = async (e, targetSection) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== 'section') return;

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedItem.id);
    const targetIndex = newSections.findIndex(s => s.id === targetSection.id);
    
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);
    
    newSections.forEach((section, index) => {
      section.order = index + 1;
    });
    
    try {
      await courseService.updateSectionsOrder(newSections);
      setSections(newSections);
    } catch (err) {
      setError('Failed to update sections order');
      console.error('Failed to update sections order:', err);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleLessonDragStart = (e, lesson) => {
    setDraggedItem({ ...lesson, type: 'lesson' });
  };

  const handleLessonDragOver = (e, lesson) => {
    e.preventDefault();
    setDragOverLesson(lesson);
  };

  const handleLessonDrop = async (e, targetLesson) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== 'lesson') return;

    const newSections = [...sections];
    const sectionIndex = newSections.findIndex(s => 
      s.lessons.some(l => l.id === targetLesson.id)
    );
    
    if (sectionIndex !== -1) {
      const lessons = [...newSections[sectionIndex].lessons];
      const draggedIndex = lessons.findIndex(l => l.id === draggedItem.id);
      const targetIndex = lessons.findIndex(l => l.id === targetLesson.id);
      
      const [removed] = lessons.splice(draggedIndex, 1);
      lessons.splice(targetIndex, 0, removed);
      
      lessons.forEach((lesson, index) => {
        lesson.order = index + 1;
      });
      
      try {
        await courseService.updateLessonsOrder(newSections[sectionIndex].id, lessons);
        newSections[sectionIndex].lessons = lessons;
        setSections(newSections);
      } catch (err) {
        setError('Failed to update lessons order');
        console.error('Failed to update lessons order:', err);
      }
    }
    
    setDraggedItem(null);
    setDragOverLesson(null);
  };

  // Section handlers
  const addSection = async (sectionData) => {
    try {
      const newSection = await courseService.createSection({
        title: sectionData.title,
        description: sectionData.description,
        order: sections.length + 1
      });
      setSections([...sections, newSection]);
      setShowAddSection(false);
    } catch (err) {
      setError('Failed to create section');
      console.error('Failed to create section:', err);
    }
  };

  const updateSection = async (id, updates) => {
    try {
      await courseService.updateSection(id, updates);
      setSections(sections.map(section => 
        section.id === id ? { ...section, ...updates } : section
      ));
    } catch (err) {
      setError('Failed to update section');
      console.error('Failed to update section:', err);
    }
  };

  const deleteSection = (id) => {
    setDeleteConfirm({ type: 'section', id });
  };

  const toggleSection = (id) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  // Lesson handlers
  const addLesson = async (sectionId, lessonData) => {
    try {
      const newLesson = await courseService.createLesson(sectionId, {
        title: lessonData.title,
        duration: lessonData.duration || '00:00',
        order: sections.find(s => s.id === sectionId)?.lessons.length + 1 || 1
      });
      
      setSections(sections.map(section => 
        section.id === sectionId 
          ? { ...section, lessons: [...section.lessons, newLesson] }
          : section
      ));
      setShowAddLesson(null);
    } catch (err) {
      setError('Failed to create lesson');
      console.error('Failed to create lesson:', err);
    }
  };

  const updateLesson = async (sectionId, lessonId, updates) => {
    try {
      await courseService.updateLesson(sectionId, lessonId, updates);
      setSections(sections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              lessons: section.lessons.map(lesson => 
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              )
            }
          : section
      ));
    } catch (err) {
      setError('Failed to update lesson');
      console.error('Failed to update lesson:', err);
    }
  };

  const deleteLesson = (sectionId, lessonId) => {
    setDeleteConfirm({ type: 'lesson', sectionId, lessonId });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.type === 'section') {
        await courseService.deleteSection(deleteConfirm.id);
        setSections(sections.filter(section => section.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'lesson') {
        await courseService.deleteLesson(deleteConfirm.sectionId, deleteConfirm.lessonId);
        setSections(sections.map(section => 
          section.id === deleteConfirm.sectionId 
            ? {
                ...section,
                lessons: section.lessons.filter(lesson => lesson.id !== deleteConfirm.lessonId)
              }
            : section
        ));
      }
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete item');
      console.error('Failed to delete:', err);
    }
  };

  const getTotalLessons = () => {
    return sections.reduce((total, section) => total + (section.lessons?.length || 0), 0);
  };

  const getTotalDuration = () => {
    let totalMinutes = 0;
    sections.forEach(section => {
      section.lessons?.forEach(lesson => {
        const [minutes, seconds] = lesson.duration.split(':').map(Number);
        totalMinutes += minutes + (seconds / 60);
      });
    });
    return Math.round(totalMinutes);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button 
              onClick={loadSections}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CourseHeader
        sectionsCount={sections.length}
        totalLessons={getTotalLessons()}
        totalDuration={getTotalDuration()}
        onAddSection={() => setShowAddSection(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error notification */}
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {showAddSection && (
          <AddSectionForm
            onAdd={addSection}
            onCancel={() => setShowAddSection(false)}
          />
        )}

        <div className="space-y-4">
          {sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              onUpdate={updateSection}
              onDelete={deleteSection}
              onToggle={toggleSection}
              onAddLesson={addLesson}
              onUpdateLesson={updateLesson}
              onDeleteLesson={deleteLesson}
              onDragStart={handleSectionDragStart}
              onDragOver={handleSectionDragOver}
              onDrop={handleSectionDrop}
              onLessonDragStart={handleLessonDragStart}
              onLessonDragOver={handleLessonDragOver}
              onLessonDrop={handleLessonDrop}
              isDragOver={dragOverItem?.id === section.id}
              showAddLesson={showAddLesson}
              setShowAddLesson={setShowAddLesson}
              dragOverLesson={dragOverLesson}
            />
          ))}
        </div>

        {/* Empty state */}
        {sections.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No sections yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first course section.
            </p>
            <button
              onClick={() => setShowAddSection(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Add First Section
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        deleteConfirm={deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default CourseManagement;