'use client'
import { useEffect, useState } from 'react';
import { firestore } from '../app/db.js';
import { collection, getDocs, addDoc, query, where, serverTimestamp, Timestamp, orderBy } from 'firebase/firestore';
import '../styles/ForumPage.css';
import Head from 'next/head.js';
import Header from '@/components/header.jsx';

const formatDate = (firebaseTimestamp) => {
  if (!firebaseTimestamp) return '';
  let date;
  if (firebaseTimestamp instanceof Timestamp) {
    date = firebaseTimestamp.toDate();
  } else if (firebaseTimestamp instanceof Date) {
    date = firebaseTimestamp;
  } else {
    return ''; // Handle unexpected types gracefully
  }
  return date.toLocaleString();
};

const Page = () => {
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComments, setNewComments] = useState({});
  const [visibleCommentFormPostId, setVisibleCommentFormPostId] = useState(null);

  useEffect(() => {
    const fetchPostsAndComments = async () => {
      // Adjusted to include orderBy for posts
      const postsQuery = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
      const postsSnapshot = await getDocs(postsQuery);
      
      const postsDataPromises = postsSnapshot.docs.map(async (doc) => {
        const post = {
          id: doc.id,
          ...doc.data(),
          comments: [],
        };
        
        // Adjusted to include orderBy for comments
        const commentsQuery = query(
          collection(firestore, 'comments'),
          where('postId', '==', doc.id),
          orderBy('createdAt', 'desc')
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        post.comments = commentsSnapshot.docs.map(commentDoc => ({
          id: commentDoc.id,
          ...commentDoc.data(),
        }));
        return post;
      });

      const postsData = await Promise.all(postsDataPromises);
      setPosts(postsData);
    };

    fetchPostsAndComments();
  }, []);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    const docRef = await addDoc(collection(firestore, 'posts'), {
      title: newPostTitle,
      content: newPostContent,
      createdAt: serverTimestamp(),
    });

    const newPost = {
      id: docRef.id,
      title: newPostTitle,
      content: newPostContent,
      comments: [],
      createdAt: new Date()
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleCommentChange = (postId, text) => {
    setNewComments({ ...newComments, [postId]: text });
  };

  const handleShowAddComment = (postId) => {
    setVisibleCommentFormPostId(postId);
  };

  const formatDate = (firebaseTimestamp) => {
    if (!firebaseTimestamp) return '';

    let date;
    if (firebaseTimestamp instanceof Timestamp) {
      date = firebaseTimestamp.toDate();
    } else if (firebaseTimestamp instanceof Date) {
      date = firebaseTimestamp;
    }

    // Check if 'date' is a Date object before calling 'toLocaleString()'
    if (date instanceof Date) {
      return date.toLocaleString();
    } else {
      return ''; 
    }
  };


  const handleSubmitComment = async (postId) => {
    if (!newComments[postId]) return;
    await addDoc(collection(firestore, 'comments'), {
      postId: postId,
      content: newComments[postId],
      createdAt: serverTimestamp(),
    });


    // Update the local state to include the new comment without refetching from Firestore
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, { content: newComments[postId] }],
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    // Clear the input field
    setNewComments({ ...newComments, [postId]: '' });
  };


  return (
    <>
    <Header/>
    <div className="forum-container">
      <h1 className="forum-title">Forum Posts</h1>
      <form onSubmit={handleSubmitPost} className="post-form">
        <input
          className="post-input"
          type="text"
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
          placeholder="Post title"
          required
        />
        <textarea
          className="post-textarea"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Post content"
          required
        ></textarea>
        <button className="submit-btn" type="submit">Submit Post</button>
      </form>

      {posts.map((post) => (
        <div key={post.id} className="post-item">
          <h2 className="post-title">{post.title}</h2>
          <p className="post-content">{post.content}</p>
          <small>{formatDate(post.createdAt)}</small>

          <div className="comments-container">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <p className="comment-content">{comment.content}</p>
                  <small>{formatDate(comment.createdAt)}</small>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>


          {visibleCommentFormPostId === post.id ? (
            <div className="comment-form">
              <textarea
                value={newComments[post.id] || ''}
                onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                placeholder="Write a comment..."
                className="comment-input"
              ></textarea>
              <button className="submit-comment-btn" onClick={() => handleSubmitComment(post.id)}>Post Comment</button>
            </div>
          ) : (
            <button className="show-add-comment-btn" onClick={() => handleShowAddComment(post.id)}>Add Comment</button>
          )}
        </div>
      ))}
    </div>
    </>
  );
};

export default Page;