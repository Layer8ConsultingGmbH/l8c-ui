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

  it('should render the icons added for the design system v0.5.1', () => {
    const expected: Record<string, number> = {
      upload: 3,
      save: 3,
      server: 4,
      ban: 2,
      'map-pin': 2,
      'circle-question-mark': 3,
    };
    for (const [name, shapes] of Object.entries(expected)) {
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('svg > *').length, name).toBe(shapes);
    }
  });

  it('should render circle-help as the same glyph as circle-question-mark', () => {
    // Compare the shapes themselves; Angular's template comments are no elements
    const shapes = (name: string): string[] => {
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();
      const svg: SVGElement = fixture.nativeElement.querySelector('svg');
      return Array.from(svg.children).map((shape) => shape.outerHTML);
    };
    expect(shapes('circle-help')).toEqual(shapes('circle-question-mark'));
  });

  it('should switch the rendered icon when the name changes', () => {
    fixture.componentRef.setInput('name', 'x');
    fixture.detectChanges();

    const paths = fixture.nativeElement.querySelectorAll('svg path');
    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute('d')).toBe('M18 6 6 18');
  });
  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => warn.mockRestore());

    it('renders an empty svg for an unknown name without throwing', () => {
      fixture.componentRef.setInput('name', 'no-such-icon');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
      expect(fixture.nativeElement.querySelectorAll('svg > *').length).toBe(0);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('parses a numeric string size and clamps size to at least 1', () => {
      fixture.componentRef.setInput('size', '20');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('svg').getAttribute('width')).toBe('20');

      fixture.componentRef.setInput('size', -4);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('svg').getAttribute('width')).toBe('1');
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('falls back to 24 for a non-numeric size', () => {
      fixture.componentRef.setInput('size', 'big');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('svg').getAttribute('width')).toBe('24');
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});
