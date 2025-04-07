import React from "react";
import Styles from "../../../Styles/StudentDashboardCSS/StudentRegistration.module.css";
import SRFormImage from "../../../assets/SRFormImage.jpg";
import MainHeader from "../../LandingPagesFolder/mainPageHeaderFooterFolder/MainHeader";
import MainFooter from "../../LandingPagesFolder/mainPageHeaderFooterFolder/MainFooter";

const StudentRegistration = () => {
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
          <form className={Styles.SRForm}>
            <div>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>PersonalDetails</h1>
                <div>
                  <label>
                    Candidate Name:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    placeholder="Candidate Name"
                    required
                  />
                </div>

                <div>
                  <label>
                    Date of Birth:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input type="date" name="dateOfBirth" required />
                </div>

                <div>
                  <label>
                    Gender:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <div className={Styles.SRradioInputs}>
                    <div>
                      <input type="radio" name="Gender" required />
                      <label htmlFor="male">Male</label>
                    </div>

                    <div>
                      <input
                        type="radio"
                        name="Gender"
                        value="Female"
                        required
                      />
                      <label> Female</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="Gender"
                        value="Other"
                        required
                      />
                      <label> Other</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="">
                    Category:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <div className={Styles.SRradioInputs}>
                    <div>
                      <input
                        type="radio"
                        name="Category"
                        value="General"
                        required
                      />
                      <label>General</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="Category"
                        value="OBC"
                        required
                      />{" "}
                      <label>OBC</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="Category"
                        value="SC/ST"
                        required
                      />{" "}
                      <label>SC/ST</label>
                    </div>
                  </div>
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
                    required
                  />
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
                    required
                    className="fromboxshado"
                  />
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
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                          required
                        />{" "}
                        <label>Appearing XII</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="qualifications"
                          value="Passsed"
                          required
                        />{" "}
                        <label>Passsed XII</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label>
                    Name of College:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="NameOfCollege"
                    placeholder="Name of College"
                    required
                  />
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
                    required
                  />
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
                    required
                  />
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
                    <input type="file" name="UploadedPhoto" required />

                    <p className={Styles.SRNotPoint}>
                      <strong> *Note : </strong>File size must be between 50KB
                      and 200KB. Only JPG, JPEG, or PNG allowed.{" "}
                    </p>
                  </div>
                  <div>
                    <label>
                      Proof:
                      <span className={Styles.SRImportantField}>*</span>
                    </label>
                    <div className={Styles.SRFormImage}>
                      <img src={SRFormImage} alt="no img" />
                    </div>
                    <input type="file" name="Proof" required />
                    <p className={Styles.SRNotPoint}>
                      <strong> *Note :</strong> File size must be between 100KB
                      and 500KB. Only JPG, JPEG, or PNG allowed.
                    </p>
                  </div>
                </div>
              </div>
              <div className={Styles.SRSubField2}>
                <div className={Styles.termsAndConditions}>
                  <label>
                    I accept all the{" "}
                    <span className={Styles.tcLink}>terms & conditions</span>
                  </label>
                </div>
              </div>
              <div>
                <button type="submit" className={Styles.buttonforStdReg} onClick={() => setSubmitType("buyNow")}>
                  Pay Now
                </button>

                <button type="submit"  className={Styles.buttonforStdReg} onClick={() => setSubmitType("register")}>
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
