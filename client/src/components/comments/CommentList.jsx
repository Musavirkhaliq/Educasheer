import React from 'react';
import CommentItem from './CommentItem';

const CommentList = ({ comments, onAddReply, onDeleteComment, onDeleteReply, onLikeComment }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map(comment => (
        <CommentItem
          key={comment._id}
          comment={comment}
          onAddReply={onAddReply}
          onDeleteComment={onDeleteComment}
          onDeleteReply={onDeleteReply}
          onLikeComment={onLikeComment}
        />
      ))}
    </div>
  );
};

export default CommentList;
