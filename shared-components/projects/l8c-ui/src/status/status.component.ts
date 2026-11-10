import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusTone } from '../table/table.component';
import { StringInput, optionalOneOf, stringInput } from '../shared/input-validation';

const TONES: readonly StatusTone[] = ['neutral', 'primary', 'success', 'warning', 'error'];
const toneTransform = optionalOneOf('l8c-status', 'tone', TONES);

/** Workflow statuses with their own `--status-*` colors */
export type WorkflowStatus =
  'draft' | 'ready' | 'open' | 'in-progress' | 'completed' | 'done' | 'archived';

const WORKFLOW_STATUSES: Record<string, WorkflowStatus> = {
  draft: 'draft',
  ready: 'ready',
  open: 'open',
  'in progress': 'in-progress',
  'in-progress': 'in-progress',
  completed: 'completed',
  done: 'done',
  archived: 'archived',
};

/** Known statuses and their semantic tone; unknown values fall back to neutral */
const STATUS_TONES: Record<string, StatusTone> = {
  // ready / open / active
  ready: 'primary',
  scheduled: 'primary',
  open: 'primary',
  sent: 'primary',
  active: 'primary',
  // success / done
  completed: 'success',
  done: 'success',
  valid: 'success',
  approved: 'success',
  submitted: 'success',
  resubmitted: 'success',
  // pending / review
  pending: 'warning',
  'in progress': 'warning',
  'in-progress': 'warning',
  review: 'warning',
  'in review': 'warning',
  'changes requested': 'warning',
  // neutral
  draft: 'neutral',
  archived: 'neutral',
  inactive: 'neutral',
  entfällt: 'neutral',
  closed: 'neutral',
  // error
  failed: 'error',
  error: 'error',
  overdue: 'error',
  expired: 'error',
};

/**
 * Row / workflow status chip: a tone dot plus the status text. Workflow
 * statuses (Draft, Ready, Open, In Progress, Completed, Done, Archived)
 * use the `--status-<name>` / `--status-<name>-bg` tokens with the shared
 * `--status-border`; other known statuses map to a semantic tone (pill
 * tokens `neutral`, `info`, `success`, `warning`, `error` with `-bg` and
 * `-border`). Unknown values are neutral; `tone` overrides both. The
 * element carries `data-tone` or `data-status`, so tests can query it.
 */
@Component({
  selector: 'l8c-status',
  template: `
    <span
      class="badge status-badge"
      [attr.data-tone]="workflowStatus() ? null : resolvedTone()"
      [attr.data-status]="workflowStatus()"
    >
      <span class="status-dot"></span>
      {{ status() }}
    </span>
  `,
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L8cStatusComponent {
  status = input.required<string, StringInput>({
    transform: stringInput('l8c-status', 'status', ''),
  });
  /** Overrides the mapping of the status to a tone */
  tone = input<StatusTone | null, StatusTone | null | undefined>(null, {
    transform: (value) => toneTransform(value) ?? null,
  });

  protected resolvedTone = computed<StatusTone>(
    () => this.tone() ?? STATUS_TONES[this.status().toLowerCase()] ?? 'neutral',
  );

  protected workflowStatus = computed<WorkflowStatus | null>(() =>
    this.tone() ? null : (WORKFLOW_STATUSES[this.status().toLowerCase()] ?? null),
  );
}
