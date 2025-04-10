import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../../config/apiConfig.js";
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css';

const CourseForm = ({ courseToEdit, onSave, onUpdate }) => {
  // State variables for form fields
  const [courseName, setCourseName] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [courseStartDate, setCourseStartDate] = useState('');
  const [courseEndDate, setCourseEndDate] = useState('');
  const [selectedexamid, setSelectedexamid] = useState('');
  const [cost, setCost] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedImage, setSelectedImage] = useState(''); // Store image name
  const [imageFile, setImageFile] = useState(null); // Store the actual image file for upload
  
  const [exams, setExams] = useState([]); // Assuming you fetch this data
  const [subjects, setSubjects] = useState([]); // Assuming you fetch this data
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [types, setTypes] = useState([]); // Assuming you fetch this data
  const [selectedTypes, setSelectedTypes] = useState([]);
  const IITCourseCardImages = [
    "iit_jee1.png",
    "iit_jee2.png",
    "iit_jee3.png",
    "iit_jee4.png",
  ];
  const ImagePath = "OtsCourseCardImages";
  useEffect(() => {
    console.log("CourseForm called", selectedImage);
  }, [selectedImage])
  useEffect(() => {
    
    // Fetch Course Creation Data (Exams and Test Types)
    const fetchCourseCreationData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/CourseCreation/CourseCreationFormData`);
        const data = await response.json();
        setExams(data.exams || []);
        setTypes(data.types || []);
      } catch (error) {
        console.error("Error fetching course creation data:", error);
      }
    };

    fetchCourseCreationData();

    // Populate form with course data for editing if courseToEdit is provided
    if (courseToEdit) {
      setCourseName(courseToEdit.course_name);
      setSelectedYear(courseToEdit.course_year);
      setCourseStartDate(courseToEdit.course_start_date);
      setCourseEndDate(courseToEdit.course_end_date);
      setCost(courseToEdit.cost);
      setDiscount(courseToEdit.discount);
      setTotalPrice(courseToEdit.total_price);
      setSelectedImage(courseToEdit.card_image); // Assuming this is the image path
      setSelectedSubjects(courseToEdit.selectedSubjects || []);
      setSelectedTypes(courseToEdit.selectedTypes || []);
    }
  }, [courseToEdit]);

  useEffect(() => {
    // Calculate discount amount and total price
    const discountAmount = (cost * discount) / 100;
    const totalPrice = cost - discountAmount;
    setDiscountAmount(discountAmount);
    setTotalPrice(totalPrice);
  }, [cost, discount]);

  const handleExamChange = async (e) => {
    debugger
    const selectedExamId = e.target.value;
    setSelectedexamid(selectedExamId); // Update selected exam ID
    setSubjects([]); // Clear the subjects first
    setSelectedSubjects([]); // Reset selected subjects

    if (selectedExamId) {
      try {
        const response = await fetch(`${BASE_URL}/CourseCreation/ExamSubjects/${selectedExamId}`);
        const data = await response.json();
        setSubjects(data.subjects || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    }
  };

  const handleSubjectCheckboxChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleTypeCheckboxChange = (e) => {
    const typeId = e.target.value;
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
  
    try {
      const formData = new FormData();
  
      // Append basic course info
      formData.append('courseName', courseName);
      formData.append('selectedYear', selectedYear);
      formData.append('courseStartDate', courseStartDate);
      formData.append('courseEndDate', courseEndDate);
      formData.append('cost', cost);
      formData.append('discount', discount);
      formData.append('discountAmount', discountAmount);
      formData.append('totalPrice', totalPrice);
      formData.append('selectedExamId', selectedexamid);
  
      // ✅ Append subjects as an array
      selectedSubjects.forEach((subject) => {
        formData.append('selectedSubjects[]', subject);
      });
  
      // ✅ Append test types as an array
      selectedTypes.forEach((type) => {
        formData.append('selectedTypes[]', type);
      });
  
      // ✅ Append course image (just the filename part)
      if (selectedImage) {
        formData.append("courseImageFile", selectedImage);
      }
  
      let url, method;
  
      if (courseToEdit) {
        // Editing existing course
        method = 'PUT';
        url = `${BASE_URL}/CourseCreation/UpdateCourse/${courseToEdit.course_creation_id}`;
      } else {
        // Creating new course
        method = 'POST';
        url = `${BASE_URL}/CourseCreation/CreateCourse`;
      }
  
      const response = await fetch(url, {
        method: method,
        body: formData,
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert(courseToEdit ? 'Course updated successfully!' : 'Course created successfully!');
      } else {
        alert('Error saving course.');
      }
  
    } catch (error) {
      console.error('Error saving course:', error);
      alert('An error occurred while saving the course.');
    }
  };
  
  
  


  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, index) => (
      <option key={currentYear + index} value={currentYear + index}>
        {currentYear + index}
      </option>
    ));
  };

  return (
    <div className={styles.formContainer}>
      <form style={{ backgroundColor: "white" }} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2>ONLINE TEST SERIES COURSE CREATION FORM</h2>
        </div>

        <div className={styles.closeButton}>
          <button type="button" onClick={onSave}>X</button>
        </div>

        {/* Course Details Section */}
        <div className={styles.formSection}>
          <h5>Course Details:</h5>
          <div className={styles.inputGroup}>
            <label htmlFor="courseName">
              Course Name:<span>*</span>
            </label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="year">
              Select Year: <span>*</span>
            </label>
            <select
              id="year"
              name="courseYear"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              required
            >
              <option value="">Select Year</option>
              {generateYearOptions()}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="courseStartDate">
              Course Start Date: <span>*</span>
            </label>
            <input
              type="date"
              id="courseStartDate"
              name="courseStartDate"
              value={courseStartDate}
              onChange={(e) => setCourseStartDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="courseEndDate">
              Course End Date:<span>*</span>
            </label>
            <input
              type="date"
              id="courseEndDate"
              name="courseEndDate"
              value={courseEndDate}
              onChange={(e) => setCourseEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Cost Details Section */}
        <div className={styles.formSection}>
          <h5>Cost Details:</h5>
          <div className={styles.inputGroup}>
            <label htmlFor="cost">
              Cost: <span>*</span>
            </label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="discount">
              Discount (%):<span>*</span>
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="discountAmount">
              Discount Amount: <span>*</span>
            </label>
            <input
              type="number"
              id="discountAmount"
              name="discountAmount"
              value={discountAmount}
              readOnly
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="totalPrice">
              Total Price:<span>*</span>
            </label>
            <input
              type="number"
              id="totalPrice"
              name="totalPrice"
              value={totalPrice}
              readOnly
            />
          </div>
        </div>

        {/* Exam Details Section */}
        <div className={styles.formSection}>
          <h5>Exam Details:</h5>

          <div className={styles.inputGroup}>
            <label htmlFor="exams">
              Select Exam:<span>*</span>
            </label>
            <select onChange={handleExamChange} id="exams" name="exams" required>
              <option value="">Select exams</option>
              {exams.map((exam) => (
                <option key={exam.exam_id} value={exam.exam_id}>
                  {exam.exam_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              Select Subjects: <span>*</span>
            </label>
            <div>
              {subjects.map((subject) => (
                <div key={subject.subject_id}>
                  <label>
                    <input
                      type="checkbox"
                      value={subject.subject_id}

                      onChange={handleSubjectCheckboxChange}
                    />
                    {subject.subject_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Type of Test Section */}
        <div className={styles.checkboxGroup}>
          <label>
            Type of test: <span>*</span>
          </label>
          <div>
            {types.map((type) => (
              <div key={type.type_of_test_id}>
                <label>
                  <input
                    type="checkbox"
                    value={type.type_of_test_id}

                    onChange={handleTypeCheckboxChange}
                  />
                  {type.type_of_test_name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Image Section */}
        <div className={styles.formSection}>
          <div className={styles.noteSection}>
            <p>
              <span>NOTE:</span> The image will be displayed in student interface.
            </p>
          </div>

          <div>
            <label htmlFor="courseImage">Select Course Image:</label>
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
            <div>
              {selectedImage && (
                <div>
                  <h4>Image Preview:</h4>
                  <img
                    src={`/${ImagePath}/${selectedImage}`} 
                    alt={`Preview ${selectedImage}`} 
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default CourseForm;