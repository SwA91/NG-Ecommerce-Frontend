import { Component, OnInit, inject } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styles: [],
})
export class CartStatusComponent implements OnInit {
  totalPrice: number = 0;
  totalQuantity: number = 0;
  cartService = inject(CartService);

  ngOnInit(): void {
    this.updateCartStatus();
  }
  updateCartStatus() {
    // subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(data => (this.totalPrice = data));
    // subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => (this.totalQuantity = data)
    );
  }
}
