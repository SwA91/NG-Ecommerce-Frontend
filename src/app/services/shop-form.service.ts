import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShopFormService {
  constructor() {}

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];
    // build an array for Year dropdown list
    // - start at current year and loop for next 10 years
    const startYear = new Date().getFullYear();
    const endYear = startYear + 10;

    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    return of(data);
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];
    // build an array for Month dropdown list
    // - start at current month and loop until
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data);
  }
}
