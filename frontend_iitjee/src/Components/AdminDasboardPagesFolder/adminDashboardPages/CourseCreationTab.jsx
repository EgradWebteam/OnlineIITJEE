// import React, { useEffect, useState } from "react";
// import { BASE_URL } from "../../../../apiConfig";
// // import ImagePath from '../../../assets/OtsCourseCardImages'

// const CourseCreationTab = () => {
//   const IITCourseCardImages = [
//     "iit_jee1.png",
//     "iit_jee2.png",
//     "iit_jee3.png",
//     "iit_jee4.png",
//   ];

//   const [exams, setExams] = useState([]);
//   const [types, setTypes] = useState([]);
//   const [subjects, setSubjects] = useState([]);

//   const [courseName, setCourseName] = useState("");
//   const [courseStartDate, setCourseStartDate] = useState("");
//   const [courseEndDate, setCourseEndDate] = useState("");
//   const [selectedTypes, setSelectedTypes] = useState([]);
//   const [selectedExamId, setSelectedExamId] = useState(null);
//   const [selectedSubjects, setSelectedSubjects] = useState([]);
//   const [selectedImage, setSelectedImage] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [cost, setCost] = useState("");
//   const [discount, setDiscount] = useState("");
//   const [discountAmount, setDiscountAmount] = useState(0);
//   const [totalPrice, setTotalPrice] = useState(0);

//   useEffect(() => {
//     fetch(`${BASE_URL}/CourseCreation/CourseCreationFormData`)
//       .then((response) => response.json())
//       .then((data) => {
//         setExams(data.exams || []);
//         setTypes(data.types || []);
//       })
//       .catch((error) => console.error("Error fetching exams:", error));
//   }, []);

//   useEffect(() => {
//     const parsedCost = parseFloat(cost) || 0;
//     const parsedDiscount = parseFloat(discount) || 0;

//     const calculatedDiscount = (parsedCost * parsedDiscount) / 100;
//     const calculatedTotal = parsedCost - calculatedDiscount;

//     setDiscountAmount(calculatedDiscount);
//     setTotalPrice(calculatedTotal);
//   }, [cost, discount]);

//   const handleTypeCheckboxChange = (e) => {
//     const typeId = parseInt(e.target.value);
//     if (e.target.checked) {
//       setSelectedTypes((prev) => [...prev, typeId]);
//     } else {
//       setSelectedTypes((prev) => prev.filter((id) => id !== typeId));
//     }
//   };

//   const handleExamChange = async (e) => {
//     const examId = e.target.value;
//     setSelectedExamId(examId);
//     setSelectedSubjects([]); // reset previously selected subjects
//     fetch(`${BASE_URL}/CourseCreation/ExamSubjects/${examId}`)
//       .then((response) => response.json())
//       .then((data) => {
//         setSubjects(data.subjects || []);
//       })
//       .catch((error) => console.error("Error fetching exams:", error));
//   };
//   const handleSubjectCheckboxChange = (e) => {
//     const subjectId = parseInt(e.target.value);
//     if (e.target.checked) {
//       setSelectedSubjects((prev) => [...prev, subjectId]);
//     } else {
//       setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
//     }
//   };

//   function generateYearOptions() {
//     const startYear = 2000;
//     const endYear = 2035;

//     const yearOptions = [];
//     for (let year = endYear; year >= startYear; year--) {
//       yearOptions.push(
//         <option key={year} value={year}>
//           {year}
//         </option>
//       );
//     }

//     return yearOptions;
//   }

//   const ImagePath = "OtsCourseCardImages";

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();

//     // Append other fields
//     formData.append("courseName", courseName);
//     formData.append("selectedYear", selectedYear);
//     formData.append("courseStartDate", courseStartDate);
//     formData.append("courseEndDate", courseEndDate);
//     formData.append("cost", cost);
//     formData.append("discount", discount);
//     formData.append("discountAmount", discountAmount);
//     formData.append("totalPrice", totalPrice);
//     formData.append("selectedExamId", selectedExamId);

//     // Arrays should be stringified
//     formData.append("selectedSubjects", JSON.stringify(selectedSubjects));
//     formData.append("selectedTypes", JSON.stringify(selectedTypes));
//     // Append file (IMPORTANT!)
//     if (selectedImage) {
//       formData.append("courseImageFile", `${ImagePath}/${selectedImage}`); // name MUST match upload.single("imageFile")
//     }

//     try {
//       const response = await fetch(`${BASE_URL}/CourseCreation/CreateCourse`, {
//         method: "POST",
//         body: formData, // No need to set Content-Type manually for FormData
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert("✅ Course Created Successfully!");
//       } else {
//         alert("❌ Error while saving the course.");
//       }
//     } catch (error) {
//       console.error("Submission Error:", error);
//     }
//   };


//   // const [courses, setCourses] = useState([]);


//   // useEffect(() => {
//   //   fetch(`${BASE_URL}/CourseCreation/iit-courses`)
//   //     .then((response) => response.json())
//   //     .then((data) => {
//   //       setCourses(data.data);
//   //     })
//   //     .catch((error) => console.error("Error fetching exams:", error));
//   // }, []);

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <h2>ONLINE TEST SERIES COURSE CREATION FORM</h2>

//         <div>
//           <button type="button">X</button>
//         </div>

//         <div>
//           <h5>Course Details:</h5>

//           <div>
//             <label htmlFor="courseName">
//               Course Name:<span>*</span>
//             </label>
//             <input
//               type="text"
//               id="courseName"
//               name="courseName"
//               value={courseName}
//               onChange={(e) => setCourseName(e.target.value)}
//             />
//           </div>

//           <div>
//             <label htmlFor="year">
//               Select Year: <span>*</span>
//             </label>
//             <select
//               id="year"
//               name="courseYear"
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(e.target.value)}
//             >
//               <option value="">Select Year</option>
//               {generateYearOptions()}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="courseStartDate">
//               Course Start Date: <span>*</span>
//             </label>
//             <input
//               type="date"
//               id="courseStartDate"
//               name="courseStartDate"
//               value={courseStartDate}
//               onChange={(e) => setCourseStartDate(e.target.value)}
//             />
//           </div>

//           <div>
//             <label htmlFor="courseEndDate">
//               Course End Date:<span>*</span>
//             </label>
//             <input
//               type="date"
//               id="courseEndDate"
//               name="courseEndDate"
//               value={courseEndDate}
//               onChange={(e) => setCourseEndDate(e.target.value)}
//             />
//           </div>
//         </div>

//         <div>
//           <h5>Cost Details:</h5>

//           <div>
//             <label htmlFor="cost">
//               Cost: <span>*</span>
//             </label>
//             <input
//               type="number"
//               id="cost"
//               name="cost"
//               value={cost}
//               onChange={(e) => setCost(e.target.value)}
//             />
//           </div>

//           <div>
//             <label htmlFor="discount">
//               Discount (%):<span>*</span>
//             </label>
//             <input
//               type="number"
//               id="discount"
//               name="discount"
//               value={discount}
//               onChange={(e) => setDiscount(e.target.value)}
//             />
//           </div>

//           <div>
//             <label htmlFor="discountAmount">
//               Discount Amount: <span>*</span>
//             </label>
//             <input
//               type="number"
//               id="discountAmount"
//               name="discountAmount"
//               value={discountAmount}
//               readOnly
//             />
//           </div>

//           <div>
//             <label htmlFor="totalPrice">
//               Total Price:<span>*</span>
//             </label>

//             <input
//               type="number"
//               id="totalPrice"
//               name="totalPrice"
//               value={totalPrice}
//               readOnly
//             />
//           </div>
//         </div>

//         <div>
//           <h5>Exam Details:</h5>

//           <div>
//             <label htmlFor="exams">
//               Select Exam:<span>*</span>
//             </label>
//             <select onChange={handleExamChange} id="exams" name="exams">
//               <option value="">Select exams</option>
//               {exams.map((exam) => (
//                 <option key={exam.exam_id} value={exam.exam_id}>
//                   {exam.exam_name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label>
//               Select Subjects: <span>*</span>
//             </label>
//             <div>
//               {subjects.map((subject) => (
//                 <div key={subject.subject_id}>
//                   <label>
//                     <input
//                       type="checkbox"
//                       value={subject.subject_id}
//                       checked={selectedSubjects.includes(subject.subject_id)}
//                       onChange={handleSubjectCheckboxChange}
//                     />
//                     {subject.subject_name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div>
//           <label>
//             Type of test: <span>*</span>
//           </label>
//           <div>
//             {types.map((type) => (
//               <div key={type.type_of_test_id}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     value={type.type_of_test_id}
//                     checked={selectedTypes.includes(type.type_of_test_id)}
//                     onChange={(e) => handleTypeCheckboxChange(e)}
//                   />
//                   {type.type_of_test_name}
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div>
//           <p>
//             <span>NOTE:</span> The image will be displayed in student interface.
//           </p>

//           <div>
//             <label htmlFor="courseImage">Select Course Image:</label>
//             <select
//               value={selectedImage}
//               onChange={(e) => setSelectedImage(e.target.value)}
//             >
//               <option value="">-- Select Image --</option>
//               {IITCourseCardImages.map((img, index) => (
//                 <option key={index} value={img}>
//                   {img}
//                 </option>
//               ))}
//             </select>
//             <div>
//               {selectedImage && (
//                 <div>
//                   <h4>Image Preview:</h4>
//                   <img
//                     src={`/${ImagePath}/${selectedImage}`}
//                     alt={`Preview ${selectedImage}`}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div>
//           <button type="submit">Submit</button>
//         </div>
//       </form>
//       {/* <div>
//       {courses.map((course) => (
//         <div key={course.id} style={{ marginBottom: "2rem" }}>
//           <h3>{course.course_name}</h3>
//           {course.fullImageUrl && (
//             <img
//               src={course.fullImageUrl}
//               alt={course.course_name}
//               style={{ width: "200px", height: "auto" }}
//             />
//           )}
//         </div>
//       ))}
//     </div> */}
//     </div>
//   );
// };

// export default CourseCreationTab;











import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../../apiConfig";
// import ImagePath from '../../../assets/OtsCourseCardImages'
 
const CourseCreationTab = () => {
  const IITCourseCardImages = [
    "iit_jee1.png",
    "iit_jee2.png",
    "iit_jee3.png",
    "iit_jee4.png",
  ];
 
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
 
  useEffect(() => {
    fetchCourses();
  }, []);
 
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
    if (e.target.checked) {
      setSelectedTypes((prev) => [...prev, typeId]);
    } else {
      setSelectedTypes((prev) => prev.filter((id) => id !== typeId));
    }
  };
 
  const handleExamChange = async (e) => {
    const examId = e.target.value;
    setSelectedExamId(examId);
    setSelectedSubjects([]); // reset previously selected subjects
    fetch(`${BASE_URL}/CourseCreation/ExamSubjects/${examId}`)
      .then((response) => response.json())
      .then((data) => {
        setSubjects(data.subjects || []);
      })
      .catch((error) => console.error("Error fetching exams:", error));
  };
  const handleSubjectCheckboxChange = (e) => {
    const subjectId = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedSubjects((prev) => [...prev, subjectId]);
    } else {
      setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
    }
  };
 
  function generateYearOptions() {
    const startYear = 2000;
    const endYear = 2035;
 
    const yearOptions = [];
    for (let year = endYear; year >= startYear; year--) {
      yearOptions.push(
        <option key={year} value={year}>
          {year}
        </option>
      );
    }
 
    return yearOptions;
  }
 
  const ImagePath = "OtsCourseCardImages";
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const formData = new FormData();
 
    // Append other fields
    formData.append("courseName", courseName);
    formData.append("selectedYear", selectedYear);
    formData.append("courseStartDate", courseStartDate);
    formData.append("courseEndDate", courseEndDate);
    formData.append("cost", cost);
    formData.append("discount", discount);
    formData.append("discountAmount", discountAmount);
    formData.append("totalPrice", totalPrice);
    formData.append("selectedExamId", selectedExamId);
 
    // Arrays should be stringified
    formData.append("selectedSubjects", JSON.stringify(selectedSubjects));
    formData.append("selectedTypes", JSON.stringify(selectedTypes));
    // Append file (IMPORTANT!)
    if (selectedImage) {
      formData.append("courseImageFile", `${ImagePath}/${selectedImage}`); // name MUST match upload.single("imageFile")
    }
 
    try {
      const response = await fetch(`${BASE_URL}/CourseCreation/CreateCourse`, {
        method: "POST",
        body: formData, // No need to set Content-Type manually for FormData
      });
 
      const result = await response.json();
      if (result.success) {
        alert("✅ Course Created Successfully!");
      } else {
        alert("❌ Error while saving the course.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
    }
  };
 
 
  const [courses, setCourses] = useState([]);
 
 
  useEffect(() => {
    fetch(`${BASE_URL}/CourseCreation/iit-courses`)
      .then((response) => response.json())
      .then((data) => {
        setCourses(data.data);
      })
      .catch((error) => console.error("Error fetching exams:", error));
  }, []);
 
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>ONLINE TEST SERIES COURSE CREATION FORM</h2>
 
        <div>
          <button type="button">X</button>
        </div>
 
        <div>
          <h5>Course Details:</h5>
 
          <div>
            <label htmlFor="courseName">
              Course Name:<span>*</span>
            </label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
 
          <div>
            <label htmlFor="year">
              Select Year: <span>*</span>
            </label>
            <select
              id="year"
              name="courseYear"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {generateYearOptions()}
            </select>
          </div>
 
          <div>
            <label htmlFor="courseStartDate">
              Course Start Date: <span>*</span>
            </label>
            <input
              type="date"
              id="courseStartDate"
              name="courseStartDate"
              value={courseStartDate}
              onChange={(e) => setCourseStartDate(e.target.value)}
            />
          </div>
 
          <div>
            <label htmlFor="courseEndDate">
              Course End Date:<span>*</span>
            </label>
            <input
              type="date"
              id="courseEndDate"
              name="courseEndDate"
              value={courseEndDate}
              onChange={(e) => setCourseEndDate(e.target.value)}
            />
          </div>
        </div>
 
        <div>
          <h5>Cost Details:</h5>
 
          <div>
            <label htmlFor="cost">
              Cost: <span>*</span>
            </label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
 
          <div>
            <label htmlFor="discount">
              Discount (%):<span>*</span>
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
 
          <div>
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
 
          <div>
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
 
        <div>
          <h5>Exam Details:</h5>
 
          <div>
            <label htmlFor="exams">
              Select Exam:<span>*</span>
            </label>
            <select onChange={handleExamChange} id="exams" name="exams">
              <option value="">Select exams</option>
              {exams.map((exam) => (
                <option key={exam.exam_id} value={exam.exam_id}>
                  {exam.exam_name}
                </option>
              ))}
            </select>
          </div>
 
          <div>
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
                      checked={selectedSubjects.includes(subject.subject_id)}
                      onChange={handleSubjectCheckboxChange}
                    />
                    {subject.subject_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        <div>
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
                    checked={selectedTypes.includes(type.type_of_test_id)}
                    onChange={(e) => handleTypeCheckboxChange(e)}
                  />
                  {type.type_of_test_name}
                </label>
              </div>
            ))}
          </div>
        </div>
 
        <div>
          <p>
            <span>NOTE:</span> The image will be displayed in student interface.
          </p>
 
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
 
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
      <div>
      {courses.map((course) => (
        <div key={course.id} style={{ marginBottom: "2rem" }}>
          <h3>{course.course_name}</h3>
          {course.fullImageUrl && (
            <img
              src={course.fullImageUrl}
              alt={course.course_name}
              style={{ width: "200px", height: "auto" }}
            />
          )}
        </div>
      ))}
    </div>
    </div>
  );
};
 
export default CourseCreationTab;
 
 