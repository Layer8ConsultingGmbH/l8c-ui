import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cIconComponent } from './icon.component';
import { ICON_ALIASES, ICON_NAMES, isIconName } from './icon-registry';

describe('icon registry', () => {
  let fixture: ComponentFixture<L8cIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [L8cIconComponent] }).compileComponents();
    fixture = TestBed.createComponent(L8cIconComponent);
  });

  it('lists the icons added for the story', () => {
    for (const name of ['upload', 'save', 'server', 'ban', 'map-pin', 'circle-question-mark']) {
      expect(isIconName(name), name).toBe(true);
    }
  });

  it('resolves the alias circle-help to circle-question-mark', () => {
    expect(ICON_ALIASES['circle-help']).toBe('circle-question-mark');
    expect(isIconName('circle-help')).toBe(true);
  });

  it('is sorted and free of duplicates', () => {
    const sorted = [...ICON_NAMES].sort();
    expect([...ICON_NAMES]).toEqual(sorted);
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
  });

  it('rejects unknown and non-string values without throwing', () => {
    expect(isIconName('no-such-icon')).toBe(false);
    expect(isIconName(undefined)).toBe(false);
    expect(isIconName(42)).toBe(false);
  });

  it('renders at least one shape for every registered name', () => {
    for (const name of ICON_NAMES) {
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('svg > *').length, name).toBeGreaterThan(0);
    }
  });
});
