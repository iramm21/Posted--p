import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function PostForm() {
  let navigate = useNavigate();

  const initialValues = {
    title: "",
    postText: "",
    username: "",
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    postText: Yup.string().required("Post text is required"),
    username: Yup.string().min(3).max(15).required("Username is required"),
  });

  const onSubmit = (data, { resetForm }) => {
    axios.post("http://localhost:3001/posts", data).then((response) => {
      console.log("Post successfully created!");
      navigate("/");
    });
    resetForm();
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        {() => (
          <Form>
            <div className="mb-6">
              <label
                htmlFor="inputCreatePost"
                className="block text-gray-700 font-bold mb-2"
              >
                Title
              </label>
              <Field
                id="inputCreatePost"
                name="title"
                placeholder="Enter your title"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="inputCreatePostText"
                className="block text-gray-700 font-bold mb-2"
              >
                Post Content
              </label>
              <Field
                as="textarea"
                id="inputCreatePostText"
                name="postText"
                placeholder="Write your post here..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              />
              <ErrorMessage
                name="postText"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="inputCreateUsername"
                className="block text-gray-700 font-bold mb-2"
              >
                Username
              </label>
              <Field
                id="inputCreateUsername"
                name="username"
                placeholder="Your username"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-300"
            >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default PostForm;
