import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cProductSwitcherComponent } from './product-switcher.component';
import { PlatformProduct } from './product-switcher.model';

describe('L8cProductSwitcherComponent', () => {
  let component: L8cProductSwitcherComponent;
  let fixture: ComponentFixture<L8cProductSwitcherComponent>;

  const products: PlatformProduct[] = [
    { key: 'survey', label: 'Survey', icon: 'clipboard-list', desc: 'Questionnaires' },
    { key: 'toolbox', label: 'Toolbox', desc: 'Security tools' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cProductSwitcherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cProductSwitcherComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('products', products);
    fixture.componentRef.setInput('active', 'survey');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the active product label', () => {
    const label = fixture.nativeElement.querySelector('.switcher-label');
    expect(label.textContent.trim()).toBe('Survey');
  });

  it('should fall back to the first product when active is unknown', () => {
    fixture.componentRef.setInput('active', 'does-not-exist');
    fixture.detectChanges();

    expect(component.activeProduct().key).toBe('survey');
  });

  it('should fall back to a platform default when no products exist', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('active', undefined);
    fixture.detectChanges();

    expect(component.activeProduct()).toEqual({ key: 'platform', label: 'Platform' });
  });

  it('should hide the label when collapsed', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.switcher-label')).toBeNull();
  });

  it('should open the menu and list all products', () => {
    fixture.nativeElement.querySelector('.switcher-button').click();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.menu-item');
    expect(component.open()).toBe(true);
    expect(items.length).toBe(2);
  });

  it('should mark the active product in the menu', () => {
    component.toggleMenu();
    fixture.detectChanges();

    const activeItems = fixture.nativeElement.querySelectorAll('.menu-item.active');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].textContent).toContain('Survey');
  });

  it('should emit onSwitch and close the menu when a product is selected', () => {
    let switchedTo: string | undefined;
    component.onSwitch.subscribe((key) => (switchedTo = key));
    component.toggleMenu();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.menu-item');
    items[1].click();
    fixture.detectChanges();

    expect(switchedTo).toBe('toolbox');
    expect(component.open()).toBe(false);
  });

  it('should close the menu on escape', () => {
    component.toggleMenu();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.open()).toBe(false);
  });

  it('should close the menu when clicking outside', () => {
    component.toggleMenu();
    fixture.detectChanges();

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();

    expect(component.open()).toBe(false);
  });

  it('should default to the layout-grid icon when a product has none', () => {
    expect(component.getIconName(undefined)).toBe('layout-grid');
    expect(component.getIconName('clipboard-list')).toBe('clipboard-list');
  });
});
