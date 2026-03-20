import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  authState
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  serverTimestamp,
  getDoc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { signOut } from '@angular/fire/auth';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth, 
    private firestore:Firestore) {}

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  logout() {
    return signOut(this.auth);
  }

  getCurrentUser(){
    return authState(this.auth)
  }

  getUserProfile(uid: string) {
    return getDoc(doc(this.firestore, "users", uid));
  }

  async register(email: string, password: string, nombre: string) {
  const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(this.firestore, "users", user.uid), {
    email: user.email,
    nombre: nombre,
    role: "customer",
    createdAt: serverTimestamp()
  });
    return user;
  }

}