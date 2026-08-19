import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cSideNavComponent } from './side-nav.component';
import { SideNavItem } from './side-nav.model';

describe('L8cSideNavComponent', () => {
  let component: L8cSideNavComponent;
  let fixture: ComponentFixture<L8cSideNavComponent>;
  let navigated: string[];
  let collapsedChanges: boolean[];

  const items: SideNavItem[] = [
    { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    {
      key: 'manage',
      label: 'Manage',
      icon: 'settings',
      children: [
        { key: 'manage-users', label: 'Users' },
        { key: 'manage-groups', label: 'Groups' },
      ],
    },
  ];

  function navItems(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.nav-item'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cSideNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cSideNavComponent);
    component = fixture.componentInstance;
    navigated = [];
    collapsedChanges = [];
    component.itemSelected.subscribe((key) => navigated.push(key));
    component.collapsedChange.subscribe((value) => collapsedChanges.push(value));
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all top-level items with their labels', () => {
    const buttons = navItems();
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Overview');
    expect(buttons[1].textContent).toContain('Manage');
  });

  it('should emit itemSelected when a leaf item is clicked', () => {
    navItems()[0].click();

    expect(navigated).toEqual(['overview']);
  });

  it('should navigate to the first child when an expanded section is clicked', () => {
    navItems()[1].click();

    expect(navigated).toEqual(['manage-users']);
  });

  it('should mark the active section including via its children', () => {
    fixture.componentRef.setInput('active', 'manage-groups');
    fixture.detectChanges();

    const buttons = navItems();
    expect(buttons[1].classList.contains('active')).toBe(true);
    expect(buttons[1].getAttribute('aria-current')).toBe('page');
    expect(buttons[0].classList.contains('active')).toBe(false);
  });

  it('should show sub-items only while their section is active', () => {
    expect(fixture.nativeElement.querySelectorAll('.nav-sub-item').length).toBe(0);

    fixture.componentRef.setInput('active', 'manage-users');
    fixture.detectChanges();

    const subItems = fixture.nativeElement.querySelectorAll('.nav-sub-item');
    expect(subItems.length).toBe(2);
    expect(subItems[0].classList.contains('active')).toBe(true);

    subItems[1].click();
    expect(navigated).toEqual(['manage-groups']);
  });

  it('should toggle collapse, emit the change and shrink the rail', () => {
    const aside = fixture.nativeElement.querySelector('.side-nav');
    expect(aside.style.width).toBe('240px');

    fixture.nativeElement.querySelector('.collapse-toggle').click();
    fixture.detectChanges();

    expect(collapsedChanges).toEqual([true]);
    expect(aside.style.width).toBe('68px');
    expect(fixture.nativeElement.querySelector('.nav-item-label')).toBeNull();

    fixture.nativeElement.querySelector('.collapse-toggle').click();
    fixture.detectChanges();

    expect(collapsedChanges).toEqual([true, false]);
    expect(aside.style.width).toBe('240px');
  });

  it('should respect custom width inputs', () => {
    fixture.componentRef.setInput('width', 300);
    fixture.componentRef.setInput('collapsedWidth', 50);
    fixture.detectChanges();

    const aside = fixture.nativeElement.querySelector('.side-nav');
    expect(aside.style.width).toBe('300px');

    component.collapsed.set(true);
    fixture.detectChanges();
    expect(aside.style.width).toBe('50px');
  });

  it('should use the collapse and expand labels', () => {
    fixture.componentRef.setInput('collapseLabel', 'Einklappen');
    fixture.componentRef.setInput('expandLabel', 'Ausklappen');
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('.collapse-toggle');
    expect(toggle.title).toBe('Einklappen');
    expect(toggle.textContent).toContain('Einklappen');

    component.collapsed.set(true);
    fixture.detectChanges();
    expect(toggle.title).toBe('Ausklappen');
  });

  describe('collapsed flyout', () => {
    beforeEach(() => {
      component.collapsed.set(true);
      fixture.detectChanges();
    });

    it('should open a flyout with the children instead of navigating', () => {
      navItems()[1].click();
      fixture.detectChanges();

      const flyout = fixture.nativeElement.querySelector('.nav-flyout');
      expect(navigated).toEqual([]);
      expect(flyout).toBeTruthy();
      expect(flyout.querySelectorAll('.nav-flyout-item').length).toBe(2);
    });

    it('should navigate and close the flyout when a flyout item is clicked', () => {
      navItems()[1].click();
      fixture.detectChanges();

      fixture.nativeElement.querySelectorAll('.nav-flyout-item')[1].click();
      fixture.detectChanges();

      expect(navigated).toEqual(['manage-groups']);
      expect(fixture.nativeElement.querySelector('.nav-flyout')).toBeNull();
    });

    it('should toggle the flyout closed when the section is clicked again', () => {
      navItems()[1].click();
      fixture.detectChanges();
      navItems()[1].click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.nav-flyout')).toBeNull();
    });

    it('should close the flyout on escape', () => {
      navItems()[1].click();
      fixture.detectChanges();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.nav-flyout')).toBeNull();
    });

    it('should close the flyout when clicking outside the nav', () => {
      navItems()[1].click();
      fixture.detectChanges();

      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.nav-flyout')).toBeNull();
    });

    it('should still navigate directly for leaf items', () => {
      navItems()[0].click();

      expect(navigated).toEqual(['overview']);
    });
  });

  it('should track the hovered item', () => {
    const button = navItems()[0];

    button.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(button.classList.contains('hover')).toBe(true);

    button.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(button.classList.contains('hover')).toBe(false);
  });

  it('should fall back to the house icon without an item icon', () => {
    expect(component.getIconName(undefined)).toBe('house');
    expect(component.getIconName('settings')).toBe('settings');
  });
});
