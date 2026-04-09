// -------------------------------
//  Firebase IMPORTS
// -------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// -------------------------------
//  Firebase CONFIG (CHANGE THIS)
// -------------------------------
const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "YOUR-PROJECT-ID.firebaseapp.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR-PROJECT-ID.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

// -------------------------------
//  Initialize Firebase
// -------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------------------------
//  SIGN UP
// -------------------------------
window.signup = function () {
  const email = document.getElementById("signupEmail").value;
  const pass = document.getElementById("signupPass").value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Sign Up Successful"))
    .catch(err => alert(err.message));
};

// -------------------------------
//  LOGIN
// -------------------------------
window.login = function () {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Login Successful"))
    .catch(err => alert(err.message));
};

// -------------------------------
//  ADD STORY
// -------------------------------
window.sendStory = async function () {
  const title = document.getElementById("storyTitle").value;
  const text = document.getElementById("storyText").value;

  if (!title || !text) return alert("Please fill both fields.");

  await addDoc(collection(db, "stories"), {
    title: title,
    text: text,
    likes: 0,
    timestamp: Date.now()
  });

  document.getElementById("storyTitle").value = "";
  document.getElementById("storyText").value = "";
};

// -------------------------------
//  LIVE STORY LOADER
// -------------------------------
const storyList = document.getElementById("storyList");

onSnapshot(collection(db, "stories"), (snapshot) => {
  storyList.innerHTML = "";

  snapshot.forEach((docu) => {
    const data = docu.data();

    const div = document.createElement("div");
    div.className = "story-card";

    const timeAgo = getTimeAgo(data.timestamp);

    div.innerHTML = `
      <div class="story-title" onclick="toggleStory('${docu.id}')">
        ${data.title}
      </div>

      <div id="story-${docu.id}" class="hidden" style="margin-top:10px;">
        <div>${data.text}</div><br>

        <button class="like-btn" onclick="likeStory('${docu.id}', ${data.likes})">❤️ ${data.likes}</button>
        <button class="comment-btn" onclick="addComment('${docu.id}')">💬 Comment</button>

        <div class="story-time">${timeAgo}</div>
      </div>
    `;

    storyList.appendChild(div);
  });
});

// -------------------------------
//  LIKE FUNCTION
// -------------------------------
window.likeStory = async function (id, currentLikes) {
  const ref = doc(db, "stories", id);
  await updateDoc(ref, { likes: currentLikes + 1 });
};

// -------------------------------
//  COMMENT FUNCTION (simple prompt)
// -------------------------------
window.addComment = function (id) {
  const c = prompt("Write your comment:");
  if (c) alert("Comment saved: " + c);
};

// -------------------------------
//  TAP TO OPEN FULL STORY
// -------------------------------
window.toggleStory = function (id) {
  const box = document.getElementById("story-" + id);
  box.classList.toggle("hidden");
};

// -------------------------------
//  SEARCH
// -------------------------------
window.searchStory = function () {
  const value = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".story-card");

  cards.forEach(card => {
    const title = card.querySelector(".story-title").innerText.toLowerCase();
    card.style.display = title.includes(value) ? "block" : "none";
  });
};

// -------------------------------
//  TIME AGO CALCULATOR
// -------------------------------
function getTimeAgo(time) {
  const diff = (Date.now() - time) / 1000;

  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";

  return Math.floor(diff / 86400) + " days ago";
}