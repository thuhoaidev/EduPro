import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, Reply } from 'lucide-react';

interface CommentItemProps {
  cmt: any;
  likedComments: Set<string>;
  commentLikesCount: { [key: string]: number };
  onReply: (commentId: string) => void;
  onLike: (commentId: string) => void;
  handleReplySubmit: (parentId: string, content: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  cmt,
  likedComments,
  commentLikesCount,
  onReply,
  onLike,
  handleReplySubmit,
}) => {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      handleReplySubmit(cmt._id, replyContent.trim());
      setReplyContent('');
      setReplying(false);
    }
  };

  useEffect(() => {
    if (replying && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replying]);

  return (
    <div className="ml-0 md:ml-6 mb-6">
      <div className="flex items-start gap-4">
        <img
          src={cmt.author?.avatar?.trim() || '/images/default-avatar.png'}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border"
          onError={(e) => {
            e.currentTarget.src = '/images/default-avatar.png';
          }}
        />
        <div className="flex-1">
          <div className="bg-gray-100 rounded-2xl px-4 py-3">
            <p className="font-semibold text-gray-800">{cmt.author?.name || 'Ẩn danh'}</p>
            <p className="text-gray-700 whitespace-pre-line mt-1">{cmt.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-1 ml-1 text-sm text-gray-500 font-medium">
            <button
              onClick={() => onLike(cmt._id)}
              className="hover:text-blue-600 flex items-center gap-1"
            >
              <ThumbsUp
                className={`w-4 h-4 ${
                  likedComments.has(cmt._id)
                    ? 'text-pink-500 fill-pink-500'
                    : 'text-gray-400'
                }`}
              />
              Thích ({commentLikesCount[cmt._id] || 0})
            </button>

            <button
              onClick={() => setReplying(!replying)}
              className="hover:text-blue-600 flex items-center gap-1"
            >
              <Reply className="w-4 h-4" />
              Phản hồi
            </button>

            <span>{new Date(cmt.createdAt).toLocaleString('vi-VN')}</span>
          </div>

          {replying && (
            <div className="mt-3 ml-0 md:ml-4">
              <textarea
                ref={textareaRef}
                className="w-full p-3 border border-gray-300 rounded-xl resize-none text-sm"
                placeholder="Trả lời bình luận..."
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex justify-end mt-2 gap-2">
                <button
                  onClick={() => setReplying(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReply}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-700"
                >
                  Gửi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phản hồi con đệ quy */}
      {cmt.replies && cmt.replies.length > 0 && (
        <div className="mt-4 pl-8 border-l-2 border-gray-200">
          {cmt.replies.map((reply: any) => (
            <CommentItem
              key={reply._id}
              cmt={reply}
              likedComments={likedComments}
              commentLikesCount={commentLikesCount}
              onReply={onReply}
              onLike={onLike}
              handleReplySubmit={handleReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
