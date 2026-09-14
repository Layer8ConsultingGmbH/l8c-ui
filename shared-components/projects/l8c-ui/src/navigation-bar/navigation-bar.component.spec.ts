import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cNavigationBarComponent } from './navigation-bar.component';

describe('L8cNavigationBarComponent', () => {
  let component: L8cNavigationBarComponent;
  let fixture: ComponentFixture<L8cNavigationBarComponent>;
  let selected: number[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cNavigationBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cNavigationBarComponent);
    component = fixture.componentInstance;
    selected = [];
    component.itemSelected.subscribe((num) => selected.push(num));
    fixture.componentRef.setInput('totalItems', 5);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one numbered button per item and mark the active one', () => {
    fixture.componentRef.setInput('activeItem', 3);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(items.length).toBe(5);
    expect(items[2].classList.contains('active')).toBe(true);
  });

  it('should emit the clicked item number', () => {
    fixture.nativeElement.querySelectorAll('.nav-item')[3].click();

    expect(selected).toEqual([4]);
  });

  it('should navigate to the previous item but not before the first', () => {
    fixture.componentRef.setInput('activeItem', 2);
    fixture.detectChanges();

    component.onPrevious();
    expect(selected).toEqual([1]);

    fixture.componentRef.setInput('activeItem', 1);
    fixture.detectChanges();
    component.onPrevious();
    expect(selected).toEqual([1]);
    expect(component.canGoPrevious()).toBe(false);
  });

  it('should navigate to the next item but not past the last', () => {
    fixture.componentRef.setInput('activeItem', 4);
    fixture.detectChanges();

    component.onNext();
    expect(selected).toEqual([5]);

    fixture.componentRef.setInput('activeItem', 5);
    fixture.detectChanges();
    component.onNext();
    expect(selected).toEqual([5]);
    expect(component.canGoNext()).toBe(false);
  });

  it('should jump to a valid item and clear the input', () => {
    component.jumpToValue.set('4');

    component.onJumpTo();

    expect(selected).toEqual([4]);
    expect(component.jumpToValue()).toBe('');
  });

  it('should ignore out-of-range or invalid jump values', () => {
    for (const value of ['0', '6', 'abc', '']) {
      component.jumpToValue.set(value);
      component.onJumpTo();
    }

    expect(selected).toEqual([]);
  });

  it('should mark completed positions and hide them via the toggle', () => {
    fixture.componentRef.setInput('completedPositions', [2, 4]);
    fixture.componentRef.setInput('showVisibilityToggle', true);
    fixture.componentRef.setInput('hideCompletedLabel', 'Hide answered');
    fixture.detectChanges();

    let items = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(items[1].classList.contains('completed')).toBe(true);
    expect(items[3].classList.contains('completed')).toBe(true);

    component.onToggleCompleted();
    fixture.detectChanges();

    items = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(items.length).toBe(3);
    expect(Array.from(items).map((item: any) => item.textContent.trim())).toEqual(['1', '3', '5']);
  });

  it('should not render the visibility toggle by default', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.jump-to l8c-button');
    expect(buttons.length).toBe(0);
  });

  it('should render info positions with an icon and the info aria label', () => {
    fixture.componentRef.setInput('infoPositions', [2]);
    fixture.componentRef.setInput('infoItemAriaLabel', 'Info');
    fixture.componentRef.setInput('itemAriaLabel', 'Question');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(items[1].querySelector('l8c-icon')).toBeTruthy();
    expect(items[1].getAttribute('aria-label')).toBe('Info 2');
    expect(items[0].getAttribute('aria-label')).toBe('Question 1');
  });

  describe('windowing', () => {
    const texts = () =>
      Array.from(fixture.nativeElement.querySelectorAll('.nav-item')).map((item: any) =>
        item.textContent.trim(),
      );

    beforeEach(() => {
      fixture.componentRef.setInput('totalItems', 42);
      fixture.componentRef.setInput('maxVisibleItems', 10);
    });

    it('should render at most maxVisibleItems numbers, starting at the beginning', () => {
      fixture.componentRef.setInput('activeItem', 1);
      fixture.detectChanges();

      expect(texts()).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
      expect(fixture.nativeElement.querySelectorAll('.nav-ellipsis').length).toBe(1);
    });

    it('should center the window on the active item', () => {
      fixture.componentRef.setInput('activeItem', 20);
      fixture.detectChanges();

      expect(texts()[0]).toBe('15');
      expect(texts()[9]).toBe('24');
      expect(fixture.nativeElement.querySelectorAll('.nav-ellipsis').length).toBe(2);
    });

    it('should clamp the window at the end', () => {
      fixture.componentRef.setInput('activeItem', 42);
      fixture.detectChanges();

      expect(texts()[0]).toBe('33');
      expect(texts()[9]).toBe('42');
    });

    it('should page the window via the ellipsis buttons', () => {
      fixture.componentRef.setInput('activeItem', 20);
      fixture.detectChanges();

      const ellipses = fixture.nativeElement.querySelectorAll('.nav-ellipsis');
      ellipses[0].click();
      ellipses[1].click();

      expect(selected).toEqual([5, 34]);
    });

    it('should show "active / total"', () => {
      fixture.componentRef.setInput('activeItem', 7);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.navigation-count').textContent.trim()).toBe(
        '7 / 42',
      );
    });

    it('should window the remaining items when completed ones are hidden', () => {
      fixture.componentRef.setInput('completedPositions', [1, 2, 3]);
      fixture.componentRef.setInput('activeItem', 4);
      component.onToggleCompleted();
      fixture.detectChanges();

      expect(texts()).toEqual(['4', '5', '6', '7', '8', '9', '10', '11', '12', '13']);
    });
  });

  it('should render back link and done button only when labels are set', () => {
    expect(fixture.nativeElement.querySelector('.navigation-topbar')).toBeFalsy();

    fixture.componentRef.setInput('backLabel', 'Back');
    fixture.componentRef.setInput('doneLabel', 'Done');
    fixture.detectChanges();

    let backEmitted = false;
    let doneEmitted = false;
    component.backClicked.subscribe(() => (backEmitted = true));
    component.doneClicked.subscribe(() => (doneEmitted = true));

    fixture.nativeElement.querySelector('.back-link').click();
    expect(backEmitted).toBe(true);

    fixture.nativeElement.querySelector('.navigation-topbar l8c-button button').click();
    expect(doneEmitted).toBe(true);
  });
});
