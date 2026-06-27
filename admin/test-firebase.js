const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const app = initializeApp({ projectId: "frontend-cms-104a4" });
const db = getFirestore(app);

getDocs(collection(db, "courses")).then(snap => {
  console.log("Docs count: ", snap.docs.length);
  snap.forEach(d => console.log(d.id, d.data()));
}).catch(console.error);
