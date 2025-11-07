import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiImagePromptResultComponent } from './ai-image-prompt-result.component';

describe('AiImagePromptResultComponent', () => {
  let component: AiImagePromptResultComponent;
  let fixture: ComponentFixture<AiImagePromptResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiImagePromptResultComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AiImagePromptResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
