export interface TemplateContent {
  id: string;
  name: string;
  category: string;
  html: string;
}

export const TEMPLATES: Record<string, TemplateContent> = {
  'mutual-nda': {
    id: 'mutual-nda',
    name: 'Mutual NDA',
    category: 'Contracts & Agreements',
    html: `<h1>MUTUAL NON-DISCLOSURE AGREEMENT</h1>
<p>This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of this ___ day of _______________, 20___ (the "Effective Date"), by and between the parties signatory hereto.</p>
<h2>1. PURPOSE</h2>
<p>The parties wish to explore a business relationship or transaction of mutual interest (the "Purpose"). In connection with the Purpose, each party may disclose to the other party certain proprietary, technical, financial, or business information that the disclosing party considers confidential.</p>
<h2>2. CONFIDENTIAL INFORMATION</h2>
<p>"Confidential Information" means any information disclosed by one party ("Discloser") to the other party ("Recipient") that is marked as confidential or should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.</p>
<h2>3. OBLIGATIONS OF RECIPIENT</h2>
<p>Recipient agrees to: (a) hold the Confidential Information in strict confidence; (b) use the Confidential Information solely for the Purpose; and (c) limit access to the Confidential Information to employees and representatives who have a need to know and are bound by confidentiality obligations no less restrictive than those herein.</p>
<h2>4. TERM AND TERMINATION</h2>
<p>This Agreement and the obligations of confidentiality hereunder shall survive for a period of three (3) years from the Effective Date, or until such time as the Confidential Information enters the public domain through no fault of the Recipient.</p>
<p>IN WITNESS WHEREOF, the parties have executed this Mutual Non-Disclosure Agreement as of the Effective Date.</p>`
  },
  'msa': {
    id: 'msa',
    name: 'Master Services Agreement',
    category: 'Contracts & Agreements',
    html: `<h1>MASTER SERVICES AGREEMENT</h1>
<p>This Master Services Agreement (the "Agreement") is made effective as of ___ day of _______________, 20___, by and between Kiya Law & Associates ("Provider") and the client signatory hereto ("Client").</p>
<h2>1. SERVICES</h2>
<p>Provider shall perform the services described in one or more Statements of Work (each, a "SOW") executed by both parties. Each SOW shall incorporate the terms of this Agreement by reference.</p>
<h2>2. FEES AND PAYMENT</h2>
<p>Client shall pay Provider the fees specified in the applicable SOW. All invoices are due and payable within thirty (30) days of the invoice date. Late payments shall bear interest at the rate of 1.5% per month.</p>
<h2>3. INTELLECTUAL PROPERTY</h2>
<p>Except as otherwise specified in an SOW, all deliverables, work product, and intellectual property created by Provider in the performance of the services shall be owned exclusively by Client upon full payment of all outstanding fees.</p>
<h2>4. LIMITATION OF LIABILITY</h2>
<p>In no event shall either party be liable for any indirect, special, incidental, or consequential damages arising out of or related to this Agreement, regardless of the form of action.</p>
<p>IN WITNESS WHEREOF, the parties hereto have executed this Master Services Agreement as of the date first written above.</p>`
  },
  'sow': {
    id: 'sow',
    name: 'Statement of Work',
    category: 'Contracts & Agreements',
    html: `<h1>STATEMENT OF WORK</h1>
<p>This Statement of Work ("SOW") is issued pursuant to the Master Services Agreement dated _______________, 20___, by and between Provider and Client.</p>
<h2>1. SCOPE OF SERVICES</h2>
<p>Provider will perform the following activities and tasks: [Insert detailed project milestones, scope of work, and expected deliverables.]</p>
<h2>2. DELIVERABLES</h2>
<p>The deliverables under this SOW consist of the following: [List specific documents, reports, code, or materials to be delivered.]</p>
<h2>3. TIMELINE & ESTIMATES</h2>
<p>The estimated schedule for the deliverables is as follows: [List completion dates or milestones.]</p>
<h2>4. BUDGET & FEE STRUCTURE</h2>
<p>The total estimated fee for the services under this SOW is $_______________, to be billed on a [Fixed Price / Time & Materials] basis.</p>
<p>Accepted and approved by authorized representatives of both parties.</p>`
  },
  'employment-agreement': {
    id: 'employment-agreement',
    name: 'Employment Agreement',
    category: 'Employment',
    html: `<h1>EMPLOYMENT AGREEMENT</h1>
<p>This Employment Agreement (the "Agreement") is entered into as of _______________, 20___, by and between Kiya Law & Associates ("Employer") and the employee signatory hereto ("Employee").</p>
<h2>1. POSITION & DUTIES</h2>
<p>Employee shall serve in the position of _______________. Employee agrees to perform all duties and responsibilities assigned by Employer in a professional and diligent manner.</p>
<h2>2. COMPENSATION & BENEFITS</h2>
<p>Employer shall pay Employee a base salary of $_______________ per year, payable in accordance with Employer's standard payroll practices. Employee shall also be eligible for standard benefits offered to full-time employees.</p>
<h2>3. TERMINATION</h2>
<p>This employment relationship is "at-will," meaning either party may terminate this Agreement at any time, with or without cause, upon written notice to the other party.</p>
<h2>4. GOVERNING LAW</h2>
<p>This Agreement shall be governed by and construed in accordance with the laws of the State of _______________.</p>
<p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>`
  },
  'independent-contractor': {
    id: 'independent-contractor',
    name: 'Independent Contractor Agreement',
    category: 'Employment',
    html: `<h1>INDEPENDENT CONTRACTOR AGREEMENT</h1>
<p>This Independent Contractor Agreement (the "Agreement") is made effective as of _______________, 20___, by and between Kiya Law & Associates ("Company") and the contractor signatory hereto ("Contractor").</p>
<h2>1. SERVICES TO BE PERFORMED</h2>
<p>Contractor agrees to perform the following services for Company: [Insert detailed description of services.]</p>
<h2>2. INDEPENDENT CONTRACTOR STATUS</h2>
<p>Contractor is an independent contractor and is not an employee, agent, or partner of Company. Contractor is solely responsible for all tax withholding, insurance, and benefits.</p>
<h2>3. TERM & TERMINATION</h2>
<p>This Agreement shall begin on the effective date and continue until completed, or terminated by either party upon _______________ days' prior written notice.</p>
<p>IN WITNESS WHEREOF, the parties have signed this Agreement as of the date first written above.</p>`
  },
  'lease-agreement': {
    id: 'lease-agreement',
    name: 'Commercial Lease',
    category: 'Commercial',
    html: `<h1>COMMERCIAL LEASE AGREEMENT</h1>
<p>This Commercial Lease Agreement (the "Lease") is entered into as of _______________, 20___, by and between the Landlord and Tenant signatories hereto.</p>
<h2>1. PREMISES</h2>
<p>Landlord hereby leases to Tenant the commercial property located at: _______________ (the "Premises").</p>
<h2>2. TERM</h2>
<p>The term of this Lease shall be for a period of _______________, commencing on _______________ and ending on _______________.</p>
<h2>3. RENT</h2>
<p>Tenant shall pay Landlord base rent in the amount of $_______________ per month, due on the first day of each calendar month.</p>
<h2>4. USE OF PREMISES</h2>
<p>Tenant shall use the Premises solely for [Office / Retail / Commercial] purposes and in compliance with all zoning laws.</p>
<p>IN WITNESS WHEREOF, Landlord and Tenant have executed this Lease as of the date first written above.</p>`
  },
  'partnership-agreement': {
    id: 'partnership-agreement',
    name: 'Partnership Agreement',
    category: 'Commercial',
    html: `<h1>PARTNERSHIP AGREEMENT</h1>
<p>This Partnership Agreement (the "Agreement") is entered into as of _______________, 20___, by and between the partners signatory hereto.</p>
<h2>1. PARTNERSHIP NAME & PURPOSE</h2>
<p>The partners hereby form a partnership under the name of: _______________ (the "Partnership"), for the purpose of carrying out legal and commercial operations.</p>
<h2>2. CAPITAL CONTRIBUTIONS</h2>
<p>Each partner shall contribute capital to the Partnership as follows: [List partner name and contribution amounts.]</p>
<h2>3. PROFIT & LOSS ALLOCATION</h2>
<p>The net profits and losses of the Partnership shall be shared and borne by the partners in proportion to their capital contributions, or as otherwise agreed herein.</p>
<p>IN WITNESS WHEREOF, the partners have signed this Agreement as of the date first written above.</p>`
  },
  'complaint': {
    id: 'complaint',
    name: 'Complaint',
    category: 'Initial Pleadings',
    html: `<h1>Complaint</h1>
<p>COMES NOW the Plaintiff, by and through its undersigned counsel, and respectfully alleges as follows:</p>
<h2>I. JURISDICTION AND VENUE</h2>
<p>This Court has subject matter jurisdiction pursuant to 28 U.S.C. § 1331 and 28 U.S.C. § 1367. Venue is proper in this district under 28 U.S.C. § 1391.</p>
<h2>II. PARTIES</h2>
<p>Plaintiff is a corporation organized and existing under the laws of the State of Delaware, with its principal place of business at _______________.</p>
<h2>III. FACTUAL ALLEGATIONS</h2>
<p>[Insert factual allegations supporting each cause of action.]</p>
<h2>IV. CAUSES OF ACTION</h2>
<h3>Count One: [Cause of Action]</h3>
<p>Plaintiff re-alleges and incorporates by reference the allegations set forth above. [Elements and supporting facts.]</p>
<h2>V. PRAYER FOR RELIEF</h2>
<p>WHEREFORE, Plaintiff respectfully requests that this Court enter judgment in its favor and against Defendant as follows:</p>
<p>A. [Relief requested];<br>B. [Additional relief];<br>C. Such other and further relief as the Court deems just and proper.</p>
<p>Respectfully submitted this ___ day of _______________, 20___.</p>`
  },
  'answer': {
    id: 'answer',
    name: 'Answer',
    category: 'Initial Pleadings',
    html: `<h1>ANSWER AND AFFIRMATIVE DEFENSES</h1>
<p>COMES NOW Defendant, by and through its undersigned counsel, and hereby submits its Answer to Plaintiff's Complaint as follows:</p>
<h2>ANSWERS BY PARAGRAPH</h2>
<p>1. Defendant admits the allegations contained in paragraph 1 of the Complaint.<br>2. Defendant denies the allegations contained in paragraph 2 of the Complaint.</p>
<h2>AFFIRMATIVE DEFENSES</h2>
<p>As and for its affirmative defenses, Defendant alleges as follows:</p>
<h3>First Affirmative Defense</h3>
<p>Plaintiff's Complaint fails to state a claim upon which relief can be granted.</p>
<h3>Second Affirmative Defense</h3>
<p>Plaintiff's claims are barred by the applicable statute of limitations.</p>
<p>Dated: _______________, 20___</p>`
  },
  'motion-dismiss': {
    id: 'motion-dismiss',
    name: 'Motion to Dismiss',
    category: 'Initial Pleadings',
    html: `<h1>MOTION TO DISMISS</h1>
<p>COMES NOW Defendant, by and through its undersigned counsel, and hereby moves this Court to dismiss Plaintiff's Complaint with prejudice pursuant to Federal Rule of Civil Procedure 12(b)(6).</p>
<h2>MEMORANDUM OF LAW</h2>
<p>Defendant is entitled to dismissal of the Complaint because Plaintiff fails to state a claim upon which relief can be granted under the pleading standards of Ashcroft v. Iqbal and Bell Atlantic Corp. v. Twombly.</p>
<h2>CONCLUSION</h2>
<p>For the reasons stated above, Defendant respectfully requests that this Court grant this Motion to Dismiss and dismiss Plaintiff's Complaint with prejudice.</p>
<p>Dated: _______________, 20___</p>`
  },
  'legal-memo': {
    id: 'legal-memo',
    name: 'Legal Memo',
    category: 'Memos & Letters',
    html: `<h1>LEGAL MEMORANDUM</h1>
<p><strong>TO:</strong> Senior Partner<br><strong>FROM:</strong> Associate Attorney<br><strong>DATE:</strong> _______________, 20___<br><strong>SUBJECT:</strong> _______________</p>
<h2>QUESTION PRESENTED</h2>
<p>[State the legal question or issue being addressed.]</p>
<h2>BRIEF ANSWER</h2>
<p>[Provide a brief, concise answer to the question presented.]</p>
<h2>STATEMENT OF FACTS</h2>
<p>[Describe the relevant factual background of the matter.]</p>
<h2>DISCUSSION & ANALYSIS</h2>
<p>[Analyze the legal authority and apply it to the facts (IRAC format).]</p>
<h2>CONCLUSION</h2>
<p>[Provide final conclusion and recommended next steps.]</p>`
  },
  'engagement-letter': {
    id: 'engagement-letter',
    name: 'Engagement Letter',
    category: 'Memos & Letters',
    html: `<h1>CLIENT ENGAGEMENT LETTER</h1>
<p>Date: _______________, 20___</p>
<p>Dear [Client Name],</p>
<p>Thank you for choosing Kiya Law & Associates (the "Firm") to represent you in connection with _______________ (the "Matter"). This letter outlines our terms of engagement.</p>
<h2>1. SCOPE OF REPRESENTATION</h2>
<p>The Firm will provide legal services restricted to the scope of: [Insert scope details]. Any additional services will require a separate written agreement.</p>
<h2>2. FEES AND BILLING</h2>
<p>Our fees will be based on hourly rates of $_______________ for Partners and $_______________ for Associates. Invoices will be sent monthly and are payable upon receipt.</p>
<h2>3. RETAINER</h2>
<p>We require an initial retainer of $_______________ prior to beginning representation, to be held in trust.</p>
<p>Please sign and return a copy of this letter to signify agreement.</p>`
  },
};
