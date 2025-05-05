const express = require("express");
const router = express.Router();
const db = require("../config/database.js");
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN_FOR_FETCHING;
const containerName = process.env.CONTAINER_NAME;
const testDocumentFolderName = process.env.DOCUMENT_FOLDER_ORVL;
const PDFUrl = process.env.DOCUMENT_FOLDER_PDF; // Folder name for PDFs

// Helper to get image URL
const getImageUrl = (documentName, folder, fileName) => {
  if (!fileName || !documentName) return null;
  return `https://${accountName}.blob.core.windows.net/${containerName}/${testDocumentFolderName}/${documentName}/${folder}/${fileName}?${sasToken}`;
};
const getPDFUrl = (fileName) => {
  if (!fileName ) return null;
  return `https://${accountName}.blob.core.windows.net/${containerName}/${testDocumentFolderName}/${PDFUrl}/${fileName}?${sasToken}`;
}
router.get('/OrvlTopicForCourse/:student_registration_id/:course_creation_id', async (req, res) => {
  const { student_registration_id, course_creation_id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `SELECT
        cct.course_creation_id,
        cct.course_name,
        otc.orvl_topic_name,
        otc.orvl_topic_id,
        e.exam_id,
        e.exam_name,
        p.portal_id,
        sbc.student_registration_id,
        s.subject_id,
        s.subject_name
      FROM
        iit_course_creation_table AS cct
      LEFT JOIN iit_exams AS e ON e.exam_id = cct.exam_id
      LEFT JOIN iit_portal AS p ON p.portal_id = cct.portal_id
      LEFT JOIN iit_student_buy_courses AS sbc ON sbc.course_creation_id = cct.course_creation_id
      LEFT JOIN iit_course_subjects cs ON cct.course_creation_id = cs.course_creation_id
      LEFT JOIN iit_subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN iit_orvl_topic_creation AS otc ON otc.subject_id = s.subject_id AND otc.exam_id = cct.exam_id
      LEFT JOIN iit_orvl_lecture_names AS orvl ON otc.orvl_topic_id = orvl.orvl_topic_id
      WHERE 
        sbc.student_registration_id = ?
        AND sbc.payment_status = 1
        AND sbc.course_creation_id = ?
        AND cct.portal_id = 3
      ORDER BY s.subject_id`,
      [student_registration_id, course_creation_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No data found" });
    }

    // Prepare nested response
    const result = {
      course_creation_id: rows[0].course_creation_id,
      course_name: rows[0].course_name,
      exam_id: rows[0].exam_id,
      exam_name: rows[0].exam_name,
      portal_id: rows[0].portal_id,
      student_registration_id: rows[0].student_registration_id,
      subjects: []
    };

    const subjectMap = {};

    rows.forEach(row => {
      if (!subjectMap[row.subject_id]) {
        subjectMap[row.subject_id] = {
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          topics: []
        };
        result.subjects.push(subjectMap[row.subject_id]);
      }

      const topicExists = subjectMap[row.subject_id].topics.some(
        topic => topic.orvl_topic_id === row.orvl_topic_id
      );

      if (row.orvl_topic_id && row.orvl_topic_name && !topicExists) {
        subjectMap[row.subject_id].topics.push({
          orvl_topic_id: row.orvl_topic_id,
          orvl_topic_name: row.orvl_topic_name
        });
      }
    });

    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching ORVL topic data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
});
router.get('/UserAnswer/:student_registration_id/:course_creation_id/:orvl_topic_id/:exercise_question_id', async (req, res) => {
  const { student_registration_id, course_creation_id, orvl_topic_id, exercise_question_id } = req.params;
 // or dynamically determine this based on your logic

  let connection;
  try {
    connection = await db.getConnection(); // assuming you use a promise-based MySQL library like `mysql2/promise`

    const [rows] = await connection.query(
      `SELECT 
          u.exercise_userresponse AS userAnswer,
           od.orvl_document_name,
          q.exercise_answer AS correctAnswer,
          v.exercise_solution_video_link AS videoSolution,
          v.exercise_solution_img AS imageSolution
        FROM iit_orvl_exercise_userresponses u
        LEFT JOIN iit_orvl_exercise_questions q ON u.exercise_question_id = q.exercise_question_id
        LEFT JOIN iit_orvl_exercise_solutions v ON u.exercise_question_id = v.exercise_question_id
        LEFT JOIN iit_orvl_documents AS od ON od.orvl_topic_id = u.orvl_topic_id
        WHERE u.student_registration_id = ?
          AND u.exercise_question_id = ?
          AND u.orvl_topic_id = ?
          AND u.question_status = 1
          AND u.course_creation_id = ?`,
      [student_registration_id, exercise_question_id, orvl_topic_id,  course_creation_id]
    );
    if (rows.length > 0 && rows[0].imageSolution) {
      rows[0].imageSolution = getImageUrl(
        rows[0].orvl_document_name, 
        'exercisesolutions', 
        rows[0].imageSolution
      );
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching user answer:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    if (connection) connection.release(); // or connection.end() based on your pool config
  }
});

router.get('/CourseTopic/:orvl_topic_id', async (req, res) => {
  const { orvl_topic_id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `SELECT 
         otc.orvl_topic_id,
         otc.orvl_topic_name,
         otc.orvl_topic_pdf,
         od.orvl_document_name,
         l.orvl_lecture_name_id,
         l.orvl_lecture_name,
         l.lecture_video_link,
         u.exercise_name_id,
         u.exercise_name,
         eq.exercise_question_id,
         eq.exercise_question_img,
         eq.exercise_question_type,
         eq.exercise_answer_unit,
         eq.exercise_answer,
         eq.exercise_question_sort_id,
         eop.exercise_option_index,
         eop.exercise_option_img,
         eop.exercise_option_id
       FROM iit_orvl_topic_creation AS otc 
       LEFT JOIN iit_orvl_documents AS od ON od.orvl_topic_id = otc.orvl_topic_id
       LEFT JOIN iit_orvl_lecture_names l ON l.orvl_topic_id = otc.orvl_topic_id
       LEFT JOIN iit_orvl_exercise_names u ON u.orvl_lecture_name_id = l.orvl_lecture_name_id
       LEFT JOIN iit_orvl_exercise_questions eq ON eq.exercise_name_id = u.exercise_name_id
       LEFT JOIN iit_orvl_exercise_options eop ON eop.exercise_question_id = eq.exercise_question_id
       WHERE otc.orvl_topic_id = ?
       ORDER BY l.orvl_lecture_name_id, u.exercise_name_id, eq.exercise_question_sort_id, eop.exercise_option_index`,
      [orvl_topic_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const result = {
      orvl_topic_id: rows[0].orvl_topic_id,
      orvl_topic_name: rows[0].orvl_topic_name,
      orvl_topic_pdf:  getPDFUrl(rows[0].orvl_topic_pdf
     
      ),
      orvl_document_name: rows[0].orvl_document_name,
      lectures: []
    };

    const lectureMap = {};

    rows.forEach(row => {
      if (!lectureMap[row.orvl_lecture_name_id] && row.orvl_lecture_name_id) {
        lectureMap[row.orvl_lecture_name_id] = {
          orvl_lecture_name_id: row.orvl_lecture_name_id,
          orvl_lecture_name: row.orvl_lecture_name,
          lecture_video_link: row.lecture_video_link,
          exercises: []
        };
        result.lectures.push(lectureMap[row.orvl_lecture_name_id]);
      }

      if (row.exercise_name_id && lectureMap[row.orvl_lecture_name_id]) {
        let exercise = lectureMap[row.orvl_lecture_name_id].exercises.find(
          ex => ex.exercise_name_id === row.exercise_name_id
        );

        if (!exercise) {
          exercise = {
            exercise_name_id: row.exercise_name_id,
            exercise_name: row.exercise_name,
            questions: []
          };
          lectureMap[row.orvl_lecture_name_id].exercises.push(exercise);
        }

        if (row.exercise_question_id) {
          let question = exercise.questions.find(
            q => q.exercise_question_id === row.exercise_question_id
          );

          if (!question) {
            question = {
              exercise_question_id: row.exercise_question_id,
              exercise_question_img: getImageUrl(
                row.orvl_document_name,
                "exercisequestions",
                row.exercise_question_img 
              ),
              exercise_question_type: row.exercise_question_type,
              exercise_answer_unit: row.exercise_answer_unit,
              exercise_answer: row.exercise_answer,
              exercise_question_sort_id: row.exercise_question_sort_id,
              options: []
            };
            exercise.questions.push(question);
          }

          if (row.exercise_option_id) {
            question.options.push({
              exercise_option_index: row.exercise_option_index,
          
              exercise_option_img: getImageUrl(
                row.orvl_document_name,
                "exerciseoptions",
                row.exercise_option_img 
              ),
              exercise_option_id: row.exercise_option_id
            });
          }
        }
      }
    });

    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching ORVL topic details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
});
router.get('/GetExcerciseQuestionStatus/:orvl_topic_id/:exercise_name_id/:student_registration_id/:course_creation_id', async (req, res) => {
  const { orvl_topic_id, exercise_name_id, student_registration_id, course_creation_id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.execute(
      `SELECT question_status, exercise_question_id
       FROM iit_db.iit_orvl_exercise_userresponses
       WHERE orvl_topic_id = ? AND exercise_name_id = ? AND student_registration_id = ? AND course_creation_id = ?`,
      [orvl_topic_id, exercise_name_id, student_registration_id, course_creation_id]
    );

    res.status(200).json( rows );
  } catch (error) {
    console.error('Error fetching question status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    if (connection) connection.release();
  }
});
function calculateWeightage(totalVideos, totalExercises) {
  const total = totalVideos + totalExercises;
  // If neither videos nor exercises exist, return equal weights
  if (total === 0) {
    return { videoWeight: 0, exerciseWeight: 0 };
  }
  return {
    videoWeight: totalVideos / total,
    exerciseWeight: totalExercises / total,
  };
}
router.get("/UserResponseStatus/:student_registration_id/:course_creation_id/:orvl_topic_id", async (req, res) => {


  const { student_registration_id, course_creation_id, orvl_topic_id } = req.params;

  // Check if necessary parameters are provided
  if (!student_registration_id || !course_creation_id || !orvl_topic_id) {
    return res.status(400).send("Missing parameters");
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `SELECT
        ivl.orvl_lecture_name_id,
        COALESCE(MAX(vc.video_count), 0) AS videoCount,
        COALESCE(MAX(vc.progress_time), 0) AS progressTime,
        COALESCE(MAX(vc.total_video_time), 0) AS totalVideoTime,
        e.exercise_name_id,
        COALESCE(COUNT(DISTINCT eq.exercise_question_id), 0) AS totalQuestions,
        COALESCE(COUNT(DISTINCT CASE WHEN eur.question_status = 1 THEN eur.exercise_question_id END), 0) AS answeredQuestions
      FROM
        iit_orvl_lecture_names ivl
      LEFT JOIN iit_orvl_video_count vc
        ON ivl.orvl_lecture_name_id = vc.orvl_lecture_name_id
        AND vc.student_registration_id = ? AND vc.orvl_topic_id = ? AND vc.course_creation_id = ?
      LEFT JOIN iit_orvl_exercise_names e
        ON ivl.orvl_lecture_name_id = e.orvl_lecture_name_id
      LEFT JOIN iit_orvl_exercise_questions eq
        ON eq.exercise_name_id = e.exercise_name_id
      LEFT JOIN iit_orvl_exercise_userresponses eur
        ON eq.exercise_question_id = eur.exercise_question_id
        AND eur.student_registration_id = ? AND eur.orvl_topic_id = ? AND eur.course_creation_id = ?
      WHERE
        ivl.orvl_topic_id = ?
      GROUP BY
        ivl.orvl_lecture_name_id, e.exercise_name_id`,
      [
        student_registration_id,
        orvl_topic_id,
        course_creation_id,
        student_registration_id,
        orvl_topic_id,
        course_creation_id,
        orvl_topic_id,
      ]
    );

    // Calculate total videos and total exercises
    const totalVideos = new Set(rows.filter((row) => row.orvl_lecture_name_id).map((row) => row.orvl_lecture_name_id)).size;
    const totalExercises = new Set(rows.filter((row) => row.exercise_name_id).map((row) => row.exercise_name_id)).size;
    const { videoWeight, exerciseWeight } = calculateWeightage(totalVideos, totalExercises);

    // Calculate visited videos and their details
    const visitedVideos = [
      ...new Set(rows.filter((row) => row.videoCount > 0).map((row) => row.orvl_lecture_name_id)),
    ];

    // Video details (unique records for each lectureId)
    const videoCountDetails = Array.from(
      rows.reduce((map, row) => {
        if (row.orvl_lecture_name_id && !map.has(row.orvl_lecture_name_id)) {
          map.set(row.orvl_lecture_name_id, {
            lectureId: row.orvl_lecture_name_id,
            videoCount: row.videoCount,
            progress_time: row.progressTime,
            totalVideoTime: row.totalVideoTime,
          });
        }
        return map;
      }, new Map()).values()
    );

    // Exercise details (unique records for each exerciseId)
    const exerciseDetails = Array.from(
      rows
        .filter((row) => row.exercise_name_id)
        .reduce((map, row) => {
          if (!map.has(row.exercise_name_id)) {
            map.set(row.exercise_name_id, {
              lectureId: row.orvl_lecture_name_id,
              exerciseId: row.exercise_name_id,
              totalQuestions: row.totalQuestions,
              answeredQuestions: row.answeredQuestions,
              exerciseCompletionPercentage:
                row.totalQuestions > 0
                  ? (row.answeredQuestions / row.totalQuestions) * 100
                  : 0,
            });
          }
          return map;
        }, new Map()).values()
    );

    // Calculate exercise completion percentage
    const exerciseCompletionPercentage =
      exerciseDetails.length > 0
        ? exerciseDetails.reduce((sum, exercise) => sum + exercise.exerciseCompletionPercentage, 0) / exerciseDetails.length
        : 100;

    // Calculate video progress percentages
    const videoProgressPercentages = videoCountDetails.map((video) => {
      if (video.videoCount > 0) return 100;
      if (video.totalVideoTime > 0) {
        const percentage = (video.progress_time / video.totalVideoTime) * 100;
        return Math.min(percentage, 100);
      }
      return 0;
    });

    // Compute overall video completion percentage
    const videoCompletionPercentage =
      videoProgressPercentages.length > 0
        ? videoProgressPercentages.reduce((sum, perc) => sum + perc, 0) / videoProgressPercentages.length
        : 100;

    // Compute total completion percentage
    const totalCompletionPercentage = (videoWeight * videoCompletionPercentage) + (exerciseWeight * exerciseCompletionPercentage);

    // Determine access granted (if all videos visited and exercises answered)
    const allVideosVisited = visitedVideos.length === totalVideos;
    const allExercisesAnswered = exerciseDetails.every(
      (exercise) => exercise.totalQuestions === exercise.answeredQuestions
    );

    const accessGranted = allVideosVisited && allExercisesAnswered;

    // Return the response
    res.status(200).json({
      videoCompletionPercentage: videoCompletionPercentage.toFixed(2),
      exerciseCompletionPercentage: exerciseCompletionPercentage.toFixed(2),
      totalCompletionPercentage: totalCompletionPercentage.toFixed(2),
      visitedVideos,
      videoCount: videoCountDetails,
      exerciseDetails,
      access: accessGranted,
    });
  } catch (error) {
    console.error("Error during access status check:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    if (connection) connection.release();
  }
});
// POST API to insert exercise user response
router.post('/ExerciseQuestionstatus', async (req, res) => {
  const {
    question_status,
    orvl_topic_id,
    exercise_question_id,
    exercise_name_id,
    student_registration_id,
    course_creation_id,
  } = req.body;

  let connection;

  try {
    connection = await db.getConnection();
    const sql = `
      INSERT INTO iit_orvl_exercise_userresponses 
      (question_status, orvl_topic_id, exercise_question_id, exercise_name_id, student_registration_id, course_creation_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      question_status,
      orvl_topic_id,
      exercise_question_id,
      exercise_name_id,
      student_registration_id,
      course_creation_id
    ];

    // Use promise-based query
    const [result] = await connection.query(sql, values);

    res.status(200).json({
      message: 'Exercise user response inserted successfully',
      insertId: result.insertId
    });
  } catch (err) {
    console.error('Error inserting response:', err);
    res.status(500).json({ message: 'Server error', error: err });
  } finally {
    if (connection) connection.release();
  }
});
router.post('/VideoVisitStatus', async (req, res) => {
  const {
    orvl_topic_id,
    total_video_time,
    progress_time,
    student_registration_id,
    course_creation_id,
    orvl_lecture_name_id,
  } = req.body;

  let connection;

  try {
    connection = await db.getConnection();

    // Check if a record already exists
    const [prevRows] = await connection.query(
      `SELECT video_count FROM iit_orvl_video_count 
       WHERE orvl_topic_id = ? 
         AND student_registration_id = ? 
         AND course_creation_id = ? 
         AND orvl_lecture_name_id = ?`,
      [orvl_topic_id, student_registration_id, course_creation_id, orvl_lecture_name_id]
    );

    // Calculate whether progress exceeds 70%
    const videoWatched = (progress_time / total_video_time) * 100 >= 70 ? 1 : 0;

    if (prevRows.length > 0) {
      const updatedCount = prevRows[0].video_count + videoWatched;

      // Update existing record
      await connection.query(
        `UPDATE iit_orvl_video_count 
         SET total_video_time = ?, progress_time = ?, video_count = ?
         WHERE orvl_topic_id = ? 
           AND orvl_lecture_name_id = ? 
           AND student_registration_id = ? 
           AND course_creation_id = ?`,
        [
          total_video_time,
          progress_time,
          updatedCount,
          orvl_topic_id,
          orvl_lecture_name_id,
          student_registration_id,
          course_creation_id,
        ]
      );
    } else {
      // Insert new record
      await connection.query(
        `INSERT INTO iit_orvl_video_count 
         (orvl_topic_id, total_video_time, progress_time, video_count, student_registration_id, course_creation_id, orvl_lecture_name_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orvl_topic_id,
          total_video_time,
          progress_time,
          videoWatched,
          student_registration_id,
          course_creation_id,
          orvl_lecture_name_id,
        ]
      );
    }

    res.status(200).json({ success: true, message: 'Video status saved successfully.' });
  } catch (error) {
    console.error('Error saving video status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    if (connection) connection.release();
  }
});


router.put('/SubmitUserAnswer', async (req, res) => {
  const {
    question_status,
    exercise_userresponse,
    orvl_topic_id,
    exercise_question_id,
    exercise_name_id,
    student_registration_id,
    course_creation_id
  } = req.body;

  let connection;

  try {
    connection = await db.getConnection();

    const sql = `
      UPDATE iit_orvl_exercise_userresponses 
      SET question_status = ?, exercise_userresponse = ?
      WHERE orvl_topic_id = ? 
        AND exercise_question_id = ? 
        AND exercise_name_id = ? 
        AND student_registration_id = ? 
        AND course_creation_id = ?
    `;

    const values = [
      question_status,
      exercise_userresponse,
      orvl_topic_id,
      exercise_question_id,
      exercise_name_id,
      student_registration_id,
      course_creation_id
    ];

    const [result] = await connection.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No matching record found to update' });
    }

    res.status(200).json({
      message: 'User answer updated successfully'
    });
  } catch (err) {
    console.error('Error updating user answer:', err);
    res.status(500).json({ message: 'Server error', error: err });
  } finally {
    if (connection) connection.release();
  }
});



      
module.exports = router;
