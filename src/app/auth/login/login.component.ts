import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading: boolean = false;

  constructor(public authService: AuthService) { }

  ngOnInit() {
  }

  onLogin(form: NgForm) {
    if (form.invalid) return;
    this.authService.logInUser(form.value.email, form.value.password);
    this.isLoading = true;
  }

}
