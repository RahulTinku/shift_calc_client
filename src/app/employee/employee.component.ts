import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../common/commonService';
import { EmployeeService } from './employee.service';
import { ListEmployeeService } from '../list-employee/list-employee.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

	employee : any;
	emp_id : any;
	isEmpDataAvaiable : boolean = false;
	remarks : string;
	myDateValue: Date;
	absentOn : Date;
	rangePicker : Date;
	employeeAbsent : any = [];
	absentDays : number;
	noOfDays : number = 0;
	allowanceAmount : number;
	totalAllowance : number = 0;
	totalAllowancePerDay : number = 0;
	errorCal : boolean = false;
	minDate : Date;
	shift : any;
	shiftsDetails : any;
	shift_change_date : Date = new Date();
	shiftChanged : any;
	allowanceData : any;
	noCalculate : boolean = false;
	shiftWithAllowance = [];
	errorMessage : boolean = false;
	shiftChangeError : boolean = false;
	changeShiftInWeekend : boolean = false;
	markAbsentInWeekend : boolean = false;
	sameShift : boolean = false;
	noDateSelected : boolean = false;
	colorTheme = 'theme-blue';
	allowance_amount : number = 0;

	bsConfig: Partial<BsDatepickerConfig>;

  constructor(
  	private _common : CommonService,
  	private _route : Router,
  	private route: ActivatedRoute,
  	private _list : ListEmployeeService,
  	private _empService : EmployeeService) {
  		this.bsConfig =  { containerClass: this.colorTheme, showWeekNumbers : false };
	  	// if(this._common.getData() === undefined || this._common.getData() === null){
	  	// 	this._route.navigate(['list']);
	  	// }
  	}

  ngOnInit() {
  	this.emp_id = this.route.snapshot.paramMap.get('id');
  	this.myDateValue = new Date();
  	//this.employee = this._common.getData();
  	
  	//console.log('employee: ', this.employee);
  	// this._empService.getShiftDetails(this.employee.shift_id)
  	// 	.subscribe(response => {
  	// 		this.shift = response[0];
  	// });

	this._list.getEmployee(this.emp_id)
		.subscribe(response => {
			this.employee = response;
			this.minDate = new Date(this.employee.join_date);
			this.isEmpDataAvaiable = true;
	}, (error)=>{
       if(error === 'Unauthorized' || error === 'Forbidden'){
         this._route.navigate(['/']);
       }
     })

  	this._common.getShifts() /** get all shift details*/
  		.subscribe((response) => {
			this.shiftsDetails = response;
  	}, (error)=>{
        if(error === 'Unauthorized' || error === 'Forbidden'){
          this._route.navigate(['/']);
        }
    })
  	this._common.getAllAllowance()
  		.subscribe((res) => {
  			this.allowanceData = res;
	}, (error)=>{
        if(error === 'Unauthorized' || error === 'Forbidden'){
          this._route.navigate(['/']);
        }
    })
  }

  markAbsent() {
  	this.errorMessage = false;
  	this.markAbsentInWeekend = false;
  	this.absentOn = this.myDateValue;
  	this.employee.absent_date = this._common.convertDate(this.absentOn);
  	this.employee.remarks = this.remarks;
  	if(this.myDateValue.getDay() !== 0 && this.myDateValue.getDay() !== 6 ){
  		this._empService.makeAbsent(this.employee)
  			.subscribe((response) => {
  				let emp_id = JSON.parse(localStorage.getItem('emp_id'));
  				this._route.navigate(['/list', emp_id]);
  			},(error) => {
  				this.errorMessage = true;
  			});
  	} else {
  		this.markAbsentInWeekend = true;
  	}
  }

  changeShift() {
  	this.noDateSelected = false;
  	//console.log(this.shiftChanged);
  	//console.log(this.shift_change_date);
  	/** If no date is seleted or no shift selected then don't do anything*/
  	if(this.shift_change_date !== undefined && (this.shiftChanged !== null && this.shiftChanged !== undefined)){
	  	this.shiftChangeError = false;
	  	this.changeShiftInWeekend = false;
	  	this.sameShift = false;
	  	let user = this.employee;
	  	let shift;
	  	if(this.shift_change_date.getDay() > 0 && this.shift_change_date.getDay() < 6){

		  	shift = this.shiftsDetails.filter((s, index) => {
		  		if(s.name === this.shiftChanged){
		  			return s._id;
		  		}
		  	})

		  	if(this.employee.shift_id === shift[0]._id){
		  		this.sameShift = true;
		  	} else{
		  		this.sameShift = false;
			  	let rosterShift = {
			  		emp_id : user._id,
			  		emp_type : user.emp_type,
			  		old_shift_id : user.shift_id,
			  		shift_name : user.shift,
			  		changed_from : this._common.convertDate(this.shift_change_date)
			  	}
			  	this.employee.shift_id = shift[0]._id;
			  	this.employee.shift = shift[0].name;

			  	this._empService.putRosterShifts(rosterShift) /** add new entry in rosterShift collection*/
			  		.subscribe((response)=> {
						this._empService.changeEmployeeDetails(this.employee) /** Change shift id of employee with new shift id*/
					  		.subscribe((res)=> {
								let emp_id = JSON.parse(localStorage.getItem('emp_id'));
								this._route.navigate(['/list', emp_id]);
					  	})
			  	},(error)=> {
			  		this.shiftChangeError = true;
			  	})
		  	}
		 } else{
		 	this.changeShiftInWeekend = true;
		 }
	}else{
		this.noDateSelected = true;
	}
  }

  calculate() {
  	//console.log('employee current shift: ', this.employee);
  	this.noCalculate = false;
  	this.totalAllowance = 0;
  	this.totalAllowancePerDay = 0;
  	this.shiftWithAllowance.length = 0;
  	let shiftToConsider;
  	let totalWorkingDays = 0;
  	let dateRange = this.rangePicker;
  	var self = this;
  	if(dateRange !== undefined && dateRange !== null){ /** Check date range*/
  		this.errorCal = false;
  		this.noOfDays = this._common.calcBusinessDays(dateRange[0], dateRange[1]); /** calculate no of days*/
  		//get attendance
		this._empService.getAttendance(this.employee._id, dateRange)
			.subscribe((res) => {
				this.employeeAbsent = res;
				this.absentDays = this.employeeAbsent.length;
			//getting roster for shift change
  			this._empService.getRoster(this.employee._id)
  			.subscribe((response) => {
  				if(response && response.length !== 0){
  					shiftToConsider = response.filter((shift_id, index) => {
  						//if effective date is less than or greater than selected date range then ignore
  						if(new Date(dateRange[0])  <= new Date(shift_id.changed_from)
  							&& new Date(dateRange[1]) >= new Date(shift_id.changed_from)){
  							return shift_id;
  						}
  					})
  					if(shiftToConsider.length !== 0){ /* if there is shift change in date range*/
	  					let index = 0;
	  					let dayOne;
	  					let dayTwo;
	  					do {
	  						//set inital date range for no of working days calculation
	  						if(index === 0){
	  							dayOne = dateRange[0];
	  							dayTwo = new Date(shiftToConsider[index].changed_from);
	  						}
	  						//create a data set to save in array for calculation
	  						let data = {
	  							absentDays : 0,
	  							shift_id : shiftToConsider[index] ? shiftToConsider[index].old_shift_id : this.employee.shift_id,
	  							emp_type : shiftToConsider[index] ? shiftToConsider[index].emp_type : this.employee.emp_type,
	  							workingDays: (index === shiftToConsider.length) ? this._common.calcBusinessDays(dayOne,dayTwo) : (this._common.calcBusinessDays(dayOne,dayTwo)-1)
	  						}
	  						//if employee is absent on any date then reduce working days
	  						if(this.employeeAbsent.length !== 0){
		  						this.employeeAbsent.forEach((abs, index) => {
		  							//if absent date is less than or equal to start date and less than end date of range
		  							if( this._common.convertDate(dayOne) <= abs.absent_date
		  								&& this._common.convertDate(dayTwo) > abs.absent_date ){
		  								//data.workingDays = data.workingDays - 1;
		  								data.absentDays++;
		  							}else if(this._common.convertDate(dayTwo) === abs.absent_date //if absent date is the last day of date range
		  								&& index === shiftToConsider.length){
		  								//data.workingDays = data.workingDays - 1;
		  								data.absentDays++;
		  							}
		  						})
	  						}
	  						//push data in an array for calculation
	  						this.shiftWithAllowance.push(data);
	  						//change the dates untill last counter
	  						if(index < shiftToConsider.length) {
	  							dayOne = new Date(shiftToConsider[index].changed_from);
	  							if(shiftToConsider[index + 1] !== undefined){
	  								dayTwo = new Date(shiftToConsider[index + 1].changed_from);
	  							} else{
	  								dayTwo = dateRange[1];
	  							}
	  						}else{}
	  						//increament counter
	  						index++;
	  					} while(index <= shiftToConsider.length);
  					} // shift to consider length check ends here
  					//console.log('shiftToConsider :', shiftToConsider);
  				} // get roster response length check end
  				/**if there a shift change in between */
  				if(this.shiftWithAllowance.length !== 0){
		  			this.allowanceData.forEach((data, index)=> {
		  				this.shiftWithAllowance.forEach((d, index) => {
		  					if(d.shift_id === data.shift_id && d.emp_type === data.emp_type){
		  						this.shiftWithAllowance[index].amount = data.amount;
		  						totalWorkingDays = totalWorkingDays + this.shiftWithAllowance[index].workingDays;
		  						this.totalAllowancePerDay = ((this.shiftWithAllowance[index].workingDays - this.shiftWithAllowance[index].absentDays) * data.amount);
		  						this.shiftWithAllowance[index].totalAllowancePerDay = this.totalAllowancePerDay;
		  						this.totalAllowance = this.totalAllowance + 
		  						((this.shiftWithAllowance[index].workingDays - this.shiftWithAllowance[index].absentDays) * data.amount);
		  						//console.log(this.totalAllowance, 'allowance');
		  					}
		  				})
		  			})
		  		}else {
		  			//if there is no shift change
		  			this.allowanceData.forEach((al, index)=> {
		  				if(al.shift_id === this.employee.shift_id 
		  					&& al.emp_type === this.employee.emp_type){
		  					this.allowanceAmount = al.amount;
		  					this.employee.allowance_amount = al.amount;
		  					this.allowance_amount = al.amount;
		  				}
		  			})
		  			//console.log(this.noOfDays, 'no of days ');
		  			this.totalAllowance = (this.noOfDays - this.absentDays) * this.allowanceAmount;
		  		} // shift allowance object length check ends here
	  			//console.log('this.employeeAbsent : ', this.employeeAbsent);
	  			//console.log('shiftWithAllowance : ', this.shiftWithAllowance);
  			}) // get roster service call ends
  		})//get attendance service call ends
  	} else {
  		this.errorCal = true;
  	} // end of date range check
  } // end of calculate function
} // end of component
