import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AiServiceService } from '../ai-service.service';

@Component({
  selector: 'app-ai-image-prompt-result',
  standalone: true,
  imports: [NgIf],
  templateUrl: './ai-image-prompt-result.component.html',
  styleUrl: './ai-image-prompt-result.component.css'
})
export class AiImagePromptResultComponent implements OnInit {

  imageUrl: string | null = null;
  textResponse: string | null = null;
  
  constructor(
    private aiService: AiServiceService,
    private router: Router
  ) { }
  
  ngOnInit() {}

  submitPrompt(prompt: string) {
    console.log(`Making http client call to generate image ${prompt}`);
    this.aiService.generateAiImage(prompt).subscribe({
      next: blob => {
        const imageUrl = URL.createObjectURL(blob);
        this.imageUrl = imageUrl;
      },
      error: (err) => {
        console.error('Error while fetching the image from API_URL', err);
      }
    });
    console.log(`Making HTTP client call to generate text: ${prompt}`);
    this.aiService.generateAiText(prompt).subscribe({
      next: response => {
        this.textResponse = response;
      },
      error: (err) => {
        console.error('Error while fetching the text response from API_URL', err);
        this.textResponse = 'Something went wrong while generating the response.';
      }
    });
  }

//   submitText(prompt: string) {
//   console.log(`Making HTTP client call to generate text: ${prompt}`);
//   this.aiService.generateAiText(prompt).subscribe({
//     next: response => {
//       this.textResponse = response;
//     },
//     error: (err) => {
//       console.error('Error while fetching the text response from API_URL', err);
//       this.textResponse = 'Something went wrong while generating the response.';
//     }
//   });
// }
}
