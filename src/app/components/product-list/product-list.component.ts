import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-table.component.html',
  //templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  constructor(
    private productSerivce: ProductService
  ) { }

  ngOnInit(): void {
    this.listProducts();
  }

  listProducts() {
    this.productSerivce.getProductList().subscribe(
      data => {
        this.products = data;
      }
    )
  }
}