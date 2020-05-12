import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ProceduresComponent} from './procedures/procedures.component';
import {CreateProcedureComponent} from './create-procedure/create-procedure.component';
import {ViewProcedureComponent} from './view-procedure/view-procedure.component';
import {EditProcedureComponent} from './edit-procedure/edit-procedure.component';


const routes: Routes = [
  {
    path: '',
    component: ProceduresComponent
  },
  {
    path: 'create',
    component: CreateProcedureComponent
  },
  {
    path: 'view/:procedureId',
    component: ViewProcedureComponent
  },
  {
    path: 'edit/:procedureId',
    component: EditProcedureComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcedureRoutingModule { }
