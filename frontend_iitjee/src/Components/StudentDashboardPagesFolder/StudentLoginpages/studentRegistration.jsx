import React, { useState } from "react";
import Styles from "../../../Styles/StudentDashboardCSS/StudentRegistration.module.css";
import SRFormImage from "../../../assets/SRFormImage.jpg";
import MainHeader from "../../LandingPagesFolder/mainPageHeaderFooterFolder/MainHeader";
import MainFooter from "../../LandingPagesFolder/mainPageHeaderFooterFolder/MainFooter";
import { BASE_URL } from "../../../../apiConfig";
const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    candidateName: '',
    dateOfBirth: '',
    gender: '',
    category: '',
    emailId: '',
    confirmEmailId: '',
    contactNo: '',
    fatherName: '',
    occupation: '',
    mobileNo: '',
    line1: '',
    state: '',
    districts: '',
    pincode: '',
    qualifications: '',
    nameOfCollege: '',
    passingYear: '',
    marks: '',
    uploadedPhoto: null,
    proof: null,
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      let errorMessage = '';

      // Validate file size based on the field
      if (name === 'uploadedPhoto') {
        if (file.size < 50 * 1024 || file.size > 200 * 1024) { // 50KB to 200KB
          errorMessage = 'Uploaded Photo must be between 50KB and 200KB.';
        }
      }

      // Update state and errors
      if (errorMessage) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: errorMessage,
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: '', // Clear any previous error
        }));
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: file,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.candidateName) newErrors.candidateName = "Candidate Name is required.";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required.";
    if (!formData.gender) newErrors.gender = "Gender is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.emailId) newErrors.emailId = "Email ID is required.";
    if (formData.emailId !== formData.confirmEmailId) newErrors.confirmEmailId = "Email IDs do not match.";
    if (!formData.contactNo) newErrors.contactNo = "Contact No is required.";
    if (!formData.fatherName) newErrors.fatherName = "Father's/Guardian's Name is required.";
    if (!formData.occupation) newErrors.occupation = "Occupation is required.";
    if (!formData.mobileNo) newErrors.mobileNo = "Mobile No is required.";
    if (!formData.line1) newErrors.line1 = "Address Line1 is required.";
    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.districts) newErrors.districts = "Districts are required.";
    if (!formData.pincode) newErrors.pincode = "Pincode is required.";
    if (!formData.qualifications) newErrors.qualifications = "Qualifications are required.";
    if (!formData.nameOfCollege) newErrors.nameOfCollege = "Name of College is required.";
    if (!formData.passingYear) newErrors.passingYear = "Passing Year is required.";
    if (!formData.marks) newErrors.marks = "Marks are required.";
    if (!formData.uploadedPhoto) newErrors.uploadedPhoto = "Photo upload is required.";
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Create a FormData object to send data to the server
      const formDataToSend = new FormData();

      // Append all form data (text fields) to FormData
      formDataToSend.append('candidateName', formData.candidateName);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('emailId', formData.emailId);
      formDataToSend.append('confirmEmailId', formData.confirmEmailId);
      formDataToSend.append('contactNo', formData.contactNo);
      formDataToSend.append('fatherName', formData.fatherName);
      formDataToSend.append('occupation', formData.occupation);
      formDataToSend.append('mobileNo', formData.mobileNo);
      formDataToSend.append('line1', formData.line1);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('districts', formData.districts);
      formDataToSend.append('pincode', formData.pincode);
      formDataToSend.append('qualifications', formData.qualifications);
      formDataToSend.append('nameOfCollege', formData.nameOfCollege);
      formDataToSend.append('passingYear', formData.passingYear);
      formDataToSend.append('marks', formData.marks);

      // Append files (if they exist)
      if (formData.uploadedPhoto) {
        formDataToSend.append('uploadedPhoto', formData.uploadedPhoto);
      }
      if (formData.proof) {
        formDataToSend.append('proof', formData.proof);
      }

      // Append termsAccepted as a string or boolean
      formDataToSend.append('termsAccepted', formData.termsAccepted.toString());

      // Convert FormData to an object and log it
      const formDataObject = Object.fromEntries(formDataToSend.entries());
      console.log('FormData Object:', formDataObject);

      try {
        const response = await fetch(`${BASE_URL}/student/studentRegistration`, {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Success:', result);
        // Handle success (e.g., show a success message, redirect, etc.)
      } catch (error) {
        console.error('Error:', error);
        // Handle error (e.g., show an error message)
      }
    }
    console.log("Form submitted successfully!");
};


  return (
    <div className={Styles.SRMainFormDiv}>
      <MainHeader />
      <div className={Styles.SRMainSubFormDiv}>
        <div className={Styles.RegistrationParentDiv}>
          <h2 className={Styles.RegistrationHeading}>
            Student Registration Page
          </h2>
          <div className={Styles.RegistrationBackbtnDiv}>
            <button className={Styles.SRBackbtn}>Back</button>
          </div>
          <form className={Styles.SRForm} onSubmit={handleSubmit}>
            <div>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>Personal Details</h1>
                <div>
                  <label>
                    Candidate Name:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    placeholder="Candidate Name"
                    value={formData.candidateName}
                    onChange={handleChange}
                    required
                  />
                  {errors.candidateName && <p className={Styles.error}>{errors.candidateName}</p>}
                </div>

                <div>
                  <label>
                    Date of Birth:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                  {errors.dateOfBirth && <p className={Styles.error}>{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label>
                    Gender:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <div className={Styles.SRradioInputs}>
                    <div>
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        onChange={handleChange}
                        required
                      />
                      <label>Male</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        onChange={handleChange}
                        required
                      />
                      <label>Female</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        onChange={handleChange}
                        required
                      />
                      <label>Other</label>
                    </div>
                  </div>
                  {errors.gender && <p className={Styles.error}>{errors.gender}</p>}
                </div>

                <div>
                  <label>
                    Category:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <div className={Styles.SRradioInputs}>
                    <div>
                      <input
                        type="radio"
                        name="category"
                        value="General"
                        onChange={handleChange}
                        required
                      />
                      <label>General</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="category"
                        value="OBC"
                        onChange={handleChange}
                        required
                      />
                      <label>OBC</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="category"
                        value="SC/ST"
                        onChange={handleChange}
                        required
                      />
                      <label>SC/ST</label>
                    </div>
                  </div>
                  {errors.category && <p className={Styles.error}>{errors.category}</p>}
                </div>

                <div>
                  <label>
                    Email ID:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="email"
                    name="emailId"
                    autoComplete="off"
                    placeholder="Email ID"
                    value={formData.emailId}
                    onChange={handleChange}
                    required
                  />
                  {errors.emailId && <p className={Styles.error}>{errors.emailId}</p>}
                </div>

                <div>
                  <label>
                    Confirm Email ID:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="email"
                    name="confirmEmailId"
                    placeholder="Confirm Email ID"
                    value={formData.confirmEmailId}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmEmailId && <p className={Styles.error}>{errors.confirmEmailId}</p>}
                </div>

                <div>
                  <label>
                    Contact No:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNo"
                    placeholder="Contact No"
                    value={formData.contactNo}
                    onChange={handleChange}
                    required
                  />
                  {errors.contactNo && <p className={Styles.error}>{errors.contactNo}</p>}
                </div>
              </div>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>Father's/ Guardian's Details</h1>
                <div>
                  <label>
                    Father/Mother/Guardian Name:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    placeholder="Father Name"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                  />
                  {errors.fatherName && <p className={Styles.error}>{errors.fatherName}</p>}
                </div>

                <div>
                  <label>
                    Occupation:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    placeholder="Occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                  />
                  {errors.occupation && <p className={Styles.error}>{errors.occupation}</p>}
                </div>

                <div>
                  <label>
                    Mobile No:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNo"
                    placeholder="Mobile No"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    required
                  />
                  {errors.mobileNo && <p className={Styles.error}>{errors.mobileNo}</p>}
                </div>
              </div>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>Communication Details</h1>

                <div>
                  <label>
                    Line1:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="line1"
                    placeholder="Line1"
                    value={formData.line1}
                    onChange={handleChange}
                    required
                  />
                  {errors.line1 && <p className={Styles.error}>{errors.line1}</p>}
                </div>

                <div>
                  <label>
                    State:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  {errors.state && <p className={Styles.error}>{errors.state}</p>}
                </div>

                <div>
                  <label>
                    Districts:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="districts"
                    placeholder="Districts"
                    value={formData.districts}
                    onChange={handleChange}
                    required
                  />
                  {errors.districts && <p className={Styles.error}>{errors.districts}</p>}
                </div>

                <div>
                  <label>
                    Pincode:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                  {errors.pincode && <p className={Styles.error}>{errors.pincode}</p>}
                </div>
              </div>
            </div>
            <div className={Styles.SRFormSubDiv2}>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>Education Details</h1>
                <div>
                  <label htmlFor="">
                    Qualifications:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <div className={Styles.SRradioInputs2}>
                    <div className={Styles.SRQualificationDiv}>
                      <div>
                        <input
                          type="radio"
                          name="qualifications"
                          value="Appearing"
                          onChange={handleChange}
                          required
                        />
                        <label>Appearing XII</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="qualifications"
                          value="Passed"
                          onChange={handleChange}
                          required
                        />
                        <label>Passed XII</label>
                      </div>
                    </div>
                  </div>
                  {errors.qualifications && <p className={Styles.error}>{errors.qualifications}</p>}
                </div>

                <div>
                  <label>
                    Name of College:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nameOfCollege"
                    placeholder="Name of College"
                    value={formData.nameOfCollege}
                    onChange={handleChange}
                    required
                  />
                  {errors.nameOfCollege && <p className={Styles.error}>{errors.nameOfCollege}</p>}
                </div>

                <div>
                  <label>
                    Passing Year:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="passingYear"
                    placeholder="Passing Year"
                    value={formData.passingYear}
                    onChange={handleChange}
                    required
                  />
                  {errors.passingYear && <p className={Styles.error}>{errors.passingYear}</p>}
                </div>

                <div>
                  <label>
                    Marks(%):
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="marks"
                    placeholder="Marks (%)"
                    value={formData.marks}
                    onChange={handleChange}
                    required
                  />
                  {errors.marks && <p className={Styles.error}>{errors.marks}</p>}
                </div>
              </div>

              <div className={Styles.SRSubField2}>
                <h1 className={Styles.SR_hTag}>Upload Image/Documents</h1>
                <div className={Styles.SRUploadPhotoDiv}>
                  <div>
                    <label>
                      Upload Photo:
                      <span className={Styles.SRImportantField}>*</span>
                    </label>
                    <div className={Styles.SRFormImage}>
                      <img src={SRFormImage} alt="no img" />
                    </div>
                    <input
                      type="file"
                      name="uploadedPhoto"
                      onChange={handleChange}
                      required
                    />
                    {errors.uploadedPhoto && <p className={Styles.error}>{errors.uploadedPhoto}</p>}
                    <p className={Styles.SRNotPoint}>
                      <strong> *Note : </strong>File size must be between 50KB
                      and 200KB. Only JPG, JPEG, or PNG allowed.{" "}
                    </p>
                  </div>

                </div>
              </div>
              <div className={Styles.SRSubField2}>
                <div className={Styles.termsAndConditions}>
                  <label>
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={() => setFormData((prevData) => ({ ...prevData, termsAccepted: !prevData.termsAccepted }))}
                    />
                    I accept all the{" "}
                    <span className={Styles.tcLink}>terms & conditions</span>
                  </label>
                  {errors.termsAccepted && <p className={Styles.error}>{errors.termsAccepted}</p>}
                </div>
              </div>
              <div>
                {/* <button type="submit" className={Styles.buttonforStdReg}>
                  Pay Now
                </button> */}

                <button type="submit" className={Styles.buttonforStdReg}>
                  Register
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <MainFooter />
    </div>
  );
};

export default StudentRegistration;