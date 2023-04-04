const AsyncError = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };
};

const getAllCourses = AsyncError(async (req, res, next) => {
  const courses = await CourseModel.find();

  res.status(200).json({ success: true, courses });
});
