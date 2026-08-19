import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cAccountMenuComponent, AccountMenuOption } from './account-menu.component';

describe('L8cAccountMenuComponent', () => {
  let component: L8cAccountMenuComponent;
  let fixture: ComponentFixture<L8cAccountMenuComponent>;

  const menuOptions: AccountMenuOption[] = [
    { label: 'Account', value: 'account-header', type: 'header' },
    { label: 'Profile', value: 'profile', type: 'action' },
    { label: '', value: 'divider-1', type: 'divider' },
    {
      label: 'Theme',
      value: 'theme',
      type: 'button-group',
      buttons: [
        { label: 'Light', value: 'Light', isActive: true },
        { label: 'Dark', value: 'Dark' },
      ],
    },
    { label: 'Logout', value: 'logout' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cAccountMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cAccountMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('userName', 'Jane Doe');
    fixture.componentRef.setInput('menuOptions', menuOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the user name', () => {
    const name = fixture.nativeElement.querySelector('.account-name');
    expect(name.textContent.trim()).toBe('Jane Doe');
  });

  it('should be closed initially', () => {
    expect(component.isOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.account-menu-dropdown')).toBeNull();
  });

  it('should open and close via toggle', () => {
    fixture.nativeElement.querySelector('.account-toggle').click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.account-menu-dropdown')).toBeTruthy();

    fixture.nativeElement.querySelector('.account-toggle').click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should render headers, dividers, button groups and items', () => {
    component.toggle();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.menu-header').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.menu-divider').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.group-button').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.account-menu-item').length).toBe(2);
  });

  it('should emit the selected option and close the menu', () => {
    let selected: string | undefined;
    component.optionSelected.subscribe((value) => (selected = value));
    component.toggle();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.account-menu-item');
    items[items.length - 1].click();
    fixture.detectChanges();

    expect(selected).toBe('logout');
    expect(component.isOpen()).toBe(false);
  });

  it('should keep the menu open for toggle values like theme buttons', () => {
    let selected: string | undefined;
    component.optionSelected.subscribe((value) => (selected = value));
    component.toggle();
    fixture.detectChanges();

    const groupButtons = fixture.nativeElement.querySelectorAll('.group-button');
    groupButtons[1].click();
    fixture.detectChanges();

    expect(selected).toBe('Dark');
    expect(component.isOpen()).toBe(true);
  });

  it('should track the hovered option', () => {
    component.toggle();
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector('.account-menu-item');
    item.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(component.hoveredOption()).toBe('profile');
    expect(item.classList.contains('hovered')).toBe(true);

    item.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(component.hoveredOption()).toBeNull();
  });

  it('should close when clicking outside the menu', () => {
    component.toggle();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('should stay open when clicking inside the menu', () => {
    component.toggle();
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('.account-menu-dropdown');
    dropdown.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
  });
});
