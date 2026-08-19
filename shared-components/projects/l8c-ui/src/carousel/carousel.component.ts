import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  input,
  output,
  untracked,
  ContentChildren,
  QueryList,
  AfterContentInit,
} from '@angular/core';
import { L8cCarouselSlideComponent } from './carousel-slide.component';

@Component({
  selector: 'l8c-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cCarouselComponent implements AfterContentInit {
  @ContentChildren(L8cCarouselSlideComponent) slides!: QueryList<L8cCarouselSlideComponent>;

  readonly currentSlide = input<number>(0);
  readonly showNavigation = input<boolean>(true);
  readonly showIndicators = input<boolean>(false);
  readonly animationDuration = input<number>(300);

  readonly slideChange = output<number>();

  readonly internalSlide = signal<number>(0);
  readonly totalSlides = signal<number>(0);

  readonly canGoBack = computed(() => this.internalSlide() > 0);
  readonly canGoForward = computed(() => this.internalSlide() < this.totalSlides() - 1);
  readonly slideIndicators = computed(() =>
    Array.from({ length: this.totalSlides() }, (_, i) => i),
  );

  constructor() {
    // Sync the internal slide and visibility when the input changes from the parent
    effect(() => {
      const value = this.currentSlide();
      untracked(() => {
        this.internalSlide.set(value);
        if (this.slides && this.slides.length > 0) {
          this.updateSlideVisibility();
        }
      });
    });
  }

  ngAfterContentInit(): void {
    this.totalSlides.set(this.slides.length);
    this.updateSlideVisibility();

    this.slides.changes.subscribe(() => {
      this.totalSlides.set(this.slides.length);
      this.updateSlideVisibility();
    });
  }

  private updateSlideVisibility(): void {
    this.slides.forEach((slide, index) => {
      const slideElement = slide.elementRef.nativeElement.querySelector('.carousel-slide');
      if (slideElement) {
        if (index === this.internalSlide()) {
          slideElement.classList.add('active');
          slideElement.classList.remove('inactive');
        } else {
          slideElement.classList.remove('active');
          slideElement.classList.add('inactive');
        }
      }
    });
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.totalSlides()) {
      this.internalSlide.set(index);
      this.updateSlideVisibility();
      this.slideChange.emit(index);
    }
  }

  next(): void {
    if (this.canGoForward()) {
      this.goToSlide(this.internalSlide() + 1);
    }
  }

  previous(): void {
    if (this.canGoBack()) {
      this.goToSlide(this.internalSlide() - 1);
    }
  }
}
