import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../common/commonService';
import { AdduserService } from '../adduser/adduser.service';
import { EmployeeService } from '../employee/employee.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import _ from 'underscore';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-login-users',
  templateUrl: './add-login-users.component.html',
  styleUrls: ['./add-login-users.component.css']
})
export class AddLoginUsersComponent implements OnInit {
	shifts : any = [];
  managers : any = [];
	userForm : FormGroup;
	errorMessage : boolean = false;
	addeduser : boolean = false;
	duplicate : boolean = false;
	joinDate : Date = new Date();
	colorTheme = 'theme-blue';
  emp_id : any;

	bsConfig: Partial<BsDatepickerConfig>;

  constructor(private fb : FormBuilder,
  	private router : Router,
    private route: ActivatedRoute,
  	private commonService : CommonService,
  	private adduserService : AdduserService,
  	private empService : EmployeeService) { 
  	this.bsConfig = Object.assign({}, { containerClass: this.colorTheme, showWeekNumbers : false });
  }

  ngOnInit() {
    this.emp_id = this.route.snapshot.paramMap.get('id');
    this.clearForm();
  	this.commonService.getShifts()
		.subscribe(res => {
			this.shifts = res;
		}, (error) => {
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/']);
          }
      });
    this.commonService.getManagers()
    .subscribe(res => {
      this.managers = res;
    }, (error) => {
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/']);
          }
      });
  }

  clearForm() {
     this.userForm = this.fb.group({
      username : ['', Validators.required],
      password: ['', Validators.required],
      name : ['', Validators.required],
      email : ['', [Validators.email, Validators.required]],
      phone : ['', [Validators.required, Validators.pattern]],
      join_date : [new Date(), Validators.required],
      manager : [''],
      gender : ['', Validators.required],
      shift : ['', Validators.required],
      team : ['', Validators.required],
      emp_type : ['', Validators.required],
      address : ['', Validators.required]
    });
  }

  goBack(){
    this.router.navigate(['/login']);
  }

  onSubmit() {
  	this.errorMessage = false;
  	this.addeduser = false;
  	this.duplicate = false;
  	
  	if(this.userForm.valid) {
  		let user = Object.assign( {}, this.userForm.value);
	  	let shiftId = this.shifts.filter((item) => {
	  		if(user.shift === item.name){
	  			return item._id;
	  		}
	  	});
      user.shift_id = shiftId[0]._id;

      if(user.manager !== ''){
        let manager_id = this.managers.filter((item) => {
          if(user.manager === item.name){
            return item;
          }
        })
        user.manager_id = manager_id[0].emp_id;
      }

      this.adduserService.addLogin(user)
        .subscribe((res)=>{
          this.addeduser = true;
          this.clearForm();
          setTimeout(()=>{
            this.router.navigate(['/list', this.emp_id]);
          }, 2000);
      }, (error) => {
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/', ]);
          }
        this.duplicate = true
      })
  	} else {
  		this.errorMessage = true;
  	}
  }

}
