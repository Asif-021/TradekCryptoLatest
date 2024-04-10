'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firestore, auth } from '../app/db';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Corrected import for onAuthStateChanged
import '../styles/ForumPage.css';
import NavBar from '@/components/navbar'; // Adjust the import path as necessary

const formatDate = (firebaseTimestamp) => {
  if (!firebaseTimestamp) return '';
  let date;
  if (firebaseTimestamp instanceof Timestamp) {
    date = firebaseTimestamp.toDate();
  } else if (firebaseTimestamp instanceof Date) {
    date = firebaseTimestamp;
  } else {
    return '';
  }
  return date.toLocaleString();
};

const Page = () => {
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComments, setNewComments] = useState({});
  const [visibleCommentFormPostId, setVisibleCommentFormPostId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false); // Added state for showPostForm
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(isLoggedIn);

    const fetchPostsAndComments = async () => {
      const postsQuery = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
      const postsSnapshot = await getDocs(postsQuery);

      const postsDataPromises = postsSnapshot.docs.map(async (doc) => {
        const post = {
          id: doc.id,
          ...doc.data(),
          userId: auth.currentUser.uid,

          comments: [],
        };

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

    return () => unsubscribe();
  }, []);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    try {
      await user.reload();

      // Correctly reference the "User Info" collection and use the UID to fetch the user document

      const q = query(collection(firestore, "User Info"), where("email", "==", user.email));
      const qSnapshot = await getDocs(q);
      const userDataDoc = qSnapshot.docs[0].data()
      // const userDataDoc = await getDoc(doc(firestore, 'User info', user.uid));
      // Extract the username; use "Anonymous" as a fallback if the document or username doesn't exist
      // const userName = userDataDoc.exists() ? userDataDoc.data().username : "Anonymous";
      const userName = userDataDoc?.username || "Anonymous";
      console.log(userName)

      const docRef = await addDoc(collection(firestore, 'posts'), {
        title: newPostTitle,
        content: newPostContent,
        userName: userName,
        userId: auth.currentUser.uid, // Include the user ID
        createdAt: serverTimestamp(),
      });


      // Construct a new post object to be added to the local state
      const newPost = {
        id: docRef.id,
        title: newPostTitle,
        content: newPostContent,
        userName: userName, // Include the username in the new post
        comments: [],
        createdAt: new Date(), // Fallback to the client's current date
      };

      setPosts([newPost, ...posts]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowPostForm(false);
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };


  const handleCommentChange = (postId, text) => {
    setNewComments({ ...newComments, [postId]: text });
  };

  const handleShowAddComment = (postId) => {
    setVisibleCommentFormPostId(postId);
  };

  const handleSubmitComment = async (postId) => {
    if (!newComments[postId]) return;
    const user = auth.currentUser;

    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    await user.reload();
    const q = query(collection(firestore, "User Info"), where("email", "==", user.email));
    const qSnapshot = await getDocs(q);
    const userDataDoc = qSnapshot.docs[0].data();
    const userName = userDataDoc?.username || "Anonymous";

    await addDoc(collection(firestore, 'comments'), {
      postId: postId,
      content: newComments[postId],
      userName: userName, // Include the userName here
      createdAt: serverTimestamp(),
    });

    // Fetch the updated comments for the postId
    const updatedComments = await fetchCommentsForPost(postId);
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: updatedComments,
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    // Clear the input field
    setNewComments({ ...newComments, [postId]: '' });
  };

  const fetchCommentsForPost = async (postId) => {
    const commentsQuery = query(
      collection(firestore, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(commentsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  const handleCancelComment = () => {
    setVisibleCommentFormPostId(null); // Hide the comment form
  };


  const handleDeletePost = async (postId) => {
    console.log(`Attempting to delete post with ID: ${postId}`);
    const isUserConfirmed = window.confirm("Are you sure you want to delete this post?");
    if (!isUserConfirmed) {
      return;
    }
  
    try {
      await deleteDoc(doc(firestore, 'posts', postId));
      console.log(`Post with ID: ${postId} has been successfully deleted.`);
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  



  console.log("Current user ID:", auth.currentUser?.uid);
  posts.forEach(post => {
    console.log(`Post ID: ${post.id}, Post User ID: ${post.userName}`);
  });



  return (
    <>
      <NavBar />
      <div className="forum-container">
        <h1 className="forum-title">Forum Posts</h1>
        {isLoggedIn ? (
          !showPostForm && (
            <button className="toggle-post-form-btn" onClick={() => setShowPostForm(true)}>Post</button>
          )
        ) : (
          <button className="ltoggle-post-form-btn" onClick={() => router.push('/signin')}>Login to Post</button>
        )}
        {showPostForm && (
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
            <button type="button" className="cancel-post-btn" onClick={() => setShowPostForm(false)}>Cancel</button>
          </form>
        )}
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            {auth.currentUser?.uid === post.userId && (
              <button onClick={() => handleDeletePost(post.id)} className="delete-post-btn">
                Delete Post
              </button>
            )}

            <div className="data__wrap">
              <div className="text__post">
                <div className="post-header">
                  <h2 className="post-title">{post.title}</h2>
                  <span>Posted by: {post.userName}</span>
                </div>
                <p className="post-content">{post.content}</p>
              </div>
              <div className="time__post">
                <small>{formatDate(post.createdAt)}</small>
              </div>
            </div>
            <div className="comments-container">
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <p className="comment-content">{comment.content}</p>
                    {/* Display the comment's author name */}
                    <small>Comment by: {comment.userName}</small>
                    {/* Include the formatted creation time of the comment, if desired */}
                    <small>{formatDate(comment.createdAt)}</small>
                  </div>
                ))
              ) : (
                <p>No comments yet.</p>
              )}

            </div>
            {isLoggedIn ? (
              visibleCommentFormPostId === post.id ? (
                <div className="comment-form">
                  <textarea
                    value={newComments[post.id] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    placeholder="Write a comment..."
                    className="comment-input"
                  ></textarea>
                  <div>
                    <button className="submit-comment-btn" onClick={() => handleSubmitComment(post.id)}>Post Comment</button>
                    <button type="button" className="cancel-comment-btn" onClick={() => handleCancelComment()}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="show-add-comment-btn" onClick={() => handleShowAddComment(post.id)}>Add Comment</button>
              )
            ) : (
              <button className="show-add-comment-btn" onClick={() => router.push('/signin')}>Sign in to Comment</button>
            )}

          </div>
        ))}
      </div>
    </>
  );
};

export default Page;
