import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common/commonService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username : any;
  password : any;
  error : boolean = false;
  loading : boolean = false;

  constructor(private _router : Router,
    private _common: CommonService) { }

  ngOnInit() {}

  login() {
    this.loading = true;
    this.error = false;
    let loginBody = {
      username : this.username,
      password : this.password
    }

    this._common.loginCheck(loginBody)
      .subscribe((response) => {
        this._common.setToken(response.token);
        localStorage.setItem('token', JSON.stringify(response.token));
        localStorage.setItem('emp_id', JSON.stringify(response.emp_id));
        this.loading = false;
        this._router.navigate(['/list', response.emp_id]);
      }, (error) =>{
          this.error = true;
          this.loading = false;
          setTimeout(()=>{
            this.error = false;
          }, 10000);
      })
  }
}
