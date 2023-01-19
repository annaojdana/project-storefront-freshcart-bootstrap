import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [RouterModule, CommonModule],
  declarations: [HeaderComponent],
  providers: [],
  exports: [HeaderComponent],
})
export class HeaderComponentModule {}
