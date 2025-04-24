import React, { useState, useEffect } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

export default function SubjectsAndSectionsContainer(
  {  testData,
  activeSubject,
  setActiveSubject,
  activeSection,
  setActiveSection,
  autoSaveNATIfNeeded ,
  showSidebar,
  setActiveQuestionIndex
}) {

  //  Function: Get all subject names
  const getSubjects = () => {
    if (!testData || !Array.isArray(testData.subjects)) return [];
    return testData.subjects.map(subject => subject?.SubjectName || "Unnamed Subject");
  };

  //  Function: Get sections for a subject
  const getSections = (subjectName) => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === subjectName);
    return subject?.sections || [];
  };

  const subjects = getSubjects();
  const sections = getSections(activeSubject).filter(
    (section) => section?.SectionName && section.SectionName.trim() !== ""
  );
 
    

  // Set default active subject and section on mount
  useEffect(() => {
    if (subjects.length > 0) {
      const defaultSubject = subjects[0];
      setActiveSubject(defaultSubject);

      const defaultSections = getSections(defaultSubject);
      if (defaultSections.length > 0) {
        setActiveSection(defaultSections[0].SectionName);
        setActiveQuestionIndex(0); // 👈 go to first question
      }
    }
  }, [testData]); // runs only once when testData is loaded

  const handleSubjectClick = (subjectName) => {
    autoSaveNATIfNeeded();
    setActiveSubject(subjectName);
    const subjectSections = getSections(subjectName);
    if (subjectSections.length > 0) {
      setActiveSection(subjectSections[0].SectionName); // auto-select first section
      setActiveQuestionIndex(0); // 👈 go to first question
    } else {
      setActiveSection(null);
    }
  };

  const handleSectionClick = (sectionName) => {
    autoSaveNATIfNeeded();
    setActiveSection(sectionName);
    setActiveQuestionIndex(0); // 👈 go to first question
  };

  return (
    <div className={styles.SubjectsAndSectionsConatinerMainDiv}>
      {/* Subject Buttons */}
      <div className={styles.OTSSubjectandSectionButtonsGroup}>
        {subjects.map((subj, index) => (
          <button
            key={index}
            className={`${styles.OTSSubjectButton} ${
              activeSubject === subj ? styles.activeSubjectAndSectionBtn : ''
            }`}
            onClick={() => handleSubjectClick(subj)}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Section Buttons (only if valid sections are present) */}
      {sections.length > 0 && (
        <div 
         className={`${styles.OTSSubjectandSectionButtonsGroup} ${
          !showSidebar ? styles.fullWidth :""
                    }`}
        >
          {sections.map((section, secIndex) => (
            <button
              key={secIndex}
              className={`${styles.OTSSubjectButton} ${activeSection === section.SectionName ? styles.activeSubjectAndSectionBtn : ''}`}
              onClick={() => handleSectionClick(section.SectionName)}
            >
              {section.SectionName}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
