import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

const domain = "https://localhost:7216/";

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private usernameSignal : WritableSignal<string|null> = signal(null);
  private rolesSignal : WritableSignal<string[]> = signal([]);
  
  username : Signal<string|null> = this.usernameSignal.asReadonly();
  roles : Signal<string[]> = this.rolesSignal.asReadonly();

  constructor(public http : HttpClient) { }

  // S'inscrire
  async register(username : string, email : string, password : string, passwordConfirm : string) : Promise<void>{

    let registerDTO = {
      username : username,
      email : email,
      password : password,
      passwordConfirm : passwordConfirm
    };

    let x = await lastValueFrom(this.http.post<any>(domain + "api/Users/Register", registerDTO));
    console.log(x);
  }

  // Se connecter
  async login(username : string, password : string) : Promise<void>{

    let loginDTO = {
      username : username,
      password : password
    };

    let x = await lastValueFrom(this.http.post<any>(domain + "api/Users/Login", loginDTO));
    console.log(x);

    // N'hésitez pas à ajouter d'autres infos dans le stockage local... 
    // Cela pourrait vous aider pour la partie admin / modérateur
    this.usernameSignal.set(x.username);
    this.rolesSignal.set(x.roles);
    localStorage.setItem("token", x.token);
    localStorage.setItem("username", x.username);
    localStorage.setItem("roles", JSON.stringify(x.roles));
     
  }
  async avatar(formData:any){
    console.log("allo");
  let x =  await lastValueFrom( this.http.put<number>(domain + "api/Users/ChangeAvatar", formData));
  console.log(x);
  }
  
}
