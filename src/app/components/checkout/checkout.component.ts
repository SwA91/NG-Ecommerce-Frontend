import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { CheckoutValidators } from 'src/app/validators/checkout-validators';
import { environment } from 'src/environments/environment';

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
  storage: Storage = sessionStorage;

  // initialize stripe api
  stripe = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = '';

  isDisabled: boolean = false;

  constructor(
    private router: Router,
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private formBuilder: FormBuilder,
    private shopFormService: ShopFormService
  ) {}

  ngOnInit(): void {
    // setup stripe payment form
    this.setupStripePaymentForm();

    this.reviewCartDetails();
    // create form group
    this.createFormGroup();

    // populate countries
    this.shopFormService
      .getCountries()
      .subscribe(data => (this.countries = data));
  }

  setupStripePaymentForm() {
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // create a car element ... and hide the zip-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // add an instance of card ui component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {
      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = '';
      } else if (event.error) {
        // show validation error to customer
        this.displayError.textContent = event.error.message;
      }
    });
  }

  reviewCartDetails() {
    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => (this.totalQuantity = totalQuantity)
    );
    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => (this.totalPrice = totalPrice)
    );
  }

  private createFormGroup() {
    // read the user's email address from browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);
    this.checkOutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace,
        ]),
        email: new FormControl(theEmail, [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({}),
    });
  }

  getState(formGroupName: string) {
    const formGroup = this.checkOutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    if (countryCode && countryName) {
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
    if (this.checkOutFormGroup.invalid) {
      // touching all fields triggers the display of the error messages
      this.checkOutFormGroup.markAllAsTouched();
      return;
    }

    // set upt order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(
      temCartItem => new OrderItem(temCartItem)
    );

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkOutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress =
      this.checkOutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(
      JSON.stringify(purchase.shippingAddress?.state)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(purchase.shippingAddress?.country)
    );
    purchase.shippingAddress!.state = shippingState.name;
    purchase.shippingAddress!.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress =
      this.checkOutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(
      JSON.stringify(purchase.billingAddress?.state)
    );
    const billingCountry: Country = JSON.parse(
      JSON.stringify(purchase.billingAddress?.country)
    );
    purchase.billingAddress!.state = billingState.name;
    purchase.billingAddress!.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = 'EUR';
    this.paymentInfo.receiptEmail = purchase.customer?.email;

    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order
    if (
      !this.checkOutFormGroup.invalid &&
      this.displayError.textContent === ''
    ) {
      this.isDisabled = true;
      this.checkoutService
        .createPaymentIntent(this.paymentInfo)
        .subscribe(paymentIntentResponse => {
          this.stripe
            .confirmCardPayment(
              paymentIntentResponse.client_secret,
              {
                payment_method: {
                  // past our form credit card
                  card: this.cardElement,
                  billing_details: {
                    email: purchase.customer?.email,
                    name: `${purchase.customer?.firstName} ${purchase.customer?.lastName}`,
                    address: {
                      line1: purchase.billingAddress?.street,
                      city: purchase.billingAddress?.city,
                      state: purchase.billingAddress?.state,
                      postal_code: purchase.billingAddress?.zipCode,
                      country: this.billingAddressCountry?.value.code,
                    },
                  },
                },
              },
              {
                handleActions: false,
              }
            )
            .then((result: any) => {
              if (result.error) {
                // inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              } else {
                // call REST API via the CheckoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: resp => {
                    console.log('next', resp);
                    alert(
                      `Your order has been received.\nOrder tracking number: ${resp.orderTrackingNumber}`
                    );
                    // reset cart
                    this.resetCart();
                    this.isDisabled = false;
                  },
                  error: err => {
                    console.log('error', err);
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false;
                  },
                });
              }
            });
        });
    } else {
      this.checkOutFormGroup.markAllAsTouched();
      return;
    }
  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    // reset the form
    this.checkOutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl('/products');
  }

  // first name
  get firstName() {
    return this.checkOutFormGroup.get('customer.firstName');
  }
  get firstNameInvalid() {
    return (
      this.firstName?.invalid &&
      (this.firstName?.dirty || this.firstName?.touched)
    );
  }
  get firstNameRequired() {
    return (
      this.firstName?.errors?.['required'] ||
      this.firstName?.errors?.['notOnlyWhitespace']
    );
  }
  // last name
  get lastName() {
    return this.checkOutFormGroup.get('customer.lastName');
  }
  get lastNameInvalid() {
    return (
      this.lastName?.invalid && (this.lastName?.dirty || this.lastName?.touched)
    );
  }
  get lastNameRequired() {
    return (
      this.lastName?.errors?.['required'] ||
      this.lastName?.errors?.['notOnlyWhitespace']
    );
  }
  // email
  get email() {
    return this.checkOutFormGroup.get('customer.email');
  }
  get emailInvalid() {
    return this.email?.invalid && (this.email?.dirty || this.email?.touched);
  }
  // shipping address
  get shippingAddressStreet() {
    return this.checkOutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressCity() {
    return this.checkOutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressState() {
    return this.checkOutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressCountry() {
    return this.checkOutFormGroup.get('shippingAddress.country');
  }
  get shippingAddressZipCode() {
    return this.checkOutFormGroup.get('shippingAddress.zipCode');
  }
  // billing address
  get billingAddressStreet() {
    return this.checkOutFormGroup.get('billingAddress.street');
  }
  get billingAddressCity() {
    return this.checkOutFormGroup.get('billingAddress.city');
  }
  get billingAddressState() {
    return this.checkOutFormGroup.get('billingAddress.state');
  }
  get billingAddressCountry() {
    return this.checkOutFormGroup.get('billingAddress.country');
  }
  get billingAddressZipCode() {
    return this.checkOutFormGroup.get('billingAddress.zipCode');
  }

  // credit card
  get creditCardType() {
    return this.checkOutFormGroup.get('creditCard.cardType');
  }
  get creditCardNameOnCard() {
    return this.checkOutFormGroup.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkOutFormGroup.get('creditCard.cardNumber');
  }
  get creditCardSecurityCode() {
    return this.checkOutFormGroup.get('creditCard.securityCode');
  }
}
