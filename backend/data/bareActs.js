const bareActs = [
  {
    title: "Constitution of India",
    actName: "Constitution of India",
    category: "Constitutional Law",
    pdfUrl: "https://legislative.gov.in/sites/default/files/COI_Eng_0.pdf",
  },

  {
    title: "Indian Penal Code, 1860 (IPC)",
    actName: "Indian Penal Code, 1860",
    category: "Criminal Law",
    pdfUrl:
      "https://indiacode.nic.in/handle/123456789/2263?view_type=full&download=1",
  },

  {
    title: "Bharatiya Nyaya Sanhita, 2023 (BNS)",
    actName: "Bharatiya Nyaya Sanhita, 2023",
    category: "Criminal Law",
    pdfUrl: "https://egazette.nic.in/WriteReadData/2023/247868.pdf",
  },

  {
    title: "Code of Criminal Procedure, 1973 (CrPC)",
    actName: "Code of Criminal Procedure, 1973",
    category: "Criminal Procedure",
    pdfUrl:
      "https://indiacode.nic.in/handle/123456789/1623?view_type=full&download=1",
  },

  {
    title: "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    category: "Criminal Procedure",
    pdfUrl: "https://egazette.nic.in/WriteReadData/2023/247869.pdf",
  },

  {
    title: "Indian Evidence Act, 1872",
    actName: "Indian Evidence Act, 1872",
    category: "Evidence Law",
    pdfUrl:
      "https://indiacode.nic.in/handle/123456789/1620?view_type=full&download=1",
  },

  {
    title: "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    actName: "Bharatiya Sakshya Adhiniyam, 2023",
    category: "Evidence Law",
    pdfUrl: "https://egazette.nic.in/WriteReadData/2023/247870.pdf",
  },

  {
    title: "Contempt of Courts Act, 1971",
    actName: "Contempt of Courts Act, 1971",
    category: "Judicial Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Advocates Act, 1961",
    actName: "Advocates Act, 1961",
    category: "Legal Profession",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Legal Services Authorities Act, 1987",
    actName: "Legal Services Authorities Act, 1987",
    category: "Legal Aid",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Police Act, 1861",
    actName: "Police Act, 1861",
    category: "Police Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Prisons Act, 1894",
    actName: "Prisons Act, 1894",
    category: "Criminal Administration",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Probation of Offenders Act, 1958",
    actName: "Probation of Offenders Act, 1958",
    category: "Criminal Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Juvenile Justice (Care and Protection of Children) Act, 2015",
    actName: "Juvenile Justice (Care and Protection of Children) Act, 2015",
    category: "Child Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Protection of Children from Sexual Offences Act, 2012 (POCSO)",
    actName: "Protection of Children from Sexual Offences Act, 2012",
    category: "Child Protection",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Protection of Women from Domestic Violence Act, 2005",
    actName: "Protection of Women from Domestic Violence Act, 2005",
    category: "Women Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Dowry Prohibition Act, 1961",
    actName: "Dowry Prohibition Act, 1961",
    category: "Women Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Sexual Harassment of Women at Workplace Act, 2013",
    actName: "Sexual Harassment of Women at Workplace Act, 2013",
    category: "Women Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title:
      "Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989",
    actName: "SC/ST Prevention of Atrocities Act, 1989",
    category: "Social Justice",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Prevention of Corruption Act, 1988",
    actName: "Prevention of Corruption Act, 1988",
    category: "Anti-Corruption",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Prevention of Money Laundering Act, 2002 (PMLA)",
    actName: "Prevention of Money Laundering Act, 2002",
    category: "Financial Crime",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Unlawful Activities (Prevention) Act, 1967 (UAPA)",
    actName: "Unlawful Activities (Prevention) Act, 1967",
    category: "National Security",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "National Investigation Agency Act, 2008",
    actName: "National Investigation Agency Act, 2008",
    category: "National Security",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Official Secrets Act, 1923",
    actName: "Official Secrets Act, 1923",
    category: "National Security",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Arms Act, 1959",
    actName: "Arms Act, 1959",
    category: "Weapon Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Explosives Act, 1884",
    actName: "Explosives Act, 1884",
    category: "Public Safety",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Narcotic Drugs and Psychotropic Substances Act, 1985 (NDPS)",
    actName: "NDPS Act, 1985",
    category: "Drug Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Transfer of Property Act, 1882",
    actName: "Transfer of Property Act, 1882",
    category: "Property Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Indian Contract Act, 1872",
    actName: "Indian Contract Act, 1872",
    category: "Contract Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Specific Relief Act, 1963",
    actName: "Specific Relief Act, 1963",
    category: "Civil Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Limitation Act, 1963",
    actName: "Limitation Act, 1963",
    category: "Civil Procedure",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Registration Act, 1908",
    actName: "Registration Act, 1908",
    category: "Property Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Indian Stamp Act, 1899",
    actName: "Indian Stamp Act, 1899",
    category: "Revenue Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Easements Act, 1882",
    actName: "Indian Easements Act, 1882",
    category: "Property Law",
    pdfUrl: "https://indiacode.nic.in/",
  },

  {
    title: "Partition Act, 1893",
    actName: "Partition Act, 1893",
    category: "Property Law",
    pdfUrl: "https://indiacode.nic.in/",
  },
];

module.exports = bareActs;
