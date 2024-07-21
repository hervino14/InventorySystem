import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Category } from 'src/app/_interface/category';
import { SuccessModalComponent } from 'src/app/shared/modals/success-modal/success-modal.component';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { RepositoryErrorHandlerService } from 'src/app/shared/services/repository-error-handler.service';
import { RepositoryService } from 'src/app/shared/services/repository.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  public errorMessage: string = '';
  public bsModalRef?: BsModalRef;
  public displayedColumns = ['name', 'update', 'delete'];
  public dataSource = new MatTableDataSource<Category>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private repoService: RepositoryService,
    private errorService: RepositoryErrorHandlerService,
    private router: Router,
    private dialogserve: DialogService,
    private modal: BsModalService
  ) { }

  ngOnInit() {
    this.getAllCategories();
  }

  public getAllCategories = () => {
    this.repoService.getData('api/categories')
      .subscribe(
        res => {
          this.dataSource.data = res as Category[];
        },
        (error: HttpErrorResponse) => {
          this.errorService.handleError(error);
        }
      );
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }

  public redirectToUpdate = (id: string) => {
    this.router.navigate([`/ui-components/update-category/${id}`]);
  }

  public deleteCategory(id: string) {
    this.dialogserve.openConfirmDialog('Are you sure you want to delete this category?')
      .afterClosed()
      .subscribe(res => {
        if (res) {
          const deleteUri: string = `api/categories/${id}`;
          this.repoService.delete(deleteUri).subscribe(() => {
            const config: ModalOptions = {
              initialState: {
                modalHeaderText: 'Success Message',
                modalBodyText: `Category deleted successfully`,
                okButtonText: 'OK'
              }
            };

            this.bsModalRef = this.modal.show(SuccessModalComponent, config);
            this.bsModalRef.content.redirectOnOk.subscribe(() => this.getAllCategories());
          });
        }
      });
  }
}