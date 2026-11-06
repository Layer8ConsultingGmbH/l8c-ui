import {
  durationFromSegments,
  durationToSegments,
  formatDuration,
  parseDuration,
} from './duration-format';
import { applySegmentDigits } from './segments';

describe('parseDuration', () => {
  it('reads the stored DD:HH:MM:SS format', () => {
    expect(parseDuration('01:02:03:04')).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4 });
  });

  it('reads legacy HH:MM:SS values as zero days', () => {
    expect(parseDuration('12:30:00')).toEqual({ days: 0, hours: 12, minutes: 30, seconds: 0 });
  });

  it('carries legacy hours beyond a day into the days segment', () => {
    expect(parseDuration('48:15:00')).toEqual({ days: 2, hours: 0, minutes: 15, seconds: 0 });
  });

  it('reads up to a year of days', () => {
    expect(parseDuration('365:23:59:59')).toEqual({
      days: 365,
      hours: 23,
      minutes: 59,
      seconds: 59,
    });
  });

  it('rejects values above the segment maximum', () => {
    expect(parseDuration('99:99:99')).toBeNull();
    expect(parseDuration('366:00:00:00')).toBeNull();
    expect(parseDuration('00:24:00:00')).toBeNull();
    expect(parseDuration('00:00:60:00')).toBeNull();
  });

  it('rejects anything that is not a duration', () => {
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('about two hours')).toBeNull();
    expect(parseDuration('01:02')).toBeNull();
    expect(parseDuration('01:-2:03:04')).toBeNull();
    expect(parseDuration(42)).toBeNull();
    expect(parseDuration(null)).toBeNull();
  });
});

describe('formatDuration', () => {
  it('pads every segment to two digits', () => {
    expect(formatDuration({ days: 0, hours: 1, minutes: 2, seconds: 3 })).toBe('00:01:02:03');
  });
});

describe('durationToSegments', () => {
  it('splits a stored value into segment texts', () => {
    expect(durationToSegments('01:02:03:04')).toEqual(['01', '02', '03', '04']);
  });

  it('yields empty segments for unparsable input', () => {
    expect(durationToSegments('99:99:99')).toEqual(['', '', '', '']);
    expect(durationToSegments('')).toEqual(['', '', '', '']);
  });
});

describe('durationFromSegments', () => {
  it('fills empty segments with zeros once one segment is filled', () => {
    expect(durationFromSegments(['', '1', '', ''])).toBe('00:01:00:00');
  });

  it('pads single digits', () => {
    expect(durationFromSegments(['1', '2', '3', '4'])).toBe('01:02:03:04');
  });

  it('stays empty while no segment is filled', () => {
    expect(durationFromSegments(['', '', '', ''])).toBe('');
  });
});

describe('applySegmentDigits', () => {
  const max = [365, 23, 59, 59];

  it('hands over to the next segment once a segment is full', () => {
    expect(applySegmentDigits(['', '', '', ''], max, 1, '1111')).toEqual({
      texts: ['', '11', '11', ''],
      focusIndex: 3,
    });
  });

  it('hands over right away when a digit cannot start a valid value', () => {
    expect(applySegmentDigits(['', '', '', ''], max, 2, '75')).toEqual({
      texts: ['', '', '07', '5'],
      focusIndex: 3,
    });
  });

  it('carries a day value beyond the maximum into the hours', () => {
    // "366" is past the cap, so the third digit starts the hours; a 6 can
    // never become a valid two-digit hour, so the focus moves on again
    expect(applySegmentDigits(['', '', '', ''], max, 0, '366')).toEqual({
      texts: ['36', '06', '', ''],
      focusIndex: 2,
    });
  });

  it('stops at the last segment', () => {
    expect(applySegmentDigits(['', '', '', ''], max, 3, '5959')).toEqual({
      texts: ['', '', '', '59'],
      focusIndex: 3,
    });
  });
});
