import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cCardComponent } from './card.component';

describe('L8cCardComponent', () => {
  let component: L8cCardComponent;
  let fixture: ComponentFixture<L8cCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cCardComponent);
    component = fixture.componentInstance;
    // Do not call detectChanges here - let each test control it
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title when provided', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const cardElement = fixture.nativeElement;
    const titleElement = cardElement.querySelector('.card-title');

    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Test Title');
  });

  it('should apply correct elevation class', () => {
    fixture.componentRef.setInput('elevation', 'high');
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.firstElementChild;
    expect(cardElement.classList.contains('elevation-high')).toBeTruthy();
  });

  it('should apply clickable class when clickable is true', () => {
    fixture.componentRef.setInput('clickable', true);
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.firstElementChild;
    expect(cardElement.classList.contains('clickable')).toBeTruthy();
  });

  it('should emit cardClick event when clicked and clickable', () => {
    fixture.componentRef.setInput('clickable', true);
    let emitted = false;
    component.cardClick.subscribe(() => {
      emitted = true;
    });
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.firstElementChild;
    cardElement.click();

    expect(emitted).toBeTruthy();
  });

  it('should not emit cardClick event when not clickable', () => {
    fixture.componentRef.setInput('clickable', false);
    let emitted = false;
    component.cardClick.subscribe(() => {
      emitted = true;
    });
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.firstElementChild;
    cardElement.click();

    expect(emitted).toBeFalsy();
  });

  it('should apply correct padding class', () => {
    fixture.componentRef.setInput('padding', 'large');
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.firstElementChild;
    expect(cardElement.classList.contains('padding-large')).toBeTruthy();
  });

  it('should show collapse button when collapsible is true', () => {
    fixture.componentRef.setInput('collapsible', true);
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    const collapseButton = fixture.nativeElement.querySelector('.collapse-button');
    expect(collapseButton).toBeTruthy();
  });

  it('should not show collapse button when collapsible is false', () => {
    fixture.componentRef.setInput('collapsible', false);
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    const collapseButton = fixture.nativeElement.querySelector('.collapse-button');
    expect(collapseButton).toBeFalsy();
  });

  it('should toggle collapsed state when collapse button is clicked', () => {
    fixture.componentRef.setInput('collapsible', true);
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    expect(component.collapsed()).toBeFalsy();

    const collapseButton = fixture.nativeElement.querySelector('.collapse-button');
    collapseButton.click();
    fixture.detectChanges();

    expect(component.collapsed()).toBeTruthy();

    collapseButton.click();
    fixture.detectChanges();

    expect(component.collapsed()).toBeFalsy();
  });

  it('should hide content when collapsed', () => {
    fixture.componentRef.setInput('collapsible', true);
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    let contentElement = fixture.nativeElement.querySelector('.card-content');
    expect(contentElement).toBeTruthy();

    component.collapsed.set(true);
    fixture.detectChanges();

    contentElement = fixture.nativeElement.querySelector('.card-content');
    expect(contentElement).toBeFalsy();
  });

  it('should sync the collapsed state from the isExpanded input when collapsible', () => {
    fixture.componentRef.setInput('collapsible', true);
    fixture.componentRef.setInput('isExpanded', false);
    fixture.detectChanges();
    expect(component.collapsed()).toBeTruthy();

    fixture.componentRef.setInput('isExpanded', true);
    fixture.detectChanges();
    expect(component.collapsed()).toBeFalsy();
  });

  it('should ignore isExpanded when not collapsible', () => {
    fixture.componentRef.setInput('collapsible', false);
    fixture.componentRef.setInput('isExpanded', false);
    fixture.detectChanges();

    expect(component.collapsed()).toBeFalsy();
  });

  it('should emit expandedChange when toggling', () => {
    fixture.componentRef.setInput('collapsible', true);
    fixture.componentRef.setInput('title', 'Test');
    const emitted: boolean[] = [];
    component.expandedChange.subscribe((expanded) => emitted.push(expanded));
    fixture.detectChanges();

    const collapseButton = fixture.nativeElement.querySelector('.collapse-button');
    collapseButton.click();
    collapseButton.click();

    expect(emitted).toEqual([false, true]);
  });

  it('should apply collapsed class when collapsed', () => {
    fixture.componentRef.setInput('collapsible', true);
    fixture.componentRef.setInput('title', 'Test');
    component.collapsed.set(true);
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.firstElementChild;
    expect(cardElement.classList.contains('collapsed')).toBeTruthy();
  });
});
