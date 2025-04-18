import React from "react";
import Contact_Data from "../../DataFiles/Contact_Data";
import { IoCall } from "react-icons/io5";
import { IoIosMail } from "react-icons/io";
import styles from '../../Styles/GlobalFilesCSS/ContacUs.module.css'
import MainFooter from "../LandingPagesFolder/MainPageHeaderFooterFolder/MainFooter.jsx";
import LogoHomeHeader from "../LandingPagesFolder/mainPageHeaderFooterFolder/LogoHomeHeader.jsx";


const ContactUs = () => {
  return (
    <div className={styles.ContactusHomePage}>
      <LogoHomeHeader/>
      <div id="contact" className={styles.ContactContainer}>
        {Contact_Data.map((data, index) => (
          <div key={index} className={styles.contact_sub_container}>
            <div >
              <h2 className={styles.ContactForHeading}>{data.contact_title}</h2>

              <div className={styles.contact_box}>
                {/* Map Section */}
                <div className={styles.ContactUsMap}>
                  <iframe
                    src={data.map}
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                    title={`Map showing ${data.adress}`}
                  ></iframe>
                </div>

                {/* Address Section */}
                <div className={styles.ContactAddress}>
                  <h1 className={styles.headingForAddress}>{data.adress}</h1>
                  <ul className={styles.listForAddress}>
                    <li>{data.ad1}</li>
                    <li>{data.add_1}</li>
                    <li>{data.add_2}</li>
                    <li>{data.add_3}</li>
                    <li>{data.add_4}</li>
                    <li>{data.add_5}</li>
                    <li className={styles.iconsForContact}><IoCall /> &nbsp; {data.mobile}</li>
                    <li  className={styles.iconsForContact}> <IoIosMail /> &nbsp; {data.email}</li>
                    
                  </ul>
                </div>

                {/* Contact Form Section */}
                <div className="contact-form">
                  <form className={styles.ContactUsForm}>
                    <input type="text" name="firstName" placeholder="First Name" className={styles.ContactInput} />
                    <input type="text" name="lastName" placeholder="Last Name" className={styles.ContactInput} />
                    <input type="email" name="email" placeholder="Your Email Address" className={styles.ContactInput} />
                    <select name="category" defaultValue="" className={styles.ContactSelect}>
                      <option value="" disabled>
                        {data.category}
                      </option>
                      <option value="general">{data.op1}</option>
                      <option value="exams">{data.op2}</option>
                      <option value="courses">{data.op3}</option>
                      <option value="payment">{data.op4}</option>
                    </select>
                    <textarea name="message" placeholder="Your Message" className={styles.ContactTextarea}></textarea>
                    <input type="submit" value="Submit" className={styles.SubmitBtnForContact} />
                  </form>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <MainFooter />
    </div>
  );
};

export default ContactUs;
