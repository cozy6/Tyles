import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAsOo4UPo7gmRfi4fC67V0Dlw-LST--9hk",
  authDomain: "parky-27cae.firebaseapp.com",
  projectId: "parky-27cae",
  storageBucket: "parky-27cae.firebasestorage.app",
  messagingSenderId: "1093054205412",
  appId: "1:1093054205412:web:852ccefc0994a8420b0bf1"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app