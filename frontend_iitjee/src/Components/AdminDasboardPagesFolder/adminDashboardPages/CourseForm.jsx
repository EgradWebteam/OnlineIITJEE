import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../../apiConfig";
import styles from "../../../Styles/AdminDashboardCSS/CourseForm.module.css";

const CourseForm = ({ showForm, setShowForm,editCourseData, setEditCourseData,onCourseCreated, courseData }) => {
  const IITCourseCardImages = [
    "iit_jee1.png",
    "iit_jee2.png",
    "iit_jee3.png",
    "iit_jee4.png",
  ];

  const isEditMode = !!courseData;
  const ImagePath = "OtsCourseCardImages";

  const [exams, setExams] = useState([]);
  const [types, setTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [courseName, setCourseName] = useState("");
  const [courseStartDate, setCourseStartDate] = useState("");
  const [courseEndDate, setCourseEndDate] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [cost, setCost] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);


  // Fetch dropdown data on mount
  useEffect(() => {
    fetch(`${BASE_URL}/CourseCreation/CourseCreationFormData`)
      .then((response) => response.json())
      .then((data) => {
        setExams(data.exams || []);
        setTypes(data.types || []);
      })
      .catch((error) => console.error("Error fetching exams/types:", error));
  }, []);

  // Fetch subjects when exam changes
  useEffect(() => {
    if (selectedExamId) {
      fetch(`${BASE_URL}/CourseCreation/ExamSubjects/${selectedExamId}`)
        .then((response) => response.json())
        .then((data) => {
          setSubjects(data.subjects || []);
        })
        .catch((error) => console.error("Error fetching subjects:", error));
    }
  }, [selectedExamId]);

  // Prefill form if editing
  useEffect(() => {
    if (isEditMode && courseData) {
      setCourseName(courseData.course_name || "");
      setCourseStartDate(courseData.course_start_date || "");
      setCourseEndDate(courseData.course_end_date || "");
      setSelectedYear(courseData.course_year || "");
      setCost(courseData.cost || "");
      setDiscount(courseData.discount || "");
      setSelectedExamId(courseData.exam_id || null);
      setSelectedSubjects(
        courseData.subject_ids?.split(",").map((id) => parseInt(id)) || []
      );
      setSelectedImage(courseData.card_image?.split("-")[1] || "");
      setSelectedTypes([]); // Update this if you store type IDs as well
    }
  }, [isEditMode, courseData]);

  // Auto calculate discount and total
  useEffect(() => {
    const parsedCost = parseFloat(cost) || 0;
    const parsedDiscount = parseFloat(discount) || 0;
    const calculatedDiscount = (parsedCost * parsedDiscount) / 100;
    const calculatedTotal = parsedCost - calculatedDiscount;
    setDiscountAmount(calculatedDiscount);
    setTotalPrice(calculatedTotal);
  }, [cost, discount]);

  const handleTypeCheckboxChange = (e) => {
    const typeId = parseInt(e.target.value);
    setSelectedTypes((prev) =>
      e.target.checked ? [...prev, typeId] : prev.filter((id) => id !== typeId)
    );
  };

  const handleSubjectCheckboxChange = (e) => {
    const subjectId = parseInt(e.target.value);
    setSelectedSubjects((prev) =>
      e.target.checked
        ? [...prev, subjectId]
        : prev.filter((id) => id !== subjectId)
    );
  };

  const generateYearOptions = () => {
    const years = [];
    for (let year = 2035; year >= 2000; year--) {
      years.push(
        <option key={year} value={year}>
          {year}
        </option>
      );
    }
    return years;
  };
  const getImageFile = (imageName) => {
    const imgPath = `/OtsCourseCardImages/${imageName}`;
    // Return a dummy file object (not the actual file, but for simulation)
    return fetch(imgPath)
      .then((response) => response.blob())
      .then((blob) => new File([blob], imageName, { type: blob.type }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("courseName", courseName);
    formData.append("selectedYear", selectedYear);
    formData.append("courseStartDate", courseStartDate);
    formData.append("courseEndDate", courseEndDate);
    formData.append("cost", cost);
    formData.append("discount", discount);
    formData.append("discountAmount", discountAmount);
    formData.append("totalPrice", totalPrice);
    formData.append("selectedExamId", selectedExamId);
    formData.append("selectedSubjects", JSON.stringify(selectedSubjects));
    formData.append("selectedTypes", JSON.stringify(selectedTypes));
    // if (selectedImage) {
    //   formData.append("courseImageFile", `${ImagePath}/${selectedImage}`);
    // }
    if (selectedImage) {
      const imageFile = await getImageFile(selectedImage);
      formData.append("courseImageFile", imageFile);
    }

    if (isEditMode && courseData.course_creation_id) {
      formData.append("course_creation_id", courseData.course_creation_id);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/CourseCreation/${
          isEditMode
            ? `UpdateCourse/${courseData.course_creation_id}`
            : "CreateCourse"
        }`,
        {
          method: isEditMode ? "PUT" : "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(
          isEditMode
            ? "✅ Course Updated Successfully!"
            : "✅ Course Created Successfully!"
        );
        if (onCourseCreated) onCourseCreated();
      } else {
        alert("❌ Error while saving the course.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
    }
  };

  return (
    <div className={styles.CourseCreationFormPage}>
      <button
              className={styles.closeBtn}
              onClick={() => {
                setShowForm(false);
                setEditCourseData(null);              
              }}
            >
            ❌

            </button>
      <h2 className={styles.HeadingForEditMode}>
        {isEditMode ? "✏️ Edit Course" : "📝 Create Course"}
      </h2>
       
      <form
        className={styles.CourseFormContainer}
        style={{ backgroundColor: "white" }}
        onSubmit={handleSubmit}
      >
        <div className={styles.CourseFormSubPagesContainer}>
          <div className={styles.CourseFormSubPage}>
            {/* Course Details */}
            <h5 className={styles.SmallHeadingForCourse}>Course Details:</h5>
            <div className={styles.CourseForInputSubContainer}>
              <div className={styles.InputBoxForCourses1}>
                <label>
                  Course Name:<span className={styles.MandatoryForCourses}>*</span>
                 
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.InputBoxForCourses2}>
                <label>
                  Year: <span className={styles.MandatoryForCourses}>*</span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  required
                >
                  <option value="">Select Year</option>
                  {generateYearOptions()}
                </select>
              </div>
            </div>
            <div className={styles.CourseForInputSubContainer}>
              <div className={styles.InputBoxForCourses1}>
                <label>
                  Start Date:{" "}
                  <span className={styles.MandatoryForCourses}>*</span>
                </label>
                <input
                  type="date"
                  value={courseStartDate}
                  onChange={(e) => setCourseStartDate(e.target.value)}
                  required
                />
              </div>

              <div className={styles.InputBoxForCourses2}>
                <label>
                  End Date:<span className={styles.MandatoryForCourses}>*</span>
              
                </label>
                <input
                  type="date"
                  value={courseEndDate}
                  onChange={(e) => setCourseEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Cost Details */}
            <h5 className={styles.SmallHeadingForCourse}>Cost Details:</h5>
            <div className={styles.CourseForInputSubContainer}>
              <div className={styles.InputBoxForCourses1}>
                <label>
                  Cost: <span className={styles.MandatoryForCourses}>*</span>
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  required
                />
              </div>

              <div className={styles.InputBoxForCourses2}>
                <label>
                  Discount (%):<span className={styles.MandatoryForCourses}>*</span>
                 
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className={styles.CourseForInputSubContainer}>
              <div className={styles.InputBoxForCourses1}>
                <label>Discount Amount:</label>
                <input type="number" value={discountAmount} readOnly />
              </div>

              <div className={styles.InputBoxForCourses2}>
                <label>Total Price:</label>
                <input type="number" value={totalPrice} readOnly />
              </div>
            </div>
            {/* Exam Details */}
            <h5 className={styles.SmallHeadingForCourse}>Exam Details:</h5>
            <div className={styles.CourseForInputSubContainer}>
              <div className={styles.InputBoxForCourses2}>
                <label>
                  Select Exam:
                  <span className={styles.MandatoryForCourses}>*</span>
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    required
                  >
                    <option value="">Select Exam</option>
                    {exams.map((exam) => (
                      <option key={exam.exam_id} value={exam.exam_id}>
                        {exam.exam_name}
                      </option>
                    ))}
                  </select>
                
              </div>

              <div className={styles.SelectBoxForCourses}>
               <div className={styles.HeadingForSubjectsSelectCourse}> 
                <label>Subjects:</label>
                </div>
                {subjects.map((subject) => (
                  <div key={subject.subject_id} className={styles.SelectSubjectOptionsForCourses} >
                    <label>{subject.subject_name} 
                    </label>
                      <input
                        type="checkbox"
                        value={subject.subject_id}
                        checked={selectedSubjects.includes(subject.subject_id)}
                        onChange={handleSubjectCheckboxChange}
                      />
                     
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.CourseFormSubPage}>
            <div className={styles.SelectBoxForCourses}>
            <div className={styles.HeadingForSubjectsSelectCourse}> 
            <label>Type of Test:</label></div>
              {types.map((type) => (
                <div key={type.type_of_test_id} className={styles.SelectOptionsForCourses}>
                  <label>  {type.type_of_test_name}
                  </label>
                    <input
                      type="checkbox"
                      value={type.type_of_test_id}
                      checked={selectedTypes.includes(type.type_of_test_id)}
                      onChange={handleTypeCheckboxChange}
                    />
                   
                </div>
              ))}
            </div>

            {/* Image */}
            <div className={styles.InputSelectBoxForCourses}>
              <label>Select Course Image:</label>
              <select
                value={selectedImage}
                onChange={(e) => setSelectedImage(e.target.value)}
              >
                <option value="">-- Select Image --</option>
                {IITCourseCardImages.map((img, index) => (
                  <option key={index} value={img}>
                    {img}
                  </option>
                ))}
              </select>

              {!isEditMode && selectedImage && (
                <div style={{ marginTop: "10px" }}>
                  <strong>Preview:</strong>
                  <br />
                  <img
                    src={`/OtsCourseCardImages/${selectedImage}`}
                    alt="Selected"
                    style={{
                      maxWidth: "250px",
                      marginTop: "5px",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={styles.SubmitBTnForCourses}
          style={{ marginTop: "1rem" }}
        >
          <button type="submit">
            {isEditMode ? " Update Course" : " Save Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;

