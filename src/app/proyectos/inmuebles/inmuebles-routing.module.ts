import { RouterModule, Routes } from '@angular/router';

import { InmueblesPage } from './inmuebles.page';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: InmueblesPage
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'detalle/:titulo',
    loadChildren: () => import('./detalle/detalle.module').then( m => m.DetallePageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InmueblesPageRoutingModule {}
