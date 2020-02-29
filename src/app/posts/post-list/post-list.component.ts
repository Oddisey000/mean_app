import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';

import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   { title: "First Post", content: "This is the first post's content" },
  //   { title: "Second Post", content: "This is the second post's content" },
  //   { title: "Third Post", content: "This is the third post's content" }
  // ];
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0; // Amount of posts to show
  postsPerPage: number = 5; // Amount of posts to show in one page
  currentPage: number = 1; // Start page
  pageSizeOptions = [1,2,3];
  userIsAuthenticated: boolean = false;
  userID: string;
  private postsSub: Subscription;
  private authServiceSub: Subscription;

  constructor(
      public postsService: PostsService,
      private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userID = this.authService.getUserId();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postsData: { posts: Post[], postsCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postsData.postsCount;
        this.posts = postsData.posts;
      });
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authServiceSub = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
          this.userID = this.authService.getUserId();
        });
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onChangePage(pageData: PageEvent) {
    // Show the spinner
    this.isLoading = true;
    // Get next page. Index start with 0 so we need to add 1
    this.currentPage = pageData.pageIndex + 1;
    // Setting page size to be a selected number from user dropdown
    this.postsPerPage = pageData.pageSize;
    // Call the service to update the data
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authServiceSub.unsubscribe();
  }
}
