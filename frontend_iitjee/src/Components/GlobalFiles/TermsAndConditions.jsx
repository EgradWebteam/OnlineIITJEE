import React from "react";
import logo from "../../assets/EGTLogoExamHeaderCompressed.png";
import styles from "../../Styles/GlobalFilesCSS/TermsAndConditions.module.css";

const TermsAndConditions = ({ isModalOpen, setIsModalOpen }) => {
  const handleCloseTermsAndCond = () => {
    setIsModalOpen((prev) => !prev);
  };

  return (
    <div className={styles.TermsAndConditionsHomePage}>
      <div className={styles.TermsAdnConPopUp}>
        <div className={styles.CloseBtnForTermsAndCon}>
          <button onClick={handleCloseTermsAndCond}>Close</button>
        </div>
        <div className={styles.logoForTermsAndCon}>
          <img src={logo} alt="logoImg" />
        </div>
        <h3>Terms and Conditions</h3>
        <div className={styles.TermsAdnConditionsContent}>
          <p>
            We at www.egradtutor.in value your trust placed in us by you (”
            subscriber”).{" "}
          </p>
          <p>
            In order to honor that trust, we adhere to ethical standards in
            gathering, using, and safeguarding any information provided by you.
            We are committed to protecting your privacy and work towards
            offering you a useful and safe online experience. Furthermore, we
            use a secured server, and this Privacy Policy describes our
            agreement with you regarding how we handle information on this
            website.
          </p>

          <p>
            This privacy policy ("Policy") applies to all Users who access or
            visit this website. You are therefore required to read and
            understand the Policy before submitting any Personal Information (as
            defined hereinafter). By visiting or accessing this website, you
            agree and acknowledge to be bound by this Privacy Policy and hereby
            consent to us collecting, using, and processing your personal and
            non-personal information in the manner set out below.
          </p>

          <p>
            1. Please note that the type and amount of information we receive
            about you depends entirely on how you use or access our website.
          </p>

          <p>
            The application/website/services obtain the information you provide
            voluntarily when you download material, browse through our website,
            register for any service, or log in to your account held on our
            website. When you register with us, you provide general information,
            including but not limited to:
          </p>
          <ul>
            <li>
              your name, age, sex, email address, location, phone number,
              password and your educational interests
            </li>
            <li>
              transaction-related information, such as when you make purchase,
              respond to any offers, or download coruse applications or access
              study materials from our website
            </li>
            <li>information you provide us when you contact us forhelp</li>
            <li>
              sessions, taking online tests, online and offline classes.
              information you enter into our system when using the services such
              aswhile participating in discussions or doubt clearance
            </li>
          </ul>
          <div>
            <p>
              Note that you should not submit any information that you do not
              want to be retained by us.
            </p>

            <p>
              2. We automatically track and collect certain non-personal
              information such as website navigation data, Internet Protocol
              ("IP") addresses, time stamps, and URLs. We use this information
              to do internal research on our users' demographics, interests, and
              behavior to better understand, protect, and serve you.
            </p>

            <p>
              3. If you send us personal correspondence, such as emails or
              letters, or if other users or third parties send us correspondence
              about your activities or postings on our website, we may store
              such information on our servers.
            </p>

            <p>
              4. We enable access to your Personal Information to employees who
              we believe reasonably need to know or require such information to
              fulfill their jobs to provide, operate, develop, or improve our
              products or services. We do not rent, sell, or share personal
              information about you with other people or non-affiliated
              companies except to provide products or services you have
              requested, when we have your permission in writing or
              electronically to do so, or under the following circumstances:
            </p>

            <ul>
              <li>
                We provide information to trusted partners who work on behalf
                of, or under our confidentiality agreements. These entities may
                use your personal information to help us communicate with you
                about offers and our marketing partners. However, these entities
                do not have any independent right to use or share this
                information.
              </li>
              <li>
                We respond to subpoenas, court orders, or legal processes, or to
                establish or exercise our legal rights or defend against legal
                claims.
              </li>
            </ul>

            <p>
              <strong>TERMS AND CONDITIONS/PRIVACY POLICY</strong>
            </p>

            <p>
              We at{" "}
              <a className="anchorLinksTAC" href="https://www.egradtutor.in">
                www.egradtutor.in
              </a>{" "}
              value the trust placed in us by you (“subscriber”). In order to
              honor that trust, we adhere to ethical standards in gathering,
              using, and safeguarding any information provided by you. We are
              committed to protecting your privacy and working towards offering
              you a useful and safe online experience. Furthermore, we use a
              secured server, and this Privacy Policy describes our agreement
              with you regarding how we handle information on this website.
            </p>

            <p>
              This privacy policy (“Policy”) applies to all Users who access or
              visit this website and are therefore required to read and
              understand the Policy before submitting any Personal Information
              (as defined hereinafter). By visiting or accessing this website,
              you agree and acknowledge to be bound by this Privacy Policy and
              you hereby consent to us collecting, using, and processing your
              personal and non-personal information in the manner set out below.
            </p>
          </div>

          <p>
            1. Please note that the type and amount of information we receive
            about you depends entirely on how you use or access our website. The
            application/website/services obtain the information you provide
            voluntarily when you download material, browse through our website,
            register to any service or login to your account held on our
            website. When you register with us, you provide general information
            but not limited to:
          </p>

          <ul>
            <li>
              Your name, age, sex, email address, location, phone number,
              password, and your educational interests.
            </li>
            <li>
              Transaction-related information, such as when you make a purchase,
              respond to any offers, or download or use applications or access
              study materials from our website.
            </li>
            <li>Information you provide us when you contact us for help.</li>
            <li>
              Information you enter into our system when using the services such
              as while participating in discussions or doubt clearance sessions,
              taking online tests, online, and offline classes.
            </li>
          </ul>

          <p>
            Note that you should not submit any information that you do not want
            to be retained by us.
          </p>

          <p>
            2. We automatically track and collect certain non-personal
            information such as website navigation data, Internet Protocol
            (“IP”) addresses, timestamps, and URLs. We use this information to
            do internal research on our users’ demographics, interests, and
            behavior to better understand, protect, and serve you.
          </p>

          <p>
            3. If you send us personal correspondence, such as emails or
            letters, or if other users or third parties send us correspondence
            about your activities or postings on our website, we may store such
            information on our servers.
          </p>

          <p>
            4. We enable access to your Personal Information to employees who we
            believe reasonably need to know or require such information to
            fulfill their jobs to provide, operate, develop, or improve our
            products or services. We do not rent, sell, or share personal
            information about you with other people or non-affiliated companies
            except to provide products or services you have requested, when we
            have your permission in writing or electronically to do so, or under
            the following circumstances:
          </p>

          <ul>
            <li>
              We provide information to trusted partners who work on behalf of,
              or under our confidentiality agreements. These entities may use
              your personal information to help us communicate with you about
              offers and our marketing partners. However, these entities do not
              have any independent right to use or share this information.
            </li>
            <li>
              We respond to subpoenas, court orders, or legal process, or to
              establish or exercise our legal rights or defend against legal
              claims.
            </li>
            <li>
              We believe it is necessary to share information in order to
              investigate, prevent, or take action regarding illegal activities,
              suspected fraud, situations involving potential threats to the
              physical safety of any person, violations of terms ofuse, or as
              otherwise required by law.
            </li>
            <li>
              We transfer information about you if we are acquired by ormerged
              with another company. In this event, we will notify you
              beforeyourinformation is transferred and becomessubjecttoa
              different privacy policy.
            </li>
          </ul>

          <strong> Note that we share your information </strong>
          <p>
            5. We may withhold personal information about you including, but not
            limited to the Name, Postal Address, Contact Number, Email,
            Home/current Town, Gender, ID proofs. If you have filled out a user
            profile, we will provide an obvious way for you to access your
            profile from our application or website. We adopt reasonable
            security measures to protect your password from being exposed or
            disclosed to anyone.
          </p>

          <p>
            6. Your personal information processed by us is kept in a form which
            permits your identification for no longer than is necessary and for
            the purposes for which the personal information is processed in line
            with legal, regulatory, contractual or statutory obligations as
            applicable. At the expiry of such periods, your personal information
            will be deleted or archived to comply with legal/contractual
            retention obligations or in accordance with applicable statutory
            limitation periods.
          </p>

          <p>
            7. We treat your personal information or your use of the service as
            private and confidential and we do not check, edit or reveal it to
            any third parties except where we believe in good faith that such
            action is necessary to comply with the applicable legal and
            regulatory processes or to protect and defend the rights of other
            users or to enforce the terms of service which are binding on all
            the users of the website. In the event of a breach, we shall notify
            the affected users within a reasonable time of first having become
            aware of such breach.
          </p>

          <p>
            8. We send cookies (small files containing a string of characters)
            to your computer, thereby uniquely identifying your browser. Cookies
            are used to track your preferences, help you log in faster, and are
            aggregated to determine user trends. This data is used to improve
            our offerings, such as providing more content in areas of greater
            interest to a majority of users. Most browsers are initially set up
            to accept cookies, but you can reset your browser to refuse all
            cookies or to indicate when a cookie is being sent. However, some of
            our features and services may not function properly if your cookies
            are disabled.
          </p>

          <p>
            9. We are not responsible for the practices or policies of the
            websites linked to or from this website, including but not limited
            to their privacy practices or policies. If you elect to use a link
            that accesses another party's website, you will be subject to that
            website's terms and practices.
          </p>

          <p>
            10. We may alert you by email or phone (through SMS/Call) to inform
            you about new service offerings or other information which we feel
            might be useful for you. By your using this website, you are
            consenting to our sending you such information.
          </p>

          <p>
            11. When you use certain features on our website like the discussion
            forums and you post or share your personal information such as
            comments, messages, files, photos, such information will be
            available to all users, and will be in the public domain. All such
            sharing of information is done at your own risk. Please be aware
            that if you disclose personal information in your profile or when
            posting on/about our forums, this information may become publicly
            available and anything against the terms of the policy shall be
            taken seriously, and action shall be processed.
          </p>

          <p>
            12. When you send an email or other communication to us, we may
            retain those communications in order to process your inquiries,
            respond to your requests, and improve our services.
          </p>

          <p>
            13. To the extent permitted by law, we may record and monitor your
            communications with us to ensure compliance with our legal and
            regulatory obligations and our internal policies. This may include
            the recording of telephone conversations.
          </p>

          <p>
            14. We automatically collect limited information about your
            computer's connection to the Internet, mobile number, including but
            not limited to your IP address, browser software, operating system
            types, click stream patterns and dates and times that our website or
            application is accessed, whenever you visit our website or
            application.
          </p>

          <p>
            15. As the company evolves, our privacy policy will need to evolve
            as well to cover new situations. You are advised to review this
            policy regularly for any changes, as continued use shall be deemed
            approval of all changes made in the privacy policy. If any of these
            provisions are deemed invalid, void, or unenforceable for any
            reason, that provision shall be deemed severable and shall not
            affect the validity and enforcement of other terms.
          </p>

          <p>
            16. If you have any grievances regarding the processing of your
            personal information, you may drop a mail at{" "}
            <a className="anchorLinksTAC" href="mailto:info@egradtutor.in">
              info@egradtutor.in
            </a>
            .
          </p>

          <ul>
            <li>
              We believe it is necessary to share information in order to
              investigate, prevent, or take action regarding illegal activities,
              suspected fraud, situations involving potential threats to the
              physical safety of any person, violations of terms of use, or as
              otherwise required by law.
            </li>
            <li>
              We transfer information about you if we are acquired by or merged
              with another company. In this event, we will notify you before
              your information is transferred and becomes subject to a different
              privacy policy. Note that we share your information with third
              parties only to the extent necessary to perform the functions and
              provide the services, and only pursuant to binding contractual
              obligations requiring such third parties to maintain the privacy
              and security of your data.
            </li>
            <li>
              We may withhold personal information about you including, but not
              limited to, the Name, Postal Address, Contact Number, Email,
              Home/current Town, Gender, ID proofs. If you have filled out a
              user profile, we will provide an obvious way for you to access
              your profile from our application or website. We adopt reasonable
              security measures to protect your password from being exposed or
              disclosed to anyone.
            </li>
            <li>
              Your personal information processed by us is kept in a form which
              permits your identification for no longer than is necessary and
              for the purposes for which the personal information is processed,
              in line with legal, regulatory, contractual or statutory
              obligations as applicable. At the expiry of such periods, your
              personal information will be deleted or archived to comply with
              legal/contractual retention obligations or in accordance with
              applicable statutory limitation periods.
            </li>
            <li>
              We treat your personal information or your use of the service as
              private and confidential, and we do not check, edit, or reveal it
              to any third parties except where we believe in good faith that
              such action is necessary to comply with the applicable legal and
              regulatory processes or to protect and defend the rights of other
              users or to enforce the terms of service which are binding on all
              the users of the website. In the event of a breach, we shall
              notify the affected users within a reasonable time of first having
              become aware of such breach.
            </li>
            <li>
              We send cookies (small files containing a string of characters) to
              your computer, thereby uniquely identifying your browser. Cookies
              are used to track your preferences, help you log in faster, and
              are aggregated to determine user trends. This data is used to
              improve our offerings, such as providing more content in areas of
              greater interest to a majority of users. Most browsers are
              initially set up to accept cookies, but you can reset your browser
              to refuse all cookies or to indicate when a cookie is being sent.
              However, some of our features and services may not function
              properly if your cookies are disabled.
            </li>
            <li>
              We are not responsible for the practices or policies of the
              websites linked to or from this website, including but not limited
              to their privacy practices or policies. If you elect to use a link
              that accesses another party’s website, you will be subject to that
              website’s terms and practices.
            </li>
            <li>
              We may alert you by email or phone (through SMS/Call) to inform
              you about new service offerings or other information which we feel
              might be useful for you. By using this website, you are consenting
              to our sending you such information.
            </li>
            <li>
              When you use certain features on our website like the discussion
              forums and you post or share your personal information such as
              comments, messages, files, photos, such information will be
              available to all users, and will be in the public domain. All such
              sharing of information is done at your own risk. Please be aware
              that if you disclose personal information in your profile or when
              posting on/about our forums, this information may become publicly
              available, and anything against the terms of the policy shall be
              taken seriously and action shall be processed.
            </li>
            <li>
              When you send an email or other communication to us, we may retain
              those communications in order to process your inquiries, respond
              to your requests, and improve our Services.
            </li>
            <li>
              To the extent permitted by law, we may record and monitor your
              communications with us to ensure compliance with our legal and
              regulatory obligations and our internal policies. This may include
              the recording of telephone conversations.
            </li>
            <li>
              We automatically collect limited information about your computer’s
              connection to the Internet, mobile number, including but not
              limited to your IP address, browser software, operating system
              types, click stream patterns, and dates and times that our website
              or application is accessed, whenever you visit our website or
              application.
            </li>
            <li>
              As the Company evolves, our privacy policy will need to evolve as
              well to cover new situations. You are advised to review this
              Policy regularly for any changes, as continued use shall be deemed
              approval of all changes made in the Privacy Policy. If any of
              these provisions are deemed invalid, void, or unenforceable for
              any reason, that provision shall be deemed severable and shall not
              affect the validity and enforcement of other terms.
            </li>
            <li>
              If you have any grievances regarding the processing of your
              personal information, you may drop an email at{" "}
              <a href="mailto:info@egradtutor.in">info@egradtutor.in</a>.
            </li>
            <li>
              Any dispute, claim, or controversy arising out of or relating to
              this Privacy Policy, including but not limited to the
              determination of the scope or interpretation or validity of any
              term in this policy or applicability of this policy to arbitrate,
              or your use of our website or information to which it gives access
              to, shall be determined by arbitration in terms of this clause:
              <ul>
                <li>The venue of arbitration shall be Hyderabad.</li>
                <li>The arbitrator shall be a person of high integrity.</li>
                <li>He should not be declared insolvent.</li>
                <li>
                  He should possess a degree in law from any university
                  recognized in India.
                </li>
                <li>
                  He shall either be a practicing advocate with a standing of 15
                  years at the bar or be a retired judge of any High Court or
                  Supreme Court of India and well-versed with the disputes
                  arising out of privacy laws and contracts.
                </li>
                <li>
                  All proceedings of such arbitration, including, without
                  limitation, any awards, shall be in the English language.
                </li>
                <li>
                  Arbitration shall be conducted in accordance with the
                  Arbitration and Conciliation Act, 1996 as amended from time to
                  time.
                </li>
                <li>
                  The award of the arbitrator shall be final and binding upon
                  the parties to the dispute.
                </li>
                <li>
                  By visiting this website, you agree to submit to the
                  arbitration.
                </li>
              </ul>
            </li>
          </ul>
          <strong>CANCELLATION & REFUND POLICY:</strong>
          <ul>
            <li>
              We do not accept cancellation of the order or refund claims.
            </li>
            <li>
              We do not accept refund for damaged shipment, if the shipment is
              damaged bring it to our notice and provide proof for the
              replacement of shipment.
            </li>
            <li>
              If the amount is debited more than once for the same order please
              bring it to our notice. If we receive the amount more than once
              for the same order then we will refund the extra amount. If we do
              not receive the extra transaction amount, then you have to contact
              your bank for the refund.
            </li>
          </ul>
          <strong>PRICING POLICY:</strong>
          <ul>
            <li>
              Please read the Terms and Conditions and Privacy Policy along with
              this Refund policy carefully before enrolling/subscribing to any
              of the courses, as once you have enrolled/subscribed:
            </li>
            <li>
              You cannot change or cancel your enrolment/subscription plan. Once
              you enroll/subscribe and make the required payment, it shall be
              considered final as you have given the consent for no refund
              policy and there cannot be any changes or modifications to the
              same and neither will there be any refund of such amount. All our
              courses do not have a refund policy or no refund shall be provided
              once the enrolment/subscription has been taken by the
              student/subscriber, and the same shall not be claimed or
              entertained in any situation as the case may be.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
