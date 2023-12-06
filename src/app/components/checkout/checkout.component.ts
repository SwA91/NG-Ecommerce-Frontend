import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { ShopFormService } from 'src/app/services/shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styles: [],
})
export class CheckoutComponent implements OnInit {
  checkOutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private shopFormService: ShopFormService
  ) {}

  ngOnInit(): void {
    this.checkOutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // populate credit card months
    const startMonth = new Date().getMonth() + 1;
    this.shopFormService
      .getCreditCardMonths(startMonth)
      .subscribe(data => (this.creditCardMonths = data));
    // populate credit card years
    this.shopFormService
      .getCreditCardYears()
      .subscribe(data => (this.creditCardYears = data));

    // populate countries
    this.shopFormService
      .getCountries()
      .subscribe(data => (this.countries = data));
  }

  getState(formGroupName: string) {
    const formGroup = this.checkOutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    if (countryCode && countryName) {
      console.log(`Hey:`, countryCode, countryName);
      this.shopFormService.getStates(countryCode).subscribe(data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else if (formGroupName === 'billingAddress') {
          this.billingAddressStates = data;
        }
        // select the first item by default
        formGroup.get('state')?.setValue(data[0]);
      });
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkOutFormGroup.get('creditCard');
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(creditCardFormGroup?.value.expirationYear);
    // if the current year equals the selected year, then start with the current month
    let startMonth;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.shopFormService
      .getCreditCardMonths(startMonth)
      .subscribe(data => (this.creditCardMonths = data));
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkOutFormGroup.controls['billingAddress'].setValue(
        this.checkOutFormGroup.controls['shippingAddress'].value
      );
      // bug fix for states
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkOutFormGroup.controls['billingAddress'].reset();
      // bug fix for states
      this.billingAddressStates = [];
    }
  }

  onSubmit() {
    console.log(`Hey:`);
  }

  get firstName() {
    return this.checkOutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkOutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkOutFormGroup.get('customer.email');
  }
}
