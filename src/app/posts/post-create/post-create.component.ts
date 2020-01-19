import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostService } from '../post.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  public post: Post;
  public isLoading: boolean = false;
  
  private postID: string;
  private editMode: boolean;

  constructor(
    public postService: PostService,
    public route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.editMode = true;
        this.postID = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postID).subscribe(postData => {
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content
          };
        });
      } else {
        this.editMode = false;
        this.postID = null;
      }
    });
  }

  onAddPost(form: NgForm) {
    if (form.invalid) return;
    this.isLoading = true;
    if (this.editMode) {
      this.postService.updatePost(this.postID, form.value.title, form.value.content);
    } else {
      this.postService.addPost(form.value.title, form.value.content);
    }
    form.resetForm();
  }

}
