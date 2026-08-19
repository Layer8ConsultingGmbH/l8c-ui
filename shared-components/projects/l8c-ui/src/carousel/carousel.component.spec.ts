import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cCarouselComponent } from './carousel.component';
import { L8cCarouselSlideComponent } from './carousel-slide.component';

@Component({
  imports: [L8cCarouselComponent, L8cCarouselSlideComponent],
  template: `
    <l8c-carousel [showIndicators]="true">
      <l8c-carousel-slide>Slide 1</l8c-carousel-slide>
      <l8c-carousel-slide>Slide 2</l8c-carousel-slide>
      <l8c-carousel-slide>Slide 3</l8c-carousel-slide>
    </l8c-carousel>
  `,
})
class CarouselHostComponent {
  carousel = viewChild.required(L8cCarouselComponent);
}

describe('L8cCarouselComponent', () => {
  let fixture: ComponentFixture<CarouselHostComponent>;
  let carousel: L8cCarouselComponent;

  function activeSlideTexts(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.carousel-slide.active') as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent!.trim());
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselHostComponent);
    fixture.detectChanges();
    carousel = fixture.componentInstance.carousel();
  });

  it('should create', () => {
    expect(carousel).toBeTruthy();
  });

  it('should count the projected slides', () => {
    expect(carousel.totalSlides()).toBe(3);
  });

  it('should show only the first slide initially', () => {
    expect(activeSlideTexts()).toEqual(['Slide 1']);
    expect(carousel.canGoBack()).toBe(false);
    expect(carousel.canGoForward()).toBe(true);
  });

  it('should only render the forward navigation on the first slide', () => {
    expect(fixture.nativeElement.querySelector('.carousel-nav-prev')).toBeNull();
    expect(fixture.nativeElement.querySelector('.carousel-nav-next')).toBeTruthy();
  });

  it('should advance to the next slide and emit slideChange', () => {
    let emitted: number | undefined;
    carousel.slideChange.subscribe((index) => (emitted = index));

    fixture.nativeElement.querySelector('.carousel-nav-next').click();
    fixture.detectChanges();

    expect(emitted).toBe(1);
    expect(activeSlideTexts()).toEqual(['Slide 2']);
    expect(carousel.canGoBack()).toBe(true);
  });

  it('should go back to the previous slide', () => {
    carousel.goToSlide(1);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.carousel-nav-prev').click();
    fixture.detectChanges();

    expect(activeSlideTexts()).toEqual(['Slide 1']);
  });

  it('should not move past the last slide', () => {
    carousel.goToSlide(2);
    carousel.next();

    expect(carousel.internalSlide()).toBe(2);
    expect(carousel.canGoForward()).toBe(false);
  });

  it('should not move before the first slide', () => {
    carousel.previous();

    expect(carousel.internalSlide()).toBe(0);
  });

  it('should ignore out-of-range slide indices', () => {
    let emitted = false;
    carousel.slideChange.subscribe(() => (emitted = true));

    carousel.goToSlide(-1);
    carousel.goToSlide(3);

    expect(carousel.internalSlide()).toBe(0);
    expect(emitted).toBe(false);
  });

  it('should render one indicator per slide and jump on click', () => {
    const indicators = fixture.nativeElement.querySelectorAll('.carousel-indicator');
    expect(indicators.length).toBe(3);

    indicators[2].click();
    fixture.detectChanges();

    expect(activeSlideTexts()).toEqual(['Slide 3']);
    expect(indicators[2].classList.contains('active')).toBe(true);
  });
});
