import { Component, ChangeDetectionStrategy, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'l8c-carousel-slide',
  template: `
    <div class="carousel-slide">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .carousel-slide {
        display: none;
        width: 100%;
        min-height: 400px;
        flex-direction: column;
        background: transparent;
      }

      .carousel-slide.active {
        display: flex;
      }

      @media (max-width: 768px) {
        .carousel-slide {
          min-height: 350px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cCarouselSlideComponent {
  readonly elementRef = inject(ElementRef);
}
