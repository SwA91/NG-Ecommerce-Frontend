import { Component, OnInit, inject } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styles: [],
})
export class CartDetailsComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;
  cartService = inject(CartService);

  ngOnInit(): void {
    this.listCartDetails();
  }

  remove(theCartItem: CartItem) {
    this.cartService.remove(theCartItem);
  }

  decrementQuantity(theCartItem: CartItem) {
    this.cartService.decrementQuantity(theCartItem);
  }

  incrementQuantity(theCartItem: CartItem) {
    this.cartService.addToCart(theCartItem);
  }

  listCartDetails() {
    // get a handle to the cart items
    this.cartItems = this.cartService.cartItems;
    // subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(data => (this.totalPrice = data));
    // subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => (this.totalQuantity = data)
    );
    // compute cart total price and quantity
    this.cartService.computeCartTotals();
  }
}
