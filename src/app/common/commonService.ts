import { Injectable } from '@angular/core';
import { EmployeeService } from '../employee/employee.service';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

@Injectable()
export class CommonService { 

	data : any;
	token : any;
	emp_id : any;
	baseUrl : any;
	constructor(private _http: Http,
		private _empService : EmployeeService) {
		this.baseUrl = environment.baseUrl;
	};

	setData(data)  {
		this.data = data;
	}

	getData() {
		return this.data;
	}
	setToken(token) {
		this.token = token;
	}
	getToken(){
		return this.token;
	}
	setEmpId(id){
		this.emp_id = id;
	}
	getEmpId(){
		return this.emp_id;
	}

	getShifts() : Observable<any> {
		let headers = new Headers({
			'Content-Type' : 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
		});
		let options = new RequestOptions({headers : headers});
		return this._http.get(this.baseUrl + 'api/shifts', options)
					.map(res => res.json())
					.catch(this.HandleError)
	}

	getManagers() : Observable<any>{
		let headers = new Headers({
			'Content-Type' : 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
		});
		let options = new RequestOptions({headers : headers});
		return this._http.get(this.baseUrl +'api/getMangers', options)
					.map(res => res.json())
					.catch(this.HandleError)		
	}

	getAllAllowance() : Observable<any> {
		let headers = new Headers({
			'Content-Type' : 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
		});
		let options = new RequestOptions({headers : headers});
		return this._http.get(this.baseUrl +'api/allowance', options)
					.map(res => res.json())
					.catch(this.HandleError)				
	}

	loginCheck(loginInfo : any) : Observable<any>{
		let headers = new Headers({
			'Content-Type' : 'application/json'
		});
		let options = new RequestOptions({headers : headers});
		return this._http.post(this.baseUrl +'api/login',loginInfo, options)
					.map(res => res.json())
					.catch(this.HandleError)		
	}

	changePassword(data :any) : Observable<any>{
		let headers = new Headers({
			'Content-Type' : 'application/json',
			'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
		});
		let options = new RequestOptions({headers : headers});
		return this._http.put(this.baseUrl +'api/changepassword',data, options)
					.map(res => res.json())
					.catch(this.HandleError)
	}

	convertDate(dateToConvert){
		let today = new Date(dateToConvert);
		let dd = today.getDate();
		let mm = today.getMonth() + 1; //January is 0!

		let yyyy = today.getFullYear();
		// if (dd < 10) {
		//   dd = '0' + dd;
		// } 
		// if (mm < 10) {
		//   mm = '0' + mm;
		// } 
		return mm + '/' + dd + '/' + yyyy;
	}

	calcBusinessDays(date1, date2) { // Validate input
		let endDate = date2;
		let startDate = date1;

		//console.log(date1)
		//console.log(date2)

	    if (endDate < startDate)
	        return 0;
	    
	    // Calculate days between dates
	    var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
	    startDate.setHours(0,0,0,1);  // Start just after midnight
	    endDate.setHours(23,59,59,999);  // End just before midnight
	    var diff = endDate - startDate;  // Milliseconds between datetime objects    
	    var days = Math.ceil(diff / millisecondsPerDay);
	    
	    // Subtract two weekend days for every week in between
	    var weeks = Math.floor(days / 7);
	    days = days - (weeks * 2);

	    // Handle special cases
	    var startDay = startDate.getDay();
	    var endDay = endDate.getDay();
	    
	    // Remove weekend not previously removed.   
	    if (startDay - endDay > 1)         
	        days = days - 2;      
	    
	    // Remove start day if span starts on Sunday but ends before Saturday
	    if (startDay == 0 && endDay != 6)
	        days = days - 1  
	            
	    // Remove end day if span ends on Saturday but starts after Sunday
	    if (endDay == 6 && startDay != 0)
	        days = days - 1  
	    
	    return days;                      // add 1 because dates are inclusive
	 
	}

	//calculate allowance
	calculate(dateRange, employee, allAllowance) {
		let shiftToConsider;
  		let totalWorkingDays = 0;
  		let noOfDays = 0;
  		let empData = employee;
  		let employeeAbsent;
  		let absentDays;
  		let shiftWithAllowance = [];
  		let allowanceData = allAllowance;
  		let totalAllowance = 0;
  		let allowanceAmount = 0;
  		let isErrorInCalculation = false;

  		//console.log('empData : ', empData);
  		//console.log('allAllowance : ', allAllowance);

	  	if(dateRange !== undefined && dateRange !== null){ /** Check date range*/
	  		noOfDays = this.calcBusinessDays(dateRange[0], dateRange[1]); /** calculate no of days*/
	  		//get attendance
			this._empService.getAttendance(empData._id, dateRange)
				.subscribe((res) => {
					employeeAbsent = res;
					absentDays = employeeAbsent.length;
					//console.log('employeeAbsent :', employeeAbsent);
			//getting roster for shift change
	  		this._empService.getRoster(empData._id)
	  			.subscribe((response) => {
	  				//console.log('roster shifts : ', response);
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
		  							dayOne = this.convertDate(dateRange[0]);
		  							dayTwo = this.convertDate(shiftToConsider[index].changed_from);
		  						}
		  						//create a data set to save in array for calculation
		  						let data = {
		  							shift_id : shiftToConsider[index-1] ? shiftToConsider[index-1].shift_id : empData.shift_id,
		  							emp_type : shiftToConsider[index-1] ? shiftToConsider[index-1].emp_type : empData.emp_type,
		  							workingDays: (index === shiftToConsider.length) ? this.calcBusinessDays(dayOne,dayTwo) : this.calcBusinessDays(dayOne,dayTwo)-1
		  						}
		  						//if employee is absent on any date then reduce working days
		  						if(employeeAbsent.length !== 0){
			  						employeeAbsent.forEach((abs, index) => {
			  							if( new Date(dayOne) <= new Date(abs.absent_date)
			  								&& new Date(dayTwo) >= new Date(abs.absent_date) ){
			  								data.workingDays = data.workingDays - 1;
			  							}
			  						})
		  						}
		  						//push data in an array for calculation
		  						shiftWithAllowance.push(data);
		  						//change the dates untill last counter
		  						if(index < shiftToConsider.length) {
		  							dayOne = this.convertDate(shiftToConsider[index].changed_from);
		  							if(shiftToConsider[index + 1] !== undefined){
		  								dayTwo = this.convertDate(shiftToConsider[index + 1].changed_from);
		  							} else{
		  								dayTwo = this.convertDate(dateRange[1]);
		  							}
		  						}else{}
		  						//increament counter
		  						index++;
		  					} while(index <= shiftToConsider.length);
	  					}
	  				}
	  				//console.log('shiftWithAllowance : ', shiftWithAllowance);
	  				//if there a shift change in between
	  				if(shiftWithAllowance.length !== 0){
			  			allowanceData.forEach((data, index)=> {
			  				shiftWithAllowance.forEach((d, index) => {
			  					if(d.shift_id === data.shift_id && d.emp_type === data.emp_type){
			  						shiftWithAllowance[index].amount = data.amount;
			  						totalWorkingDays = totalWorkingDays + shiftWithAllowance[index].workingDays;
			  						totalAllowance = totalAllowance + (shiftWithAllowance[index].workingDays * data.amount)
			  					}
			  				})
			  			})
			  		}else {
			  			//if there is no shift change
			  			allowanceData.forEach((al, index)=> {
			  				if(al.shift_id === empData.shift_id 
			  					&& al.emp_type === empData.emp_type){
			  					allowanceAmount = al.amount;
			  				}
			  			})
			  			totalAllowance = (noOfDays - absentDays) * allowanceAmount;
			  		}

			  	
			let returnData = {
				noOfDays : noOfDays,
				absentDays : absentDays,
				totalAllowance :totalAllowance,
			}
			//console.log('creating return data ', returnData);
			return returnData;
	  		})
	  		})
	  	} else {
	  		return isErrorInCalculation = true;
	  	}
	}

	private HandleError(error : Response | any) {
		if(error.status === 409){
	      return Observable.throw('Duplicate entry');
	    } if(error.status === 403) {
	      return Observable.throw('Forbidden');
	    } if(error.status === 401){
	      return Observable.throw('Unauthorized');
	    } else{
	      return Observable.throw(error || 'Server error');
	    }
	}
}