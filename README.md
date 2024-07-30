# YouTube Backend Project

Welcome to the YouTube Backend Project! This repository contains a complete backend system for a YouTube-like application, built using modern technologies and practices. It provides functionality for user authentication, video management, playlists, comments, likes, and more.


## Technologies Used

- **JavaScript** - The primary programming language used.
- **Node.js** - JavaScript runtime for building the server.
- **Express** - Web application framework for Node.js.
- **MongoDB Atlas** - Cloud-based NoSQL database for storing data
- **Mongoose** - ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Postman** - API testing tool used for testing endpoints.
- **Multer** - Middleware for handling file uploads.
- **Cloudinary** - Cloud service for storing images and media.

## Features

- **User Authentication**: Register, login, and manage user sessions.
- **Video Management**: Post, update, and delete videos.
- **Playlist Management**: Create, update, and delete playlists.
- **Comments**: Add, edit, and delete comments on videos.
- **Likes**: Like and unlike videos.
- **Channel Statistics**: Get statistics for user channels.
- **User Dashboard**: View and manage user-specific data.
- **Avatar and Cover Images**: Upload and manage user avatar and cover images using Multer and Cloudinary.

## Controllers

- **User Controller**: Manages user-related operations such as registration, authentication, and profile updates (including avatar and cover images).
- **Video Controller**: Handles operations related to videos, including uploading and updating.
- **Subscription Controller**: Manages user subscriptions.
- **Playlist Controller**: Manages playlists, including creation and updates.
- **Likes Controller**: Handles liking and unliking of videos.
- **Comment Controller**: Manages comments on videos.
- **User Dashboard Controller**: Provides user-specific statistics and data.

## Acknowledgements

A special thanks to Hitesh Chaudhary ([GitHub Profile](https://github.com/hiteshchoudhary)) for the backend series. This project was built upon the foundation laid by his tutorials, with the user controller and initial setup closely following his teachings. All additional features and functionalities were developed independently, with some support from Google and ChatGPT.
