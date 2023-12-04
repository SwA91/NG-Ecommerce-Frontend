import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  // templateUrl: './product-list-table.component.html',
  //templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;
  previousCategoryId: number = 1;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private productSerivce: ProductService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(
      () => {
        this.listProducts();
      });
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  listProducts(event?: number) {
    this.searchMode = this.activatedRoute.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts(event);
    }
  }

  handleListProducts(_pageNumber: number = 1) {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.activatedRoute.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the id param string, convert string to a number using the + symbol
      this.currentCategoryId = +this.activatedRoute.snapshot.paramMap.get('id')!;
    } else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
    }

    // check if we have a different category than previous
    // Note: angular will reuse a component if it is currently being viewed

    // if we have a different category id than previous
    // then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    // now get the products for the given category id 
    this.productSerivce.getProductListPaginate(
      _pageNumber,
      this.thePageSize,
      this.currentCategoryId
    ).subscribe(data => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    });
  }


  handleSearchProducts() {
    const theKeyword: string = this.activatedRoute.snapshot.paramMap.get('keyword')!;

    // now search for the products using keyword
    this.productSerivce.searchProducts(theKeyword).subscribe(data => {
      this.products = data;
    });
  }
}
