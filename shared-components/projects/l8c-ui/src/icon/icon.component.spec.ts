import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cIconComponent } from './icon.component';

describe('L8cIconComponent', () => {
  let component: L8cIconComponent;
  let fixture: ComponentFixture<L8cIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cIconComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'check');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an svg with the default size', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });

  it('should apply a custom size', () => {
    fixture.componentRef.setInput('size', 16);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('height')).toBe('16');
  });

  it('should render the paths of the selected icon', () => {
    const path = fixture.nativeElement.querySelector('svg path');
    expect(path.getAttribute('d')).toBe('M20 6 9 17l-5-5');
  });

  it('should switch the rendered icon when the name changes', () => {
    fixture.componentRef.setInput('name', 'x');
    fixture.detectChanges();

    const paths = fixture.nativeElement.querySelectorAll('svg path');
    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute('d')).toBe('M18 6 6 18');
  });
});
