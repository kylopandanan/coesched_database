const Joi = require("joi");

const regScheme = (data) => {
  const schemaReg = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).max(16).required(),
  });
  return schemaReg.validate(data);
};

const logScheme = (data) => {
  const schemaLog = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).max(16).required(),
  });
  return schemaLog.validate(data);
};

const scheduleScheme = (data) => {
  const schemaLog = Joi.object({
    dayIndex: Joi.number().required(),
    timeslotIndex: Joi.number().required(),
    course: Joi.string().required(),
    section: Joi.string().required(),
    room: Joi.string().required(),
    day: Joi.string().required(),
    timeslot: Joi.string().required(),
    subject: Joi.string().required(),
    instructor: Joi.string().required(),
  });
  return schemaLog.validate(data);
};

const roomScheme = (data) => {
  const schemaLog = Joi.object({
    room: Joi.string().required(),
  });
  return schemaLog.validate(data);
};

const sectionScheme = (data) => {
  const schemaLog = Joi.object({
    section: Joi.string().required(),
    course: Joi.string().required(),
    year: Joi.string().required(),
  });
  return schemaLog.validate(data);
};

const subjectScheme = (data) => {
  const schemaLog = Joi.object({
    s_code: Joi.string().required(),
    subject: Joi.string().required(),
  });
  return schemaLog.validate(data);
};

const instructorScheme = (data) => {
  const schemaLog = Joi.object({
    instructor: Joi.string().required(),
  });
  return schemaLog.validate(data);
};

module.exports.regScheme = regScheme;

module.exports.logScheme = logScheme;

module.exports.scheduleScheme = scheduleScheme;

module.exports.roomScheme = roomScheme;

module.exports.sectionScheme = sectionScheme;

module.exports.subjectScheme = subjectScheme;

module.exports.instructorScheme = instructorScheme;
