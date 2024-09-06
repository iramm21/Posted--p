import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaTrash, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { AuthContext } from "../helpers/AuthContext";

function Post() {
  let { id } = useParams();
  const [postObject, setPostObject] = useState({});
  const [commentObject, setCommentObject] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    // Fetch post details and like/dislike counts
    axios.get(`http://localhost:3001/posts/byId/${id}`).then((response) => {
      setPostObject(response.data);

      // Fetch total likes and dislikes for the post
      axios
        .get(`http://localhost:3001/likesdislikes/post/${id}`, {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((res) => {
          setLikesCount(res.data.totalLikes || 0);
          setDislikesCount(res.data.totalDislikes || 0);
          setLiked(res.data.likedByUser); // Check if the user has liked the post
          setDisliked(res.data.dislikedByUser); // Check if the user has disliked the post
        });
    });

    // Fetch comments with like/dislike counts
    axios.get(`http://localhost:3001/comments/${id}`).then((response) => {
      setCommentObject(response.data);
    });
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccessToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const toggleLike = () => {
    axios
      .post(
        `http://localhost:3001/likesdislikes`,
        { PostId: id, type: liked ? null : "like" }, // Toggle like
        { headers: { accessToken } }
      )
      .then(() => {
        setLiked(!liked);
        if (liked) {
          setLikesCount(likesCount - 1);
        } else {
          setLikesCount(likesCount + 1);
          if (disliked) {
            setDisliked(false);
            setDislikesCount(dislikesCount - 1);
          }
        }
      });
  };

  const toggleDislike = () => {
    axios
      .post(
        `http://localhost:3001/likesdislikes`,
        { PostId: id, type: disliked ? null : "dislike" }, // Toggle dislike
        { headers: { accessToken } }
      )
      .then(() => {
        setDisliked(!disliked);
        if (disliked) {
          setDislikesCount(dislikesCount - 1);
        } else {
          setDislikesCount(dislikesCount + 1);
          if (liked) {
            setLiked(false);
            setLikesCount(likesCount - 1);
          }
        }
      });
  };

  const handleCommentLike = (commentId, likedStatus, dislikedStatus) => {
    axios
      .post(
        `http://localhost:3001/likesdislikes`,
        { CommentId: commentId, type: likedStatus ? null : "like" }, // Toggle like
        { headers: { accessToken } }
      )
      .then(() => {
        setCommentObject((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  liked: !likedStatus,
                  disliked: likedStatus ? false : dislikedStatus,
                  likesCount: likedStatus
                    ? comment.likesCount - 1
                    : comment.likesCount + 1,
                  dislikesCount:
                    likedStatus && dislikedStatus
                      ? comment.dislikesCount - 1
                      : comment.dislikesCount,
                }
              : comment
          )
        );
      });
  };

  const handleCommentDislike = (commentId, dislikedStatus, likedStatus) => {
    axios
      .post(
        `http://localhost:3001/likesdislikes`,
        { CommentId: commentId, type: dislikedStatus ? null : "dislike" }, // Toggle dislike
        { headers: { accessToken } }
      )
      .then(() => {
        setCommentObject((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  disliked: !dislikedStatus,
                  liked: dislikedStatus ? false : likedStatus,
                  dislikesCount: dislikedStatus
                    ? comment.dislikesCount - 1
                    : comment.dislikesCount + 1,
                  likesCount:
                    dislikedStatus && likedStatus
                      ? comment.likesCount - 1
                      : comment.likesCount,
                }
              : comment
          )
        );
      });
  };

  const deleteComment = (commentId) => {
    axios
      .delete(`http://localhost:3001/comments/${commentId}`, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then(() => {
        setCommentObject(commentObject.filter((val) => val.id !== commentId));
      });
  };

  const initialValues = {
    commentBody: "",
  };

  const validationSchema = Yup.object().shape({
    commentBody: Yup.string().required("Comment is required"),
  });

  const onSubmit = (data, { resetForm }) => {
    axios
      .post(
        `http://localhost:3001/comments`,
        {
          PostId: id,
          ...data,
        },
        {
          headers: {
            accessToken: accessToken,
          },
        }
      )
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          setCommentObject([...commentObject, response.data]);
          resetForm();
        }
      })
      .catch((error) => {
        console.error("Error creating comment:", error);
        alert("Failed to add comment. Please try again.");
      });
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto p-6 space-y-8">
      {/* Post Content Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-4xl font-bold mb-4">{postObject.title}</h1>
        <p className="text-gray-700 text-lg mb-6">{postObject.postText}</p>
        <span className="text-sm text-gray-500">
          Posted by:{" "}
          <span className="font-semibold">{postObject.username}</span>
        </span>

        <div className="flex gap-6 mt-4">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
              liked ? "bg-blue-600" : "bg-gray-400 hover:bg-blue-500"
            }`}
          >
            <FaThumbsUp />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={toggleDislike}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
              disliked ? "bg-red-600" : "bg-gray-400 hover:bg-red-500"
            }`}
          >
            <FaThumbsDown />
            <span>{dislikesCount}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        {commentObject.length > 0 ? (
          <ul className="space-y-4">
            {commentObject.map((comment) => (
              <li
                key={comment.id}
                className="p-4 bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-800">{comment.commentBody}</p>
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() =>
                        handleCommentLike(
                          comment.id,
                          comment.liked,
                          comment.disliked
                        )
                      }
                      className={`flex items-center gap-2 text-gray-600 hover:text-blue-600 ${
                        comment.liked ? "text-blue-600" : ""
                      }`}
                    >
                      <FaThumbsUp />
                      <span>{comment.likesCount || 0}</span>
                    </button>
                    <button
                      onClick={() =>
                        handleCommentDislike(
                          comment.id,
                          comment.disliked,
                          comment.liked
                        )
                      }
                      className={`flex items-center gap-2 text-gray-600 hover:text-red-600 ${
                        comment.disliked ? "text-red-600" : ""
                      }`}
                    >
                      <FaThumbsDown />
                      <span>{comment.dislikesCount || 0}</span>
                    </button>
                    {authState.username === comment.username && (
                      <button
                        className="text-red-900 hover:text-red-500"
                        title="Delete comment"
                        onClick={() => deleteComment(comment.id)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-600">Username: </span>
                  {comment.username}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No comments yet.</p>
        )}
      </div>

      {/* Add Comment Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Add Comment</h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form className="flex flex-col space-y-4">
            <Field
              name="commentBody"
              placeholder="Write your comment here..."
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage
              name="commentBody"
              component="div"
              className="text-red-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Add Comment
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default Post;
