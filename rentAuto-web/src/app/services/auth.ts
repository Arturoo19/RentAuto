import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from '@angular/fire/firestore';


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

  async register(email:string,password:string){
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,email,password
    )

    const user = userCredential.user

    await setDoc(doc(this.firestore, "users", user.uid),{
      email: user.email,
      role: "customer",
      createdAt: serverTimestamp()
    })
    return user
  }

}