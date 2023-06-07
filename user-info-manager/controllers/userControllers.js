const User = require("../models");
const { CustomAPIError } = require("../errors/");
const { StatusCodes } = require("http-status-codes");
const { Producer, Consumer } = require("../kafka/");
require("express-async-errors");

// connect to kafka as a publisher
const stream = Producer.createTopicStream("user-data");

// read new user credits
const consumer = Consumer.create("kafka12", "credit-data");
const syncDB = async (msg) => {
  const user = User.findOne({ email: msg.email });
  user.credits = msg.credits;
  await user.save();
};
Consumer.consume(consumer, syncDB);

/**
 * @description gets user data from database and checks if its a new user or not
 * @param {*} req.params.email
 * @returns {JSON} if user exist
 *  {newUser:false, _id: String, email:String, number_of_charts: Number, credits: Number, last_login: Timestamp}
 * @returns {JSON} if user doesnt exist
 * {newUser:true, email: String, last_login: Timestamp}
 */
const userData = async (req, res) => {
  const email = req.params.email;
  if (!email) {
    throw new CustomAPIError(
      "Please provide email address",
      StatusCodes.BAD_REQUEST
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.OK).json({
      newUser: true,
      email,
      last_login: Date.now(),
    });
  }

  res.status(StatusCodes.OK).json({
    newUser: false,
    email: user.email,
    number_of_charts: user.number_of_charts,
    credits: user.credits,
    last_login: user.last_login,
  });
};

/**
 * @description saves user to database if found its a new user
 * @param {*} req.body {"newUser": Boolean, "email": String, "lastLoginTimestamp": timestamp}
 * @returns {JSON} {success: Boolean, msg: String}
 */
const saveUser = async (req, res) => {
  const { newUser, email, lastLoginTimestamp: last_login } = req.body.data;
  if (!newUser || !email || !last_login) {
    throw new CustomAPIError(
      "Fields newUser: Boolean, email: String, lastLoginTimestamp: timestamp are required",
      StatusCodes.BAD_REQUEST
    );
  }

  const user = await User.create({ email: email, last_login: last_login });
  res
    .status(StatusCodes.OK)
    .json({ success: true, msg: "User saved to db successfully" });

  let event = { email, credits: Number(0) };
  Producer.produce(event, stream);
}



/**
 * @description updates last login attribute, front end has to save login time and when user log outs update the value
 * @param {body} req.body {email: String, lastLoginTimestamp: timestamp}
 * @returns {JSON} {success: Boolean, msg: String}
 * @publishes {_id: String, last_login: timestamp}
 */
const lastLoginUpdate = async (req, res) => {
  const { email, lastLoginTimestamp: last_login } = req.body;
  if (!email || !last_login) {
    throw new CustomAPIError(
      "Fields email: String, lastLoginTimestamp:timestamp are required",
      StatusCodes.BAD_REQUEST
    );
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    throw new CustomAPIError(
      "User doesn't exist in database",
      StatusCodes.NOT_FOUND
    );
  }

  await User.updateOne({ _id: user._id }, { $set: { last_login: last_login } });
  res
    .status(StatusCodes.OK)
    .json({ success: true, msg: "User last login timestamp updated" });
};

const userController = {
  userData, saveUser, lastLoginUpdate
}

module.exports = userController;
