import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Post } from './post.model';
@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string }>('http://localhost:3000/api/posts/' + id)
  }

  getPosts() {
    this.http
      .get<{message: string, posts: any}>('http://localhost:3000/api/posts')
      .pipe(map((postData) => {
        return postData.posts.map((postData: any) => {
          return {
            title: postData.title,
            content: postData.content,
            id: postData._id
          };
        });
      }))
      .subscribe((postData) => {
        this.posts = postData;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http
      .post<{ message: string; post: Post }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe(responseData => {
        const post: Post = {
          id: responseData.post.id,
          title: title,
          content: content,
          imagePath: responseData.post.imagePath,
          creator: responseData.post.creator
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, content: string, creator: string) {
    const post: Post = { id: id, title: title, content: content, imagePath: null, creator: null };
    this.http.put<{message: string, post: any}>('http://localhost:3000/api/posts/' + id, post)
    .subscribe((response) => {
      console.log(response.message);
      const newPostArray = this.posts.filter((post) => post.id !== id);
      newPostArray.push(response.post);
      this.posts = newPostArray;
      this.postsUpdated.next([...this.posts]);
      this.toStartRoute();
    });
  }

  deletePost(id: string) {
    this.http.delete('http://localhost:3000/api/posts/' + id)
      .subscribe(() => {
        const newPostArray = this.posts.filter((post) => post.id !== id);
        this.posts = newPostArray;
        this.postsUpdated.next([...this.posts]);
      });
  }

  toStartRoute() {
    this.router.navigate(['/']);
  }

  constructor(
    private http: HttpClient,
    private router: Router) { }
}
