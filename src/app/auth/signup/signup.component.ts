import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  isLoading: boolean = false;

  constructor(public authService: AuthService) { }

  ngOnInit() {
  }

  onSignUp(form: NgForm) {
    //console.log(form.value);
    if (form.invalid) return;
    this.authService.createUser(form.value.email, form.value.password);
    this.isLoading = true;
  }

}
