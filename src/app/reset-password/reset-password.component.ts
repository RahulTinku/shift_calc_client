import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common/commonService';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { _ } from 'underscore';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
	errorMessage : boolean = false;
	passwordNotSame : boolean = false;
	success : boolean = false;
	errorMismatch : boolean = false;

  constructor(
  	private fb : FormBuilder,
  	private _common : CommonService,
  	private _route : Router
  	) {}

  resetPassword : FormGroup;

  ngOnInit() {
  	this.clearForm();
  }

  clearForm(){
    this.resetPassword = this.fb.group({
      username : ['', Validators.required],
      email : ['', [Validators.email, Validators.required]],
      phone : ['', [Validators.required, Validators.pattern]],
      password: ['', Validators.required],
      password1: ['', Validators.required]
    });
  }

  goBack() {
  	this._route.navigate(['/login']);
  }

  onSubmit() {
  	this.errorMessage = false;
  	this.passwordNotSame = false;
  	this.success = false;
  	this.errorMismatch = false;
  	if(this.resetPassword.valid) {
  		let user = _.clone(this.resetPassword.value);
  		if(user.password === user.password1) {
  			this._common.resetPassword(_.omit(user, 'password1'))
  				.subscribe((res) => {
  					this.success = true;
  					setTimeout(()=>{
			           this.goBack()
			        }, 7000);
  				}, (err) => {
  					this.errorMismatch = true;
  				})
  		}else{
  			this.passwordNotSame = true;
  		}
  	} else{
  		this.errorMessage = true;
  	}
  }

}
