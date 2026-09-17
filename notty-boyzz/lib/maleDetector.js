const MALE_NAMES = new Set([
  // Popular Indian Male Names
  "rahul", "amit", "rohit", "mohit", "vikas", "ajay", "deepak", "suresh", "ramesh", "raj", "rajesh",
  "sachin", "karan", "arjun", "aman", "sumit", "abhishek", "vivek", "sunil", "anil", "pawan",
  "manoj", "ravi", "sanjay", "vijay", "vishal", "sandeep", "pradeep", "gaurav", "saurav", "kunal",
  "neeraj", "manish", "sunny", "vicky", "nitin", "ashish", "harsh", "aditya", "shubham", "mayank",
  "akash", "varun", "chetan", "dev", "rohan", "kabir", "aryan", "ayush", "kartik", "ankit",
  "sourabh", "pankaj", "alok", "anand", "ashok", "bharat", "brijesh", "chandan", "dharmendra",
  "dinesh", "ganesh", "gopal", "govind", "harish", "hemant", "himanshu", "ishaan", "jagdish",
  "jitendra", "kamal", "kapil", "keshav", "kishore", "krishna", "kuldeep", "lalit", "lokesh",
  "mahesh", "mithun", "mukesh", "naresh", "narendra", "naveen", "nikhil", "om", "parveen",
  "prashant", "praveen", "prem", "raghav", "rajat", "rajeev", "rakesh", "ram", "ranjeet",
  "ratnesh", "rishi", "ritesh", "samir", "sameer", "santosh", "sarvesh", "satish", "shankar",
  "shantanu", "shashi", "shivam", "shiv", "sid", "siddharth", "sonu", "monu", "tarun", "tushar",
  "umesh", "upendra", "vinay", "vinod", "vipin", "yash", "yogesh", "bablu", "chintu", "monty",
  "bunty", "rocky", "tony", "lucky", "bobby", "deep", "jeet", "meet", "gagan", "mandeep",
  "gurpreet", "harpreet", "jaspreet", "gursewak", "kulwant", "balwinder", "satnam", "manpreet",
  "mohammed", "mohammad", "ali", "ahmed", "imran", "salman", "sahil", "faizan", "bilal", "zeeshan",
  "john", "david", "michael", "alex", "chris", "mike", "james", "robert", "william", "daniel"
]);

export function isMaleName(fullName) {
  if (!fullName) return false;
  const clean = fullName.trim().toLowerCase();
  const parts = clean.split(/[\s._-]+/).filter(Boolean);

  // Check prefix
  if (['mr', 'mr.', 'shri', 'master', 'bhai', 'kumar', 'boy', 'guy'].includes(parts[0])) {
    return true;
  }

  // Check any token
  for (const token of parts) {
    if (MALE_NAMES.has(token)) return true;
  }

  // Check suffix
  if (clean.endsWith('kumar') || clean.endsWith(' bhai') || clean.includes(' boy')) {
    return true;
  }

  return false;
}
