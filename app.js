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

// FIXED FIREBASE CONFIG
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

// --------------- AUTH
window.signup = () => {
  let email = document.getElementById("signupEmail").value;
  let pass = document.getElementById("signupPass").value;
  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Signed up"))
    .catch(e => alert(e.message));
};

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

function showHome(){
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("homePage").classList.remove("hidden");
  loadStories();
}

// --------------- ADD STORY
window.sendStory = async () => {
  let title = document.getElementById("storyTitle").value;
  let text = document.getElementById("storyText").value;
  if(!title || !text) return;
  await addDoc(collection(db,"stories"), {
    title,title,
    text,text,
    likes:0,
    timestamp:Date.now()
  });
};

// --------------- LIST STORIES
const storyList = document.getElementById("storyList");
onSnapshot(collection(db,"stories"), snap => {
  storyList.innerHTML = "";
  snap.forEach(docu => {
    let data = docu.data();
    let div = document.createElement("div");
    div.className = "story-card";

    div.innerHTML = `
      <div class="story-title" onclick="toggleStory('${docu.id}')">
        ${data.title}
      </div>
      <div id="story-${docu.id}" class="hidden">
        <p>${data.text}</p>
        <button class="like-btn" onclick="likeStory('${docu.id}',${data.likes})">❤️ ${data.likes}</button>
      </div>
    `;
    storyList.appendChild(div);
  });
});

// --------------- TOGGLE & LIKE
window.toggleStory = id => {
  let el = document.getElementById("story-"+id);
  el.classList.toggle("hidden");
};

window.likeStory = async (id, likes) => {
  await updateDoc(doc(db,"stories",id), { likes: likes+1 });
};

// --------------- SEARCH
window.searchStory = () => {
  let value = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll(".story-card").forEach(card => {
    let title = card.innerText.toLowerCase();
    card.style.display = title.includes(value) ? "block" : "none";
  });
};