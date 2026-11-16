import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L8cNumberInputComponent } from './number-input.component';

describe('L8cNumberInputComponent', () => {
  let component: L8cNumberInputComponent;
  let fixture: ComponentFixture<L8cNumberInputComponent>;

  function field(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function typeValue(text: string) {
    const input = field();
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [L8cNumberInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(L8cNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit valueChange and call the registered onChange on typing', () => {
    let emitted: number | undefined;
    let cvaValue: number | undefined;
    component.valueChange.subscribe((value) => (emitted = value));
    component.registerOnChange((value: number) => (cvaValue = value));

    typeValue('42');

    expect(emitted).toBe(42);
    expect(cvaValue).toBe(42);
    expect(component.value()).toBe(42);
  });

  it('should fall back to 0 for unparsable input and clear the text', () => {
    typeValue('abc');
    expect(component.value()).toBe(0);
    expect(field().value).toBe('');
  });

  describe('keyboard and paste filter', () => {
    function press(key: string, options: KeyboardEventInit = {}): KeyboardEvent {
      const event = new KeyboardEvent('keydown', { key, cancelable: true, ...options });
      field().dispatchEvent(event);
      return event;
    }

    function paste(text: string): void {
      // jsdom has no DataTransfer, so the clipboard is faked on a plain event
      const event = new Event('paste', { cancelable: true }) as ClipboardEvent;
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: () => text },
      });
      field().dispatchEvent(event);
      fixture.detectChanges();
    }

    it('is a text field with the numeric keyboard and spinbutton semantics', () => {
      expect(field().type).toBe('text');
      expect(field().getAttribute('inputmode')).toBe('numeric');
      expect(field().getAttribute('role')).toBe('spinbutton');

      fixture.componentRef.setInput('decimals', 2);
      fixture.componentRef.setInput('min', 1);
      fixture.componentRef.setInput('max', 9);
      fixture.detectChanges();
      expect(field().getAttribute('inputmode')).toBe('decimal');
      expect(field().getAttribute('aria-valuemin')).toBe('1');
      expect(field().getAttribute('aria-valuemax')).toBe('9');
    });

    it('lets digits, control keys and shortcuts through and swallows letters', () => {
      field().value = '';
      expect(press('7').defaultPrevented).toBe(false);
      expect(press('Backspace').defaultPrevented).toBe(false);
      expect(press('Tab').defaultPrevented).toBe(false);
      expect(press('a', { ctrlKey: true }).defaultPrevented).toBe(false);
      expect(press('a').defaultPrevented).toBe(true);
      expect(press('e').defaultPrevented).toBe(true);
      expect(press('+').defaultPrevented).toBe(true);
      expect(press(' ').defaultPrevented).toBe(true);
    });

    it('allows one leading minus only when min permits a negative value', () => {
      field().value = '';
      field().setSelectionRange(0, 0);
      expect(press('-').defaultPrevented).toBe(false);

      field().value = '5';
      field().setSelectionRange(1, 1);
      expect(press('-').defaultPrevented).toBe(true);

      fixture.componentRef.setInput('min', 0);
      fixture.detectChanges();
      field().value = '';
      field().setSelectionRange(0, 0);
      expect(press('-').defaultPrevented).toBe(true);
    });

    it('allows one decimal separator only with decimals above 0', () => {
      field().value = '3';
      field().setSelectionRange(1, 1);
      expect(press('.').defaultPrevented).toBe(true);

      fixture.componentRef.setInput('decimals', 2);
      fixture.detectChanges();
      field().value = '3';
      field().setSelectionRange(1, 1);
      expect(press('.').defaultPrevented).toBe(false);
      expect(press(',').defaultPrevented).toBe(false);

      field().value = '3.5';
      field().setSelectionRange(3, 3);
      expect(press('.').defaultPrevented).toBe(true);
    });

    it('keeps only the usable characters of a paste', () => {
      fixture.componentRef.setInput('decimals', 2);
      fixture.detectChanges();
      field().value = '';
      field().setSelectionRange(0, 0);

      paste(' 1,2a3.4-5 ');

      expect(field().value).toBe('1,2345');
      expect(component.value()).toBe(1.2345);
    });

    it('drops characters that arrive through input events directly', () => {
      typeValue('12abc3');
      expect(field().value).toBe('123');
      expect(component.value()).toBe(123);
    });

    it('reads a comma as the decimal separator', () => {
      fixture.componentRef.setInput('decimals', 1);
      fixture.detectChanges();
      typeValue('2,5');
      expect(component.value()).toBe(2.5);
    });

    it('steps with the arrow keys', () => {
      fixture.componentRef.setInput('step', 3);
      component.writeValue(6);
      fixture.detectChanges();

      expect(press('ArrowUp').defaultPrevented).toBe(true);
      expect(component.value()).toBe(9);
      press('ArrowDown');
      press('ArrowDown');
      expect(component.value()).toBe(3);
    });
  });

  it('should format the display value with the configured decimals', () => {
    fixture.componentRef.setInput('decimals', 2);
    component.writeValue(3.5);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('3.50');
  });

  it('should keep the raw text while typing and reformat on blur', () => {
    fixture.componentRef.setInput('decimals', 2);
    typeValue('3.456');

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('3.456');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.value).toBe('3.46');
  });

  it('should step with the arrow buttons using the configured step', () => {
    fixture.componentRef.setInput('step', 5);
    component.writeValue(10);
    fixture.detectChanges();

    const [up, down] = fixture.nativeElement.querySelectorAll('button');
    up.click();
    expect(component.value()).toBe(15);
    down.click();
    down.click();
    expect(component.value()).toBe(5);
  });

  it('should clamp the value to min and max', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    fixture.detectChanges();

    typeValue('99');
    expect(component.value()).toBe(10);

    component.writeValue(0);
    fixture.detectChanges();
    const [, down] = fixture.nativeElement.querySelectorAll('button');
    down.click();
    expect(component.value()).toBe(0);
  });

  it('should update the value via writeValue and reset invalid values to 0', () => {
    component.writeValue(7);
    expect(component.value()).toBe(7);

    component.writeValue(null);
    expect(component.value()).toBe(0);
  });

  it('should disable the field and the arrows via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons.every((btn) => btn.disabled)).toBe(true);
  });

  it('should call onTouched on blur', () => {
    let touched = false;
    component.registerOnTouched(() => (touched = true));

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(touched).toBe(true);
  });

  it('should render suffix and hint when set', () => {
    fixture.componentRef.setInput('suffix', '%');
    fixture.componentRef.setInput('hint', 'Enter a whole number');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.number-suffix').textContent.trim()).toBe('%');
    expect(fixture.nativeElement.querySelector('.number-hint').textContent.trim()).toBe(
      'Enter a whole number',
    );
  });
  describe('input validation', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => warn.mockRestore());

    it('treats a step of 0 or a non-numeric step as 1', () => {
      fixture.componentRef.setInput('step', 0);
      fixture.detectChanges();
      component.increment();
      expect(component.value()).toBe(1);

      fixture.componentRef.setInput('step', 'big');
      fixture.detectChanges();
      component.increment();
      expect(component.value()).toBe(2);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('clamps decimals to 0..20 and parses numeric strings for min and max', () => {
      fixture.componentRef.setInput('decimals', 99);
      fixture.componentRef.setInput('min', '5');
      fixture.componentRef.setInput('max', '10');
      fixture.detectChanges();

      expect(component.decimals()).toBe(20);
      component.writeValue(2);
      component.increment();
      expect(component.value()).toBe(5);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('ignores a non-numeric max', () => {
      fixture.componentRef.setInput('max', 'lots');
      fixture.detectChanges();

      expect(component.max()).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});
