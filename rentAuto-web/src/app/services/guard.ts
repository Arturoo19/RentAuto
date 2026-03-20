import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';
import { map, take } from 'rxjs';
import { user } from '@angular/fire/auth';


export const Guard:CanActivateFn = () => {
  const authService = inject(AuthService)
  const router = inject(Router)

  return authService.getCurrentUser().pipe(
    take(1),
    map(user=>{
      if (user){
        return true
      }else{
        router.navigate(['/register'])
        return false
      }
    })
  )



}
