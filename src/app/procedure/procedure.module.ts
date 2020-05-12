import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';


import { ProcedureRoutingModule } from './procedure-routing.module';
import { ProcedureComponent, DeleteProcedureDialog } from './procedure/procedure.component';
import { ProceduresComponent } from './procedures/procedures.component';
import { EditProcedureComponent } from './edit-procedure/edit-procedure.component';
import { CreateProcedureComponent } from './create-procedure/create-procedure.component';
import { ViewProcedureComponent } from './view-procedure/view-procedure.component';


@NgModule({
  declarations: [
    ProcedureComponent, 
    ProceduresComponent, 
    EditProcedureComponent, 
    CreateProcedureComponent, 
    ViewProcedureComponent,
    DeleteProcedureDialog
  ],
  imports: [
    CommonModule,
    ProcedureRoutingModule,
    SharedModule
  ],
  entryComponents: [
    DeleteProcedureDialog
  ]
})
export class ProcedureModule { }
