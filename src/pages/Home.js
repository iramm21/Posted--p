import axios from "axios";
import { useEffect, useState } from "react";
import { FaTrash, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { Link } from "react-router-dom";

function Home() {
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]); // To track liked posts
  const [dislikedPosts, setDislikedPosts] = useState([]); // To track disliked posts
  const [likesCount, setLikesCount] = useState({}); // Track likes count per post
  const [dislikesCount, setDislikesCount] = useState({}); // Track dislikes count per post
  const [auth, setAuth] = useState(false); // Check if user is logged in
  const [message, setMessage] = useState(""); // To display login message

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAuth(true);
    }

    // Fetch posts and initialize likes and dislikes from server
    axios.get("http://localhost:3001/posts").then((response) => {
      setListOfPosts(response.data);

      response.data.forEach((post) => {
        // Fetch likes/dislikes for each post
        axios
          .get(`http://localhost:3001/likesdislikes/post/${post.id}`, {
            headers: { accessToken: token },
          })
          .then((res) => {
            // Set like and dislike counts
            setLikesCount((prev) => ({
              ...prev,
              [post.id]: res.data.totalLikes || 0,
            }));
            setDislikesCount((prev) => ({
              ...prev,
              [post.id]: res.data.totalDislikes || 0,
            }));

            // Set liked/disliked status for the current user
            if (res.data.likedByUser) {
              setLikedPosts((prev) => [...prev, post.id]);
            }
            if (res.data.dislikedByUser) {
              setDislikedPosts((prev) => [...prev, post.id]);
            }
          });
      });
    });
  }, []);

  const handleNotLoggedIn = (action) => {
    setMessage(`You must log in to ${action} a post`);
    setTimeout(() => {
      setMessage(""); // Clear the message after a few seconds
    }, 3000);
  };

  const toggleLike = (postId) => {
    if (!auth) {
      handleNotLoggedIn("like");
      return;
    }

    const isLiked = likedPosts.includes(postId);
    const actionType = isLiked ? null : "like";

    axios
      .post(
        "http://localhost:3001/likesdislikes",
        { PostId: postId, type: actionType },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then(() => {
        if (isLiked) {
          // Remove like
          setLikedPosts(likedPosts.filter((id) => id !== postId));
          setLikesCount((prev) => ({ ...prev, [postId]: prev[postId] - 1 }));
        } else {
          // Remove dislike (if any) and add like
          if (dislikedPosts.includes(postId)) {
            setDislikedPosts(dislikedPosts.filter((id) => id !== postId));
            setDislikesCount((prev) => ({
              ...prev,
              [postId]: prev[postId] - 1,
            }));
          }
          setLikedPosts([...likedPosts, postId]);
          setLikesCount((prev) => ({ ...prev, [postId]: prev[postId] + 1 }));
        }
      });
  };

  const toggleDislike = (postId) => {
    if (!auth) {
      handleNotLoggedIn("dislike");
      return;
    }

    const isDisliked = dislikedPosts.includes(postId);
    const actionType = isDisliked ? null : "dislike";

    axios
      .post(
        "http://localhost:3001/likesdislikes",
        { PostId: postId, type: actionType },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then(() => {
        if (isDisliked) {
          // Remove dislike
          setDislikedPosts(dislikedPosts.filter((id) => id !== postId));
          setDislikesCount((prev) => ({ ...prev, [postId]: prev[postId] - 1 }));
        } else {
          // Remove like (if any) and add dislike
          if (likedPosts.includes(postId)) {
            setLikedPosts(likedPosts.filter((id) => id !== postId));
            setLikesCount((prev) => ({ ...prev, [postId]: prev[postId] - 1 }));
          }
          setDislikedPosts([...dislikedPosts, postId]);
          setDislikesCount((prev) => ({ ...prev, [postId]: prev[postId] + 1 }));
        }
      });
  };

  const deletePost = (postId) => {
    axios
      .delete(`http://localhost:3001/posts/${postId}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        setListOfPosts(listOfPosts.filter((post) => post.id !== postId));
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
      });
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-12 mt-5 text-gray-800">
        Posts
      </h1>

      {/* Display login message */}
      {message && (
        <div className="text-red-600 text-center mb-4">{message}</div>
      )}

      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg my-6 mx-auto block">
        <Link to="/create-post" className="block w-full h-full text-center">
          Create a Post
        </Link>
      </button>

      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        {listOfPosts.map((value) => {
          const isLiked = likedPosts.includes(value.id);
          const isDisliked = dislikedPosts.includes(value.id);

          return (
            <div
              key={value.id}
              className="p-6 bg-white shadow-lg rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {value.title}
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => toggleLike(value.id)}
                    className={`flex items-center gap-2 text-gray-600 hover:text-blue-600 ${
                      isLiked ? "text-blue-600" : ""
                    }`}
                  >
                    <FaThumbsUp />
                    <span>{likesCount[value.id]}</span>
                  </button>
                  <button
                    onClick={() => toggleDislike(value.id)}
                    className={`flex items-center gap-2 text-gray-600 hover:text-red-600 ${
                      isDisliked ? "text-red-600" : ""
                    }`}
                  >
                    <FaThumbsDown />
                    <span>{dislikesCount[value.id]}</span>
                  </button>
                </div>
                <button
                  className="text-red-600 hover:text-red-400"
                  onClick={() => deletePost(value.id)}
                >
                  <FaTrash />
                </button>
              </div>
              <p className="text-gray-700 mt-2">
                {truncateText(value.postText, 150)}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  Posted by: {value.username}
                </span>
                <Link
                  to={`/post/${value.id}`}
                  className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                  Read More...
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
