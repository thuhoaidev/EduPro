// DeleteConfirmModal Component
const DeleteConfirmModal = ({ deleteConfirm, onConfirm, onCancel }) => {
  if (!deleteConfirm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Xác nhận xóa</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'section' ? 'chương' : 'bài học'} này không? 
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DeleteConfirmModal;