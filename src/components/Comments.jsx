import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Comments = ({ itemId, itemType }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [itemId, itemType]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://music-streaming-be-iuzg.onrender.com/api/comment/${itemType}/${itemId}`);
      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      const response = await axios.post(`https://music-streaming-be-iuzg.onrender.com/api/comment/${itemType}/${itemId}`, {
        content: newComment
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setComments([response.data.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    
    try {
      const response = await axios.put(`https://music-streaming-be-iuzg.onrender.com/api/comment/${commentId}`, {
        content: editText
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setComments(comments.map(comment => 
        comment._id === commentId ? response.data.data : comment
      ));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await axios.delete(`https://music-streaming-be-iuzg.onrender.com/api/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment._id);
    setEditText(comment.content);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Comments</h2>
      
      {user && (
        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 text-white"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            required
          ></textarea>
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
              disabled={!newComment.trim()}
            >
              Comment
            </button>
          </div>
        </form>
      )}
      
      {!user && (
        <div className="text-center py-4 mb-6 bg-gray-700 rounded">
          <p className="text-gray-300">
            <button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300"
            >
              Log in
            </button>
            {' '}to add a comment
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-700 rounded-lg p-4">
              {editingComment === comment._id ? (
                <div>
                  <textarea
                    className="w-full px-4 py-2 bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 text-white mb-2"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows="3"
                  ></textarea>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingComment(null)}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{comment.user?.name || 'Unknown User'}</p>
                      <p className="text-gray-400 text-xs">{formatDate(comment.createdAt)}</p>
                    </div>
                    
                    {user && comment.user && user._id === comment.user._id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(comment)}
                          className="text-gray-400 hover:text-white"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2">{comment.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;