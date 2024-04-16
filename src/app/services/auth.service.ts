import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = new Observable((subscriber) => {
      onAuthStateChanged(auth, subscriber);
    });
  }

  // Registration method
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then(
      (credential) => {
        // Assuming you want to auto-login the user
        const user = credential.user;
        localStorage.setItem(
          'user',
          JSON.stringify({ displayName: user.displayName, email: user.email })
        );
        return user;
      }
    );
  }

  // Login method
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password).then(
      (credential) => {
        // Assuming the user object is in credential.user
        const user = credential.user;
        localStorage.setItem(
          'user',
          JSON.stringify({ displayName: user.displayName, email: user.email })
        );
        return user;
      }
    );
  }

  // Logout method
  logout() {
    return signOut(this.auth).then(() => {
      localStorage.removeItem('user');
    });
  }

  // Function to get the current user, returning a promise
  getCurrentUser(): Promise<User | null> {
    return this.user$.pipe(first()).toPromise();
  }

  // Function to update user profile
  updateUserProfile(
    user: User,
    property: string,
    value: string
  ): Promise<void | string> {
    if (property === 'name') {
      return updateProfile(user, { displayName: value });
    }
    return Promise.reject(
      'Invalid property. Please provide a valid property to update.'
    );
  }
}
