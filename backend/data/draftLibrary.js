// Phase 11 – Draft Library
// Editable legal document templates with placeholder variables.

const draftLibraryPhase11 = {
  lastUpdatedNote: "Last updated: 2026-07-13",
  sections: [
    {
      key: "legal-notice",
      title: "Legal Notice",
      icon: "alert-circle-outline",
      description: "Formal legal notice templates for demand, defamation, breach of contract, eviction and more.",
      templates: [
        {
          id: "ln-demand",
          label: "Demand Notice (Money Recovery)",
          fields: [
            { key: "senderName", label: "Sender Name", type: "text", default: "[Sender Name]" },
            { key: "senderAddress", label: "Sender Address", type: "textarea", default: "[Sender Address]" },
            { key: "recipientName", label: "Recipient Name", type: "text", default: "[Recipient Name]" },
            { key: "recipientAddress", label: "Recipient Address", type: "textarea", default: "[Recipient Address]" },
            { key: "amount", label: "Amount Due (₹)", type: "text", default: "[Amount]" },
            { key: "reason", label: "Reason for Demand", type: "textarea", default: "[Reason for Demand]" },
            { key: "noticeDate", label: "Notice Date", type: "date", default: "[Date]" },
            { key: "replyDeadline", label: "Reply Deadline (days)", type: "text", default: "15" },
          ],
          body: `NOTICE UNDER SECTION 434 OF THE COMPANIES ACT, 2013 / AS PER CONTRACT

Date: {{noticeDate}}

To,
{{recipientName}}
{{recipientAddress}}

From,
{{senderName}}
{{senderAddress}}

Subject: LEGAL NOTICE FOR RECOVERY OF ₹{{amount}}

Dear Sir/Madam,

1. We are advocates acting on behalf of our client {{senderName}}.

2. Our client states that you are liable to pay a sum of ₹{{amount}} (Rupees {{amount}} only) as detailed below:

   {{reason}}

3. Despite repeated demands, you have failed and neglected to make the payment.

4. TAKE NOTICE that unless the aforesaid amount of ₹{{amount}} is paid within {{replyDeadline}} days from the receipt of this notice, our client shall be constrained to initiate appropriate legal proceedings against you, including but not limited to:
   a) Filing a civil suit for recovery;
   b) Insurance of winding-up petition under the Companies Act (if applicable);
   c) Criminal proceedings under Section 138 of the Negotiable Instruments Act, 1881 (if cheque was issued);
   d) Such other remedies as may be available in law.

5. You are hereby called upon to make the payment of ₹{{amount}} by way of bank draft/pay order in favour of {{senderName}} within the said period.

6. Please treat this notice as final and without prejudice.

Thanking you,

Yours faithfully,

([Advocate Name])
For {{senderName}}`,
        },
        {
          id: "ln-eviction",
          label: "Eviction Notice (Tenant)",
          fields: [
            { key: "landlordName", label: "Landlord Name", type: "text", default: "[Landlord Name]" },
            { key: "landlordAddress", label: "Landlord Address", type: "textarea", default: "[Landlord Address]" },
            { key: "tenantName", label: "Tenant Name", type: "text", default: "[Tenant Name]" },
            { key: "tenantAddress", label: "Tenant Address", type: "textarea", default: "[Tenant Address]" },
            { key: "propertyAddress", label: "Property Address", type: "textarea", default: "[Property Address]" },
            { key: "rentAmount", label: "Monthly Rent (₹)", type: "text", default: "[Rent Amount]" },
            { key: "arrears", label: "Rent Arrears (₹)", type: "text", default: "[Arrears]" },
            { key: "leaseStart", label: "Lease Start Date", type: "date", default: "[Start Date]" },
            { key: "noticeDate", label: "Notice Date", type: "date", default: "[Date]" },
            { key: "vacateDate", label: "Vacate By Date", type: "date", default: "[Vacate Date]" },
          ],
          body: `LEGAL NOTICE FOR EVICTION AND RECOVERY OF POSSESSION

Date: {{noticeDate}}

To,
{{tenantName}}
{{tenantAddress}}

From,
{{landlordName}}
{{landlordAddress}}

Subject: NOTICE TO VACATE AND DELIVER POSSESSION

Dear Sir/Madam,

1. Our office represents {{landlordName}}, the owner/landlord of the property situated at:

   {{propertyAddress}}

2. You were inducted as a tenant in the aforesaid property vide Agreement dated {{leaseStart}} at a monthly rent of ₹{{rentAmount}}.

3. You have failed to pay the rent since [last paid month/year] and an amount of ₹{{arrears}} (Rupees {{arrears}} only) has accumulated as arrears of rent.

4. Despite repeated reminders and requests, you have not cleared the outstanding dues nor vacated the premises.

5. TAKE NOTICE that you are hereby required and called upon to:
   a) Pay the entire arrears of rent amounting to ₹{{arrears}} within [ ] days;
   b) Vacate and deliver peaceful vacant possession of the property at {{propertyAddress}} on or before {{vacateDate}}.

6. In case you fail to comply with the above, our client shall be constrained to file eviction proceedings before the competent court/rent controller, and you shall be liable for all costs including mesne profits, interest, and legal expenses.

Thanking you,

Yours faithfully,

([Advocate Name])
For {{landlordName}}`,
        },
      ],
    },
    {
      key: "bail",
      title: "Bail",
      icon: "shield-checkmark-outline",
      description: "Bail application templates for regular, anticipatory and interim bail across criminal matters.",
      templates: [
        {
          id: "bail-regular",
          label: "Regular Bail Application (CrPC 437/439)",
          fields: [
            { key: "courtName", label: "Court Name", type: "text", default: "[Court Name]" },
            { key: "caseNumber", label: "Case / FIR Number", type: "text", default: "[FIR/Case No.]" },
            { key: "accusedName", label: "Accused Name", type: "text", default: "[Accused Name]" },
            { key: "fatherName", label: "Father's Name", type: "text", default: "[Father's Name]" },
            { key: "address", label: "Address", type: "textarea", default: "[Address]" },
            { key: "offenseSection", label: "Offense Section(s)", type: "text", default: "[IPC Sections]" },
            { key: "policeStation", label: "Police Station", type: "text", default: "[Police Station]" },
            { key: "arrestDate", label: "Date of Arrest", type: "date", default: "[Arrest Date]" },
            { key: "custodyType", label: "Type of Custody", type: "text", default: "Judicial Custody" },
            { key: "applicationDate", label: "Application Date", type: "date", default: "[Date]" },
          ],
          body: `BEFORE THE HON'BLE {{courtName}}

{{caseNumber}}
IN THE MATTER OF:
State                                                         ……….Complainant/State

Versus

{{accusedName}} S/o {{fatherName}}
R/o {{address}}
                                                              ……….Accused

APPLICATION FOR REGULAR BAIL UNDER SECTION 437/439 OF THE CODE OF CRIMINAL PROCEDURE, 1973

MOST RESPECTFULLY SHOWETH:

1. That the applicant/accused was arrested on {{arrestDate}} in connection with FIR No. {{caseNumber}} registered at Police Station {{policeStation}} for alleged offences under Section {{offenseSection}} and has been in {{custodyType}} since then.

2. That the applicant is innocent and has been falsely implicated in the present case.

3. That the applicant is a permanent resident of {{address}} and is not a flight risk. He/She undertakes to abide by any conditions imposed by this Hon'ble Court.

4. That the investigation is complete / charge sheet has been filed and the applicant's further detention is not required for investigation purposes.

5. That there are no criminal antecedents of the applicant (if any, specify).

6. That the offences alleged are triable by a Magistrate / Sessions Court and are bailable in nature.

7. That the applicant undertakes to appear before the Court as and when required and shall not tamper with evidence or influence witnesses.

PRAYER

It is, therefore, most respectfully prayed that this Hon'ble Court may be pleased to:

a) Enlarge the applicant on regular bail in connection with the aforesaid FIR/Case, on such terms and conditions as this Hon'ble Court may deem fit;
b) Pass any other order(s) as this Hon'ble Court may deem fit in the interests of justice.

AND THE APPLICANT SHALL, AS IN DUTY BOUND, EVER PRAY.

Place: [Place]
Date: {{applicationDate}}

                                           ([Advocate Name])
                                           Counsel for the Applicant`,
        },
        {
          id: "bail-anticipatory",
          label: "Anticipatory Bail Application (CrPC 438)",
          fields: [
            { key: "courtName", label: "Court Name (Session/High Court)", type: "text", default: "[Court Name]" },
            { key: "firNumber", label: "FIR Number", type: "text", default: "[FIR No.]" },
            { key: "applicantName", label: "Applicant Name", type: "text", default: "[Applicant Name]" },
            { key: "fatherName", label: "Father's Name", type: "text", default: "[Father's Name]" },
            { key: "address", label: "Address", type: "textarea", default: "[Address]" },
            { key: "offenseSection", label: "Offense Section(s)", type: "text", default: "[IPC Sections]" },
            { key: "policeStation", label: "Police Station", type: "text", default: "[Police Station]" },
            { key: "applicationDate", label: "Application Date", type: "date", default: "[Date]" },
            { key: "grounds", label: "Grounds for Anticipatory Bail", type: "textarea", default: "[Brief grounds for seeking anticipatory bail]" },
          ],
          body: `BEFORE THE HON'BLE {{courtName}}

IN THE MATTER OF:
{{applicantName}} S/o {{fatherName}}
R/o {{address}}
                                                              ……….Applicant

Versus

State of [State] through Police Station {{policeStation}}
                                                              ……….Respondent

APPLICATION FOR ANTICIPATORY BAIL UNDER SECTION 438 OF THE CODE OF CRIMINAL PROCEDURE, 1973

MOST RESPECTFULLY SHOWETH:

1. That the applicant has reason to believe that he/she may be arrested in connection with FIR No. {{firNumber}} registered at Police Station {{policeStation}} for alleged offences under Section {{offenseSection}}.

2. That the applicant is innocent and has been falsely implicated. The allegations are entirely false and baseless.

3. That the applicant has no criminal antecedents and is a law-abiding citizen.

4. That the applicant is a permanent resident of {{address}} and undertakes to cooperate with the investigation.

5. That the Applicant has no intention to flee from justice and undertakes to appear before the Investigating Officer as and when required.

6. The grounds on which the applicant seeks anticipatory bail are:
   {{grounds}}

7. That custodial interrogation of the applicant is not required and no useful purpose would be served by sending the applicant to custody.

8. That the applicant undertakes to abide by any conditions imposed by this Hon'ble Court.

PRAYER

It is, therefore, most respectfully prayed that this Hon'ble Court may be pleased to:

a) Direct that in the event of arrest of the applicant in connection with FIR No. {{firNumber}}, the applicant be released on bail;
b) Pass any other order(s) as this Hon'ble Court may deem fit in the interests of justice.

AND THE APPLICANT SHALL, AS IN DUTY BOUND, EVER PRAY.

Place: [Place]
Date: {{applicationDate}}

                                           ([Advocate Name])
                                           Counsel for the Applicant`,
        },
        {
          id: "bail-interim",
          label: "Interim Bail Application",
          fields: [
            { key: "courtName", label: "Court Name", type: "text", default: "[Court Name]" },
            { key: "caseNumber", label: "Case Number", type: "text", default: "[Case No.]" },
            { key: "applicantName", label: "Applicant Name", type: "text", default: "[Applicant Name]" },
            { key: "fatherName", label: "Father's Name", type: "text", default: "[Father's Name]" },
            { key: "address", label: "Address", type: "textarea", default: "[Address]" },
            { key: "grounds", label: "Grounds for Interim Bail", type: "textarea", default: "[Medical/Family/Personal grounds]" },
            { key: "duration", label: "Duration Sought", type: "text", default: "[Number of days]" },
            { key: "applicationDate", label: "Application Date", type: "date", default: "[Date]" },
          ],
          body: `BEFORE THE HON'BLE {{courtName}}

{{caseNumber}}

IN THE MATTER OF:
{{applicantName}} S/o {{fatherName}}
R/o {{address}}
                                                              ……….Applicant/Accused

Versus

State of [State]
                                                              ……….Respondent

APPLICATION FOR INTERIM BAIL

MOST RESPECTFULLY SHOWETH:

1. That the applicant is an accused in the above-mentioned case and is currently in judicial custody.

2. That the applicant most respectfully submits that he/she requires interim bail for a period of {{duration}} on the following grounds:

   {{grounds}}

3. That the applicant undertakes to surrender before the Court / concerned Jail authorities immediately after the expiry of the interim bail period.

4. That the applicant undertakes to abide by all terms and conditions imposed by this Hon'ble Court.

5. That no prejudice shall be caused to the prosecution case if the applicant is released on interim bail.

PRAYER

It is, therefore, most respectfully prayed that this Hon'ble Court may be pleased to:

a) Release the applicant on interim bail for a period of {{duration}} on such terms and conditions as this Hon'ble Court may deem fit;
b) Pass any other order(s) as may be deemed fit.

AND THE APPLICANT SHALL, AS IN DUTY BOUND, EVER PRAY.

Place: [Place]
Date: {{applicationDate}}

                                           ([Advocate Name])
                                           Counsel for the Applicant`,
        },
      ],
    },
    {
      key: "agreement",
      title: "Agreement",
      icon: "document-text-outline",
      description: "Professional agreement templates – employment, consultancy, NDA, partnership, MOU, service contracts.",
      templates: [
        {
          id: "agreement-nda",
          label: "Non-Disclosure Agreement (NDA)",
          fields: [
            { key: "party1", label: "Disclosing Party Name", type: "text", default: "[Party 1]" },
            { key: "party1Address", label: "Disclosing Party Address", type: "textarea", default: "[Address]" },
            { key: "party2", label: "Receiving Party Name", type: "text", default: "[Party 2]" },
            { key: "party2Address", label: "Receiving Party Address", type: "textarea", default: "[Address]" },
            { key: "agreementDate", label: "Date of Agreement", type: "date", default: "[Date]" },
            { key: "purpose", label: "Purpose of Disclosure", type: "textarea", default: "[Purpose]" },
            { key: "term", label: "Term of Agreement (years)", type: "text", default: "3" },
          ],
          body: `NON-DISCLOSURE AGREEMENT

THIS NON-DISCLOSURE AGREEMENT (hereinafter referred to as the "Agreement") is entered into on this {{agreementDate}} day of [Month], [Year] by and between:

{{party1}}, having its registered office at {{party1Address}} (hereinafter referred to as the "Disclosing Party")

AND

{{party2}}, having its registered office at {{party2Address}} (hereinafter referred to as the "Receiving Party").

The Disclosing Party and the Receiving Party are individually referred to as "Party" and collectively as "Parties".

WHEREAS:

A. The Disclosing Party possesses certain confidential and proprietary information relating to {{purpose}}.

B. The Receiving Party desires to receive and review such confidential information for the purpose of {{purpose}}.

C. The Parties agree that any confidential information disclosed shall be protected and used only for the aforesaid purpose.

NOW, THEREFORE, IN CONSIDERATION OF THE MUTUAL COVENANTS AND PROMISES HEREIN CONTAINED, THE PARTIES AGREE AS FOLLOWS:

1. DEFINITION OF CONFIDENTIAL INFORMATION
   "Confidential Information" means all information, data, documents, drawings, specifications, know-how, trade secrets, business plans, financial information, customer lists, and any other proprietary information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, or in any other form.

2. OBLIGATIONS OF RECEIVING PARTY
   The Receiving Party agrees to:
   a) Hold all Confidential Information in strict confidence;
   b) Not disclose Confidential Information to any third party without prior written consent;
   c) Use Confidential Information solely for the Purpose;
   d) Restrict access to Confidential Information to employees who need to know;
   e) Return or destroy all Confidential Information upon request.

3. EXCLUSIONS
   Confidential Information does not include information that:
   a) Is or becomes publicly available through no fault of the Receiving Party;
   b) Was in Receiving Party's possession prior to disclosure;
   c) Is independently developed by Receiving Party without use of Confidential Information;
   d) Is required to be disclosed by law.

4. TERM
   This Agreement shall remain in effect for a period of {{term}} years from the date hereof. The obligations of confidentiality shall survive the termination of this Agreement for a period of [3] years.

5. REMEDIES
   The Parties acknowledge that any breach of this Agreement may cause irreparable harm, and the Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law.

6. GOVERNING LAW
   This Agreement shall be governed by and construed in accordance with the laws of India.

IN WITNESS WHEREOF, the Parties have executed this Agreement on the date first above written.

____________________                          ____________________
For {{party1}}                                For {{party2}}
(Disclosing Party)                            (Receiving Party)

Witness 1: _______________                    Witness 2: _______________
Name: _______________                         Name: _______________
Address: _______________                      Address: _______________`,
        },
        {
          id: "agreement-employment",
          label: "Employment Agreement",
          fields: [
            { key: "employerName", label: "Employer Name", type: "text", default: "[Employer Name]" },
            { key: "employerAddress", label: "Employer Address", type: "textarea", default: "[Address]" },
            { key: "employeeName", label: "Employee Name", type: "text", default: "[Employee Name]" },
            { key: "employeeAddress", label: "Employee Address", type: "textarea", default: "[Address]" },
            { key: "designation", label: "Designation", type: "text", default: "[Designation]" },
            { key: "joiningDate", label: "Date of Joining", type: "date", default: "[Joining Date]" },
            { key: "salary", label: "Monthly Salary (₹)", type: "text", default: "[Salary]" },
            { key: "probationPeriod", label: "Probation Period (months)", type: "text", default: "6" },
            { key: "noticePeriod", label: "Notice Period (days)", type: "text", default: "30" },
            { key: "agreementDate", label: "Date of Agreement", type: "date", default: "[Date]" },
          ],
          body: `EMPLOYMENT AGREEMENT

THIS EMPLOYMENT AGREEMENT (hereinafter referred to as the "Agreement") is made and entered into on this {{agreementDate}} day of [Month], [Year] by and between:

{{employerName}}, having its registered office at {{employerAddress}} (hereinafter referred to as the "Employer")

AND

{{employeeName}}, residing at {{employeeAddress}} (hereinafter referred to as the "Employee").

WHEREAS:

A. The Employer is engaged in the business of [Business Description].

B. The Employer desires to employ the Employee, and the Employee desires to accept such employment, on the terms and conditions set forth herein.

NOW, THEREFORE, IN CONSIDERATION OF THE MUTUAL COVENANTS HEREIN, THE PARTIES AGREE AS FOLLOWS:

1. APPOINTMENT
   The Employer hereby appoints the Employee as {{designation}}, and the Employee accepts such appointment.

2. DUTIES AND RESPONSIBILITIES
   The Employee shall perform duties as assigned by the Employer and shall devote full time and attention to the business of the Employer.

3. COMPENSATION
   The Employer shall pay the Employee a monthly salary of ₹{{salary}} (Rupees {{salary}} only), subject to applicable deductions.

4. PROBATION
   The Employee shall be on probation for a period of {{probationPeriod}} months, extendable at the discretion of the Employer.

5. LEAVE AND BENEFITS
   The Employee shall be entitled to leaves and benefits as per the policies of the Employer.

6. TERMINATION
   Either party may terminate this Agreement by giving {{noticePeriod}} days' written notice. The Employer may terminate without notice in case of misconduct.

7. CONFIDENTIALITY
   The Employee shall maintain confidentiality of all proprietary information during and after employment.

8. NON-COMPETE
   The Employee agrees not to engage in competing business during the term of employment and for [1] year thereafter.

9. GOVERNING LAW
   This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the Parties have executed this Agreement on the date first written above.

____________________                          ____________________
For {{employerName}}                          {{employeeName}}

Witness 1: _______________                    Witness 2: _______________`,
        },
      ],
    },
    {
      key: "affidavit",
      title: "Affidavit",
      icon: "document-outline",
      description: "General affidavit templates, sworn statements, undertaking affidavits, and evidence affidavits.",
      templates: [
        {
          id: "affidavit-general",
          label: "General Affidavit (Sworn Statement)",
          fields: [
            { key: "stateName", label: "State Name", type: "text", default: "[State]" },
            { key: "oathCommissioner", label: "Oath Commissioner / Notary Details", type: "text", default: "[Oath Commissioner]" },
            { key: "deponentName", label: "Deponent Name", type: "text", default: "[Deponent Name]" },
            { key: "fatherName", label: "Father's/Husband's Name", type: "text", default: "[Father's Name]" },
            { key: "age", label: "Age", type: "text", default: "[Age]" },
            { key: "occupation", label: "Occupation", type: "text", default: "[Occupation]" },
            { key: "residence", label: "Residence Address", type: "textarea", default: "[Address]" },
            { key: "affidavitDate", label: "Date of Affidavit", type: "date", default: "[Date]" },
            { key: "declaration", label: "Body / Declaration Text", type: "textarea", default: "[I do hereby state and declare as follows...]" },
          ],
          body: `AFFIDAVIT

I, {{deponentName}}, aged about {{age}} years, son/daughter/wife of {{fatherName}}, by occupation {{occupation}}, residing at {{residence}}, do hereby solemnly affirm and state as follows:

1. I am the Deponent herein and am fully conversant with the facts of this case.

2. {{declaration}}

3. I state that the contents of this affidavit are true and correct to my knowledge and belief, and nothing material has been concealed therefrom.

4. I am filing this affidavit in support of [the accompanying application / petition / reply].

DEPONENT

VERIFICATION

I, {{deponentName}}, the Deponent above named, do hereby verify that the contents of this affidavit are true and correct to my knowledge and belief, and no part of it is false and nothing material has been concealed therefrom.

Verified at [Place] on this {{affidavitDate}}.

DEPONENT

BEFORE ME

I, {{oathCommissioner}}, do hereby certify that the above-named Deponent has appeared before me and affirmed the contents of this affidavit on this {{affidavitDate}}.

Notary / Oath Commissioner
{{stateName}}

[Seal]`,
        },
        {
          id: "affidavit-undertaking",
          label: "Undertaking Affidavit (Court)",
          fields: [
            { key: "courtName", label: "Court Name", type: "text", default: "[Court Name]" },
            { key: "caseNumber", label: "Case Number", type: "text", default: "[Case No.]" },
            { key: "partyName", label: "Party Giving Undertaking", type: "text", default: "[Party Name]" },
            { key: "fatherName", label: "Father's/Husband's Name", type: "text", default: "[Father's Name]" },
            { key: "address", label: "Address", type: "textarea", default: "[Address]" },
            { key: "undertakingText", label: "Undertaking Details", type: "textarea", default: "[Nature of undertaking]" },
            { key: "affidavitDate", label: "Date of Affidavit", type: "date", default: "[Date]" },
          ],
          body: `AFFIDAVIT-CUM-UNDERTAKING

BEFORE THE HON'BLE {{courtName}}

Case No. {{caseNumber}}

I, {{partyName}} son/daughter/wife of {{fatherName}}, residing at {{address}}, do hereby solemnly affirm and undertake as follows:

1. I am the [Applicant / Defendant / Respondent / Petitioner] in the above-mentioned case and am fully aware of the proceedings.

2. I undertake before this Hon'ble Court as follows:

   {{undertakingText}}

3. I undertake to abide strictly by the terms and conditions mentioned above and agree that any breach thereof shall render me liable for contempt of court and other legal consequences.

4. I submit to the jurisdiction of this Hon'ble Court for enforcement of this undertaking.

5. I state that the contents of this affidavit are true and correct to my knowledge and belief.

DEPONENT

VERIFICATION

Verified at [Place] on this {{affidavitDate}}.

DEPONENT

BEFORE ME

Notary / Oath Commissioner`,
        },
      ],
    },
    {
      key: "power-of-attorney",
      title: "Power of Attorney",
      icon: "key-outline",
      description: "General and special power of attorney templates for property, litigation, banking and business.",
      templates: [
        {
          id: "poa-general",
          label: "General Power of Attorney (GPA)",
          fields: [
            { key: "principalName", label: "Principal Name", type: "text", default: "[Principal Name]" },
            { key: "principalFather", label: "Principal's Father Name", type: "text", default: "[Father's Name]" },
            { key: "principalAddress", label: "Principal Address", type: "textarea", default: "[Address]" },
            { key: "agentName", label: "Agent/Attorney Name", type: "text", default: "[Agent Name]" },
            { key: "agentFather", label: "Agent's Father Name", type: "text", default: "[Father's Name]" },
            { key: "agentAddress", label: "Agent Address", type: "textarea", default: "[Address]" },
            { key: "poaDate", label: "Date of Execution", type: "date", default: "[Date]" },
            { key: "place", label: "Place of Execution", type: "text", default: "[Place]" },
            { key: "powers", label: "Powers Granted", type: "textarea", default: "[List of powers granted]" },
            { key: "consideration", label: "Consideration (if any)", type: "text", default: "[Consideration]" },
          ],
          body: `GENERAL POWER OF ATTORNEY

THIS GENERAL POWER OF ATTORNEY is executed on this {{poaDate}} day of [Month], [Year] at {{place}}.

BY

{{principalName}} son/daughter/wife of {{principalFather}}, residing at {{principalAddress}} (hereinafter referred to as the "Principal" / "Executant")

IN FAVOUR OF

{{agentName}} son/daughter/wife of {{agentFather}}, residing at {{agentAddress}} (hereinafter referred to as the "Agent" / "Attorney")

WHEREAS:

A. The Principal is the owner of and/or entitled to [properties/assets/business interests].

B. The Principal is unable to personally attend to the day-to-day management and wishes to appoint an Attorney to act on his/her behalf.

C. The Principal has agreed to appoint the Agent as his/her lawful Attorney on the terms hereinafter appearing.

NOW THIS POWER OF ATTORNEY WITNESSETH AS FOLLOWS:

1. APPOINTMENT
   The Principal hereby appoints and constitutes the Agent as his/her true and lawful Attorney for him/her and in his/her name or on his/her behalf to do and execute all or any of the following acts, deeds and things:

   {{powers}}

2. POWERS
   The Agent is authorized to:
   a) Manage, administer, and deal with the Principal's properties/assets;
   b) Sign documents, agreements, deeds, contracts;
   c) Appear before any court, tribunal, or authority;
   d) Operate bank accounts and deal with financial institutions;
   e) Execute, sign, and register any documents;
   f) Appoint advocates and legal representatives;
   g) Do all incidental acts necessary for the exercise of powers herein.

3. INDEMNITY
   The Principal agrees to ratify and confirm all acts done by the Agent and indemnify the Agent against all claims, losses, and liabilities incurred in good faith.

4. CONSIDERATION
   {{consideration}}

5. REVOCATION
   This Power of Attorney shall remain in full force and effect until revoked in writing by the Principal or upon the death of the Principal.

6. GOVERNING LAW
   This Power of Attorney shall be governed by the laws of India.

IN WITNESS WHEREOF, the Principal has executed this Power of Attorney on the date first above written.

_______________________
SIGNATURE OF PRINCIPAL

WITNESSES:

1. Signature: ____________
   Name: ____________
   Address: ____________
   Occupation: ____________

2. Signature: ____________
   Name: ____________
   Address: ____________
   Occupation: ____________

ACCEPTED BY AGENT:

I, {{agentName}}, hereby accept the appointment as Attorney and agree to act in accordance with the terms herein.

_______________________
SIGNATURE OF AGENT`,
        },
        {
          id: "poa-litigation",
          label: "Special Power of Attorney (Litigation)",
          fields: [
            { key: "principalName", label: "Principal/Party Name", type: "text", default: "[Principal Name]" },
            { key: "principalAddress", label: "Principal Address", type: "textarea", default: "[Address]" },
            { key: "agentName", label: "Advocate/Agent Name", type: "text", default: "[Advocate Name]" },
            { key: "agentAddress", label: "Advocate Address", type: "textarea", default: "[Address]" },
            { key: "caseNumber", label: "Case Number(s)", type: "text", default: "[Case No.]" },
            { key: "courtName", label: "Court / Forum Name", type: "text", default: "[Court Name]" },
            { key: "poaDate", label: "Date of Execution", type: "date", default: "[Date]" },
            { key: "place", label: "Place", type: "text", default: "[Place]" },
          ],
          body: `SPECIAL POWER OF ATTORNEY (LITIGATION)

THIS SPECIAL POWER OF ATTORNEY is executed on this {{poaDate}} day of [Month], [Year] at {{place}}.

BY

{{principalName}}, residing at {{principalAddress}} (hereinafter referred to as the "Principal")

IN FAVOUR OF

{{agentName}}, Advocate, having office at {{agentAddress}} (hereinafter referred to as the "Advocate")

WHEREAS the Principal is involved in / desires to file Case No. {{caseNumber}} before the Hon'ble {{courtName}}.

NOW THIS POWER OF ATTORNEY WITNESSETH THAT the Principal hereby authorizes the Advocate to:

1. Appear before the Hon'ble {{courtName}} in the aforesaid case;
2. File, sign, verify, and present pleadings, applications, affidavits, and other documents;
3. Argue the case and make submissions;
4. Receive documents, notices, and orders;
5. Compromise or settle the matter with the prior approval of the Principal;
6. Appoint counsels/advocates if required;
7. Do all acts necessary for the conduct of the case.

The Principal ratifies and confirms all acts done by the Advocate in exercise of these powers.

_______________________
SIGNATURE OF PRINCIPAL

WITNESSES:

1. Signature: ____________
2. Signature: ____________

ACCEPTED:

_______________________
SIGNATURE OF ADVOCATE`,
        },
      ],
    },
    {
      key: "rent-agreement",
      title: "Rent Agreement",
      icon: "home-outline",
      description: "Residential and commercial lease/rental agreement templates compliant with Indian rent laws.",
      templates: [
        {
          id: "rent-residential",
          label: "Residential Rent Agreement",
          fields: [
            { key: "landlordName", label: "Landlord Name", type: "text", default: "[Landlord Name]" },
            { key: "landlordFather", label: "Landlord's Father Name", type: "text", default: "[Father's Name]" },
            { key: "landlordAddress", label: "Landlord Address", type: "textarea", default: "[Address]" },
            { key: "tenantName", label: "Tenant Name", type: "text", default: "[Tenant Name]" },
            { key: "tenantFather", label: "Tenant's Father Name", type: "text", default: "[Father's Name]" },
            { key: "tenantAddress", label: "Tenant Address", type: "textarea", default: "[Address]" },
            { key: "propertyAddress", label: "Property Address", type: "textarea", default: "[Property Address]" },
            { key: "rentAmount", label: "Monthly Rent (₹)", type: "text", default: "[Rent]" },
            { key: "securityDeposit", label: "Security Deposit (₹)", type: "text", default: "[Deposit]" },
            { key: "leaseStart", label: "Lease Start Date", type: "date", default: "[Start Date]" },
            { key: "leaseEnd", label: "Lease End Date", type: "date", default: "[End Date]" },
            { key: "noticePeriod", label: "Notice Period (months)", type: "text", default: "3" },
            { key: "agreementDate", label: "Date of Agreement", type: "date", default: "[Date]" },
          ],
          body: `RESIDENTIAL RENT AGREEMENT

THIS RENT AGREEMENT is made and entered into at [Place] on this {{agreementDate}} day of [Month], [Year].

BETWEEN

{{landlordName}} son/daughter/wife of {{landlordFather}}, residing at {{landlordAddress}} (hereinafter referred to as the "Landlord" / "Lessor")

AND

{{tenantName}} son/daughter/wife of {{tenantFather}}, residing at {{tenantAddress}} (hereinafter referred to as the "Tenant" / "Lessee")

WHEREAS:

A. The Landlord is the absolute owner and landlord of the residential property situated at {{propertyAddress}} (hereinafter referred to as the "Premises").

B. The Tenant has agreed to take the Premises on rent for residential purposes on the terms and conditions hereinafter appearing.

NOW, THEREFORE, THE PARTIES AGREE AS FOLLOWS:

1. DEMISE
   The Landlord hereby lets out and the Tenant hereby takes on rent the Premises described above on a monthly tenancy basis.

2. TERM
   The tenancy shall commence on {{leaseStart}} and shall continue up to {{leaseEnd}}, renewable by mutual consent.

3. RENT
   The monthly rent for the Premises shall be ₹{{rentAmount}} (Rupees {{rentAmount}} only), payable on or before the [ ] day of each English calendar month.

4. SECURITY DEPOSIT
   The Tenant shall pay a refundable interest-free security deposit of ₹{{securityDeposit}} (Rupees {{securityDeposit}} only).

5. UTILITY CHARGES
   Electricity, water, and other utility charges shall be paid by the Tenant as per consumption.

6. USE OF PREMISES
   The Premises shall be used for residential purposes only and not for any commercial, illegal, or immoral activity.

7. MAINTENANCE
   The Landlord shall be responsible for structural repairs, and the Tenant for day-to-day maintenance.

8. SUB-LETTING
   The Tenant shall not sub-let, assign, or part with possession of the Premises or any part thereof.

9. ALTERATIONS
   The Tenant shall not make any structural additions or alterations without the prior written consent of the Landlord.

10. TERMINATION
    Either party may terminate the tenancy by giving {{noticePeriod}} months' written notice. In case of default in payment of rent for [2] consecutive months, the Landlord may terminate the tenancy forthwith.

11. VACATION
    On termination, the Tenant shall vacate the Premises peacefully and deliver possession to the Landlord.

12. JURISDICTION
    The courts at [Place] shall have exclusive jurisdiction over any disputes arising under this Agreement.

IN WITNESS WHEREOF, the Parties have signed this Agreement on the date first written above.

____________________                          ____________________
LANDLORD                                      TENANT

WITNESSES:

1. Signature: ____________
   Name: ____________
   Address: ____________

2. Signature: ____________
   Name: ____________
   Address: ____________`,
        },
        {
          id: "rent-commercial",
          label: "Commercial Lease Agreement",
          fields: [
            { key: "lessorName", label: "Lessor Name", type: "text", default: "[Lessor Name]" },
            { key: "lessorAddress", label: "Lessor Address", type: "textarea", default: "[Address]" },
            { key: "lesseeName", label: "Lessee/Tenant Name", type: "text", default: "[Lessee Name]" },
            { key: "lesseeAddress", label: "Lessee Address", type: "textarea", default: "[Address]" },
            { key: "propertyAddress", label: "Commercial Property Address", type: "textarea", default: "[Property Address]" },
            { key: "rentAmount", label: "Monthly Rent (₹)", type: "text", default: "[Rent]" },
            { key: "securityDeposit", label: "Security Deposit (₹)", type: "text", default: "[Deposit]" },
            { key: "leaseStart", label: "Lease Start Date", type: "date", default: "[Start Date]" },
            { key: "leaseTerm", label: "Lease Term (years)", type: "text", default: "[Years]" },
            { key: "rentEscalation", label: "Rent Escalation (% per year)", type: "text", default: "[Escalation]" },
            { key: "agreementDate", label: "Date of Agreement", type: "date", default: "[Date]" },
          ],
          body: `COMMERCIAL LEASE AGREEMENT

THIS COMMERCIAL LEASE AGREEMENT is entered into at [Place] on this {{agreementDate}} day of [Month], [Year].

BETWEEN

{{lessorName}}, having its registered office at {{lessorAddress}} (hereinafter referred to as the "Lessor")

AND

{{lesseeName}}, having its registered office at {{lesseeAddress}} (hereinafter referred to as the "Lessee")

WHEREAS:

A. The Lessor is the owner of the commercial property situated at {{propertyAddress}} (hereinafter referred to as the "Demised Premises").

B. The Lessee desires to take the Demised Premises on lease for commercial/business purposes.

NOW, THEREFORE, THE PARTIES AGREE AS FOLLOWS:

1. DEMISE AND TERM
   The Lessor hereby leases and the Lessee takes on lease the Demised Premises for a term of {{leaseTerm}} years commencing from {{leaseStart}}.

2. RENT
   The monthly rent shall be ₹{{rentAmount}} (Rupees {{rentAmount}} only), payable monthly in advance.

3. RENT ESCALATION
   The rent shall be escalated by {{rentEscalation}}% every [year] from the commencement date.

4. SECURITY DEPOSIT
   The Lessee shall pay a refundable interest-free security deposit of ₹{{securityDeposit}}.

5. USE
   The Demised Premises shall be used for commercial/business purposes only.

6. MAINTENANCE
   The Lessee shall maintain the Premises in good condition and shall bear all operating expenses.

7. INSURANCE
   The Lessee shall insure the stock and goods against fire and theft.

8. SUB-LETTING
   The Lessee shall not sub-let or assign the lease without prior written consent of the Lessor.

9. FORCE MAJEURE
   Neither party shall be liable for failure to perform due to force majeure events.

10. GOVERNING LAW
    This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the Parties have executed this Agreement.

____________________                          ____________________
LESSOR                                        LESSEE`,
        },
      ],
    },
    {
      key: "sale-deed",
      title: "Sale Deed",
      icon: "pricetags-outline",
      description: "Property sale deed templates – land, house, flat, commercial property, with all requisite clauses.",
      templates: [
        {
          id: "sale-property",
          label: "Sale Deed (Property)",
          fields: [
            { key: "vendorName", label: "Vendor/Seller Name", type: "text", default: "[Vendor Name]" },
            { key: "vendorFather", label: "Vendor's Father Name", type: "text", default: "[Father's Name]" },
            { key: "vendorAddress", label: "Vendor Address", type: "textarea", default: "[Address]" },
            { key: "purchaserName", label: "Purchaser/Buyer Name", type: "text", default: "[Purchaser Name]" },
            { key: "purchaserFather", label: "Purchaser's Father Name", type: "text", default: "[Father's Name]" },
            { key: "purchaserAddress", label: "Purchaser Address", type: "textarea", default: "[Address]" },
            { key: "propertyDetails", label: "Property Details (Area, Bounds, Survey No.)", type: "textarea", default: "[Property Description]" },
            { key: "totalConsideration", label: "Total Sale Consideration (₹)", type: "text", default: "[Consideration]" },
            { key: "advancePaid", label: "Advance Paid (₹)", type: "text", default: "[Advance]" },
            { key: "balanceAmount", label: "Balance Amount (₹)", type: "text", default: "[Balance]" },
            { key: "possessionDate", label: "Date of Possession", type: "date", default: "[Possession Date]" },
            { key: "executionDate", label: "Date of Execution", type: "date", default: "[Date]" },
            { key: "registrationOffice", label: "Sub-Registrar Office", type: "text", default: "[Sub-Registrar Office]" },
          ],
          body: `SALE DEED

THIS SALE DEED is executed at [Place] on this {{executionDate}} day of [Month], [Year].

BETWEEN

{{vendorName}} son/daughter/wife of {{vendorFather}}, residing at {{vendorAddress}} (hereinafter referred to as the "Vendor" / "Seller")

AND

{{purchaserName}} son/daughter/wife of {{purchaserFather}}, residing at {{purchaserAddress}} (hereinafter referred to as the "Purchaser" / "Buyer")

WHEREAS:

A. The Vendor is the absolute owner and in possession of the property described in the Schedule hereunder (hereinafter referred to as the "Schedule Property").

B. The Vendor has agreed to sell the Schedule Property to the Purchaser for a total sale consideration of ₹{{totalConsideration}} (Rupees {{totalConsideration}} only).

C. The Purchaser has agreed to purchase the same on the terms and conditions herein contained.

SCHEDULE OF PROPERTY

{{propertyDetails}}

NOW THIS SALE DEED WITNESSETH AS FOLLOWS:

1. SALE
   In consideration of the total sale consideration of ₹{{totalConsideration}} received as follows:
   a) Advance of ₹{{advancePaid}} paid on [Date];
   b) Balance of ₹{{balanceAmount}} paid at the time of registration;

   The Vendor hereby sells, conveys, and transfers the Schedule Property absolutely to the Purchaser.

2. TITLE
   The Vendor covenants that he/she has good and marketable title to the Schedule Property and has full power and authority to sell the same.

3. ENCUMBRANCES
   The Vendor declares that the Schedule Property is free from all encumbrances, charges, liens, and claims.

4. POSSESSION
   The Vendor hereby delivers vacant and peaceful possession of the Schedule Property to the Purchaser on {{possessionDate}}.

5. INDEMNITY
   The Vendor indemnifies the Purchaser against any defect in title or any claim arising prior to this sale.

6. BOUNDARIES
   The Vendor confirms the boundaries of the Schedule Property as described in the Schedule.

7. REGISTRATION
   This Deed shall be presented for registration before the Office of the Sub-Registrar, {{registrationOffice}}.

8. FUTURE DEALINGS
   The Purchaser shall have absolute right to deal with the Schedule Property in any manner.

IN WITNESS WHEREOF, the Parties have signed this Deed on the date first written above.

____________________                          ____________________
VENDOR                                        PURCHASER

WITNESSES:

1. Signature: ____________                   2. Signature: ____________
   Name: ____________                          Name: ____________
   Address: ____________                       Address: ____________`,
        },
      ],
    },
    {
      key: "gst-reply",
      title: "GST Reply",
      icon: "receipt-outline",
      description: "Reply templates for GST notices – SCN, demand, mismatch, assessment, and adjudication.",
      templates: [
        {
          id: "gst-scn-reply",
          label: "Reply to Show Cause Notice (GST)",
          fields: [
            { key: "noticeNumber", label: "Notice Reference Number", type: "text", default: "[Notice No.]" },
            { key: "noticeDate", label: "Notice Date", type: "date", default: "[Notice Date]" },
            { key: "gstin", label: "GSTIN", type: "text", default: "[GSTIN]" },
            { key: "legalName", label: "Legal Name of Taxpayer", type: "text", default: "[Legal Name]" },
            { key: "tradeName", label: "Trade Name (if any)", type: "text", default: "[Trade Name]" },
            { key: "address", label: "Registered Address", type: "textarea", default: "[Address]" },
            { key: "replyDate", label: "Date of Reply", type: "date", default: "[Date]" },
            { key: "reasonShowCause", label: "Reason for SCN (in brief)", type: "textarea", default: "[Brief summary of the allegation]" },
            { key: "replyContent", label: "Detailed Reply / Submissions", type: "textarea", default: "[Detailed reply with legal submissions]" },
            { key: "supportingDocs", label: "List of Supporting Documents", type: "textarea", default: "[List of documents attached]" },
          ],
          body: `REPLY TO SHOW CAUSE NOTICE UNDER THE CGST ACT, 2017

To,
The [Proper Officer / Joint Commissioner / Additional Commissioner],
[Office Name and Address]

Date: {{replyDate}}

Reference: Show Cause Notice No. {{noticeNumber}} dated {{noticeDate}}

From,
{{legalName}} ({{tradeName}})
GSTIN: {{gstin}}
{{address}}

Subject: REPLY TO SHOW CAUSE NOTICE UNDER SECTION [ ] OF THE CGST ACT, 2017

Respected Sir/Madam,

I/We, {{legalName}}, holder of GSTIN {{gstin}}, hereby submit this reply to the Show Cause Notice No. {{noticeNumber}} dated {{noticeDate}} issued under Section [ ] of the CGST Act, 2017 and the rules made thereunder.

1. PRELIMINARY SUBMISSIONS

   I/We have received the aforesaid SCN alleging that:

   {{reasonShowCause}}

2. DETAILED REPLY

   {{replyContent}}

3. DOCUMENTS RELIED UPON

   I/We rely upon the following documents in support of this reply:

   {{supportingDocs}}

4. PRAYER

   In view of the above submissions, it is respectfully prayed that:

   a) The Show Cause Notice may be disposed of as withdrawn / dropped;
   b) The allegations made therein may not be confirmed;
   c) Any personal hearing may be granted before passing any adverse order;
   d) Any other order deemed fit may be passed.

Thanking you,

Yours faithfully,

_______________________
(Authorized Signatory)
{{legalName}}
GSTIN: {{gstin}}`,
        },
        {
          id: "gst-demand-reply",
          label: "Reply to GST Demand Notice",
          fields: [
            { key: "demandNoticeNumber", label: "Demand Notice Number", type: "text", default: "[Notice No.]" },
            { key: "demandDate", label: "Notice Date", type: "date", default: "[Date]" },
            { key: "gstin", label: "GSTIN", type: "text", default: "[GSTIN]" },
            { key: "legalName", label: "Legal Name", type: "text", default: "[Legal Name]" },
            { key: "address", label: "Registered Address", type: "textarea", default: "[Address]" },
            { key: "demandAmount", label: "Disputed Demand Amount (₹)", type: "text", default: "[Amount]" },
            { key: "replyDate", label: "Date of Reply", type: "date", default: "[Date]" },
            { key: "grounds", label: "Grounds for Dispute", type: "textarea", default: "[Grounds for disputing the demand]" },
            { key: "paymentMade", label: "Payment Made (if any, ₹)", type: "text", default: "[Amount Paid]" },
          ],
          body: `REPLY TO DEMAND NOTICE UNDER CGST ACT, 2017

To,
The [Deputy Commissioner / Joint Commissioner],
[Office Name and Address]

Date: {{replyDate}}

Reference: Demand Notice No. {{demandNoticeNumber}} dated {{demandDate}}

From,
{{legalName}}
GSTIN: {{gstin}}
{{address}}

Subject: REPLY TO DEMAND NOTICE / ADJUDICATION ORDER

Respected Sir/Madam,

I/We, {{legalName}}, GSTIN {{gstin}}, hereby submit this reply to the Demand Notice No. {{demandNoticeNumber}} dated {{demandDate}} raising a demand of ₹{{demandAmount}}.

1. I/We have received the aforesaid demand notice raising a demand of ₹{{demandAmount}} on account of [brief description of demand].

2. I/We most respectfully submit that the said demand is not sustainable in law and on facts for the following reasons:

   {{grounds}}

3. I/We have paid ₹{{paymentMade}} as pre-deposit / part payment (if applicable) vide Challan/ITC No. [Details].

4. It is respectfully submitted that the demand may be dropped / reduced / set aside in view of the above submissions.

5. I/We request that a personal hearing may be granted before any final order is passed.

Thanking you,

Yours faithfully,

_______________________
(Authorized Signatory)
{{legalName}}
GSTIN: {{gstin}}`,
        },
      ],
    },
    {
      key: "income-tax-reply",
      title: "Income Tax Reply",
      icon: "calculator-outline",
      description: "Reply templates for income tax notices – 148, 143(2), 142(1), scrutiny, CPC intimation, appeals.",
      templates: [
        {
          id: "it-reply-148",
          label: "Reply to Notice under Section 148 (Re-assessment)",
          fields: [
            { key: "noticeNumber", label: "Notice Number (148)", type: "text", default: "[Notice No.]" },
            { key: "noticeDate", label: "Notice Date", type: "date", default: "[Date]" },
            { key: "assessmentYear", label: "Assessment Year", type: "text", default: "[AY]" },
            { key: "pan", label: "PAN", type: "text", default: "[PAN]" },
            { key: "taxpayerName", label: "Taxpayer Name", type: "text", default: "[Name]" },
            { key: "address", label: "Address", type: "textarea", default: "[Address]" },
            { key: "replyDate", label: "Date of Reply", type: "date", default: "[Date]" },
            { key: "grounds", label: "Grounds / Reasons for Re-assessment", type: "textarea", default: "[Brief of reasons recorded]" },
            { key: "submissions", label: "Detailed Submissions", type: "textarea", default: "[Detailed legal and factual submissions]" },
          ],
          body: `REPLY TO NOTICE UNDER SECTION 148 OF THE INCOME TAX ACT, 1961

To,
The Assessing Officer,
[Ward/Circle], [City]

Date: {{replyDate}}

Reference: Notice under Section 148 dated {{noticeDate}} for A.Y. {{assessmentYear}}

From,
{{taxpayerName}}
PAN: {{pan}}
{{address}}

Subject: REPLY TO NOTICE UNDER SECTION 148 OF THE INCOME-TAX ACT, 1961

Respected Sir/Madam,

I, {{taxpayerName}}, PAN {{pan}}, am in receipt of the Notice under Section 148 of the Income Tax Act, 1961 dated {{noticeDate}} for Assessment Year {{assessmentYear}}.

Pursuant to the above and without prejudice to my rights, I hereby submit my reply as follows:

1. The reasons recorded for issuing the notice under Section 148, as provided by your office, state:

   {{grounds}}

2. My detailed submissions are as follows:

   {{submissions}}

3. In view of the above, I submit that:
   a) There is no failure on my part to disclose fully and truly all material facts;
   b) The reasons recorded do not justify the reopening of assessment;
   c) The notice under Section 148 is bad in law and liable to be dropped;

   OR

   (If cooperating with assessment)
   a) I have filed my return of income originally on [Date];
   b) I am providing the information / documents as called for;
   c) The proceedings may be treated as assessment under Section 143(3)/147.

4. I request that the proceedings initiated vide the said notice may be dropped / concluded at the earliest.

Thanking you,

Yours faithfully,

_______________________
{{taxpayerName}}
PAN: {{pan}}`,
        },
        {
          id: "it-reply-scrutiny",
          label: "Reply to Scrutiny Notice (143(2) / 142(1))",
          fields: [
            { key: "noticeNumber", label: "Notice Number", type: "text", default: "[Notice No.]" },
            { key: "noticeSection", label: "Section (143(2) / 142(1))", type: "text", default: "[Section]" },
            { key: "noticeDate", label: "Notice Date", type: "date", default: "[Date]" },
            { key: "assessmentYear", label: "Assessment Year", type: "text", default: "[AY]" },
            { key: "pan", label: "PAN", type: "text", default: "[PAN]" },
            { key: "taxpayerName", label: "Taxpayer Name", type: "text", default: "[Name]" },
            { key: "address", label: "Address", type: "textarea", default: "[Address]" },
            { key: "replyDate", label: "Date of Reply", type: "date", default: "[Date]" },
            { key: "queryDetails", label: "Queries Raised by AO", type: "textarea", default: "[List of queries]" },
            { key: "replyDetails", label: "Point-wise Replies", type: "textarea", default: "[Point-wise replies to each query]" },
          ],
          body: `REPLY TO NOTICE UNDER SECTION {{noticeSection}} OF THE INCOME TAX ACT, 1961

To,
The Assessing Officer,
[Ward/Circle], [City]

Date: {{replyDate}}

Reference: Notice under Section {{noticeSection}} dated {{noticeDate}} for A.Y. {{assessmentYear}}

From,
{{taxpayerName}}
PAN: {{pan}}
{{address}}

Subject: REPLY TO NOTICE UNDER SECTION {{noticeSection}} OF THE INCOME-TAX ACT, 1961

Respected Sir/Madam,

I, {{taxpayerName}}, PAN {{pan}}, am in receipt of the Notice under Section {{noticeSection}} of the Income Tax Act, 1961 dated {{noticeDate}} for Assessment Year {{assessmentYear}}.

In response to the queries raised, I submit my reply as follows:

DETAILED REPLY

{{queryDetails}}

{{replyDetails}}

I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief. I have no other income to disclose beyond what has been returned.

I request that the assessment proceedings may be completed at the earliest based on the above submissions.

Thanking you,

Yours faithfully,

_______________________
{{taxpayerName}}
PAN: {{pan}}`,
        },
      ],
    },
    {
      key: "revenue-appeal",
      title: "Revenue Appeal",
      icon: "git-branch-outline",
      description: "Appeal templates for revenue matters – Income Tax, GST, Customs, Excise before appellate authorities.",
      templates: [
        {
          id: "revenue-appeal-it",
          label: "Income Tax Appeal (CIT(A) / ITAT)",
          fields: [
            { key: "appellateAuthority", label: "Appellate Authority (CIT(A) / ITAT)", type: "text", default: "[CIT(A) / ITAT]" },
            { key: "appealNumber", label: "Appeal Number (if any)", type: "text", default: "[Appeal No.]" },
            { key: "assessmentYear", label: "Assessment Year", type: "text", default: "[AY]" },
            { key: "orderNumber", label: "Order Being Appealed (Number & Date)", type: "text", default: "[Order No. & Date]" },
            { key: "appellantName", label: "Appellant Name", type: "text", default: "[Appellant Name]" },
            { key: "pan", label: "PAN", type: "text", default: "[PAN]" },
            { key: "address", label: "Address", type: "textarea", default: "[Address]" },
            { key: "appealDate", label: "Date of Appeal", type: "date", default: "[Date]" },
            { key: "groundsOfAppeal", label: "Grounds of Appeal", type: "textarea", default: "[Numbered grounds of appeal]" },
            { key: "factsOfCase", label: "Facts of the Case", type: "textarea", default: "[Brief statement of facts]" },
            { key: "reliefSought", label: "Relief Sought", type: "textarea", default: "[Nature of relief claimed]" },
          ],
          body: `APPEAL UNDER THE INCOME TAX ACT, 1961

BEFORE THE HON'BLE {{appellateAuthority}}

Appeal No. ______________ (to be assigned)
A.Y. {{assessmentYear}}

IN THE MATTER OF:
{{appellantName}}
PAN: {{pan}}
{{address}}
                                                              ……….Appellant

Versus

Income Tax Officer / Assistant Commissioner / Deputy Commissioner
[Ward/Circle]
                                                              ……….Respondent

GROUNDS OF APPEAL AGAINST THE ORDER DATED [Date] UNDER SECTION [ ] OF THE INCOME TAX ACT, 1961

MOST RESPECTFULLY SHOWETH:

1. FACTS OF THE CASE

   {{factsOfCase}}

2. GROUNDS OF APPEAL

   {{groundsOfAppeal}}

3. RELIEF SOUGHT

   {{reliefSought}}

4. The Appellant craves leave to add, amend, modify, or alter any of the above grounds at the time of hearing.

5. The Appellant submits that this appeal is within the period of limitation.

PRAYER

It is, therefore, most respectfully prayed that the Hon'ble {{appellateAuthority}} may be pleased to:

a) Admit this appeal;
b) Set aside / modify the impugned order dated [Date];
c) Grant such relief as deemed fit;
d) Pass any other order(s) as may be deemed just and proper.

AND THE APPELLANT SHALL, AS IN DUTY BOUND, EVER PRAY.

Place: [Place]
Date: {{appealDate}}

                                          _______________________
                                          (Authorized Representative)
                                          For {{appellantName}}
                                          PAN: {{pan}}`,
        },
        {
          id: "revenue-appeal-gst",
          label: "GST Appeal (Appellate Authority / Tribunal)",
          fields: [
            { key: "appellateAuthority", label: "Appellate Authority", type: "text", default: "[Appellate Authority]" },
            { key: "orderNumber", label: "Impugned Order Number & Date", type: "text", default: "[Order No. & Date]" },
            { key: "gstin", label: "GSTIN", type: "text", default: "[GSTIN]" },
            { key: "appellantName", label: "Appellant Name", type: "text", default: "[Name]" },
            { key: "tradeName", label: "Trade Name", type: "text", default: "[Trade Name]" },
            { key: "address", label: "Address", type: "textarea", default: "[Address]" },
            { key: "appealDate", label: "Date of Appeal", type: "date", default: "[Date]" },
            { key: "disputedAmount", label: "Disputed Amount (₹)", type: "text", default: "[Amount]" },
            { key: "groundsOfAppeal", label: "Grounds of Appeal", type: "textarea", default: "[Numbered grounds]" },
            { key: "preDeposit", label: "Pre-deposit Paid (₹)", type: "text", default: "[Pre-deposit]" },
          ],
          body: `APPEAL UNDER THE CGST ACT, 2017

BEFORE THE {{appellateAuthority}}

IN THE MATTER OF:
{{appellantName}} ({{tradeName}})
GSTIN: {{gstin}}
{{address}}
                                                              ……….Appellant

Versus

[Respondent Authority]
                                                              ……….Respondent

APPEAL AGAINST ORDER NO. {{orderNumber}} UNDER SECTION [ ] OF THE CGST ACT, 2017

MOST RESPECTFULLY SHOWETH:

1. The Appellant is a registered person under GST bearing GSTIN {{gstin}}.

2. The Appellant had filed the requisite returns and complied with all statutory requirements.

3. The impugned order dated [Date] has confirmed a demand of ₹{{disputedAmount}} which is contrary to law and facts.

4. GROUNDS OF APPEAL

   {{groundsOfAppeal}}

5. The Appellant has paid a pre-deposit of ₹{{preDeposit}} as required under Section 107(6) / 112(8) of the CGST Act, 2017.

6. The appeal is within the period of limitation.

PRAYER

It is, therefore, most respectfully prayed that the Hon'ble Authority may be pleased to:

a) Admit this appeal;
b) Set aside or modify the impugned order;
c) Grant consequential relief;
d) Pass any other order as may be deemed fit.

Place: [Place]
Date: {{appealDate}}

                                          _______________________
                                          (Authorized Signatory)
                                          For {{appellantName}}
                                          GSTIN: {{gstin}}`,
        },
      ],
    },
  ],
};

module.exports = draftLibraryPhase11;