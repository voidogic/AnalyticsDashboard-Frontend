import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService, Event as EventInterface, SubEvent } from '../../services/data.service';

@Component({
  selector: 'app-admin-events',
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.css']
})
export class AdminEventsComponent implements OnInit {
  events: EventInterface[] = [];
  subEvents: SubEvent[] = [];
  selectedEvent: EventInterface | null = null;
  showEventForm = false;
  showSubEventForm = false;
  loading = false;

  eventForm: FormGroup;
  subEventForm: FormGroup;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2030)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      venue: ['', Validators.required],
      totalBudget: [0, [Validators.required, Validators.min(0)]]
    });

    this.subEventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(300)]],
      event: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      maxParticipants: [1, [Validators.required, Validators.min(1)]],
      registrationFee: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.dataService.getAllEvents().subscribe({
      next: (response) => {
        if (response.success) {
          this.events = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  selectEvent(event: EventInterface): void {
    this.selectedEvent = event;
    this.loadSubEvents();
  }

  loadSubEvents(): void {
    if (!this.selectedEvent) return;

    this.dataService.getSubEventsByEvent(this.selectedEvent._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.subEvents = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading sub-events:', error);
      }
    });
  }

  createEvent(): void {
    if (this.eventForm.invalid) return;

    this.loading = true;
    this.dataService.createEvent(this.eventForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.events.unshift(response.data);
          this.showEventForm = false;
          this.eventForm.reset({
            year: new Date().getFullYear(),
            totalBudget: 0
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.loading = false;
      }
    });
  }

  createSubEvent(): void {
    if (this.subEventForm.invalid || !this.selectedEvent) return;

    const formData = {
      ...this.subEventForm.value,
      event: this.selectedEvent._id
    };

    this.loading = true;
    this.dataService.createSubEvent(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.subEvents.push(response.data);
          this.showSubEventForm = false;
          this.subEventForm.reset();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating sub-event:', error);
        this.loading = false;
      }
    });
  }

  deleteEvent(eventId: string): void {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    this.dataService.deleteEvent(eventId).subscribe({
      next: (response) => {
        if (response.success) {
          this.events = this.events.filter(e => e._id !== eventId);
          if (this.selectedEvent?._id === eventId) {
            this.selectedEvent = null;
            this.subEvents = [];
          }
        }
      },
      error: (error) => {
        console.error('Error deleting event:', error);
      }
    });
  }

  deleteSubEvent(subEventId: string): void {
    if (!confirm('Are you sure you want to delete this sub-event? This action cannot be undone.')) {
      return;
    }

    this.dataService.deleteSubEvent(subEventId).subscribe({
      next: (response) => {
        if (response.success) {
          this.subEvents = this.subEvents.filter(se => se._id !== subEventId);
        }
      },
      error: (error) => {
        console.error('Error deleting sub-event:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
