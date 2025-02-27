import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FooterComponent } from './footer.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [FooterComponent],
  providers: [],
  exports: [FooterComponent]
})
export class FooterComponentModule {
}
