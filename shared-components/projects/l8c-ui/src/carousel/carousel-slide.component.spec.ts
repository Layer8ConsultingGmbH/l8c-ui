import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cCarouselSlideComponent } from './carousel-slide.component';

@Component({
  imports: [L8cCarouselSlideComponent],
  template: `<l8c-carousel-slide><p class="content">Hello</p></l8c-carousel-slide>`,
})
class SlideHostComponent {}

describe('L8cCarouselSlideComponent', () => {
  let fixture: ComponentFixture<SlideHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SlideHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(SlideHostComponent);
    fixture.detectChanges();
  });

  it('renders the projected content inside the slide wrapper', () => {
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.carousel-slide');
    expect(wrapper).toBeTruthy();
    expect(wrapper.querySelector('.content')?.textContent).toBe('Hello');
  });

  it('exposes its host element so the carousel can toggle the active class', () => {
    const slide = fixture.debugElement.children[0].componentInstance as L8cCarouselSlideComponent;
    expect(slide.elementRef.nativeElement.tagName.toLowerCase()).toBe('l8c-carousel-slide');
    expect(slide.elementRef.nativeElement.querySelector('.carousel-slide')).toBeTruthy();
  });
});
