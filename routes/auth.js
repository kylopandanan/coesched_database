const router = require("express").Router();
const AuthScheme = require("../models/AuthScheme");
const AuthScheduleScheme = require("../models/AuthScheduleScheme");
const AuthRoomScheme = require("../models/AuthRoomScheme");
const AuthSectionScheme = require("../models/AuthSectionScheme");
const AuthSubjectScheme = require("../models/AuthSubjectScheme");
const AuthInstructorScheme = require("../models/AuthInstructorScheme");
const AuthCourseScheme = require("../models/AuthCourseScheme");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  regScheme,
  logScheme,
  scheduleScheme,
  roomScheme,
  sectionScheme,
  subjectScheme,
  instructorScheme,
} = require("../models/validation");
const dotenv = require("dotenv");
const AuthToken = require("./AuthToken");
const AuthSemesterScheme = require("../models/AuthSemesterScheme");
const AuthYearScheme = require("../models/AuthYearScheme");

dotenv.config();

// Register user
router.post("/register", async (req, res) => {
  const { error } = regScheme(req.body);
  if (error)
    return res.status(400).send({ error: error["details"][0]["message"] });

  const usernameExist = await AuthScheme.findOne({
    username: req.body.username,
  });
  if (usernameExist) return res.status(400).send({ message: true });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const data = new AuthScheme({
    username: req.body.username,
    password: hashedPassword,
  });

  try {
    const UReg = await data.save();
    if (UReg) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send({ message: err["message"] });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { error } = logScheme(req.body);
    if (error)
      return res.status(400).send({ error: error["details"][0]["message"] });

    const user = await AuthScheme.findOne({
      username: req.body.username,
    });

    if (!user) return res.status(400).send({ message: false });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
      return res.status(400).send({ message: "Invalid Credentials." });

    const token = jwt.sign(
      { _id: user._id, credential: user.credential },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "12h",
      }
    );

    res.header("auth-token", token).send({ token: token });
  } catch (err) {
    res.status(400).send({ message: err["message"] });
  }
});

router.delete("/schedule", AuthToken, async (req, res) => {
  try {
    const data = await AuthScheduleScheme.deleteOne({ _id: req.body._id });
    if (data) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/schedule", AuthToken, async (req, res) => {
  const { error } = scheduleScheme(req.body);
  if (error)
    return res.status(400).send({ error: error["details"][0]["message"] });

  const CheckInstructorTimeslot = await AuthScheduleScheme.findOne({
    instructor: req.body.instructor,
    timeslot: req.body.timeslot,
    day: req.body.day,
  });

  if (CheckInstructorTimeslot)
    return res.status(400).send({
      message: `${req.body.instructor} is not "Available".`,
      description: `${CheckInstructorTimeslot.instructor} is already scheduled for ${CheckInstructorTimeslot.section} at ${req.body.day} ${req.body.timeslot}.`,
    });

  const CheckRoomTimeslot = await AuthScheduleScheme.findOne({
    room: req.body.room,
    timeslot: req.body.timeslot,
    day: req.body.day,
  });

  if (CheckRoomTimeslot)
    return res.status(400).send({
      message: `Room ${req.body.room} is not "Available".`,
      description: `Room. ${req.body.room} is already scheduled for ${CheckRoomTimeslot.section} at ${req.body.day} ${req.body.timeslot}.`,
    });

  const CheckTimeslot = await AuthScheduleScheme.findOne({
    section: req.body.section,
    timeslot: req.body.timeslot,
    day: req.body.day,
  });

  if (CheckTimeslot)
    return res.status(400).send({
      message: `Timeslot ${req.body.timeslot} is not "Available".`,
      description: `Timeslot. ${req.body.timeslot} is already scheduled for ${CheckTimeslot.instructor} at room ${CheckTimeslot.room}.`,
    });

  const data = new AuthScheduleScheme({
    dayIndex: req.body.dayIndex,
    timeslotIndex: req.body.timeslotIndex,
    course: req.body.course,
    section: req.body.section,
    room: req.body.room,
    day: req.body.day,
    timeslot: req.body.timeslot,
    subject: req.body.subject,
    instructor: req.body.instructor,
  });

  try {
    const setSchedule = await data.save();
    if (setSchedule) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send({ message: err["message"] });
  }
});

router.get("/search-by-section/:section", async (req, res) => {
  try {
    const data = await AuthScheduleScheme.find({
      section: req.params.section,
    }).sort({ dayIndex: 1, timeslotIndex: 1 });
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/search-by-instructor/:instructor", async (req, res) => {
  try {
    const data = await AuthScheduleScheme.find({
      instructor: req.params.instructor,
    });
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/semester", async (req, res) => {
  try {
    const data = await AuthSemesterScheme.find();
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/semester", AuthToken, async (req, res) => {
  try {
    const data = new AuthSemesterScheme({
      semester: req.body.semester,
      year: req.body.year,
    });

    try {
      const setSchedule = await data.save();
      if (setSchedule) return res.send({ message: "OK" });
    } catch (err) {
      res.status(400).send({ message: err["message"] });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch("/semester", AuthToken, async (req, res) => {
  try {
    const data = await AuthSemesterScheme.updateOne(
      {
        _id: req.body._id,
      },
      { $set: { semester: req.body.semester, year: req.body.year } }
    );

    if (data) return res.send({ message: true });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/year", AuthToken, async (req, res) => {
  try {
    const data = await AuthYearScheme.find();
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/room", AuthToken, async (req, res) => {
  const { error } = roomScheme(req.body);
  if (error)
    return res.status(400).send({ error: error["details"][0]["message"] });

  const CheckRoom = await AuthRoomScheme.findOne({
    room: req.body.room,
  });
  if (CheckRoom) return res.status(400).send({ message: "Room found" });

  const data = new AuthRoomScheme({
    room: req.body.room,
  });

  try {
    const setSchedule = await data.save();
    if (setSchedule) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send({ message: err["message"] });
  }
});

router.get("/room", AuthToken, async (req, res) => {
  try {
    const data = await AuthRoomScheme.find();
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/room", AuthToken, async (req, res) => {
  try {
    const data = await AuthRoomScheme.deleteOne({ _id: req.body._id });
    if (data) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch("/room", AuthToken, async (req, res) => {
  try {
    await AuthRoomScheme.updateOne(
      {
        _id: req.body._id,
      },
      { $set: { room: req.body.room } }
    );

    const oldroom = await AuthScheduleScheme.updateMany(
      {
        room: req.body.oldroom,
      },
      { $set: { room: req.body.room } }
    );

    if (oldroom) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/course", AuthToken, async (req, res) => {
  try {
    const data = await AuthCourseScheme.find();
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/search-by-course/:course", AuthToken, async (req, res) => {
  try {
    const data = await AuthSectionScheme.find({
      course: req.params.course,
    });
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/searchbysection/:section", async (req, res) => {
  try {
    const data = await AuthSectionScheme.find({
      section: req.params.section,
    });
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/section", AuthToken, async (req, res) => {
  const { error } = sectionScheme(req.body);
  if (error)
    return res.status(400).send({ error: error["details"][0]["message"] });

  const CheckSection = await AuthSectionScheme.findOne({
    section: req.body.section,
  });
  if (CheckSection) return res.status(400).send({ message: "Section found" });

  const data = new AuthSectionScheme({
    section: req.body.section,
    course: req.body.course,
    year: req.body.year,
  });

  try {
    const setSchedule = await data.save();
    if (setSchedule) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send({ message: err["message"] });
  }
});

router.get("/section", async (req, res) => {
  try {
    const data = await AuthSectionScheme.find();
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/section", AuthToken, async (req, res) => {
  try {
    await AuthSectionScheme.deleteOne({ _id: req.body._id });
    const dataD = await AuthScheduleScheme.deleteMany({
      section: req.body.isSec,
    });
    if (dataD) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch("/section", AuthToken, async (req, res) => {
  try {
    const data = await AuthSectionScheme.updateOne(
      {
        _id: req.body._id,
      },
      { $set: { section: req.body.section } }
    );

    const oldsec = await AuthScheduleScheme.updateMany(
      {
        section: req.body.isSec,
      },
      { $set: { section: req.body.section } }
    );

    if (data) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/subject", AuthToken, async (req, res) => {
  const { error } = subjectScheme(req.body);
  if (error)
    return res.status(400).send({ error: error["details"][0]["message"] });

  // const CheckSubject = await AuthSubjectScheme.findOne({
  //   subject: req.body.subject,
  // });

  // if (CheckSubject) return res.status(400).send({ message: "Subject found" });

  const CheckSCode = await AuthSubjectScheme.findOne({
    s_code: req.body.s_code,
  });

  if (CheckSCode)
    return res.status(400).send({ message: "Subject Code found" });

  const data = new AuthSubjectScheme({
    s_code: req.body.s_code,
    subject: req.body.subject,
  });

  try {
    const setSchedule = await data.save();
    if (setSchedule) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send({ message: err["message"] });
  }
});

router.get("/subject", AuthToken, async (req, res) => {
  try {
    const data = await AuthSubjectScheme.find();
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/subject", AuthToken, async (req, res) => {
  try {
    const data = await AuthSubjectScheme.deleteOne({ _id: req.body._id });
    if (data) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch("/subject", AuthToken, async (req, res) => {
  try {
    const data = await AuthSubjectScheme.updateOne(
      {
        _id: req.body._id,
      },
      { $set: { subject: req.body.subject } }
    );

    const oldins = await AuthScheduleScheme.updateMany(
      {
        subject: req.body.isSub,
      },
      { $set: { subject: req.body.subject } }
    );

    if (oldins) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/instructor", AuthToken, async (req, res) => {
  const { error } = instructorScheme(req.body);
  if (error)
    return res.status(400).send({ error: error["details"][0]["message"] });

  const CheckInstructor = await AuthInstructorScheme.findOne({
    instructor: req.body.instructor,
  });
  if (CheckInstructor)
    return res.status(400).send({ message: "Instructor found" });

  const data = new AuthInstructorScheme({
    instructor: req.body.instructor,
  });

  try {
    const setSchedule = await data.save();
    if (setSchedule) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send({ message: err["message"] });
  }
});

router.get("/instructor", async (req, res) => {
  try {
    const data = await AuthInstructorScheme.find().sort({
      instructor: 1,
    });
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/instructor/:data", async (req, res) => {
  try {
    const data = await AuthInstructorScheme.find({
      instructor: req.params.data,
    });
    if (data) return res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/instructor", AuthToken, async (req, res) => {
  try {
    const data = await AuthInstructorScheme.deleteOne({ _id: req.body._id });
    if (data) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch("/instructor", AuthToken, async (req, res) => {
  try {
    const data = await AuthInstructorScheme.updateOne(
      {
        _id: req.body._id,
      },
      { $set: { instructor: req.body.instructor } }
    );

    const oldins = await AuthScheduleScheme.updateMany(
      {
        instructor: req.body.oldins,
      },
      { $set: { instructor: req.body.instructor } }
    );

    if (data) return res.send({ message: "OK" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/verify", async (req, res) => {
  const token = req.header("auth-token");
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    res.send(verified);
  } catch (error) {
    res.status(400).send({ message: false });
  }
});

router.patch("/verify", AuthToken, async (req, res) => {
  const token = req.header("auth-token");

  const verified = jwt.verify(token, process.env.TOKEN_SECRET);

  if (!verified) return res.send({ message: false });

  try {
    if (req.body.username) {
      const Username = await AuthScheme.updateOne(
        { _id: verified._id },
        { $set: { username: req.body.username } }
      );
      return res.send(Username);
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const Password = await AuthScheme.updateOne(
        { _id: verified._id },
        { $set: { password: hashedPassword } }
      );
      return res.send(Password);
    }
  } catch (error) {
    res.status(400).send({ message: false });
  }
});

module.exports = router;
