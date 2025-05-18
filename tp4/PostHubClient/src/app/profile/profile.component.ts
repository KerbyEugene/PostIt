import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  userIsConnected : boolean = false;
   @ViewChild("myFileInput", {static : false}) pictureInput ?: ElementRef;

  // Vous êtes obligés d'utiliser ces trois propriétés
  oldPassword : string = "";
  newPassword : string = "";
  newPasswordConfirm : string = "";
  previewUrl: string | ArrayBuffer | null = null;
  username : string | null = null;
 

  constructor(public userService : UserService) { }

  ngOnInit() {
    this.userIsConnected = localStorage.getItem("token") != null;
    this.username = localStorage.getItem("username");
    
  }
  preview(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  async uploadPicture() : Promise<void>{

    // Il faut vérifier si l'<input> est actuellement visible dans la page !
    if(this.pictureInput == undefined){
        console.log("Input HTML non chargé.");
        return;
    }

    // On récupère le premier (ou le seul) fichier dans l'<input> !
    let file = this.pictureInput.nativeElement.files[0];

    if(file == null){
        console.log("Input HTML ne contient aucune image.");
        return;
    }

    // Préparation du FormData avec l'image
    let formData = new FormData();
    formData.append("monImage", file, file.name);

    // Envoi au serveur
   await this.userService.avatar(formData);

}
async changePassword() : Promise<void>{  
  if(this.newPassword != this.newPasswordConfirm){    
    return;
  }  
  await this.userService.changePassword(this.oldPassword, this.newPassword);
  
  this.oldPassword = "";
  this.newPassword = "";
  this.newPasswordConfirm = "";

}



}
