// Central export point for all Mongoose models
const User    = require("./User");
const Project = require("./Project");
const Task    = require("./Task");

module.exports = { User, Project, Task };
