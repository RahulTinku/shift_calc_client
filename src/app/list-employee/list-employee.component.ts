import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ListEmployeeService } from './list-employee.service';
import { CommonService } from '../common/commonService';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { _ } from 'underscore';

@Component({
  selector: 'app-list-employee',
  templateUrl: './list-employee.component.html',
  styleUrls: ['./list-employee.component.css']
})
export class ListEmployeeComponent implements OnInit {
	list : any = [];
  finalList : any =[];
  sortedList : any = [];
	employeeData : any;
  thisEmployeeData : any;
	attendanceData : any;
	showCal : boolean = false;
  emp_id : any;
  showAddUsers : boolean = false;
  isEmployeeDisplayed : boolean = false;
  loading : boolean = true;
  noUser : boolean = false;
  serverError : boolean = false;
  isChangePassword: boolean = false;
  ismatchPasswordWrong : boolean = false;
  isSamePassword : boolean = false;
  wrongCurrentPassword : boolean = false;
  success : boolean = false;
  changePasswordform : FormGroup;
	  //sorting
  	key: string = 'name'; //set default
  	reverse: boolean = false;
  	//initializing p to one
  	p: number = 1;

  constructor(
    private fb : FormBuilder,
  	private router : Router,
    private route: ActivatedRoute, 
  	private _list : ListEmployeeService,
  	private _common : CommonService) { }

  ngOnInit() {
    this.isChangePassword = false;
    this.showAddUsers = false;
    this.isEmployeeDisplayed = false;
    this.loading = true;
    this.serverError = false;
    this.finalList.length = 0;
    this.sortedList.length = 0;
    this.emp_id = this.route.snapshot.paramMap.get('id');
    this._common.setEmpId(this.emp_id);
    this.clearForm();

    this._list.getEmployee(this.emp_id)
        .subscribe((response) => {
          if(response && response.length !==0){
            this.thisEmployeeData = response;
            this.isEmployeeDisplayed = true;
            this.loading = false;
            this.noUser = false;
            if(this.thisEmployeeData.emp_type === 'Manager'){
              this.showAddUsers = true;
            }
          }else{
            this.loading = false;
            this.noUser = true;
          }
        }, (error)=>{
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/']);
          }else {
            this.serverError = true;
          }
        })

  	this._list.getList(this.emp_id)
  			.subscribe(response => {
          if(response && response.length !== 0){
            this.loading = true;
    				this.list = response;
            this.list.map((item, index)=> {
              this.finalList.push(item);
              this._list.getList(item._id)
                .subscribe((res) => {
                  if(res && res.length !== 0){
                    res.map((emp, index) => {
                      this.finalList.push(emp);
                      if((index + 1) === res.length){
                        this.sortedList = _.clone(_.sortBy(this.finalList, 'name'));
                        console.log(this.sortedList);
                      }
                    })
                  }
                })
            })
            this.loading = false;
          }else{
            this.loading = false;
            this.noUser = true;
          }
  			}, (error)=>{
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/']);
          }
        })
  }

  clearForm(){
    this.changePasswordform = this.fb.group({
      current : ['', Validators.required],
      newPassword : ['', [Validators.required]],
      reenter : ['', [Validators.required]]
    });
  }

  sort(key){
    this.key = key;
    this.reverse = !this.reverse;
  }

  goToUser(_id) {
    this.isChangePassword = false;
    this.router.navigate(['/employee', _id]);
  }

  calculate(employee){
  	this.showCal = true;
    this.loading = true;
    this.isChangePassword = false;
  	this._list.getAttendance(employee.id)
  			.subscribe(response => {
          this.loading = false;
  				this.attendanceData = response;
  				this._common.setData(response);
  				this.router.navigate(['calculate']);
  			}, (error)=>{
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this.router.navigate(['/']);
          }
        })
  	//console.log(employee);
  }

  calulateAll(){
    this.isChangePassword = false;
  	//console.log(this.sortedList);
  	this._common.setData(this.sortedList);
  	this.router.navigate(['calculate']);
  }

  addUser(){
    this.isChangePassword = false;
    this.router.navigate(['/addloginuser', this.thisEmployeeData._id]);
  }

  addemployee(){
    this.isChangePassword = false;
  	this.router.navigate(['/adduser', this.thisEmployeeData._id]);
  }

  changePassword(){
    this.isChangePassword = true;
  }
  onSubmit() {
    this.ismatchPasswordWrong = false;
    this.isSamePassword = false;
    this.wrongCurrentPassword = false;
    this.success = false;
      if(this.changePasswordform.valid) {
        let password = _.clone(this.changePasswordform.value);
        if(password.current == password.newPassword){
          this.isSamePassword = true;
        }else{
          if(password.newPassword !== password.reenter){
            this.ismatchPasswordWrong = true;
          } else {
            password.emp_id = this.thisEmployeeData._id;
            this._common.changePassword(password)
              .subscribe((res)=>{
                this.success = true;
                setTimeout(()=>{
                  this.router.navigate(['/']);
                }, 5000);
              }, (error)=>{
                //console.log(error);
                if(error === 'Unauthorized' || error === 'Forbidden'){
                  this.router.navigate(['/']);
                } else{
                  this.clearForm();
                  this.wrongCurrentPassword = true;
                }
              })
          }
        }
      }else {
        //console.log('wrong');
      }
  }
  gotoList() {
    this.isChangePassword = false;
  }

  navigationButton(){
    var x = document.getElementById("myLinks");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
  }
}
