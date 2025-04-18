import React from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { Intstruction_content } from '../InstructionsFolder/InstructionsData.js';
const OTSInstrcutions = ({closeInstructions}) => {
    return (
        <div className={styles.OTSInstrcutionsMainDiv}>
            <div className={styles.OTSInstrcutionsSubDiv}>
                <div className={styles.OTSInstructionCloseBtnDiv}>
                    <button onClick={closeInstructions}>Close</button>
                </div>
                <div className={styles.instructionSubdiv}>
                    <h2 >
                        {Intstruction_content[0].Intstruction_content_text_center}
                    </h2>

                    <div className={styles.instructionSection}>
                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_1}</h3>
                        <ul>
                            <li>
                                "Please note: If you open any other window, switch tabs, or
                                minimize this window during the exam, it will be
                                automatically terminated. Be careful while taking the exam!"
                            </li>
                            <li>{Intstruction_content[0].Intstruction_content_points_1}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_2}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_3}</li>
                            <div className={styles.tableOFbtns}>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.NotVisitedBehaviourBtns}`}>1</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p1}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.NotAnsweredBtnCls}`}>3</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p2}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.AnswerdBtnCls}`}>5</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p3}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.MarkedForReview}`}>7</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p4}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.AnsMarkedForReview}`}>9</span>
                                    </div >
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p5}</div>
                                </div>
                            </div>
                            <li>{Intstruction_content[0].Intstruction_content_points_p}</li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_2}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_4}</li>
                            <ul>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_a}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_b}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_c}</li>
                            </ul>
                            <li>
                                {Intstruction_content[0].Intstruction_content_points_5}
                                <strong> {Intstruction_content[0].span_1} </strong>
                                {Intstruction_content[0].Intstruction_content_points_5__}
                            </li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_3}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_6}</li>
                            <ul>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_a}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_b}</li>
                                <li>
                                    {Intstruction_content[0].Intstruction_content_points_6_c}
                                    <strong> {Intstruction_content[0].span_2} </strong>
                                </li>
                                <li>
                                    {Intstruction_content[0].Intstruction_content_points_6_d}
                                    <strong> {Intstruction_content[0].span_3} </strong>
                                    {Intstruction_content[0].Intstruction_content_points_6_d__}
                                </li>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_e}</li>
                            </ul>
                            <li>
                                {Intstruction_content[0].Intstruction_content_points_7}
                                <strong> {Intstruction_content[0].span_4} </strong>
                                {Intstruction_content[0].Intstruction_content_points_7__}
                            </li>
                            <li>{Intstruction_content[0].Intstruction_content_points_8}</li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_4}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_9}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_10}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_11}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_12}</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default OTSInstrcutions
