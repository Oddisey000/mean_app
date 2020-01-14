import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  getPosts() {
    this.http
      .get<{message: string, posts: Post[]}>('http://localhost:3000/api/posts')
      .subscribe((response) => {
        this.posts = response.posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content:content };
    
    this.http
      .post<{message: string}>('http://localhost:3000/api/posts', post)
      .subscribe((response) => {
        console.log(response.message);
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  constructor(private http: HttpClient) { }
}
