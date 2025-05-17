
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { faDownLong, faEllipsis, faImage, faL, faMessage, faUpLong, faXmark } from '@fortawesome/free-solid-svg-icons';
import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {

  @Input() comment : Comment | null = null;

  // Icônes Font Awesome
  faEllipsis = faEllipsis;
  faUpLong = faUpLong;
  faDownLong = faDownLong;
  faMessage = faMessage;
  faImage = faImage;
  faXmark = faXmark;

  // Plein de variables sus pour afficher / cacher des éléments HTML
  replyToggle : boolean = false;
  editToggle : boolean = false;
  repliesToggle : boolean = false;
  isAuthor : boolean = false;
  editMenu : boolean = false;
  displayInputFile : boolean = false;

  // Variables associées à des inputs
  newComment : string = "";
  editedText ?: string;
  @ViewChild("myFileInput", {static : false}) pictureInput ?: ElementRef;
  @ViewChild("myNewFileInput", {static : false}) newPictureInput ?: ElementRef;
  http: any;
 pictureIds : number[] = [];
 avatar= "";
  constructor(public commentService : CommentService) { }

  async ngOnInit() {
    this.isAuthor = localStorage.getItem("username") == this.comment?.username;
    this.editedText = this.comment?.text;
    this.avatar=`https://localhost:7216/api/Users/GetAvatar/Avatar/${this.comment?.username}`
  }
  


  // Créer un nouveau sous-commentaire au commentaire affiché dans ce composant
  // (Pouvoir les commentaires du post, donc ceux qui sont enfant du commentaire principal du post,
  // voyez le composant fullPost !)

  async deleteImage(imageId:number){
    this.commentService.deleteImage(imageId);
    if (this.comment && this.comment.imageIds) {
      this.comment.imageIds = this.comment.imageIds.filter(id => id !== imageId);
    }
  }

  async createComment(){
    if(this.newComment == ""){
      alert("Écris un commentaire niochon !");
      return;
    }

    if(this.comment == null) return;
    if(this.comment.subComments == null) this.comment.subComments = [];

   let formData= new FormData();
   let i=1;
   formData.append("text",this.newComment);
   if(this.pictureInput != undefined){
    for (let file of this.pictureInput.nativeElement.files)
      {
      formData.append("monImage"+i, file, file.name); 
      i++;
    }
  }

    this.comment.subComments.push(await this.commentService.postComment(formData, this.comment.id));
    
    this.replyToggle = false;
    this.repliesToggle = true;
    this.newComment = "";
  }

  // Modifier le texte (et éventuellement ajouter des images) d'un commentaire
  async editComment(){

    if(this.comment == null || this.editedText == undefined) return;

    let i = 1;
    let formData = new FormData();
    formData.append("text", this.editedText);

    if(this.newPictureInput?.nativeElement.files) {
      for(let p of this.newPictureInput.nativeElement.files){
        formData.append("image" + i, p, p.name);       
        i++;        
      }
    }
    
    let newMainComment = await this.commentService.editComment(formData, this.comment.id);

    //let commentDTO = {
    //   text : this.editedText
    // }

    //let newMainComment = await this.commentService.editComment(commentDTO, this.comment.id);
    this.comment = newMainComment;
    this.editedText = this.comment.text;
    this.editMenu = false;
    this.editToggle = false;
  }

  // Supprimer un commentaire (le serveur va le soft ou le hard delete, selon la présence de sous-commentaires)
  async deleteComment(){
    if(this.comment == null || this.editedText == undefined) return;
    await this.commentService.deleteComment(this.comment.id);

    // Changements visuels pour le soft-delete
    if(this.comment.subComments != null && this.comment.subComments.length > 0){
      this.comment.username = null;
      this.comment.upvoted = false;
      this.comment.downvoted = false;
      this.comment.upvotes = 0;
      this.comment.downvotes = 0;
      this.comment.text = "Commentaire supprimé.";
      this.isAuthor = false;
    }
    // Changements ... visuels ... pour le hard-delete
    else{
      this.comment = null;
    }
  }

  // Upvoter (notez que ça annule aussi tout downvote fait pas soi-même)
  async upvote(){
    if(this.comment == null) return;
    await this.commentService.upvote(this.comment.id);
    
    // Changements visuels immédiats
    if(this.comment.upvoted){
      this.comment.upvotes -= 1;
    }
    else{
      this.comment.upvotes += 1;
    }
    this.comment.upvoted = !this.comment.upvoted;
    if(this.comment.downvoted){
      this.comment.downvoted = false;
      this.comment.downvotes -= 1;
    }
  }

  // Upvoter (notez que ça annule aussi tout upvote fait pas soi-même)
  async downvote(){
    if(this.comment == null) return;
    await this.commentService.downvote(this.comment.id);

    // Changements visuels immédiats
    if(this.comment.downvoted){
      this.comment.downvotes -= 1;
    }
    else{
      this.comment.downvotes += 1;
    }
    this.comment.downvoted = !this.comment.downvoted;
    if(this.comment.upvoted){
      this.comment.upvoted = false;
      this.comment.upvotes -= 1;
    }
  }
 async report(){
  if(this.comment == null) return;
  console.log("signaler");
  await this.commentService.report(this.comment.id);
  
 }
}
