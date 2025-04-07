import React from "react";
import Contact_Data from "../../DataFiles/Contact_Data";
import { GiPhone } from "react-icons/gi";
import { MdAttachEmail } from "react-icons/md";
import MainHeader from "../LandingPagesFolder/mainPageHeaderFooterFolder/MainHeader";
import MainFooter from "../LandingPagesFolder/mainPageHeaderFooterFolder/MainFooter";

const ContactUs = () => {
  return (
    <div>
      <MainHeader />
      <div id="contact">
        {Contact_Data.map((data, index) => (
          <div key={index} className="contactuscontainer">
            <div className={data.contact_sub_contcainer}>
              <h2>{data.contact_title}</h2>

              <div className={data.contact_box}>
                {/* Map Section */}
                <div className="map">
                  <iframe
                    src={data.map}
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                    title={`Map showing ${data.adress}`}
                  ></iframe>
                </div>

                {/* Address Section */}
                <div className={data.mpa_adresss}>
                  <h1 className={data.adres}>{data.adress}</h1>
                  <ul style={{ fontSize: "20px", padding: 0, listStyle: "none" }}>
                    <li style={{ padding: "7px 0" }}>{data.ad1}</li>
                    <li style={{ padding: "7px 0" }}>{data.add_1}</li>
                    <li style={{ padding: "7px 0" }}>{data.add_2}</li>
                    <li style={{ padding: "7px 0" }}>{data.add_3}</li>
                    <li style={{ padding: "7px 0" }}>{data.add_4}</li>
                    <li style={{ padding: "7px 0" }}>{data.add_5}</li>
                    <li style={{ padding: "10px 0" }}>
                      <GiPhone /> &nbsp; {data.mobile}
                    </li>
                    <li style={{ padding: "10px 0" }}>
                      <MdAttachEmail /> &nbsp; {data.email}
                    </li>
                  </ul>
                </div>

                {/* Contact Form Section */}
                <div className="contact-form">
                  <form>
                    <input type="text" name="firstName" placeholder="First Name" />
                    <input type="text" name="lastName" placeholder="Last Name" />
                    <input type="email" name="email" placeholder="Your Email Address" />
                    <select name="category" defaultValue="">
                      <option value="" disabled>
                        {data.category}
                      </option>
                      <option value="general">{data.op1}</option>
                      <option value="exams">{data.op2}</option>
                      <option value="courses">{data.op3}</option>
                      <option value="payment">{data.op4}</option>
                    </select>
                    <textarea name="message" placeholder="Your Message"></textarea>
                    <input type="submit" value="Submit" />
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
