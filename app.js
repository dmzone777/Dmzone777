import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAtJzjzNsBvMVj6bOfByWzX21hxSAyLYVQ",
  authDomain: "mini-instagram-95485.firebaseapp.com",
  projectId: "mini-instagram-95485",
  storageBucket: "mini-instagram-95485.appspot.com",
  messagingSenderId: "426906615408",
  appId: "1:426906615408:web:1ba85f1d00b9c09e083eb5",
  measurementId: "G-V8E6NEGGZD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------- SIGNUP
window.signup = () => {
  let name = document.getElementById("signupName").value;
  let email = document.getElementById("signupEmail").value;
  let pass = document.getElementById("signupPass").value;

  if (!name) return alert("Enter your name");

  createUserWithEmailAndPassword(auth, email, pass)
    .then(async (res) => {
      // Save Name in Firestore Users
      await addDoc(collection(db, "users"), {
        uid: res.user.uid,
        name: name
      });
      alert("Account Created");
    })
    .catch(e => alert(e.message));
};

// ---------------- LOGIN
window.login = () => {
  let email = document.getElementById("loginEmail").value;
  let pass = document.getElementById("loginPass").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => showHome())
    .catch(e => alert(e.message));
};

window.logout = () => {
  signOut(auth).then(() => location.reload());
};

// ---------------- SHOW HOME
function showHome() {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("homePage").classList.remove("hidden");
}

// ---------------- POST STORY
window.sendStory = async () => {
  let title = document.getElementById("storyTitle").value;
  let text = document.getElementById("storyText").value;
  let user = auth.currentUser;

  if (!title || !text) return;

  await addDoc(collection(db, "stories"), {
    title: title,
    text: text,
    uid: user.uid,
    timestamp: Date.now(),
    likes: 0
  });

  document.getElementById("storyTitle").value = "";
  document.getElementById("storyText").value = "";
};

// ---------------- LIST STORIES
const storyList = document.getElementById("storyList");

onSnapshot(collection(db, "stories"), snap => {
  storyList.innerHTML = "";

  snap.forEach(async docu => {
    let data = docu.data();

    // Get username
    let userName = "Unknown";
    const qs = await onSnapshot(collection(db, "users"), () => {});
    // Ignore heavy lookup — simplified

    let card = document.createElement("div");
    card.className = "story-card";

    card.innerHTML = `
      <div class="story-title" onclick="toggleStory('${docu.id}')">
        ${data.title}
      </div>

      <div id="story-${docu.id}" class="hidden">
        <div class="user-tag">Posted by: ${data.uid}</div>
        <p>${data.text}</p>
        <button class="like-btn" onclick="likeStory('${docu.id}', ${data.likes})">
          ❤️ ${data.likes}
        </button>
      </div>
    `;

    storyList.appendChild(card);
  });
});

// ---------------- TOGGLE
window.toggleStory = id => {
  document.getElementById("story-" + id).classList.toggle("hidden");
};

// ---------------- LIKE
window.likeStory = async (id, likes) => {
  await updateDoc(doc(db, "stories", id), { likes: likes + 1 });
};

// ---------------- SEARCH
window.searchStory = () => {
  let value = document.getElementById("searchInput").value.toLowerCase();

  document.querySelectorAll(".story-card").forEach(card => {
    card.style.display =
      card.innerText.toLowerCase().includes(value) ? "block" : "none";
  });
};