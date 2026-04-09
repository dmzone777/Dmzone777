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
  deleteDoc,
  getDocs,
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
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------------- SIGNUP
window.signup = () => {
  let name = document.getElementById("signupName").value;
  let email = document.getElementById("signupEmail").value;
  let pass = document.getElementById("signupPass").value;

  if (!name) return alert("Enter name");

  createUserWithEmailAndPassword(auth, email, pass).then(async (res) => {
    await addDoc(collection(db, "users"), {
      uid: res.user.uid,
      name: name
    });
    alert("Account Created");
  });
};

// -------------------- LOGIN
window.login = () => {
  let email = document.getElementById("loginEmail").value;
  let pass = document.getElementById("loginPass").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => showHome())
    .catch(e => alert(e.message));
};

// -------------------- LOGOUT
window.logout = () => signOut(auth).then(() => location.reload());

// -------------------- HOME
function showHome() {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("homePage").classList.remove("hidden");
}

// -------------------- POST STORY
window.sendStory = async () => {
  let title = document.getElementById("storyTitle").value;
  let text = document.getElementById("storyText").value;
  let user = auth.currentUser;

  await addDoc(collection(db, "stories"), {
    title,
    text,
    uid: user.uid,
    likes: [],
    comments: [],
    timestamp: Date.now()
  });

  document.getElementById("storyTitle").value = "";
  document.getElementById("storyText").value = "";
};

// -------------------- FETCH USERNAME BY UID
async function getName(uid) {
  let q = await getDocs(collection(db, "users"));
  let name = "Unknown";
  q.forEach(u => {
    if (u.data().uid === uid) name = u.data().name;
  });
  return name;
}

// -------------------- STORY LISTENER
const storyList = document.getElementById("storyList");

onSnapshot(collection(db, "stories"), async snap => {
  storyList.innerHTML = "";

  for (let docu of snap.docs) {
    let data = docu.data();
    let storyId = docu.id;

    let ownerName = await getName(data.uid);
    let currentUid = auth.currentUser?.uid;

    let isLiked = data.likes.includes(currentUid);
    let canDelete = currentUid === data.uid;

    let card = document.createElement("div");
    card.className = "story-card";

    card.innerHTML = `
      <div class="story-title" onclick="toggleStory('${storyId}')">${data.title}</div>

      <div id="story-${storyId}" class="hidden">
        <div class="user-tag">Posted by: ${ownerName}</div>
        <p>${data.text}</p>

        <button class="like-btn" onclick="likeStory('${storyId}')">
          ❤️ ${data.likes.length} ${isLiked ? "(Liked)" : ""}
        </button>

        ${canDelete ? `<button class="delete-btn" onclick="deleteStory('${storyId}')">🗑 Delete</button>` : ""}

        <div class="comment-box">
          <input id="comment-input-${storyId}" placeholder="Write a comment..." />
          <button class="comment-btn" onclick="addComment('${storyId}')">Comment</button>
        </div>

        <div id="comments-${storyId}">
        ${data.comments.map(c => `<div class="comment-item"><b>${c.name}:</b> ${c.text}</div>`).join("")}
        </div>
      </div>
    `;

    storyList.appendChild(card);
  }
});

// -------------------- TOGGLE
window.toggleStory = id => {
  document.getElementById("story-" + id).classList.toggle("hidden");
};

// -------------------- LIKE SYSTEM (1 user = 1 like)
window.likeStory = async (id) => {
  let uid = auth.currentUser.uid;
  let ref = doc(db, "stories", id);
  let snap = await getDocs(collection(db, "stories"));

  snap.forEach(async s => {
    if (s.id === id) {
      let data = s.data();
      let likes = data.likes;

      if (likes.includes(uid)) {
        likes = likes.filter(u => u !== uid); // remove like
      } else {
        likes.push(uid); // add like
      }

      await updateDoc(ref, { likes });
    }
  });
};

// -------------------- COMMENT SYSTEM
window.addComment = async (id) => {
  let input = document.getElementById("comment-input-" + id);
  let text = input.value;

  if (!text) return;

  let ref = doc(db, "stories", id);
  let snap = await getDocs(collection(db, "stories"));

  snap.forEach(async s => {
    if (s.id === id) {
      let data = s.data();

      let userName = await getName(auth.currentUser.uid);

      let comments = data.comments;
      comments.push({ name: userName, text });

      await updateDoc(ref, { comments });
      input.value = "";
    }
  });
};

// -------------------- DELETE STORY (only owner)
window.deleteStory = async (id) => {
  let ref = doc(db, "stories", id);
  await deleteDoc(ref);
};