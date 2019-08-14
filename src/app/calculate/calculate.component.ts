import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common/commonService';
import { ListEmployeeService } from '../list-employee/list-employee.service';
import { EmployeeService } from '../employee/employee.service';
import { ExcelService } from '../common/excel.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-calculate',
  templateUrl: './calculate.component.html',
  styleUrls: ['./calculate.component.css']
})
export class CalculateComponent implements OnInit {
	employeeList : any;
	employeeAttendance : any;
  rangePicker : Date;
  allowances : any = [];
  allowanceData : any;
  calculateData : any;
  shiftChanges : any;
  noDateSelected : boolean = false;
  errorMessge : boolean = false;
  loading : boolean = true;
  downloadableData : any = [];
  colorTheme = 'theme-blue';
  bsConfig: Partial<BsDatepickerConfig>;
    //sorting
  key: string = 'name'; //set default
  reverse: boolean = false;
  //initializing p to one
  p: number = 1;
  itemsPerPage : number = 50;
  currentPage : number = 1;

  constructor(
  	private _common:CommonService,
  	private _route : Router,
  	private _list : ListEmployeeService,
    private _empService : EmployeeService,
    private _excel : ExcelService
  	) {
    this.bsConfig = { containerClass: this.colorTheme, showWeekNumbers : false };
    /** If there is some error return to list page*/
  	if(this._common.getData() === undefined){
        let emp_id = JSON.parse(localStorage.getItem('emp_id'));
	  		this._route.navigate(['/list', emp_id]);
	  	}
  }
  /** For index displaying according to pagination using ngx-pagination library*/
  absoluteIndex(indexOnPage: number): number {
    return this.itemsPerPage * (this.currentPage - 1) + indexOnPage;
  }
  /** Init for this page*/
  ngOnInit() {
    this.loading = true;
    this.errorMessge = false;
  	this.employeeList = this._common.getData();
    //console.log(this.employeeList);
    //get all the allowances for calculation purpose
    this._common.getAllAllowance()
      .subscribe((res) => {
        this.loading = false;
        this.allowanceData = res;
    }, (error)=>{
        if(error === 'Unauthorized' || error === 'Forbidden'){
          this._route.navigate(['/']);
        }
    })
  }
  // sort function
  sort(key){
    this.key = key;
    this.reverse = !this.reverse;
  }
  download() {
    this.errorMessge = false;
    this.loading = true;
    this.downloadableData.length = 0;
    let today = new Date();
    let date = today.getDay();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let saveDate = '' + date + '/' + month + '/' + year + '';
    let tempData = {
      Emp_Id : '',
      Name: '',
      Joining_Date : '',
      Manager_Name : '',
      Shift : '',
      Team : '',
      Emp_Type : '',
      Absent : '',
      Business_Days : '',
      Allowance : '',
      Total_Allowance : ''
    };

    if(this.employeeList[0].totalAllowance){
      this.employeeList.map((item, index)=>{
        tempData = {
          Emp_Id : item.employee_id,
          Name: item.name,
          Joining_Date : item.join_date,
          Manager_Name : item.manager,
          Shift : item.shift,
          Team : item.team,
          Emp_Type : item.emp_type,
          Absent : item.absentDays,
          Business_Days : item.noOfBusineesDays,
          Allowance : item.allowancePerDay,
          Total_Allowance : item.totalAllowance
        }
        this.downloadableData.push(tempData);
      });
      let file_name = 'shift_allowance_'+saveDate;
      this.exportAsXLSX(this.downloadableData, file_name)
    }else{
      this.loading = false;
      this.errorMessge = true;
    }
  }

  //export calculatered data to excel sheet
  exportAsXLSX(excelBuffer, filename):void {
    this.loading = false;
    this._excel.exportAsExcelFile(excelBuffer,filename);
  }
  /**
  * main calculation of allownaces, calculating no of working days and reduce the absent days in between those days,
  * if shift is changed in between that period then find the no of working days in that period and what was the allowance
  * during that period. According to that calculate the total allowances.
  */
  calculate(){
    this.loading = true;
    this.errorMessge = false;
    let dateRange = this.rangePicker;
    if(dateRange !== null && dateRange !== undefined){ /** Check date range*/
      // for each employee calculate individually
      this.employeeList.forEach((emp, index) => {
      //declare variables
      let shiftToConsider;
      let totalWorkingDays = 0;
      let noOfDays = 0;
      let empData = emp;
      let employeeAbsent;
      let absentDate = '';
      let absentDays;
      let shiftWithAllowance = [];
      let allowanceData = this.allowanceData;
      let totalAllowance = 0;
      let allowanceAmount = 0;
      let allowancePerShift = '';
      let workingDaysInShift = '';
      let isErrorInCalculation = false;
      if(new Date(emp.join_date) > dateRange[1]){
        noOfDays = 0;
      }else if(dateRange[0] < new Date(emp.join_date)){
        noOfDays = this._common.calcBusinessDays(new Date(emp.join_date), dateRange[1]); /** calculate no of days*/
      }else{
        noOfDays = this._common.calcBusinessDays(dateRange[0], dateRange[1]); /** calculate no of days*/
      }
      //get attendance
      this._empService.getAttendance(empData._id, dateRange)
        .subscribe((res) => {
          employeeAbsent = res;
          //console.log('absent :', res)
          absentDays = employeeAbsent.length;
        //getting roster for shift change
        this._empService.getRoster(empData._id)
          .subscribe((response) => {
            if(response && response.length !== 0){
              shiftToConsider = response.filter((shift_id, index) => {
                //if effective date is less than or greater than selected date range then ignore
                //console.log('emp ',emp)
                //console.log('start date ',dateRange[0])
                //console.log('shift change ',shift_id.changed_from)
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
                    if(dateRange[0] < new Date(emp.join_date)){
                      dayOne = new Date(emp.join_date);
                    }else{
                      dayOne = dateRange[0];
                    }
                    dayTwo = new Date(shiftToConsider[index].changed_from);
                  }
                  //create a data set to save in array for calculation

                  let data = {
                    shift_id : shiftToConsider[index] ? shiftToConsider[index].old_shift_id : empData.shift_id,
                    emp_type : shiftToConsider[index] ? shiftToConsider[index].emp_type : empData.emp_type,
                    workingDays: (index === shiftToConsider.length) ? this._common.calcBusinessDays(dayOne,dayTwo) : this._common.calcBusinessDays(dayOne,dayTwo)-1
                  }

                  //if employee is absent on any date then reduce working days
                  if(employeeAbsent.length !== 0){
                    employeeAbsent.forEach((abs, index) => {
                      if( dayOne <= new Date(abs.absent_date)
                      && dayTwo > new Date(abs.absent_date )){
                        data.workingDays = data.workingDays - 1;
                      /** If display of absent dates are needed*/
                        //absentDate = abs.absent_date.split('/')[0] + '/' + abs.absent_date.split('/')[1];
                      }
                      //if absent date is the last day of date range
                      if(dayTwo === new Date(abs.absent_date)
                        && index === shiftToConsider.length){
                        data.workingDays = data.workingDays - 1;
                      /** If display of absent dates are needed*/
                        //absentDate = abs.absent_date.split('/')[0] +'/' + abs.absent_date.split('/')[1];
                        //data.absentDays++;
                      }
                    })
                  }
                  //push data in an array for calculation
                  shiftWithAllowance.push(data);
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
                } while(index <= shiftToConsider.length); // end of do while loop
              }else { /** special condition when response is not null but shift to consider is calculating as null**/
              //   if(response.length !== 0){
              //   /** let's assume only one element in response**/
              //   let shift_id = response[0].old_shift_id;
              //   let dayOne = dateRange[0];
              //   let dayTwo = dateRange[1];
              //   let data = {
              //     absentDays : 0,
              //     shift_id : shift_id,
              //     emp_type : empData.emp_type,
              //     workingDays: this._common.calcBusinessDays(dateRange[0],dateRange[1])
              //   }
              //   //if employee is absent on any date then reduce working days
              //   if(employeeAbsent.length !== 0){
              //     employeeAbsent.forEach((abs, index) => {
              //       //if absent date is less than or equal to start date and less than end date of range
              //       if( this._common.convertDate(dayOne) <= abs.absent_date
              //         && this._common.convertDate(dayTwo) > abs.absent_date ){
              //         //data.workingDays = data.workingDays - 1;
              //         data.absentDays++;
              //       }else if(this._common.convertDate(dayTwo) === abs.absent_date //if absent date is the last day of date range
              //         && index === shiftToConsider.length){
              //         //data.workingDays = data.workingDays - 1;
              //         data.absentDays++;
              //       }
              //     })
              //   }
              // //push data in an array for calculation
              //   shiftWithAllowance.push(data);
              // }  
             } // shift to consider length end
            } // end of get roster response check
            //console.log('shiftToConsider :', shiftToConsider);
            //if there a shift change in between then calculate the allowance amount
            if(shiftWithAllowance.length !== 0){
              allowanceData.forEach((data, index)=> {
                shiftWithAllowance.forEach((d, index) => {
                  if(d.shift_id === data.shift_id && d.emp_type === data.emp_type){
                  //console.log('data : ', data);
                  //console.log('shift with allowance : ', d);
                    shiftWithAllowance[index].amount = data.amount;
                    allowancePerShift = allowancePerShift === '' ? data.amount : allowancePerShift + ' and ' + data.amount;
                    workingDaysInShift = workingDaysInShift === '' ? shiftWithAllowance[index].workingDays : workingDaysInShift + ' and ' + shiftWithAllowance[index].workingDays;
                    totalWorkingDays = totalWorkingDays + shiftWithAllowance[index].workingDays;
                    totalAllowance = totalAllowance + (shiftWithAllowance[index].workingDays * data.amount)
                  }
                })
              })
              //store individual working days and allowance for report pourpose

            }else {
              //if there is no shift change then calculate the allowance amount
              allowanceData.forEach((al, index)=> {
                //console.log('allowance data : ', al);
                if(al.shift_id === empData.shift_id 
                  && al.emp_type === empData.emp_type){
                  allowanceAmount = al.amount;
                }
              })
              totalAllowance = (noOfDays - absentDays) * allowanceAmount;
            } //end of shift allowance object length check if and else

          let emplWithAllowance = {
            emp_id : emp._id,
            emp_name : emp.name,
            noOfDays : noOfDays,
            absentDays : absentDays,
            totalAllowance :totalAllowance,
          }
          //console.log('employeeAbsent :', employeeAbsent);
          //push all data in employeelist for display, this need to change once all the coloums in excel are defined
          this.shiftChanges = shiftWithAllowance;
          if(workingDaysInShift !== ''){
            this.employeeList[index].daysInSifts = workingDaysInShift;
          }
          this.employeeList[index].absentDays = absentDate === '' ? absentDays : absentDays + '(' + absentDate + ')';
          this.employeeList[index].noOfBusineesDays = workingDaysInShift === '' ? noOfDays : noOfDays + '('+workingDaysInShift+')';
          /** Because allowance amount was 0 in case of normal shift and allowancePerShift was '', do nothing was comming in UI*/
          if(allowanceAmount === 0 && allowancePerShift === ''){
            this.employeeList[index].allowancePerDay = 0;
          } else if(allowanceAmount === 0 && allowancePerShift !== ''){
            this.employeeList[index].allowancePerDay = allowancePerShift
          } else if(allowanceAmount !== 0 ){
            this.employeeList[index].allowancePerDay = allowanceAmount;
          }
          //this.employeeList[index].allowancePerDay = allowanceAmount == 0 ? allowancePerShift : allowanceAmount;
          this.employeeList[index].totalAllowance = totalAllowance;
          this.loading = false;
        })//get roster service end
      }, (error)=>{
          if(error === 'Unauthorized' || error === 'Forbidden'){
            this._route.navigate(['/']);
          }
        })// get attendance service end
      }) //for Each employee iterator end
    } else {
      this.loading = false;
      this.noDateSelected = true;
    }//end of checking date range validation
  }//end of function calculate

} //end of component
