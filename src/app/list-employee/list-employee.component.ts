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
    itemsPerPage : number = 15;
    currentPage : number = 1;

  constructor(
    private fb : FormBuilder,
  	private router : Router,
    private route: ActivatedRoute, 
  	private _list : ListEmployeeService,
  	private _common : CommonService) { }

  /** For index displaying according to pagination using ngx-pagination library*/
  absoluteIndex(indexOnPage: number): number {
    return this.itemsPerPage * (this.currentPage - 1) + indexOnPage;
  }
  /** execute this on page load*/
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

    this._list.getEmployee(this.emp_id) //get details of employee
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

  	this._list.getList(this.emp_id) //get list of employees and sub-ordinates
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
                       // console.log(this.sortedList);
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
  /** Clear the input form*/
  clearForm(){
    this.changePasswordform = this.fb.group({
      current : ['', Validators.required],
      newPassword : ['', [Validators.required]],
      reenter : ['', [Validators.required]]
    });
  }
  /** Sort the list */
  sort(key){
    this.key = key;
    this.reverse = !this.reverse;
  }
  /** Navigate to individual user */
  goToUser(_id) {
    this.isChangePassword = false;
    this.router.navigate(['/employee', _id]);
  }
  /** set the data and navigate to calculate all page*/
  calulateAll(){
    this.isChangePassword = false;
  	//console.log(this.sortedList);
  	this._common.setData(this.sortedList);
  	this.router.navigate(['calculate']);
  };
  // add new user
  addUser(){
    this.isChangePassword = false;
    this.router.navigate(['/addloginuser', this.thisEmployeeData._id]);
  }
  //add new employee
  addemployee(){
    this.isChangePassword = false;
  	this.router.navigate(['/adduser', this.thisEmployeeData._id]);
  }
  // open change password view
  changePassword(){
    this.isChangePassword = true;
  }
  //submit the cahgne password function
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
  //naviagate back to the lis view
  gotoList() {
    this.isChangePassword = false;
  }
  // display navigation button in mobile
  navigationButton(){
    var x = document.getElementById("myLinks");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
  }
}
