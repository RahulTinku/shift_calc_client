import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../common/commonService';
import { AdduserService } from './adduser.service';
import { EmployeeService } from '../employee/employee.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { _ } from 'underscore';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent implements OnInit {

	shifts : any = [];
  managers : any =[];
	userForm : FormGroup;
	errorMessage : boolean = false;
	addeduser : boolean = false;
	duplicate : boolean = false;
	joinDate : Date = new Date();
	colorTheme = 'theme-blue';
  emp_id : any;

	bsConfig: Partial<BsDatepickerConfig>;

  constructor(
  	private fb : FormBuilder,
  	private router : Router,
    private route: ActivatedRoute,
  	private commonService : CommonService,
  	private adduserService : AdduserService,
  	private empService : EmployeeService) { 
  	this.bsConfig = { containerClass: this.colorTheme, showWeekNumbers : false };
  }

  ngOnInit() {
    this.emp_id = this.route.snapshot.paramMap.get('id');
    this.clearForm();
    this.commonService.getManagers()
    .subscribe(res => {
      this.managers = res;
    }, (error)=>{
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/']);
          }
        });
  	this.commonService.getShifts()
  			.subscribe(res => {
  				this.shifts = res;
  			}, (error)=>{
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/']);
          }
        });
  }

  clearForm(){
    this.userForm = this.fb.group({
      name : ['', Validators.required],
      email : ['', [Validators.email, Validators.required]],
      employee_id : ['', Validators.required],
      phone : ['', [Validators.required, Validators.pattern]],
      join_date : [new Date(), Validators.required],
      manager : ['', Validators.required],
      gender : ['', Validators.required],
      shift : ['', Validators.required],
      team : ['', Validators.required],
      emp_type : ['', Validators.required],
      address : ['', Validators.required]
    });
  }

  onSubmit() {
  	this.errorMessage = false;
  	this.addeduser = false;
  	this.duplicate = false;
  	let self = this;
  	
  	if(this.userForm.valid) {
  		let user = _.clone(this.userForm.value);
	  	let shiftId = this.shifts.filter((item) => {
	  		if(user.shift === item.name){
	  			return item._id;
	  		}
	  	});
	  	user.shift_id = shiftId[0]._id;
      let manager_id = this.managers.filter((item) => {
        if(user.manager === item.name){
          return item;
        }
      })
      user.manager_id = manager_id[0].emp_id;
      user.join_date = this.commonService.convertDate(user.join_date);

      if(user.emp_type ==='Manager' || user.emp_type === 'Supervisor'){
        if(confirm('Please go to login page and add new user for Manager and Supervisor')){
          this.clearForm();
          // this.adduserService.addLogin(user)
          //   .subscribe((res)=>{
          //     this.addeduser = true;
          // }, (error) => {
          //   this.duplicate = true
          // })
        }
      }else{
        this.adduserService.newUser(user)
          .subscribe((response)=> {
            this.addeduser = true;
            this.router.navigate(['/list',this.emp_id]);
        }, (error) => {
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/']);
          }
          self.duplicate = true
        });
      }
  	} else {
  		this.errorMessage = true;
  	}
  }

}
