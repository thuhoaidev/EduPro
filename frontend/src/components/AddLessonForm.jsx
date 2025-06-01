const AddLessonForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({ title: '', duration: '' });

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onAdd(formData);
    setFormData({ title: '', duration: '' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Thêm bài học mới</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={16} />
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Tên bài học"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
        <input
          type="text"
          placeholder="Thời lượng (VD: 05:30)"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            Hủy
          </button>
          <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
            <Plus size={14} />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddLessonForm;