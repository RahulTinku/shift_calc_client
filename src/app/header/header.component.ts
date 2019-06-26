import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common/commonService';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
	title = 'Shift Calculator';
	emp_id : any;

  constructor(private _route : Router,
  	private _common : CommonService) { }

  ngOnInit() {}
  home(){
  	this.emp_id = JSON.parse(localStorage.getItem('emp_id'));
  	if(this.emp_id){
  		this._route.navigate(['/list', this.emp_id]);
  	}else{
  		this._route.navigate(['/',]);
  	}
  	
  	
  }
  logout() {
  	localStorage.removeItem('emp_id');
  	localStorage.removeItem('token');
	this._route.navigate(['']);
  }

}
