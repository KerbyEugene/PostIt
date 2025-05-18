import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-tab',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-tab.component.html',
  styleUrl: './admin-tab.component.css'
})
export class AdminTabComponent {

  newModeratorUsername : string = "";

  constructor(public userService : UserService, public router : Router) { }
  ngOnInit() {}

  async makeModerator() : Promise<void>{
    if(this.newModeratorUsername == ""){
      console.log("Remplis le nom d'utilisateur du modérateur");
      return;
    }
   await this.userService.makeModerator(this.newModeratorUsername);        
  }


}
