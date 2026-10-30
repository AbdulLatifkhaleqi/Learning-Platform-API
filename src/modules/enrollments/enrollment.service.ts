export const getAllEnrollments = async (
  input: ListEnrollmentsInput,
  requester: {
    userId: string;
    role: "student" | "teacher" | "admin";
  },
) => {
  assertValidId(requester.userId, "requester");

  const { page, limit, studentId, courseId, status, sortOrder } = input;

  const filter: Record<string, unknown> = {};

  if (requester.role === "student") {
    filter.student = new Types.ObjectId(requester.userId);
  }

  if (requester.role === "teacher") {
    const instructorCourses = await Course.find({
      instructor: new Types.ObjectId(requester.userId),
    })
      .select("_id")
      .lean()
      .exec();

    const instructorCourseIds = instructorCourses.map((course) => course._id);

    filter.course = {
      $in: instructorCourseIds,
    };
  }

  if (studentId !== undefined) {
    assertValidId(studentId, "student");

    if (requester.role === "student" && studentId !== requester.userId) {
      throw new AppError("You can only access your own enrollments", 403);
    }

    filter.student = new Types.ObjectId(studentId);
  }

  if (courseId !== undefined) {
    assertValidId(courseId, "course");

    if (requester.role === "teacher") {
      const course = await Course.findOne({
        _id: new Types.ObjectId(courseId),
        instructor: new Types.ObjectId(requester.userId),
      })
        .select("_id")
        .lean()
        .exec();

      if (!course) {
        throw new AppError(
          "You can only access enrollments for your own courses",
          403,
        );
      }
    }

    filter.course = new Types.ObjectId(courseId);
  }

  if (status !== undefined) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const direction: 1 | -1 = sortOrder === "asc" ? 1 : -1;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("student", "name email")
      .populate("course", "title price level status instructor")
      .sort({ createdAt: direction, _id: direction })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),

    Enrollment.countDocuments(filter).exec(),
  ]);

  return {
    enrollments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};
