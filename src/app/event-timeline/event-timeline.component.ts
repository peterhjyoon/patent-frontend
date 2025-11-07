import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppEventService } from '../app-event.service';
import { AppEvent } from '../app-event';
import { AppComment } from '../app-comment';
import { FormsModule } from '@angular/forms';
import { AiServiceService } from '../ai-service.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BasicAuthenticationService } from '../service/basic-authentication.service';
import { AppGroupService, Group } from '../group.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-event-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-timeline.component.html',
  styleUrls: ['./event-timeline.component.css'],
})
export class EventTimelineComponent implements OnInit {
  events: AppEvent[] = [];
  newEvent: AppEvent = { title: '', description: '', startDate: '', endDate: '' };
  editingEventId: number | null = null;
  lifeStory: string | null = null;
  storyEvents: AppEvent[] = [];
  loadingStory = false;
  generatedImageUrl: string | null = null;
  eventComments: { [eventId: number]: AppComment[] } = {};
  lifeStoryComments: AppComment[] = [];
  newLifeStoryComment: string = '';
  storyStyle: string = 'comical'; 

  selectedFile?: File;
  selectedMask?: File;
  editedImageUrl?: SafeUrl;
  prompt: string = '';

  generatedVideoUrl?: SafeUrl;
  generatingVideo: boolean = false;

  modifyingImage = false;

  filterStartDate: string = '';
  filterEndDate: string = '';
  filteredEvents: AppEvent[] = [];
  resumeText: string | null = null;

  groups: Group[] = [];
  selectedGroupId: number | null = null;
  mergedVideoUrl?: SafeUrl;

  showSlideshow = false;
  slideshowEvents: AppEvent[] = [];
  slideIndex = 0;
  currentSlide?: AppEvent;

  speechSynthesis = window.speechSynthesis;
  utterance = new SpeechSynthesisUtterance();
  slideDuration = 8000; // 8 seconds per slide
  slideshowInterval?: any;

  constructor(private eventService: AppEventService,
    private aiService: AiServiceService,
    private sanitizer: DomSanitizer,
    public authService: BasicAuthenticationService,
    private groupService: AppGroupService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadEvents();
    this.loadLifeStory(); 
    this.groupService.getMyGroups().subscribe((groups: Group[]) => {
      this.groups = groups;
    });
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe(events => {
    this.events = events;
    this.events.forEach(e => this.loadEventComments(e.id!));
  });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.newEvent.image = input.files[0];
    }
  }

  mergeSelectedVideos(): void {
    const eventIds = this.events
      .filter(e => e.videoPath && e.startDate)
      .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
      .map(e => e.id!); // now using event IDs, not paths

    if (!eventIds.length) {
      alert('No events with videos to merge!');
      return;
    }

    this.eventService.mergeVideos(eventIds).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.mergedVideoUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (err) => {
        console.error('Video merge failed', err);
        alert('Failed to merge videos. See console for details.');
      }
    });
  }


  submitEvent(): void {
    if (!this.newEvent.title.trim()) return;

    if (this.editingEventId !== null) {
      this.eventService.updateEvent(this.editingEventId, this.newEvent).subscribe(() => {
        this.resetForm();
        this.loadEvents();
      });
    } else {
      this.eventService.createEvent(this.newEvent, this.selectedGroupId!).subscribe(() => {
        this.resetForm();
        this.loadEvents();
      });
    }
  }

  startEdit(event: AppEvent): void {
    this.editingEventId = event.id!;
    this.newEvent = { ...event }; // clone for editing
  }

  deleteEvent(id: number): void {
    if (!id) {
      console.error('Event ID is undefined, cannot delete');
      return;
    }

    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== id);
      },
      error: err => console.error('Failed to delete event', err)
    });
  }

  resetForm(): void {
    this.newEvent = { title: '', description: '', startDate: '', endDate: '' };
    this.editingEventId = null;
    this.generatedImageUrl = null;
  }

  generateImageFromPrompt(): void {
    if (!this.newEvent.description) return;

    this.aiService.generateAiImage(this.newEvent.description).subscribe({
      next: (blob) => {
        // Create a File object from the blob and attach it to the event
        const file = new File([blob], 'generated-image.png', { type: 'image/png' });
        this.newEvent.image = file;

        // Create an object URL for preview
        this.generatedImageUrl = URL.createObjectURL(blob);
      },
      error: (err) => {
        console.error('Failed to generate image', err);
        alert('Failed to generate image. See console for details.');
      }
    });
  }
  

  onEditFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile);
      this.cd.detectChanges(); // 👈 force Angular to update bindings
    }
  }

  
  onPromptChange(): void {
    console.log('Prompt changed:', this.prompt);
    this.cd.detectChanges(); // 👈 same here
  }

  onMaskSelected(event: any) {
    this.selectedMask = event.target.files[0];
  }

  onSubmit() {
    if (!this.selectedFile || !this.prompt) {
      alert("Please select an image and enter a prompt");
      return;
    }
    this.modifyingImage = true;

    this.aiService.editImage(this.selectedFile, this.prompt, this.selectedMask)
      .subscribe(
      {next: (blob) =>{
        const file = new File([blob], 'edited-image.png', { type: 'image/png' });
        this.newEvent.image = file; // replace event image
        const objectUrl = URL.createObjectURL(blob);
        this.editedImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.modifyingImage = false;
      },
      error: (err) => {
        console.error("Image modification failed", err);
        this.modifyingImage = false; // reset even if error
      }
    });
  }


  generateVideoFromImage(): void {
    if (!this.newEvent.description) {
      alert("Please select an image and enter a prompt.");
      return;
    }

    this.generatingVideo = true;
    this.aiService.generateVideo(this.newEvent.description).subscribe({
      next: (blob) => {
        const file = new File([blob], 'generated-video.mp4', { type: 'video/mp4' });
        this.newEvent.video = file; // attach AI video

        const objectUrl = URL.createObjectURL(blob);
        this.generatedVideoUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.generatingVideo = false;
      },
      error: (err) => {
        console.error("Video generation failed", err);
        alert("Failed to generate video. See console for details.");
        this.generatingVideo = false;
      }
    });
  }


  generateLifeStory(): void {
    const sortedEvents = [...this.events]
      .filter(e => !!e.startDate)
      .sort((a, b) =>
        new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
      );

    this.loadingStory = true;

    this.eventService.generateLifeStory(sortedEvents, this.storyStyle).subscribe({
      next: response => {
        this.lifeStory = response.story;
        this.storyEvents = response.events;
        this.loadingStory = false;
        this.loadLifeStoryComments();
      },
      error: err => {
        console.error('Error generating story', err);
        this.loadingStory = false;
      }
    });
  }

  submitEventComment(event: AppEvent): void {
    if (!event.newComment?.trim()) return;

    this.eventService.commentOnEvent(event.id!, event.newComment).subscribe(() => {
      this.loadEventComments(event.id!);
      event.newComment = '';
    });
  }

  loadEventComments(eventId: number): void {
    this.eventService.getCommentsForEvent(eventId).subscribe(comments => {
      this.eventComments[eventId] = comments;
    });
  }

  submitLifeStoryComment(): void {
    if (!this.newLifeStoryComment.trim()) return;

    this.eventService.commentOnLifeStory(this.newLifeStoryComment).subscribe(() => {
        this.loadLifeStoryComments();
        this.newLifeStoryComment = '';
      });
  }

  loadLifeStory(): void {
    this.eventService.fetchLatestLifeStory().subscribe({
      next: response => {
        if (response) {
          this.lifeStory = response.story ?? null;
          this.storyEvents = response.events || [];
        } else {
          this.lifeStory = null;
          this.storyEvents = [];
        }
      },
      error: err => {
        console.warn('No existing life story found or error fetching it', err);
        this.lifeStory = null;
        this.storyEvents = [];
      }
    });
  }


  loadLifeStoryComments(): void {
    this.eventService.getLifeStoryComments().subscribe(comments => this.lifeStoryComments = comments);
  }

  startEditingComment(comment: AppComment): void {
    comment.isEditing = true;
    comment.editContent = comment.content;
  }

  cancelEditingComment(comment: AppComment): void {
    comment.isEditing = false;
    comment.editContent = '';
  }

  saveEditedComment(comment: AppComment, eventId: number): void {
    if (!comment.editContent?.trim()) return;

    this.eventService.updateComment(comment.id!, comment.editContent).subscribe(updated => {
      comment.content = updated.content;
      comment.isEditing = false;
      this.loadEventComments(eventId);
    });
  }

  deleteComment(comment: AppComment, eventId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.eventService.deleteComment(comment.id!).subscribe(() => {
        this.loadEventComments(eventId);
      });
    }
  }

  acceptComment(comment: AppComment, event: AppEvent): void {
    if (!event.id || !comment.id) return;

    this.eventService.acceptComment(event.id, comment.id).subscribe({
      next: (updatedEvent) => {
        // Update the specific event in the events array
        const index = this.events.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
          this.events[index] = updatedEvent;
        }

        // Optionally update filteredEvents if filter is applied
        const filteredIndex = this.filteredEvents.findIndex(e => e.id === updatedEvent.id);
        if (filteredIndex !== -1) {
          this.filteredEvents[filteredIndex] = updatedEvent;
        }

        alert('Comment accepted and description updated!');
      },
      error: (err) => {
        console.error('Failed to accept comment', err);
        alert('An error occurred while accepting the comment.');
      }
    });
  }

  startEditingLifeStoryComment(comment: AppComment): void {
    comment.isEditing = true;
    comment.editContent = comment.content;
  }

  cancelEditingLifeStoryComment(comment: AppComment): void {
    comment.isEditing = false;
    comment.editContent = '';
  }

  saveEditedLifeStoryComment(comment: AppComment): void {
    if (!comment.editContent?.trim()) return;

    this.eventService.updateComment(comment.id!, comment.editContent).subscribe(updated => {
      comment.content = updated.content;
      comment.isEditing = false;
      this.loadLifeStoryComments();
    });
  }

  deleteLifeStoryComment(comment: AppComment): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.eventService.deleteComment(comment.id!).subscribe(() => {
        this.loadLifeStoryComments();
      });
    }
  }

  applyFilter(): void {
    if (!this.filterStartDate && !this.filterEndDate) {
      this.filteredEvents = [...this.events];
      return;
    }

    const start = this.filterStartDate ? new Date(this.filterStartDate) : null;
    const end = this.filterEndDate ? new Date(this.filterEndDate) : null;

    this.filteredEvents = this.events.filter(event => {
      const startDate = new Date(event.startDate!);
      return (!start || startDate >= start) && (!end || startDate <= end);
    });
  }

  resetFilter(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filteredEvents = [...this.events];
  }

  generateResume(): void {
    const ids = this.filteredEvents.map(e => e.id!);

    this.eventService.generateResume(ids).subscribe({
      next: (text) => {
        this.resumeText = text;
      },
      error: (err) => console.error('Failed to generate resume', err)
    });
  }

  stopAutoplay(): void {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
      this.slideshowInterval = undefined;
    }
  }

  autoAdvanceSlide(): void {
    this.stopSpeech();

    if (this.slideIndex < this.slideshowEvents.length - 1) {
      this.slideIndex++;
      this.currentSlide = this.slideshowEvents[this.slideIndex];
      this.playDescription();
    } else {
      // End of slideshow reached — stop autoplay
      this.stopAutoplay();
    }
  }

  openSlideshow(): void {
    this.slideshowEvents = this.events
    .filter(e => e.imagePath && e.description)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

    if (!this.slideshowEvents.length) {
      alert('No events with images and descriptions available for slideshow.');
      return;
    }

    this.slideIndex = 0;
    this.currentSlide = this.slideshowEvents[this.slideIndex];
    this.showSlideshow = true;

    this.playDescription();

    // Start autoplay
    this.slideshowInterval = setInterval(() => {
      this.autoAdvanceSlide();
    }, this.slideDuration);
  }

  closeSlideshow(): void {
    this.showSlideshow = false;
    this.stopSpeech();
    this.stopAutoplay();
  }

  nextSlide(): void {
    this.stopAutoplay();  // Stop auto
    if (this.slideIndex < this.slideshowEvents.length - 1) {
      this.slideIndex++;
      this.currentSlide = this.slideshowEvents[this.slideIndex];
      this.playDescription();
    }
  }

  previousSlide(): void {
    this.stopAutoplay();  // Stop auto
    if (this.slideIndex > 0) {
      this.slideIndex--;
      this.currentSlide = this.slideshowEvents[this.slideIndex];
      this.playDescription();
    }
  }

  playDescription(): void {
    this.stopSpeech();

    if (this.currentSlide?.description) {
      this.utterance = new SpeechSynthesisUtterance(this.currentSlide.description);
      this.speechSynthesis.speak(this.utterance);
    }
  }

  stopSpeech(): void {
    this.speechSynthesis.cancel();
  }
}
