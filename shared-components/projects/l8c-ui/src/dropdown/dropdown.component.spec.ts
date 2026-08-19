import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cDropdownComponent, DropdownOption } from './dropdown.component';

describe('L8cDropdownComponent', () => {
  let component: L8cDropdownComponent;
  let fixture: ComponentFixture<L8cDropdownComponent>;

  function toggleButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.dropdown-toggle');
  }

  function menu(): HTMLElement {
    return fixture.nativeElement.querySelector('.dropdown-menu');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cDropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cDropdownComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', ['Option A', 'Option B']);
    fixture.componentRef.setInput('defaultValue', 'Pick one');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default value when nothing is selected', () => {
    expect(toggleButton().textContent.trim()).toBe('Pick one');
  });

  it('should display the selected input value', () => {
    fixture.componentRef.setInput('selected', 'Option B');
    fixture.detectChanges();

    expect(toggleButton().textContent.trim()).toBe('Option B');
  });

  it('should always display the default value when showSelectedValue is false', () => {
    fixture.componentRef.setInput('selected', 'Option B');
    fixture.componentRef.setInput('showSelectedValue', false);
    fixture.detectChanges();

    expect(toggleButton().textContent.trim()).toBe('Pick one');
  });

  it('should open and close the menu via toggle', () => {
    toggleButton().click();
    fixture.detectChanges();
    expect(menu().classList.contains('open')).toBe(true);

    toggleButton().click();
    fixture.detectChanges();
    expect(menu().classList.contains('open')).toBe(false);
  });

  it('should render all options', () => {
    component.open.set(true);
    fixture.detectChanges();

    const items = menu().querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent!.trim()).toBe('Option A');
  });

  it('should select an option, emit it and close the menu', () => {
    let emitted: string | undefined;
    component.selectedValue.subscribe((value) => (emitted = value));
    component.open.set(true);
    fixture.detectChanges();

    menu().querySelectorAll('li')[1].dispatchEvent(new MouseEvent('mousedown'));
    fixture.detectChanges();

    expect(emitted).toBe('Option B');
    expect(component.open()).toBe(false);
    expect(toggleButton().textContent.trim()).toBe('Option B');
  });

  it('should mark an active selection within a selection group', () => {
    fixture.componentRef.setInput('selectionGroup', 'filter');
    fixture.detectChanges();
    expect(component.isActiveSelection()).toBe(false);

    component.select('Option A');
    fixture.detectChanges();

    expect(component.isActiveSelection()).toBe(true);
    expect(toggleButton().classList.contains('dropdown-toggle-selected')).toBe(true);
  });

  it('should open on button hover and close after the leave timeout', async () => {
    toggleButton().dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(component.open()).toBe(true);

    toggleButton().dispatchEvent(new MouseEvent('mouseleave'));
    await new Promise((resolve) => setTimeout(resolve, 150));
    fixture.detectChanges();

    expect(component.open()).toBe(false);
  });

  it('should stay open when the pointer moves onto the menu', async () => {
    toggleButton().dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    toggleButton().dispatchEvent(new MouseEvent('mouseleave'));
    menu().dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise((resolve) => setTimeout(resolve, 150));
    fixture.detectChanges();

    expect(component.open()).toBe(true);
  });

  describe('with submenus', () => {
    const optionsWithSubmenus: DropdownOption[] = [
      { label: 'Simple', value: 'simple' },
      {
        label: 'More',
        submenu: [{ label: 'Sub A', value: 'sub-a', icon: 'check' }, { label: 'Sub B' }],
      },
    ];

    beforeEach(() => {
      fixture.componentRef.setInput('optionsWithSubmenus', optionsWithSubmenus);
      component.open.set(true);
      fixture.detectChanges();
    });

    it('should render top-level items instead of the plain options', () => {
      const items = menu().querySelectorAll(':scope > li');
      expect(component.hasSubmenus()).toBe(true);
      expect(items.length).toBe(2);
      expect(items[1].classList.contains('has-submenu')).toBe(true);
    });

    it('should select a plain item by its value', () => {
      let emitted: string | undefined;
      component.selectedValue.subscribe((value) => (emitted = value));

      menu()
        .querySelectorAll(':scope > li')[0]
        .querySelector('.dropdown-item-content')!
        .dispatchEvent(new MouseEvent('mousedown'));

      expect(emitted).toBe('simple');
    });

    it('should open the submenu on hover of its parent item', () => {
      const parent = menu().querySelectorAll(':scope > li')[1];
      parent.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      expect(component.openSubmenu()).toBe('More');
      expect(parent.querySelector('.dropdown-submenu')!.classList.contains('open')).toBe(true);
    });

    it('should close the submenu when hovering an item without one', () => {
      component.openSubmenu.set('More');

      menu().querySelectorAll(':scope > li')[0].dispatchEvent(new MouseEvent('mouseenter'));

      expect(component.openSubmenu()).toBeNull();
    });

    it('should toggle the submenu on click without selecting', () => {
      let emitted = false;
      component.selectedValue.subscribe(() => (emitted = true));
      const content = menu()
        .querySelectorAll(':scope > li')[1]
        .querySelector('.dropdown-item-content')!;

      content.dispatchEvent(new MouseEvent('mousedown'));
      fixture.detectChanges();
      expect(component.openSubmenu()).toBe('More');

      content.dispatchEvent(new MouseEvent('mousedown'));
      fixture.detectChanges();
      expect(component.openSubmenu()).toBeNull();
      expect(emitted).toBe(false);
    });

    it('should select from the submenu, falling back to the label without a value', () => {
      let emitted: string | undefined;
      component.selectedValue.subscribe((value) => (emitted = value));
      component.openSubmenu.set('More');
      fixture.detectChanges();

      const subItems = menu().querySelectorAll('.dropdown-submenu li');
      subItems[0].dispatchEvent(new MouseEvent('mousedown'));
      expect(emitted).toBe('sub-a');

      component.open.set(true);
      fixture.detectChanges();
      subItems[1].dispatchEvent(new MouseEvent('mousedown'));
      expect(emitted).toBe('Sub B');
      expect(component.open()).toBe(false);
    });
  });
});
