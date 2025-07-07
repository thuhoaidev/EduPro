import { Plus, Book, Video, Clock } from 'lucide-react';

const CourseHeader = ({ sectionsCount, totalLessons, totalDuration, onAddSection }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quản lý chương học và bài học
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              HTML CSS từ Zero đến Hero
            </p>
          </div>
          <button
            onClick={onAddSection}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={20} />
            Thêm chương mới
          </button>
        </div>
        
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Book size={16} />
            {sectionsCount} chương
          </div>
          <div className="flex items-center gap-2">
            <Video size={16} />
            {totalLessons} bài học
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            {totalDuration} phút
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
