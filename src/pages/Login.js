import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Assuming you're using React Router
import { AuthContext } from "../helpers/AuthContext";

const initialValues = {
  username: "",
  password: "",
};

const validationSchema = Yup.object().shape({
  username: Yup.string().min(3).max(15).required("Username is required"),
  password: Yup.string().min(4).max(20).required("Password is required"),
});

function Login() {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const { setAuthState } = useContext(AuthContext);

  const onSubmit = (data) => {
    axios
      .post("http://localhost:3001/auth/login", data)
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          const { token, username, id } = response.data;
          if (token) {
            localStorage.setItem("accessToken", token); // Store the token
            setAuthState({ username: username, id: id, status: true }); // Update authState with username and id
            console.log("Login successful, token saved:", token);
            navigate("/");
          }
        }
      })
      .catch((error) => {
        console.error("Error logging in", error);
        alert("Login failed. Please try again.");
      });
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        {() => (
          <Form>
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
            <div className="mb-6">
              <label
                htmlFor="inputCreatePassword"
                className="block text-gray-700 font-bold mb-2"
              >
                Password
              </label>
              <Field
                id="inputCreatePassword"
                name="password"
                type="password"
                placeholder="Your password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-300"
            >
              Login
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Login;
